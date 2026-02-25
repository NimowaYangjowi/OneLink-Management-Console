/**
 * Shared DB and serialization utilities used by OneLink group store modules.
 */

import { createHash } from 'node:crypto';
import type { ScopedParamRule } from '@/lib/onelinkGroupSchema';
import { normalizeLinkGroupShortLinkIdConfig } from '@/lib/onelinkShortLinkId';
import { getSqliteDatabase } from '@/lib/sqlite';
import type {
  LinkGroupItemStatus,
  LinkGroupShortLinkIdConfig,
  LinkGroupStatus,
} from '@/lib/onelinkGroupTypes';
import type {
  ClaimedPendingItem,
  ExistingGroupItemSnapshot,
  GroupExecutionConfig,
  GroupItemRow,
  GroupRow,
  LinkGroupItemRecord,
  LinkGroupSummary,
} from '@/lib/onelinkGroupStore.types';

export function mapGroupRowToSummary(row: GroupRow): LinkGroupSummary {
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

export function mapGroupItemRow(row: GroupItemRow): LinkGroupItemRecord {
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

export function getGroupRowById(groupId: string): GroupRow | undefined {
  const db = getSqliteDatabase();

  return db
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
}

export function buildVariantKey(payload: Record<string, string>): string {
  const sortedEntries = Object.entries(payload)
    .sort(([first], [second]) => first.localeCompare(second));

  return createHash('sha256').update(JSON.stringify(sortedEntries)).digest('hex');
}

export function buildLongUrlPreview(templateId: string, oneLinkData: Record<string, string>): string {
  const query = new URLSearchParams(oneLinkData).toString();
  if (!query) {
    return `https://app.onelink.me/${templateId}`;
  }

  return `https://app.onelink.me/${templateId}?${query}`;
}

export function parseGlobalParamsJson(value: string | undefined): Record<string, string> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.entries(parsed as Record<string, unknown>).reduce<Record<string, string>>((accumulator, [key, rawValue]) => {
      if (!key.trim() || typeof rawValue !== 'string') {
        return accumulator;
      }

      accumulator[key.trim()] = rawValue.trim();
      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

export function parseScopedParamsJson(value: string | undefined): ScopedParamRule[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.reduce<ScopedParamRule[]>((accumulator, rawRule) => {
      if (!rawRule || typeof rawRule !== 'object' || Array.isArray(rawRule)) {
        return accumulator;
      }

      const candidate = rawRule as Record<string, unknown>;
      const key = typeof candidate.key === 'string' ? candidate.key.trim() : '';
      const valueText = typeof candidate.value === 'string' ? candidate.value.trim() : '';
      const isDisabled = Boolean(candidate.isDisabled);
      if (!key || (!valueText && !isDisabled) || !Array.isArray(candidate.scopePathPrefixes)) {
        return accumulator;
      }

      const scopePathPrefixes = Array.from(
        new Set(
          candidate.scopePathPrefixes
            .filter((entry): entry is string => typeof entry === 'string')
            .map((entry) => entry.trim())
            .filter(Boolean),
        ),
      );

      if (scopePathPrefixes.length === 0) {
        return accumulator;
      }

      accumulator.push({
        isDisabled,
        key,
        scopePathPrefixes,
        value: valueText,
      });

      return accumulator;
    }, []);
  } catch {
    return [];
  }
}

export function parseShortLinkIdConfigJson(value: string | undefined): LinkGroupShortLinkIdConfig {
  if (!value) {
    return { mode: 'random' };
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return normalizeLinkGroupShortLinkIdConfig(parsed);
  } catch {
    return { mode: 'random' };
  }
}

export function getScopeSpecificity(scopePathPrefixes: string[]): number {
  return scopePathPrefixes.reduce((maxDepth, prefix) => {
    const depth = prefix.split(' > ').length;
    return Math.max(maxDepth, depth);
  }, 0);
}

export function pathMatchesScope(pathLabel: string, scopePathPrefixes: string[]): boolean {
  return scopePathPrefixes.some((prefix) => pathLabel === prefix || pathLabel.startsWith(`${prefix} > `));
}

export function getExistingGroupItemsSnapshot(groupId: string): ExistingGroupItemSnapshot[] {
  const db = getSqliteDatabase();

  const rows = db
    .prepare(
      `
        SELECT
          variant_key,
          path_label,
          status,
          short_link,
          error_message,
          retry_count
        FROM onelink_link_group_items
        WHERE group_id = ?
      `,
    )
    .all(groupId) as Array<{
      error_message: string;
      path_label: string;
      retry_count: number;
      short_link: string;
      status: LinkGroupItemStatus;
      variant_key: string;
    }>;

  return rows.map((row) => ({
    errorMessage: row.error_message,
    pathLabel: row.path_label,
    retryCount: row.retry_count,
    shortLink: row.short_link,
    status: row.status,
    variantKey: row.variant_key,
  }));
}

export function resolveFinalStatus(successCount: number, failedCount: number, pendingCount: number): LinkGroupStatus {
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

export function refreshGroupAggregates(groupId: string): void {
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

export function getGroupExecutionConfig(groupId: string): GroupExecutionConfig | null {
  const db = getSqliteDatabase();
  const row = db
    .prepare(
      `
        SELECT
          id,
          name,
          template_id,
          brand_domain,
          shortlink_id_config_json
        FROM onelink_link_groups
        WHERE id = ?
        LIMIT 1
      `,
    )
    .get(groupId) as {
      brand_domain: string;
      id: string;
      name: string;
      shortlink_id_config_json?: string;
      template_id: string;
    } | undefined;

  if (!row) {
    return null;
  }

  return {
    brandDomain: row.brand_domain,
    groupName: row.name,
    groupId: row.id,
    shortLinkIdConfig: parseShortLinkIdConfigJson(row.shortlink_id_config_json),
    templateId: row.template_id,
  };
}

export function claimPendingItems(groupId: string, limit: number): ClaimedPendingItem[] {
  const db = getSqliteDatabase();

  const claim = db.transaction((targetGroupId: string, targetLimit: number) => {
    const now = new Date().toISOString();
    const rows = db
      .prepare(
        `
          SELECT
            id,
            payload_json,
            path_label
          FROM onelink_link_group_items
          WHERE group_id = ?
            AND status = 'pending'
          ORDER BY created_at ASC
          LIMIT ?
        `,
      )
      .all(targetGroupId, targetLimit) as Array<{ id: string; path_label: string; payload_json: string }>;

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
      pathLabel: row.path_label,
      payloadJson: row.payload_json,
    }));
  });

  return claim(groupId, limit);
}
