/**
 * Runs asynchronous link-group item execution with concurrency control and item state transitions.
 */

import { randomUUID } from 'node:crypto';
import {
  createOneLinkShortlink,
  deleteOneLinkShortlink,
  extractShortLinkIdFromUrl,
  OneLinkCreateError,
  OneLinkDeleteError,
} from '@/lib/onelinkApi';
import {
  createShortLinkIdAllocator,
  resolveShortLinkIdBaseFromPayload,
  type ShortLinkIdAllocator,
} from '@/lib/onelinkShortLinkId';
import { ensureOneLinkLinkGroupColumns, getSqliteDatabase } from '@/lib/sqlite';
import { EXECUTION_CONCURRENCY, type ClaimedPendingItem, type GroupExecutionConfig } from '@/lib/onelinkGroupStore.types';
import {
  buildLongUrlPreview,
  claimPendingItems,
  getGroupExecutionConfig,
  refreshGroupAggregates,
} from '@/lib/onelinkGroupStore.utils';

const activeGroupExecutions = new Set<string>();

export async function runTasksWithConcurrency<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  let cursor = 0;

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = cursor;
      cursor += 1;

      if (currentIndex >= items.length) {
        return;
      }

      await task(items[currentIndex]);
    }
  });

  await Promise.allSettled(workers);
}

export function upsertOneLinkRecordForGroupItem(
  config: GroupExecutionConfig,
  item: ClaimedPendingItem,
  payload: Record<string, string>,
  shortLink: string,
): void {
  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);
  const now = new Date().toISOString();
  const linkName = `${config.groupName} | ${item.pathLabel}`.slice(0, 160);

  db.prepare(
    `
      INSERT INTO onelink_links (
        id,
        link_name,
        short_link,
        long_url,
        template_id,
        brand_domain,
        media_source,
        campaign_name,
        channel,
        creation_type,
        group_id,
        group_item_id,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'link_group', ?, ?, ?)
      ON CONFLICT(group_item_id) DO UPDATE SET
        link_name = excluded.link_name,
        short_link = excluded.short_link,
        long_url = excluded.long_url,
        template_id = excluded.template_id,
        brand_domain = excluded.brand_domain,
        media_source = excluded.media_source,
        campaign_name = excluded.campaign_name,
        channel = excluded.channel,
        group_id = excluded.group_id
    `,
  ).run(
    randomUUID(),
    linkName,
    shortLink,
    buildLongUrlPreview(config.templateId, payload),
    config.templateId,
    config.brandDomain,
    payload.pid ?? '',
    payload.c ?? '',
    payload.af_channel ?? '',
    config.groupId,
    item.id,
    now,
  );
}

function markItemSuccess(
  config: GroupExecutionConfig,
  item: ClaimedPendingItem,
  payload: Record<string, string>,
  shortLink: string,
): void {
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
  ).run(shortLink, new Date().toISOString(), item.id);

  upsertOneLinkRecordForGroupItem(config, item, payload, shortLink);
  refreshGroupAggregates(config.groupId);
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

function getReservedShortLinkIdsForGroup(groupId: string, templateId: string): string[] {
  const db = getSqliteDatabase();
  const storedRows = db
    .prepare(
      `
        SELECT short_link
        FROM onelink_links
        WHERE template_id = ?
          AND short_link != ''
      `,
    )
    .all(templateId) as Array<{ short_link: string }>;
  const templateGroupRows = db
    .prepare(
      `
        SELECT items.short_link
        FROM onelink_link_group_items items
        INNER JOIN onelink_link_groups groups ON groups.id = items.group_id
        WHERE groups.template_id = ?
          AND items.short_link != ''
      `,
    )
    .all(templateId) as Array<{ short_link: string }>;
  const reservedIds = new Set<string>();
  [...storedRows, ...templateGroupRows].forEach((row) => {
    const extracted = extractShortLinkIdFromUrl(row.short_link, templateId);
    if (extracted) {
      reservedIds.add(extracted);
    }
  });

  return [...reservedIds];
}

async function executeSingleItem(
  config: GroupExecutionConfig,
  item: ClaimedPendingItem,
  shortLinkIdAllocator: ShortLinkIdAllocator,
): Promise<void> {
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
    const shortLinkIdBase = resolveShortLinkIdBaseFromPayload(parsedPayload, config.shortLinkIdConfig);
    const shortLinkId = shortLinkIdBase ? shortLinkIdAllocator.allocate(shortLinkIdBase) : undefined;
    const shortLink = await createOneLinkShortlink({
      brandDomain: config.brandDomain,
      data: parsedPayload,
      shortLinkId,
      templateId: config.templateId,
    });

    markItemSuccess(config, item, parsedPayload, shortLink);
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
  let shortLinkIdAllocator: ShortLinkIdAllocator | null = null;
  let allocatorTemplateId = '';

  while (true) {
    const config = getGroupExecutionConfig(groupId);
    if (!config) {
      break;
    }

    if (!shortLinkIdAllocator || allocatorTemplateId !== config.templateId) {
      shortLinkIdAllocator = createShortLinkIdAllocator(getReservedShortLinkIdsForGroup(groupId, config.templateId));
      allocatorTemplateId = config.templateId;
    }
    if (!shortLinkIdAllocator) {
      break;
    }
    const allocator = shortLinkIdAllocator;

    const items = claimPendingItems(groupId, EXECUTION_CONCURRENCY);
    if (items.length === 0) {
      break;
    }

    await Promise.allSettled(
      items.map(async (item) => {
        await executeSingleItem(config, item, allocator);
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

export async function deleteRemoteShortLinksForGroup(
  groupId: string,
  templateId: string,
): Promise<{ remoteDeleted: boolean }> {
  const db = getSqliteDatabase();
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

  let hasRemoteDeleteFailure = false;

  await runTasksWithConcurrency(successItems, 5, async (item) => {
    const shortLinkId = extractShortLinkIdFromUrl(item.short_link, templateId);
    if (!shortLinkId) {
      hasRemoteDeleteFailure = true;
      return;
    }

    try {
      await deleteOneLinkShortlink(templateId, shortLinkId);
    } catch (error) {
      if (error instanceof OneLinkDeleteError) {
        hasRemoteDeleteFailure = true;
        return;
      }

      hasRemoteDeleteFailure = true;
    }
  });

  return {
    remoteDeleted: !hasRemoteDeleteFailure,
  };
}

export function clearActiveGroupExecution(groupId: string): void {
  activeGroupExecutions.delete(groupId);
}
