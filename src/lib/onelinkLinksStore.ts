/**
 * Server-side repository for persisting and reading created OneLink records.
 */
import 'server-only';

import { randomUUID } from 'node:crypto';
import { extractShortLinkIdFromUrl } from '@/lib/onelinkApi';
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

type ListOneLinkRecordsPageInput = {
  creationType?: OneLinkRecord['creationType'];
  page?: number;
  pageSize?: number;
  query?: string;
  templateId?: string;
};

export type OneLinkRecordsPage = {
  page: number;
  pageSize: number;
  records: OneLinkRecord[];
  total: number;
  totalPages: number;
};

type QueryFilters = {
  creationType?: OneLinkRecord['creationType'];
  query?: string;
  templateId?: string;
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

function isValidCreationType(value: string): value is OneLinkRecord['creationType'] {
  return value === 'single_link' || value === 'link_group';
}

function sanitizePositiveInt(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(value));
}

function escapeLikePattern(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_');
}

function buildWhereClause(filters: QueryFilters): { params: Array<number | string>; whereClause: string } {
  const conditions: string[] = [];
  const params: Array<number | string> = [];

  const normalizedCreationType = filters.creationType?.trim();
  if (normalizedCreationType && isValidCreationType(normalizedCreationType)) {
    conditions.push('creation_type = ?');
    params.push(normalizedCreationType);
  }

  const normalizedTemplateId = filters.templateId?.trim();
  if (normalizedTemplateId) {
    conditions.push('template_id = ?');
    params.push(normalizedTemplateId);
  }

  const normalizedQuery = filters.query?.trim();
  if (normalizedQuery) {
    const escapedQuery = `%${escapeLikePattern(normalizedQuery)}%`;
    conditions.push(`
      (
        link_name LIKE ? ESCAPE '\\'
        OR short_link LIKE ? ESCAPE '\\'
        OR long_url LIKE ? ESCAPE '\\'
        OR template_id LIKE ? ESCAPE '\\'
        OR media_source LIKE ? ESCAPE '\\'
        OR campaign_name LIKE ? ESCAPE '\\'
        OR channel LIKE ? ESCAPE '\\'
      )
    `);
    params.push(
      escapedQuery,
      escapedQuery,
      escapedQuery,
      escapedQuery,
      escapedQuery,
      escapedQuery,
      escapedQuery,
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { params, whereClause };
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
 * listOneLinkRecordsPage - Returns paginated OneLink records with optional filters.
 */
export function listOneLinkRecordsPage(input: ListOneLinkRecordsPageInput = {}): OneLinkRecordsPage {
  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);

  const safePageSize = Math.min(sanitizePositiveInt(input.pageSize, 50), 200);
  const safePage = sanitizePositiveInt(input.page, 1);

  const { params, whereClause } = buildWhereClause({
    creationType: input.creationType,
    query: input.query,
    templateId: input.templateId,
  });

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM onelink_links ${whereClause}`)
    .get(...params) as { count: number };
  const total = totalRow.count;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const normalizedPage = Math.min(safePage, totalPages);
  const normalizedOffset = (normalizedPage - 1) * safePageSize;

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
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
    )
    .all(...params, safePageSize, normalizedOffset) as OneLinkRow[];

  return {
    page: normalizedPage,
    pageSize: safePageSize,
    records: rows.map((row) => mapOneLinkRowToRecord(row)),
    total,
    totalPages,
  };
}

/**
 * listOneLinkTemplateOptions - Returns sorted distinct template IDs for list filters.
 */
export function listOneLinkTemplateOptions(input: Pick<ListOneLinkRecordsPageInput, 'creationType' | 'query'>): string[] {
  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);

  const { params, whereClause } = buildWhereClause({
    creationType: input.creationType,
    query: input.query,
  });

  const rows = db
    .prepare(
      `
        SELECT DISTINCT template_id
        FROM onelink_links
        ${whereClause}
        ORDER BY template_id ASC
      `,
    )
    .all(...params) as Array<{ template_id: string }>;

  return rows.map((row) => row.template_id).filter(Boolean);
}

/**
 * listStoredShortLinkIds - Returns normalized short link IDs already stored for a template.
 */
export function listStoredShortLinkIds(templateId: string, excludeGroupId?: string): string[] {
  const normalizedTemplateId = templateId.trim();
  if (!normalizedTemplateId) {
    return [];
  }

  const db = getSqliteDatabase();
  ensureOneLinkLinkGroupColumns(db);
  const normalizedExcludeGroupId = excludeGroupId?.trim();

  const rows = normalizedExcludeGroupId
    ? db
      .prepare(
        `
          SELECT short_link
          FROM onelink_links
          WHERE template_id = ?
            AND short_link != ''
            AND (group_id IS NULL OR group_id <> ?)
        `,
      )
      .all(normalizedTemplateId, normalizedExcludeGroupId) as Array<{ short_link: string }>
    : db
      .prepare(
        `
          SELECT short_link
          FROM onelink_links
          WHERE template_id = ?
            AND short_link != ''
        `,
      )
      .all(normalizedTemplateId) as Array<{ short_link: string }>;
  const groupItemRows = normalizedExcludeGroupId
    ? db
      .prepare(
        `
          SELECT items.short_link
          FROM onelink_link_group_items items
          INNER JOIN onelink_link_groups groups ON groups.id = items.group_id
          WHERE groups.template_id = ?
            AND items.short_link != ''
            AND items.group_id <> ?
        `,
      )
      .all(normalizedTemplateId, normalizedExcludeGroupId) as Array<{ short_link: string }>
    : db
      .prepare(
        `
          SELECT items.short_link
          FROM onelink_link_group_items items
          INNER JOIN onelink_link_groups groups ON groups.id = items.group_id
          WHERE groups.template_id = ?
            AND items.short_link != ''
        `,
      )
      .all(normalizedTemplateId) as Array<{ short_link: string }>;

  const shortLinkIdSet = new Set<string>();
  [...rows, ...groupItemRows].forEach((row) => {
    const shortLinkId = extractShortLinkIdFromUrl(row.short_link, normalizedTemplateId);
    if (shortLinkId) {
      shortLinkIdSet.add(shortLinkId);
    }
  });

  return [...shortLinkIdSet];
}

/**
 * findExistingShortLinkIds - Returns candidate short link IDs that already exist in storage.
 */
export function findExistingShortLinkIds(
  templateId: string,
  candidateIds: string[],
  excludeGroupId?: string,
): string[] {
  const normalizedCandidateIds = Array.from(
    new Set(
      candidateIds
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
  if (normalizedCandidateIds.length === 0) {
    return [];
  }

  const existingIdSet = new Set(listStoredShortLinkIds(templateId, excludeGroupId));
  return normalizedCandidateIds.filter((candidateId) => existingIdSet.has(candidateId));
}

/**
 * listOneLinkRecords - Returns the most recent stored OneLink records.
 */
export function listOneLinkRecords(limit = 200): OneLinkRecord[] {
  const safeLimit = Math.max(1, Math.min(limit, 1000));
  return listOneLinkRecordsPage({ page: 1, pageSize: safeLimit }).records;
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
