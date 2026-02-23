/**
 * Utility helpers for formatting and routing logic on the OneLink list page.
 */

import type { OneLinkCreationType, OneLinkRecord } from '@/lib/onelinkLinksSchema';
import type { SearchParamsReader } from './types';

export function formatCreatedAt(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return new Date(timestamp).toLocaleString();
}

export function buildEditHref(record: OneLinkRecord): string {
  if (record.creationType === 'link_group') {
    const targetId = record.groupId || record.id;
    return `/link-groups/${encodeURIComponent(targetId)}`;
  }

  return `/create/single-link/${encodeURIComponent(record.id)}`;
}

export function buildLongUrlPreview(templateId: string, oneLinkData: Record<string, string>): string {
  const query = new URLSearchParams(oneLinkData).toString();
  if (!query) {
    return `https://app.onelink.me/${templateId}`;
  }

  return `https://app.onelink.me/${templateId}?${query}`;
}

export function getCreationTypeFromSearchParams(searchParams: SearchParamsReader): OneLinkCreationType {
  const type = searchParams.get('type');
  if (type === 'link_group') {
    return 'link_group';
  }

  return 'single_link';
}
