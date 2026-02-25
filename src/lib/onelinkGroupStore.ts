/**
 * Server-side repository API for Link Group CRUD, paging, and execution lifecycle orchestration.
 */
import 'server-only';

import { randomUUID } from 'node:crypto';
import type {
  CreateLinkGroupRequestPayload,
  UpdateLinkGroupRequestPayload,
} from '@/lib/onelinkGroupSchema';
import { buildSeeds } from '@/lib/onelinkGroupStore.seed';
import {
  clearActiveGroupExecution,
  deleteRemoteShortLinksForGroup,
  startLinkGroupExecution,
  upsertOneLinkRecordForGroupItem,
} from '@/lib/onelinkGroupStore.execution';
import {
  DEFAULT_LIST_LIMIT,
  ITEMS_PAGE_SIZE_DEFAULT,
  type GroupExecutionConfig,
  type GroupItemRow,
  type GroupRow,
  type LinkGroupDetail,
  type LinkGroupSummary,
  type LinkGroupUpdateResult,
} from '@/lib/onelinkGroupStore.types';
import {
  getExistingGroupItemsSnapshot,
  getGroupRowById,
  mapGroupItemRow,
  mapGroupRowToSummary,
  parseGlobalParamsJson,
  parseShortLinkIdConfigJson,
  parseScopedParamsJson,
  refreshGroupAggregates,
} from '@/lib/onelinkGroupStore.utils';
import { ensureOneLinkLinkGroupColumns, getSqliteDatabase } from '@/lib/sqlite';
import type { LinkGroupItemStatus } from '@/lib/onelinkGroupTypes';

export type { LinkGroupDetail, LinkGroupItemRecord, LinkGroupSummary, LinkGroupUpdateDiff, LinkGroupUpdateResult } from '@/lib/onelinkGroupStore.types';

export function isLinkGroupNameTaken(name: string, excludeGroupId?: string): boolean {
  const normalizedName = name.trim();
  if (!normalizedName) {
    return false;
  }

  const db = getSqliteDatabase();
  const normalizedExcludeGroupId = excludeGroupId?.trim();

  if (normalizedExcludeGroupId) {
    const row = db
      .prepare(
        `
          SELECT id
          FROM onelink_link_groups
          WHERE lower(trim(name)) = lower(trim(?))
            AND id <> ?
          LIMIT 1
        `,
      )
      .get(normalizedName, normalizedExcludeGroupId) as { id: string } | undefined;

    return Boolean(row?.id);
  }

  const row = db
    .prepare(
      `
        SELECT id
        FROM onelink_link_groups
        WHERE lower(trim(name)) = lower(trim(?))
        LIMIT 1
      `,
    )
    .get(normalizedName) as { id: string } | undefined;

  return Boolean(row?.id);
}

export function createLinkGroupAndStartExecution(input: CreateLinkGroupRequestPayload): LinkGroupSummary {
  const db = getSqliteDatabase();
  if (isLinkGroupNameTaken(input.name)) {
    throw new Error('LINK_GROUP_NAME_DUPLICATE');
  }

  const groupId = randomUUID();
  const now = new Date().toISOString();
  const seeds = buildSeeds(input.treeConfig.roots, input.globalParams, input.scopedParams);

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
          scoped_params_json,
          shortlink_id_config_json,
          planned_count,
          success_count,
          failed_count,
          status,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'running', ?, ?)
      `,
    ).run(
      groupId,
      input.name,
      input.templateId,
      input.brandDomain,
      JSON.stringify(input.treeConfig),
      JSON.stringify(input.globalParams),
      JSON.stringify(input.scopedParams),
      JSON.stringify(input.shortLinkIdConfig),
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

export function updateLinkGroupAndStartExecution(
  groupId: string,
  input: UpdateLinkGroupRequestPayload,
): LinkGroupUpdateResult | null {
  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);

  const existingGroup = getGroupRowById(groupId);
  if (!existingGroup) {
    return null;
  }

  if (existingGroup.status === 'running') {
    throw new Error('LINK_GROUP_RUNNING');
  }

  if (isLinkGroupNameTaken(input.name, groupId)) {
    throw new Error('LINK_GROUP_NAME_DUPLICATE');
  }

  const now = new Date().toISOString();
  const existingItems = getExistingGroupItemsSnapshot(groupId);
  const existingByVariant = new Map(existingItems.map((item) => [item.variantKey, item]));
  const nextSeeds = buildSeeds(input.treeConfig.roots, input.globalParams, input.scopedParams);
  const nextVariantSet = new Set(nextSeeds.items.map((item) => item.variantKey));

  const diffAddedPaths = nextSeeds.items
    .filter((item) => !existingByVariant.has(item.variantKey))
    .map((item) => item.pathLabel);
  const diffRemovedPaths = existingItems
    .filter((item) => !nextVariantSet.has(item.variantKey))
    .map((item) => item.pathLabel);
  const diffUnchangedPaths = nextSeeds.items
    .filter((item) => existingByVariant.has(item.variantKey))
    .map((item) => item.pathLabel);
  const diffFailedPaths = nextSeeds.items
    .filter((item) => existingByVariant.get(item.variantKey)?.status === 'failed')
    .map((item) => item.pathLabel);

  let targetedItemCount = 0;

  const persistUpdate = db.transaction(() => {
    db.prepare('DELETE FROM onelink_links WHERE group_id = ?').run(groupId);
    db.prepare('DELETE FROM onelink_link_group_nodes WHERE group_id = ?').run(groupId);
    db.prepare('DELETE FROM onelink_link_group_items WHERE group_id = ?').run(groupId);

    db.prepare(
      `
        UPDATE onelink_link_groups
        SET
          name = ?,
          template_id = ?,
          brand_domain = ?,
          tree_config_json = ?,
          global_params_json = ?,
          scoped_params_json = ?,
          shortlink_id_config_json = ?,
          planned_count = ?,
          status = 'draft',
          updated_at = ?
        WHERE id = ?
      `,
    ).run(
      input.name,
      input.templateId,
      input.brandDomain,
      JSON.stringify(input.treeConfig),
      JSON.stringify(input.globalParams),
      JSON.stringify(input.scopedParams),
      JSON.stringify(input.shortLinkIdConfig),
      input.plannedCount,
      now,
      groupId,
    );

    nextSeeds.nodes.forEach((node) => {
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

    const executionConfig: GroupExecutionConfig = {
      brandDomain: input.brandDomain,
      groupId,
      groupName: input.name,
      shortLinkIdConfig: input.shortLinkIdConfig,
      templateId: input.templateId,
    };

    nextSeeds.items.forEach((item) => {
      const existing = existingByVariant.get(item.variantKey);
      const isNewVariant = !existing;
      const shouldTarget =
        input.applyMode === 'all'
        || (input.applyMode === 'new_only' && isNewVariant)
        || (input.applyMode === 'failed_only' && existing?.status === 'failed');

      let nextStatus: LinkGroupItemStatus = 'pending';
      let nextShortLink = '';
      let nextErrorMessage = '';
      let nextRetryCount = existing?.retryCount ?? 0;

      if (shouldTarget) {
        targetedItemCount += 1;
        if (existing?.status === 'failed') {
          nextRetryCount += 1;
        }
      } else if (existing?.status === 'success' && existing.shortLink) {
        nextStatus = 'success';
        nextShortLink = existing.shortLink;
      } else if (existing?.status === 'failed') {
        nextStatus = 'failed';
        nextErrorMessage = existing.errorMessage;
      } else if (existing) {
        nextStatus = 'failed';
        nextErrorMessage = 'Skipped during update.';
      } else {
        nextStatus = 'failed';
        nextErrorMessage = `Skipped by apply mode ${input.applyMode}.`;
      }

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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      ).run(
        item.id,
        groupId,
        item.leafNodeId,
        item.pathLabel,
        item.variantKey,
        item.payloadJson,
        nextStatus,
        nextShortLink,
        nextErrorMessage,
        nextRetryCount,
        now,
        now,
      );

      if (nextStatus === 'success' && nextShortLink) {
        try {
          const payload = JSON.parse(item.payloadJson) as Record<string, string>;
          upsertOneLinkRecordForGroupItem(executionConfig, {
            id: item.id,
            pathLabel: item.pathLabel,
            payloadJson: item.payloadJson,
          }, payload, nextShortLink);
        } catch {
          // Preserve forward progress even if one row payload is malformed.
        }
      }
    });
  });

  persistUpdate();
  refreshGroupAggregates(groupId);

  const refreshed = getGroupRowById(groupId);
  if (!refreshed) {
    throw new Error('GROUP_UPDATE_FAILED');
  }

  if (targetedItemCount > 0) {
    db.prepare(
      `
        UPDATE onelink_link_groups
        SET
          status = 'running',
          updated_at = ?
        WHERE id = ?
      `,
    ).run(new Date().toISOString(), groupId);
    startLinkGroupExecution(groupId);
  }

  const finalGroup = getGroupRowById(groupId);
  if (!finalGroup) {
    throw new Error('GROUP_UPDATE_FAILED');
  }

  return {
    diff: {
      addedPaths: diffAddedPaths,
      changedPaths: [],
      failedPaths: diffFailedPaths,
      removedPaths: diffRemovedPaths,
      unchangedPaths: diffUnchangedPaths,
    },
    execution: {
      appliedMode: input.applyMode,
      status: finalGroup.status,
      targetedItemCount,
    },
    group: mapGroupRowToSummary(finalGroup),
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
          global_params_json,
          scoped_params_json,
          shortlink_id_config_json,
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
          global_params_json,
          scoped_params_json,
          shortlink_id_config_json,
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
    globalParams: parseGlobalParamsJson(group.global_params_json),
    id: group.id,
    items: itemRows.map((itemRow) => mapGroupItemRow(itemRow)),
    name: group.name,
    page: safePage,
    pageSize: safePageSize,
    plannedCount: group.planned_count,
    scopedParams: parseScopedParamsJson(group.scoped_params_json),
    shortLinkIdConfig: parseShortLinkIdConfigJson(group.shortlink_id_config_json),
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
  ensureOneLinkLinkGroupColumns(db);
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
    const result = await deleteRemoteShortLinksForGroup(groupId, group.template_id);
    remoteDeleted = result.remoteDeleted;
  }

  const remove = db.transaction(() => {
    db.prepare('DELETE FROM onelink_links WHERE group_id = ?').run(groupId);
    const deletedGroup = db.prepare('DELETE FROM onelink_link_groups WHERE id = ?').run(groupId);
    return deletedGroup.changes > 0;
  });

  const deleted = remove();
  clearActiveGroupExecution(groupId);

  return {
    deleted,
    remoteDeleted,
  };
}
