/**
 * Server-side repository and async batch runner for Link Group Phase A.
 */
import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import {
  createOneLinkShortlink,
  deleteOneLinkShortlink,
  extractShortLinkIdFromUrl,
  OneLinkCreateError,
  OneLinkDeleteError,
} from '@/lib/onelinkApi';
import { generateLeafPaths, getHierarchicalPayload } from '@/lib/onelinkGroupTree';
import type { CreateLinkGroupRequestPayload } from '@/lib/onelinkGroupSchema';
import { getSqliteDatabase } from '@/lib/sqlite';
import type { LinkGroupItemStatus, LinkGroupStatus, LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';

const DEFAULT_LIST_LIMIT = 200;
const EXECUTION_CONCURRENCY = 3;
const ITEMS_PAGE_SIZE_DEFAULT = 50;

const activeGroupExecutions = new Set<string>();

interface GroupRow {
  brand_domain: string;
  created_at: string;
  failed_count: number;
  id: string;
  name: string;
  planned_count: number;
  status: LinkGroupStatus;
  success_count: number;
  template_id: string;
  tree_config_json: string;
  updated_at: string;
}

interface GroupItemRow {
  created_at: string;
  error_message: string;
  id: string;
  leaf_node_id: string;
  path_label: string;
  payload_json: string;
  retry_count: number;
  short_link: string;
  status: LinkGroupItemStatus;
  updated_at: string;
  variant_key: string;
}

interface GroupNodeSeed {
  id: string;
  isLeaf: boolean;
  level: string;
  parentNodeId: string | null;
  pathKey: string;
  sortOrder: number;
  value: string;
}

interface GroupItemSeed {
  id: string;
  leafNodeId: string;
  pathLabel: string;
  payloadJson: string;
  variantKey: string;
}

export interface LinkGroupSummary {
  createdAt: string;
  failedCount: number;
  id: string;
  name: string;
  plannedCount: number;
  status: LinkGroupStatus;
  successCount: number;
  templateId: string;
  updatedAt: string;
}

export interface LinkGroupItemRecord {
  createdAt: string;
  errorMessage: string;
  id: string;
  leafNodeId: string;
  pathLabel: string;
  payloadJson: string;
  retryCount: number;
  shortLink: string;
  status: LinkGroupItemStatus;
  updatedAt: string;
  variantKey: string;
}

export interface LinkGroupDetail {
  brandDomain: string;
  createdAt: string;
  failedCount: number;
  id: string;
  items: LinkGroupItemRecord[];
  name: string;
  page: number;
  pageSize: number;
  plannedCount: number;
  status: LinkGroupStatus;
  successCount: number;
  templateId: string;
  totalItems: number;
  totalPages: number;
  treeConfigJson: string;
  updatedAt: string;
}

interface GroupExecutionConfig {
  brandDomain: string;
  groupId: string;
  templateId: string;
}

interface ClaimedPendingItem {
  id: string;
  payloadJson: string;
}

function mapGroupRowToSummary(row: GroupRow): LinkGroupSummary {
  return {
    createdAt: row.created_at,
    failedCount: row.failed_count,
    id: row.id,
    name: row.name,
    plannedCount: row.planned_count,
    status: row.status,
    successCount: row.success_count,
    templateId: row.template_id,
    updatedAt: row.updated_at,
  };
}

function mapGroupItemRow(row: GroupItemRow): LinkGroupItemRecord {
  return {
    createdAt: row.created_at,
    errorMessage: row.error_message,
    id: row.id,
    leafNodeId: row.leaf_node_id,
    pathLabel: row.path_label,
    payloadJson: row.payload_json,
    retryCount: row.retry_count,
    shortLink: row.short_link,
    status: row.status,
    updatedAt: row.updated_at,
    variantKey: row.variant_key,
  };
}

function buildVariantKey(payload: Record<string, string>): string {
  const sortedEntries = Object.entries(payload)
    .sort(([first], [second]) => first.localeCompare(second));

  return createHash('sha256').update(JSON.stringify(sortedEntries)).digest('hex');
}

function buildSeeds(
  roots: LinkGroupTreeNode[],
  globalParams: Record<string, string>,
): {
  items: GroupItemSeed[];
  nodes: GroupNodeSeed[];
} {
  const nodes: GroupNodeSeed[] = [];
  const items: GroupItemSeed[] = [];

  const leafPaths = generateLeafPaths(roots);
  const leafPayloadByLabel = new Map<string, Record<string, string>>();
  leafPaths.forEach((leafPath) => {
    const hierarchical = getHierarchicalPayload(leafPath);
    leafPayloadByLabel.set(leafPath.pathLabel, {
      ...globalParams,
      ...hierarchical,
    });
  });

  const visit = (
    node: LinkGroupTreeNode,
    parentNodeId: string | null,
    pathIndexes: number[],
    pathLabels: string[],
    sortOrder: number,
  ) => {
    const nodeId = randomUUID();
    const nextPathLabels = [...pathLabels, node.value];
    const isLeaf = node.children.length === 0;

    nodes.push({
      id: nodeId,
      isLeaf,
      level: node.level,
      parentNodeId,
      pathKey: pathIndexes.join('.'),
      sortOrder,
      value: node.value,
    });

    if (isLeaf) {
      const pathLabel = nextPathLabels.join(' > ');
      const payload = leafPayloadByLabel.get(pathLabel) ?? {};
      const variantKey = buildVariantKey(payload);

      items.push({
        id: randomUUID(),
        leafNodeId: nodeId,
        pathLabel,
        payloadJson: JSON.stringify(payload),
        variantKey,
      });
      return;
    }

    node.children.forEach((childNode, childIndex) => {
      visit(childNode, nodeId, [...pathIndexes, childIndex], nextPathLabels, childIndex);
    });
  };

  roots.forEach((root, rootIndex) => {
    visit(root, null, [rootIndex], [], rootIndex);
  });

  return {
    items,
    nodes,
  };
}

function resolveFinalStatus(successCount: number, failedCount: number, pendingCount: number): LinkGroupStatus {
  if (pendingCount > 0) {
    return 'running';
  }

  if (successCount > 0 && failedCount > 0) {
    return 'partial_failed';
  }

  if (successCount > 0) {
    return 'completed';
  }

  if (failedCount > 0) {
    return 'failed';
  }

  return 'draft';
}

function refreshGroupAggregates(groupId: string): void {
  const db = getSqliteDatabase();
  const counts = db
    .prepare(
      `
        SELECT
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS success_count,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_count,
          SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END) AS pending_count
        FROM onelink_link_group_items
        WHERE group_id = ?
      `,
    )
    .get(groupId) as {
      failed_count: number | null;
      pending_count: number | null;
      success_count: number | null;
    };

  const successCount = counts.success_count ?? 0;
  const failedCount = counts.failed_count ?? 0;
  const pendingCount = counts.pending_count ?? 0;
  const status = resolveFinalStatus(successCount, failedCount, pendingCount);

  db.prepare(
    `
      UPDATE onelink_link_groups
      SET
        success_count = ?,
        failed_count = ?,
        status = ?,
        updated_at = ?
      WHERE id = ?
    `,
  ).run(successCount, failedCount, status, new Date().toISOString(), groupId);
}

function getGroupExecutionConfig(groupId: string): GroupExecutionConfig | null {
  const db = getSqliteDatabase();
  const row = db
    .prepare(
      `
        SELECT
          id,
          template_id,
          brand_domain
        FROM onelink_link_groups
        WHERE id = ?
        LIMIT 1
      `,
    )
    .get(groupId) as { brand_domain: string; id: string; template_id: string } | undefined;

  if (!row) {
    return null;
  }

  return {
    brandDomain: row.brand_domain,
    groupId: row.id,
    templateId: row.template_id,
  };
}

function claimPendingItems(groupId: string, limit: number): ClaimedPendingItem[] {
  const db = getSqliteDatabase();

  const claim = db.transaction((targetGroupId: string, targetLimit: number) => {
    const now = new Date().toISOString();
    const rows = db
      .prepare(
        `
          SELECT
            id,
            payload_json
          FROM onelink_link_group_items
          WHERE group_id = ?
            AND status = 'pending'
          ORDER BY created_at ASC
          LIMIT ?
        `,
      )
      .all(targetGroupId, targetLimit) as Array<{ id: string; payload_json: string }>;

    rows.forEach((row) => {
      db.prepare(
        `
          UPDATE onelink_link_group_items
          SET
            status = 'processing',
            updated_at = ?
          WHERE id = ?
            AND status = 'pending'
        `,
      ).run(now, row.id);
    });

    return rows.map((row) => ({
      id: row.id,
      payloadJson: row.payload_json,
    }));
  });

  return claim(groupId, limit);
}

function markItemSuccess(groupId: string, itemId: string, shortLink: string): void {
  const db = getSqliteDatabase();
  db.prepare(
    `
      UPDATE onelink_link_group_items
      SET
        status = 'success',
        short_link = ?,
        error_message = '',
        updated_at = ?
      WHERE id = ?
    `,
  ).run(shortLink, new Date().toISOString(), itemId);

  refreshGroupAggregates(groupId);
}

function markItemFailed(groupId: string, itemId: string, errorMessage: string): void {
  const db = getSqliteDatabase();
  db.prepare(
    `
      UPDATE onelink_link_group_items
      SET
        status = 'failed',
        error_message = ?,
        updated_at = ?
      WHERE id = ?
    `,
  ).run(errorMessage.slice(0, 2048), new Date().toISOString(), itemId);

  refreshGroupAggregates(groupId);
}

function resetProcessingItemsToPending(groupId: string): void {
  const db = getSqliteDatabase();
  db.prepare(
    `
      UPDATE onelink_link_group_items
      SET
        status = 'pending',
        updated_at = ?
      WHERE group_id = ?
        AND status = 'processing'
    `,
  ).run(new Date().toISOString(), groupId);
}

async function executeSingleItem(config: GroupExecutionConfig, item: ClaimedPendingItem): Promise<void> {
  let parsedPayload: Record<string, string>;

  try {
    const payload = JSON.parse(item.payloadJson) as unknown;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('Invalid payload format.');
    }

    const entries = Object.entries(payload as Record<string, unknown>);
    parsedPayload = {};
    entries.forEach(([key, value]) => {
      if (typeof value === 'string' && key.trim()) {
        parsedPayload[key.trim()] = value.trim();
      }
    });

    if (!parsedPayload.pid) {
      throw new Error('Media Source (pid) is required.');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse item payload.';
    markItemFailed(config.groupId, item.id, message);
    return;
  }

  try {
    const shortLink = await createOneLinkShortlink({
      brandDomain: config.brandDomain,
      data: parsedPayload,
      templateId: config.templateId,
    });

    markItemSuccess(config.groupId, item.id, shortLink);
  } catch (error) {
    if (error instanceof OneLinkCreateError) {
      markItemFailed(config.groupId, item.id, error.message);
      return;
    }

    const message = error instanceof Error ? error.message : 'Unknown AppsFlyer create error.';
    markItemFailed(config.groupId, item.id, message);
  }
}

async function runGroupExecution(groupId: string): Promise<void> {
  resetProcessingItemsToPending(groupId);

  while (true) {
    const config = getGroupExecutionConfig(groupId);
    if (!config) {
      break;
    }

    const items = claimPendingItems(groupId, EXECUTION_CONCURRENCY);
    if (items.length === 0) {
      break;
    }

    await Promise.allSettled(
      items.map(async (item) => {
        await executeSingleItem(config, item);
      }),
    );
  }

  refreshGroupAggregates(groupId);
}

export function startLinkGroupExecution(groupId: string): void {
  const normalizedGroupId = groupId.trim();
  if (!normalizedGroupId || activeGroupExecutions.has(normalizedGroupId)) {
    return;
  }

  activeGroupExecutions.add(normalizedGroupId);
  void runGroupExecution(normalizedGroupId).finally(() => {
    activeGroupExecutions.delete(normalizedGroupId);
  });
}

export function createLinkGroupAndStartExecution(input: CreateLinkGroupRequestPayload): LinkGroupSummary {
  const db = getSqliteDatabase();
  const groupId = randomUUID();
  const now = new Date().toISOString();
  const seeds = buildSeeds(input.treeConfig.roots, input.globalParams);

  const saveGroup = db.transaction(() => {
    db.prepare(
      `
        INSERT INTO onelink_link_groups (
          id,
          name,
          template_id,
          brand_domain,
          tree_config_json,
          global_params_json,
          planned_count,
          success_count,
          failed_count,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'running', ?, ?)
      `,
    ).run(
      groupId,
      input.name,
      input.templateId,
      input.brandDomain,
      JSON.stringify(input.treeConfig),
      JSON.stringify(input.globalParams),
      input.plannedCount,
      now,
      now,
    );

    seeds.nodes.forEach((node) => {
      db.prepare(
        `
          INSERT INTO onelink_link_group_nodes (
            id,
            group_id,
            parent_node_id,
            level,
            value,
            sort_order,
            path_key,
            is_leaf,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      ).run(
        node.id,
        groupId,
        node.parentNodeId,
        node.level,
        node.value,
        node.sortOrder,
        node.pathKey,
        node.isLeaf ? 1 : 0,
        now,
        now,
      );
    });

    seeds.items.forEach((item) => {
      db.prepare(
        `
          INSERT INTO onelink_link_group_items (
            id,
            group_id,
            leaf_node_id,
            path_label,
            variant_key,
            payload_json,
            status,
            short_link,
            error_message,
            retry_count,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, 'pending', '', '', 0, ?, ?)
        `,
      ).run(
        item.id,
        groupId,
        item.leafNodeId,
        item.pathLabel,
        item.variantKey,
        item.payloadJson,
        now,
        now,
      );
    });
  });

  saveGroup();
  startLinkGroupExecution(groupId);

  return {
    createdAt: now,
    failedCount: 0,
    id: groupId,
    name: input.name,
    plannedCount: input.plannedCount,
    status: 'running',
    successCount: 0,
    templateId: input.templateId,
    updatedAt: now,
  };
}

export function listLinkGroups(limit = DEFAULT_LIST_LIMIT): LinkGroupSummary[] {
  const db = getSqliteDatabase();
  const safeLimit = Math.max(1, Math.min(limit, 1000));

  const rows = db
    .prepare(
      `
        SELECT
          id,
          name,
          template_id,
          brand_domain,
          tree_config_json,
          planned_count,
          success_count,
          failed_count,
          status,
          created_at,
          updated_at
        FROM onelink_link_groups
        ORDER BY datetime(created_at) DESC
        LIMIT ?
      `,
    )
    .all(safeLimit) as GroupRow[];

  rows.forEach((row) => {
    if (row.status === 'running') {
      startLinkGroupExecution(row.id);
    }
  });

  return rows.map((row) => mapGroupRowToSummary(row));
}

export function getLinkGroupDetail(
  groupId: string,
  page = 1,
  pageSize = ITEMS_PAGE_SIZE_DEFAULT,
): LinkGroupDetail | null {
  const db = getSqliteDatabase();
  const group = db
    .prepare(
      `
        SELECT
          id,
          name,
          template_id,
          brand_domain,
          tree_config_json,
          planned_count,
          success_count,
          failed_count,
          status,
          created_at,
          updated_at
        FROM onelink_link_groups
        WHERE id = ?
        LIMIT 1
      `,
    )
    .get(groupId) as GroupRow | undefined;

  if (!group) {
    return null;
  }

  if (group.status === 'running') {
    startLinkGroupExecution(groupId);
  }

  const safePageSize = Math.max(1, Math.min(pageSize, 200));
  const totalItems = db
    .prepare('SELECT COUNT(*) as count FROM onelink_link_group_items WHERE group_id = ?')
    .get(groupId) as { count: number };

  const totalPages = Math.max(1, Math.ceil(totalItems.count / safePageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const offset = (safePage - 1) * safePageSize;

  const itemRows = db
    .prepare(
      `
        SELECT
          id,
          leaf_node_id,
          path_label,
          variant_key,
          payload_json,
          status,
          short_link,
          error_message,
          retry_count,
          created_at,
          updated_at
        FROM onelink_link_group_items
        WHERE group_id = ?
        ORDER BY datetime(created_at) ASC
        LIMIT ? OFFSET ?
      `,
    )
    .all(groupId, safePageSize, offset) as GroupItemRow[];

  return {
    brandDomain: group.brand_domain,
    createdAt: group.created_at,
    failedCount: group.failed_count,
    id: group.id,
    items: itemRows.map((itemRow) => mapGroupItemRow(itemRow)),
    name: group.name,
    page: safePage,
    pageSize: safePageSize,
    plannedCount: group.planned_count,
    status: group.status,
    successCount: group.success_count,
    templateId: group.template_id,
    totalItems: totalItems.count,
    totalPages,
    treeConfigJson: group.tree_config_json,
    updatedAt: group.updated_at,
  };
}

export function retryFailedLinkGroupItems(groupId: string): { requeuedCount: number } {
  const db = getSqliteDatabase();
  const now = new Date().toISOString();

  const result = db.prepare(
    `
      UPDATE onelink_link_group_items
      SET
        status = 'pending',
        error_message = '',
        retry_count = retry_count + 1,
        updated_at = ?
      WHERE group_id = ?
        AND status = 'failed'
    `,
  ).run(now, groupId);

  if (result.changes < 1) {
    return { requeuedCount: 0 };
  }

  db.prepare(
    `
      UPDATE onelink_link_groups
      SET
        status = 'running',
        updated_at = ?
      WHERE id = ?
    `,
  ).run(now, groupId);

  refreshGroupAggregates(groupId);
  startLinkGroupExecution(groupId);

  return {
    requeuedCount: result.changes,
  };
}

export async function deleteLinkGroup(
  groupId: string,
  mode: 'local_only' | 'local_and_remote',
): Promise<{ deleted: boolean; remoteDeleted: boolean }> {
  const db = getSqliteDatabase();
  const group = db
    .prepare('SELECT id, template_id FROM onelink_link_groups WHERE id = ? LIMIT 1')
    .get(groupId) as { id: string; template_id: string } | undefined;

  if (!group) {
    return {
      deleted: false,
      remoteDeleted: false,
    };
  }

  let remoteDeleted = true;

  if (mode === 'local_and_remote') {
    const successItems = db
      .prepare(
        `
          SELECT short_link
          FROM onelink_link_group_items
          WHERE group_id = ?
            AND status = 'success'
            AND short_link != ''
        `,
      )
      .all(groupId) as Array<{ short_link: string }>;

    for (const item of successItems) {
      const shortLinkId = extractShortLinkIdFromUrl(item.short_link, group.template_id);
      if (!shortLinkId) {
        remoteDeleted = false;
        continue;
      }

      try {
        await deleteOneLinkShortlink(group.template_id, shortLinkId);
      } catch (error) {
        if (error instanceof OneLinkDeleteError) {
          remoteDeleted = false;
          continue;
        }

        remoteDeleted = false;
      }
    }
  }

  const remove = db.transaction(() => {
    db.prepare('DELETE FROM onelink_links WHERE group_id = ?').run(groupId);
    const deletedGroup = db.prepare('DELETE FROM onelink_link_groups WHERE id = ?').run(groupId);
    return deletedGroup.changes > 0;
  });

  const deleted = remove();
  activeGroupExecutions.delete(groupId);

  return {
    deleted,
    remoteDeleted,
  };
}
