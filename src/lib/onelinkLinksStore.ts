/**
 * Server-side repository for persisting and reading created OneLink records.
 */
import 'server-only';

import { randomUUID } from 'node:crypto';
import type { CreateOneLinkPayload, OneLinkRecord } from '@/lib/onelinkLinksSchema';
import { ensureOneLinkLinkGroupColumns, getSqliteDatabase } from '@/lib/sqlite';

interface OneLinkRow {
  brand_domain: string;
  campaign_name: string;
  channel: string;
  created_at: string;
  creation_type: string;
  group_id: string | null;
  group_item_id: string | null;
  id: string;
  link_name: string;
  long_url: string;
  media_source: string;
  short_link: string;
  template_id: string;
}

type UpdateOneLinkRecordInput = {
  brandDomain: string;
  campaignName: string;
  channel: string;
  id: string;
  linkName: string;
  longUrl: string;
  mediaSource: string;
};

function mapOneLinkRowToRecord(row: OneLinkRow): OneLinkRecord {
  return {
    brandDomain: row.brand_domain,
    campaignName: row.campaign_name,
    channel: row.channel,
    createdAt: row.created_at,
    creationType: row.creation_type as OneLinkRecord['creationType'],
    groupId: row.group_id || undefined,
    groupItemId: row.group_item_id || undefined,
    id: row.id,
    linkName: row.link_name,
    longUrl: row.long_url,
    mediaSource: row.media_source,
    shortLink: row.short_link,
    templateId: row.template_id,
  };
}

/**
 * createOneLinkRecord - Creates and stores a new OneLink record.
 */
export function createOneLinkRecord(input: CreateOneLinkPayload): OneLinkRecord {
  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);
  const id = randomUUID();
  const createdAt = new Date().toISOString();

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
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    id,
    input.linkName,
    input.shortLink,
    input.longUrl,
    input.templateId,
    input.brandDomain,
    input.mediaSource,
    input.campaignName,
    input.channel,
    input.creationType,
    createdAt,
  );

  return {
    ...input,
    createdAt,
    id,
  };
}

/**
 * listOneLinkRecords - Returns the most recent stored OneLink records.
 */
export function listOneLinkRecords(limit = 200): OneLinkRecord[] {
  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);
  const safeLimit = Math.max(1, Math.min(limit, 1000));

  const rows = db
    .prepare(
      `
        SELECT
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
        FROM onelink_links
        ORDER BY datetime(created_at) DESC
        LIMIT ?
      `,
    )
    .all(safeLimit) as OneLinkRow[];

  return rows.map((row) => mapOneLinkRowToRecord(row));
}

/**
 * getOneLinkRecordById - Returns a stored OneLink record by ID.
 */
export function getOneLinkRecordById(id: string): OneLinkRecord | null {
  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);
  const row = db
    .prepare(
      `
        SELECT
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
        FROM onelink_links
        WHERE id = ?
        LIMIT 1
      `,
    )
    .get(id) as OneLinkRow | undefined;

  if (!row) {
    return null;
  }

  return mapOneLinkRowToRecord(row);
}

/**
 * updateOneLinkRecord - Updates mutable metadata of an existing OneLink record.
 */
export function updateOneLinkRecord(input: UpdateOneLinkRecordInput): OneLinkRecord | null {
  const db = getSqliteDatabase();
  const result = db.prepare(
    `
      UPDATE onelink_links
      SET
        link_name = ?,
        long_url = ?,
        brand_domain = ?,
        media_source = ?,
        campaign_name = ?,
        channel = ?
      WHERE id = ?
    `,
  ).run(
    input.linkName,
    input.longUrl,
    input.brandDomain,
    input.mediaSource,
    input.campaignName,
    input.channel,
    input.id,
  );

  if (result.changes < 1) {
    return null;
  }

  return getOneLinkRecordById(input.id);
}

/**
 * deleteOneLinkRecord - Deletes a stored OneLink record by ID.
 */
export function deleteOneLinkRecord(id: string): boolean {
  const db = getSqliteDatabase();
  const result = db.prepare('DELETE FROM onelink_links WHERE id = ?').run(id);
  return result.changes > 0;
}
