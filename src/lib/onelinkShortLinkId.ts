/**
 * Shared short link ID normalization and allocation helpers for OneLink and Link Group flows.
 */

import type { LinkGroupShortLinkIdConfig } from '@/lib/onelinkGroupTypes';

const SHORT_LINK_ID_ALLOWED_CHARS_REGEX = /[^a-zA-Z0-9_-]+/g;
const SHORT_LINK_ID_MULTI_SEPARATOR_REGEX = /[_-]{2,}/g;
const SHORT_LINK_ID_TRIM_SEPARATOR_REGEX = /^[_-]+|[_-]+$/g;
const SHORT_LINK_FIELD_KEY_REGEX = /^[a-zA-Z0-9_.-]+$/;

const SHORT_LINK_ID_FALLBACK_BASE = 'link';
const SHORT_LINK_ID_SUFFIX_START = 2;
const SHORT_LINK_ID_SUFFIX_LIMIT = 10000;
const SHORT_LINK_FIELD_KEY_MAX_LENGTH = 128;
export const SHORT_LINK_ID_MAX_LENGTH = 50;
export const SHORT_LINK_RANDOM_SEGMENT = '{random}';

function stripCombiningMarks(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function trimSeparators(value: string): string {
  return value.replace(SHORT_LINK_ID_TRIM_SEPARATOR_REGEX, '');
}

function withMaxLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength);
}

export function normalizeShortLinkFieldKey(value: string): string {
  const normalized = value.trim().slice(0, SHORT_LINK_FIELD_KEY_MAX_LENGTH);
  if (!normalized || !SHORT_LINK_FIELD_KEY_REGEX.test(normalized)) {
    return '';
  }

  return normalized;
}

export function normalizeLinkGroupShortLinkIdConfig(value: unknown): LinkGroupShortLinkIdConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { mode: 'random' };
  }

  const candidate = value as Partial<Record<'fieldKey' | 'mode', unknown>>;
  if (candidate.mode !== 'field') {
    return { mode: 'random' };
  }

  const fieldKey = typeof candidate.fieldKey === 'string' ? normalizeShortLinkFieldKey(candidate.fieldKey) : '';
  if (!fieldKey) {
    return { mode: 'random' };
  }

  return {
    fieldKey,
    mode: 'field',
  };
}

export function sanitizeShortLinkIdBase(value: string): string {
  const normalized = trimSeparators(
    stripCombiningMarks(value.trim())
      .replace(SHORT_LINK_ID_ALLOWED_CHARS_REGEX, '-')
      .replace(SHORT_LINK_ID_MULTI_SEPARATOR_REGEX, '-'),
  );

  return withMaxLength(normalized, SHORT_LINK_ID_MAX_LENGTH);
}

export function resolveShortLinkIdBaseFromPayload(
  payload: Record<string, string>,
  shortLinkIdConfig: LinkGroupShortLinkIdConfig,
): string | null {
  if (shortLinkIdConfig.mode !== 'field') {
    return null;
  }

  const fieldKey = normalizeShortLinkFieldKey(shortLinkIdConfig.fieldKey);
  if (!fieldKey) {
    return null;
  }

  const rawValue = payload[fieldKey];
  if (!rawValue) {
    return null;
  }

  const normalized = sanitizeShortLinkIdBase(rawValue);
  if (!normalized) {
    return null;
  }

  return normalized;
}

export type ShortLinkIdAllocator = {
  allocate: (base: string) => string;
};

export function createShortLinkIdAllocator(initialReservedIds: Iterable<string> = []): ShortLinkIdAllocator {
  const usedIds = new Set<string>();
  const nextSuffixByBase = new Map<string, number>();

  const reserve = (candidate: string) => {
    if (!candidate) {
      return;
    }

    usedIds.add(candidate);
    const suffixMatch = candidate.match(/^(.*?)-(\d+)$/);
    if (!suffixMatch) {
      if (!nextSuffixByBase.has(candidate)) {
        nextSuffixByBase.set(candidate, SHORT_LINK_ID_SUFFIX_START);
      }
      return;
    }

    const base = trimSeparators(withMaxLength(suffixMatch[1], SHORT_LINK_ID_MAX_LENGTH)) || SHORT_LINK_ID_FALLBACK_BASE;
    const suffixValue = Number.parseInt(suffixMatch[2], 10);
    if (Number.isNaN(suffixValue)) {
      return;
    }

    nextSuffixByBase.set(base, Math.max(nextSuffixByBase.get(base) ?? SHORT_LINK_ID_SUFFIX_START, suffixValue + 1));
  };

  for (const id of initialReservedIds) {
    reserve(withMaxLength(String(id).trim(), SHORT_LINK_ID_MAX_LENGTH));
  }

  const allocate = (base: string): string => {
    const normalizedBase = sanitizeShortLinkIdBase(base) || SHORT_LINK_ID_FALLBACK_BASE;
    if (!usedIds.has(normalizedBase)) {
      reserve(normalizedBase);
      return normalizedBase;
    }

    let suffix = nextSuffixByBase.get(normalizedBase) ?? SHORT_LINK_ID_SUFFIX_START;
    while (suffix < SHORT_LINK_ID_SUFFIX_LIMIT) {
      const suffixText = `-${suffix}`;
      const baseMaxLength = Math.max(1, SHORT_LINK_ID_MAX_LENGTH - suffixText.length);
      const candidateBase = trimSeparators(withMaxLength(normalizedBase, baseMaxLength)) || SHORT_LINK_ID_FALLBACK_BASE.slice(0, baseMaxLength);
      const candidate = `${candidateBase}${suffixText}`;
      if (!usedIds.has(candidate)) {
        reserve(candidate);
        return candidate;
      }
      suffix += 1;
    }

    const fallbackCandidate = `${SHORT_LINK_ID_FALLBACK_BASE}-${Date.now().toString(36).slice(-6)}`;
    reserve(withMaxLength(fallbackCandidate, SHORT_LINK_ID_MAX_LENGTH));
    return withMaxLength(fallbackCandidate, SHORT_LINK_ID_MAX_LENGTH);
  };

  return { allocate };
}

export function buildShortLinkBaseUrl(templateId: string, brandDomain: string): string {
  const normalizedTemplateId = templateId.trim() || 'template';
  const normalizedDomain = brandDomain.trim().toLowerCase() || 'app.onelink.me';
  return `https://${normalizedDomain}/${normalizedTemplateId}`;
}

export function buildShortLinkPreviewUrl(
  baseShortLinkUrl: string,
  shortLinkId: string | null,
): string {
  if (!shortLinkId) {
    return `${baseShortLinkUrl}/${SHORT_LINK_RANDOM_SEGMENT}`;
  }

  return `${baseShortLinkUrl}/${shortLinkId}`;
}
