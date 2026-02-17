/**
 * Shared schema helpers for OneLink creation/list payload validation and normalization.
 */

export type OneLinkCreationType = 'single_link' | 'link_group';

export interface CreateOneLinkRequestPayload {
  brandDomain: string;
  campaignName: string;
  channel: string;
  creationType: OneLinkCreationType;
  linkName: string;
  longUrlPreview: string;
  mediaSource: string;
  oneLinkData: Record<string, string>;
  shortLinkId: string;
  templateId: string;
}

export interface CreateOneLinkPayload {
  brandDomain: string;
  campaignName: string;
  channel: string;
  creationType: OneLinkCreationType;
  linkName: string;
  longUrl: string;
  mediaSource: string;
  shortLink: string;
  templateId: string;
}

export interface OneLinkRecord extends CreateOneLinkPayload {
  createdAt: string;
  id: string;
}

const CREATION_TYPES = new Set<OneLinkCreationType>(['single_link', 'link_group']);
const SHORT_LINK_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const TEMPLATE_ID_REGEX = /^[a-zA-Z0-9]{4}$/;
const IPV4_HOSTNAME_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const REDIRECTION_URL_FIELD_LABELS: Record<string, string> = {
  af_android_url: 'Android Mobile Redirection URL',
  af_ios_url: 'iOS Mobile Redirection URL',
  af_web_dp: 'Desktop Fallback URL',
};

function sanitizeOptionalString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, maxLength);
}

function sanitizeRequiredString(value: unknown, fieldLabel: string, maxLength: number): { error?: string; value: string } {
  const sanitized = sanitizeOptionalString(value, maxLength);
  if (!sanitized) {
    return { error: `${fieldLabel} is required.`, value: '' };
  }
  return { value: sanitized };
}

function sanitizeCreationType(value: unknown): OneLinkCreationType | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim() as OneLinkCreationType;
  return CREATION_TYPES.has(normalized) ? normalized : null;
}

function isLocalOrPrivateHostname(hostname: string): boolean {
  if (!hostname) {
    return true;
  }

  const normalized = hostname.trim().toLowerCase();
  if (!normalized || normalized === 'localhost' || normalized.endsWith('.localhost')) {
    return true;
  }

  if (normalized.includes(':') || IPV4_HOSTNAME_REGEX.test(normalized)) {
    return true;
  }

  if (!normalized.includes('.')) {
    return true;
  }

  const tld = normalized.split('.').pop() || '';
  return !/^[a-z]{2,63}$/i.test(tld);
}

/**
 * validateOneLinkRedirectUrl - Validates AppsFlyer redirect URLs requiring a public http(s) domain.
 */
export function validateOneLinkRedirectUrl(
  value: string,
  fieldLabel: string,
): { error?: string; valid: boolean } {
  const normalized = value.trim();
  if (!normalized) {
    return { valid: true };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalized);
  } catch {
    return {
      error: `${fieldLabel} must be a valid absolute URL.`,
      valid: false,
    };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return {
      error: `${fieldLabel} must start with http:// or https://.`,
      valid: false,
    };
  }

  if (isLocalOrPrivateHostname(parsedUrl.hostname)) {
    return {
      error: `${fieldLabel} must use a public domain with a valid TLD. Localhost and IP addresses are not supported by AppsFlyer.`,
      valid: false,
    };
  }

  return { valid: true };
}

function sanitizeOneLinkData(value: unknown): { error?: string; value: Record<string, string> } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { error: 'OneLink data is invalid.', value: {} };
  }

  const normalized: Record<string, string> = {};
  let totalEntries = 0;

  for (const [rawKey, rawValue] of Object.entries(value as Record<string, unknown>)) {
    const key = rawKey.trim();
    if (!key) {
      continue;
    }

    if (typeof rawValue !== 'string') {
      return { error: `OneLink data value for "${key}" must be a string.`, value: {} };
    }

    const dataValue = rawValue.trim();
    if (!dataValue) {
      continue;
    }

    if (key.length > 128) {
      return { error: `OneLink data key "${key}" is too long.`, value: {} };
    }

    if (dataValue.length > 1024) {
      return { error: `OneLink data value for "${key}" is too long.`, value: {} };
    }

    const redirectionFieldLabel = REDIRECTION_URL_FIELD_LABELS[key];
    if (redirectionFieldLabel) {
      const validation = validateOneLinkRedirectUrl(dataValue, redirectionFieldLabel);
      if (!validation.valid) {
        return { error: validation.error, value: {} };
      }
    }

    normalized[key] = dataValue;
    totalEntries += 1;

    if (totalEntries > 100) {
      return { error: 'Too many OneLink data parameters.', value: {} };
    }
  }

  if (!normalized.pid) {
    return { error: 'Media Source (pid) is required.', value: {} };
  }

  if (new URLSearchParams(normalized).toString().length > 2048) {
    return { error: 'OneLink data exceeds 2048 characters.', value: {} };
  }

  return { value: normalized };
}

/**
 * sanitizeCreateOneLinkRequestPayload - Validates and normalizes create request payload.
 */
export function sanitizeCreateOneLinkRequestPayload(payload: unknown): {
  error?: string;
  value?: CreateOneLinkRequestPayload;
} {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Invalid payload.' };
  }

  const candidate = payload as Record<string, unknown>;
  const linkName = sanitizeRequiredString(candidate.linkName, 'Link name', 160);
  if (linkName.error) {
    return { error: linkName.error };
  }

  const templateId = sanitizeRequiredString(candidate.templateId, 'Template ID', 16);
  if (templateId.error) {
    return { error: templateId.error };
  }

  if (!TEMPLATE_ID_REGEX.test(templateId.value)) {
    return { error: 'Template ID must be exactly 4 alphanumeric characters.' };
  }

  const longUrlPreview = sanitizeRequiredString(candidate.longUrlPreview, 'Long URL', 2048);
  if (longUrlPreview.error) {
    return { error: longUrlPreview.error };
  }

  const creationType = sanitizeCreationType(candidate.creationType);
  if (!creationType) {
    return { error: 'Creation type is invalid.' };
  }

  const shortLinkId = sanitizeOptionalString(candidate.shortLinkId, 50);
  if (shortLinkId && !SHORT_LINK_ID_REGEX.test(shortLinkId)) {
    return { error: 'Short Link ID can include only letters, numbers, "_" or "-".' };
  }

  const sanitizedData = sanitizeOneLinkData(candidate.oneLinkData);
  if (sanitizedData.error) {
    return { error: sanitizedData.error };
  }

  return {
    value: {
      brandDomain: sanitizeOptionalString(candidate.brandDomain, 255),
      campaignName: sanitizeOptionalString(candidate.campaignName, 255),
      channel: sanitizeOptionalString(candidate.channel, 255),
      creationType,
      linkName: linkName.value,
      longUrlPreview: longUrlPreview.value,
      mediaSource: sanitizeOptionalString(candidate.mediaSource, 255),
      oneLinkData: sanitizedData.value,
      shortLinkId,
      templateId: templateId.value,
    },
  };
}

function sanitizeOneLinkRecord(value: unknown): OneLinkRecord | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const creationType = sanitizeCreationType(candidate.creationType);
  if (!creationType) {
    return null;
  }

  const id = sanitizeOptionalString(candidate.id, 128);
  const linkName = sanitizeOptionalString(candidate.linkName, 160);
  const shortLink = sanitizeOptionalString(candidate.shortLink, 600);
  const longUrl = sanitizeOptionalString(candidate.longUrl, 2048);
  const templateId = sanitizeOptionalString(candidate.templateId, 16);
  const createdAt = sanitizeOptionalString(candidate.createdAt, 128);

  if (!id || !linkName || !shortLink || !longUrl || !templateId || !createdAt) {
    return null;
  }

  return {
    brandDomain: sanitizeOptionalString(candidate.brandDomain, 255),
    campaignName: sanitizeOptionalString(candidate.campaignName, 255),
    channel: sanitizeOptionalString(candidate.channel, 255),
    createdAt,
    creationType,
    id,
    linkName,
    longUrl,
    mediaSource: sanitizeOptionalString(candidate.mediaSource, 255),
    shortLink,
    templateId,
  };
}

/**
 * sanitizeOneLinkRecords - Normalizes list payloads used by UI rendering.
 */
export function sanitizeOneLinkRecords(payload: unknown): OneLinkRecord[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => sanitizeOneLinkRecord(item))
    .filter((record): record is OneLinkRecord => Boolean(record));
}
