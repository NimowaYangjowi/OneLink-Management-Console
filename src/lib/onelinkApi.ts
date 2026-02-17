/**
 * Server-side AppsFlyer OneLink API helpers for creating links and probing template domains.
 */
import 'server-only';

import type { TemplateDomainInfo } from '@/lib/settingsSchema';

const ONELINK_API_BASE_URL = 'https://onelink.appsflyer.com/api/v2.0';
const REQUEST_RETRY_DELAYS_MS = [300, 600, 900];
const MAX_REQUEST_ATTEMPTS = REQUEST_RETRY_DELAYS_MS.length + 1;

interface OneLinkCreateShortlinkResponse {
  shortlink_url?: string;
}

interface OneLinkGetShortlinkResponse {
  expiry?: string;
  payload?: Record<string, unknown>;
  ttl?: number | string;
}

interface CreateOneLinkShortlinkInput {
  brandDomain?: string;
  data: Record<string, string>;
  shortLinkId?: string;
  templateId: string;
}

interface UpdateOneLinkShortlinkInput {
  brandDomain?: string;
  data: Record<string, string>;
  shortLinkId: string;
  templateId: string;
  ttl?: string;
}

export interface OneLinkRemoteDetail {
  expiry: string;
  oneLinkData: Record<string, string>;
  ttl: string;
}

export class OneLinkApiError extends Error {
  public readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'OneLinkApiError';
    this.status = status;
  }
}

export class OneLinkProbeError extends OneLinkApiError {
  constructor(message: string, status = 500) {
    super(message, status);
    this.name = 'OneLinkProbeError';
  }
}

export class OneLinkCreateError extends OneLinkApiError {
  constructor(message: string, status = 500) {
    super(message, status);
    this.name = 'OneLinkCreateError';
  }
}

export class OneLinkGetError extends OneLinkApiError {
  constructor(message: string, status = 500) {
    super(message, status);
    this.name = 'OneLinkGetError';
  }
}

export class OneLinkUpdateError extends OneLinkApiError {
  constructor(message: string, status = 500) {
    super(message, status);
    this.name = 'OneLinkUpdateError';
  }
}

export class OneLinkDeleteError extends OneLinkApiError {
  constructor(message: string, status = 500) {
    super(message, status);
    this.name = 'OneLinkDeleteError';
  }
}

function getOneLinkApiToken(makeError: (message: string, status?: number) => OneLinkApiError): string {
  const token =
    process.env.APPSFLYER_ONELINK_API_TOKEN?.trim() || process.env.ONELINK_API_TOKEN?.trim() || '';

  if (!token) {
    throw makeError(
      'AppsFlyer OneLink API token is missing. Set APPSFLYER_ONELINK_API_TOKEN in your environment.',
      500,
    );
  }

  return token;
}

function parseTemplateDomainInfo(shortlinkUrl: string): TemplateDomainInfo {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(shortlinkUrl);
  } catch {
    throw new OneLinkProbeError('OneLink probe response included an invalid shortlink URL.', 502);
  }

  const host = parsedUrl.hostname.trim().toLowerCase();
  const segments = host.split('.').filter(Boolean);

  if (!host || segments.length === 0) {
    throw new OneLinkProbeError('OneLink probe response included an empty domain.', 502);
  }

  return {
    host,
    isBrandedDomain: !host.endsWith('.onelink.me'),
    subdomain: segments[0],
  };
}

async function readResponseErrorMessage(
  response: Response,
): Promise<{ message: string; rawBody: string }> {
  const responseText = await response.text();
  if (!responseText) {
    return {
      message: `AppsFlyer request failed with status ${response.status}.`,
      rawBody: '',
    };
  }

  try {
    const parsed = JSON.parse(responseText) as { error?: string; message?: string };
    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      return { message: parsed.error.trim(), rawBody: responseText };
    }
    if (typeof parsed.message === 'string' && parsed.message.trim()) {
      return { message: parsed.message.trim(), rawBody: responseText };
    }
  } catch {
    // Keep raw response text fallback below.
  }

  return {
    message: responseText.trim() || `AppsFlyer request failed with status ${response.status}.`,
    rawBody: responseText,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetriableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function normalizeOneLinkData(
  data: Record<string, string>,
  makeError: (message: string, status?: number) => OneLinkApiError,
): Record<string, string> {
  const normalizedEntries = Object.entries(data)
    .map(([key, value]) => [key.trim(), value.trim()] as const)
    .filter(([key, value]) => Boolean(key && value));

  const normalized = Object.fromEntries(normalizedEntries);
  if (!normalized.pid) {
    throw makeError('Media Source (pid) is required.', 400);
  }

  return normalized;
}

function normalizeTtlValue(
  ttl: string | undefined,
  makeError: (message: string, status?: number) => OneLinkApiError,
): string {
  const normalized = ttl?.trim() || '';
  if (!normalized) {
    return '';
  }

  if (!/^\d+[mhd]?$/i.test(normalized)) {
    throw makeError('TTL must be a number with optional m, h, or d suffix (for example 10m, 20h, 14d).', 400);
  }

  return normalized.toLowerCase();
}

type RequestWithRetryInput = {
  body?: Record<string, unknown>;
  endpoint: string;
  logPrefix: string;
  makeError: (message: string, status?: number) => OneLinkApiError;
  method: 'DELETE' | 'GET' | 'POST' | 'PUT';
  networkErrorMessage: string;
};

async function requestWithRetry({
  body,
  endpoint,
  logPrefix,
  makeError,
  method,
  networkErrorMessage,
}: RequestWithRetryInput): Promise<Response> {
  const token = getOneLinkApiToken(makeError);
  let lastError: OneLinkApiError | null = null;

  for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt += 1) {
    let response: Response;
    const requestInit: RequestInit = {
      cache: 'no-store',
      headers: {
        authorization: token,
      },
      method,
    };

    if (body) {
      requestInit.body = JSON.stringify(body);
      requestInit.headers = {
        ...requestInit.headers,
        'content-type': 'application/json',
      };
    }

    try {
      response = await fetch(endpoint, requestInit);
    } catch {
      lastError = makeError(networkErrorMessage, 502);
      if (attempt < MAX_REQUEST_ATTEMPTS) {
        await delay(REQUEST_RETRY_DELAYS_MS[attempt - 1]);
        continue;
      }
      throw lastError;
    }

    if (!response.ok) {
      const { message, rawBody } = await readResponseErrorMessage(response);
      console.error(`[${logPrefix}] AppsFlyer request failed`, {
        attempt,
        body,
        endpoint,
        method,
        responseBody: rawBody,
        status: response.status,
      });
      lastError = makeError(message, response.status);

      if (attempt < MAX_REQUEST_ATTEMPTS && isRetriableStatus(response.status)) {
        await delay(REQUEST_RETRY_DELAYS_MS[attempt - 1]);
        continue;
      }

      throw lastError;
    }

    return response;
  }

  throw lastError ?? makeError('AppsFlyer request failed.', 500);
}

async function createShortlinkWithRetry(
  input: CreateOneLinkShortlinkInput,
  logPrefix: string,
  makeError: (message: string, status?: number) => OneLinkApiError,
): Promise<string> {
  const normalizedTemplateId = input.templateId.trim();
  if (!normalizedTemplateId) {
    throw makeError('Template ID is required.', 400);
  }

  const endpoint = `${ONELINK_API_BASE_URL}/shortlinks/${encodeURIComponent(normalizedTemplateId)}`;
  const requestBody: {
    brand_domain?: string;
    data: string;
    shortlink_id?: string;
  } = {
    data: JSON.stringify(normalizeOneLinkData(input.data, makeError)),
  };

  const normalizedBrandDomain = input.brandDomain?.trim().toLowerCase() || '';
  if (normalizedBrandDomain) {
    requestBody.brand_domain = normalizedBrandDomain;
  }

  const normalizedShortLinkId = input.shortLinkId?.trim() || '';
  if (normalizedShortLinkId) {
    requestBody.shortlink_id = normalizedShortLinkId;
  }

  const response = await requestWithRetry({
    body: requestBody,
    endpoint,
    logPrefix,
    makeError,
    method: 'POST',
    networkErrorMessage: 'AppsFlyer create request failed due to a network error.',
  });

  const payload = (await response.json()) as OneLinkCreateShortlinkResponse;
  const shortlinkUrl = typeof payload.shortlink_url === 'string' ? payload.shortlink_url.trim() : '';

  if (!shortlinkUrl) {
    throw makeError('AppsFlyer create response did not include shortlink_url.', 502);
  }

  return shortlinkUrl;
}

function normalizeRemotePayload(payload: unknown): Record<string, string> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      continue;
    }

    if (typeof value === 'string') {
      normalized[normalizedKey] = value.trim();
      continue;
    }

    if (value == null) {
      normalized[normalizedKey] = '';
      continue;
    }

    normalized[normalizedKey] = String(value);
  }

  return normalized;
}

/**
 * extractShortLinkIdFromUrl - Extracts shortlink-id from a full shortlink URL.
 */
export function extractShortLinkIdFromUrl(shortLink: string, templateId: string): string | null {
  const normalizedTemplateId = templateId.trim().toLowerCase();
  if (!normalizedTemplateId) {
    return null;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(shortLink);
  } catch {
    return null;
  }

  const segments = parsedUrl.pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const templateIndex = segments.findIndex((segment) => segment.toLowerCase() === normalizedTemplateId);
  if (templateIndex >= 0 && segments[templateIndex + 1]) {
    try {
      return decodeURIComponent(segments[templateIndex + 1].trim());
    } catch {
      return segments[templateIndex + 1].trim();
    }
  }

  const fallback = segments[segments.length - 1]?.trim();
  if (!fallback) {
    return null;
  }

  try {
    return decodeURIComponent(fallback);
  } catch {
    return fallback;
  }
}

/**
 * createOneLinkShortlink - Creates a real shortlink via AppsFlyer OneLink Create API.
 */
export async function createOneLinkShortlink(input: CreateOneLinkShortlinkInput): Promise<string> {
  return createShortlinkWithRetry(
    input,
    'onelink-create',
    (message, status) => new OneLinkCreateError(message, status),
  );
}

/**
 * getOneLinkShortlinkData - Retrieves current payload data for an existing OneLink shortlink.
 */
export async function getOneLinkShortlinkData(
  templateId: string,
  shortLinkId: string,
): Promise<OneLinkRemoteDetail> {
  const normalizedTemplateId = templateId.trim();
  const normalizedShortLinkId = shortLinkId.trim();
  if (!normalizedTemplateId || !normalizedShortLinkId) {
    throw new OneLinkGetError('Template ID and shortlink ID are required.', 400);
  }

  const endpoint = `${ONELINK_API_BASE_URL}/shortlinks/${encodeURIComponent(normalizedTemplateId)}/${encodeURIComponent(normalizedShortLinkId)}`;
  const response = await requestWithRetry({
    endpoint,
    logPrefix: 'onelink-get',
    makeError: (message, status) => new OneLinkGetError(message, status),
    method: 'GET',
    networkErrorMessage: 'AppsFlyer get request failed due to a network error.',
  });

  const payload = (await response.json()) as OneLinkGetShortlinkResponse;
  const ttlValue = typeof payload.ttl === 'number' ? String(payload.ttl) : (payload.ttl?.trim() || '');

  return {
    expiry: typeof payload.expiry === 'string' ? payload.expiry.trim() : '',
    oneLinkData: normalizeRemotePayload(payload.payload),
    ttl: ttlValue,
  };
}

/**
 * updateOneLinkShortlink - Updates payload data for an existing OneLink shortlink.
 */
export async function updateOneLinkShortlink(input: UpdateOneLinkShortlinkInput): Promise<string> {
  const normalizedTemplateId = input.templateId.trim();
  const normalizedShortLinkId = input.shortLinkId.trim();
  if (!normalizedTemplateId || !normalizedShortLinkId) {
    throw new OneLinkUpdateError('Template ID and shortlink ID are required.', 400);
  }

  const endpoint = `${ONELINK_API_BASE_URL}/shortlinks/${encodeURIComponent(normalizedTemplateId)}/${encodeURIComponent(normalizedShortLinkId)}`;
  const requestBody: {
    brand_domain?: string;
    data: string;
    ttl?: string;
  } = {
    data: JSON.stringify(normalizeOneLinkData(input.data, (message, status) => new OneLinkUpdateError(message, status))),
  };

  const normalizedBrandDomain = input.brandDomain?.trim().toLowerCase() || '';
  if (normalizedBrandDomain) {
    requestBody.brand_domain = normalizedBrandDomain;
  }

  const normalizedTtl = normalizeTtlValue(input.ttl, (message, status) => new OneLinkUpdateError(message, status));
  if (normalizedTtl) {
    requestBody.ttl = normalizedTtl;
  }

  const response = await requestWithRetry({
    body: requestBody,
    endpoint,
    logPrefix: 'onelink-update',
    makeError: (message, status) => new OneLinkUpdateError(message, status),
    method: 'PUT',
    networkErrorMessage: 'AppsFlyer update request failed due to a network error.',
  });

  const payload = (await response.json()) as OneLinkCreateShortlinkResponse;
  const shortlinkUrl = typeof payload.shortlink_url === 'string' ? payload.shortlink_url.trim() : '';
  if (!shortlinkUrl) {
    throw new OneLinkUpdateError('AppsFlyer update response did not include shortlink_url.', 502);
  }

  return shortlinkUrl;
}

/**
 * deleteOneLinkShortlink - Deletes an existing OneLink shortlink.
 */
export async function deleteOneLinkShortlink(templateId: string, shortLinkId: string): Promise<void> {
  const normalizedTemplateId = templateId.trim();
  const normalizedShortLinkId = shortLinkId.trim();
  if (!normalizedTemplateId || !normalizedShortLinkId) {
    throw new OneLinkDeleteError('Template ID and shortlink ID are required.', 400);
  }

  const endpoint = `${ONELINK_API_BASE_URL}/shortlinks/${encodeURIComponent(normalizedTemplateId)}/${encodeURIComponent(normalizedShortLinkId)}`;
  await requestWithRetry({
    endpoint,
    logPrefix: 'onelink-delete',
    makeError: (message, status) => new OneLinkDeleteError(message, status),
    method: 'DELETE',
    networkErrorMessage: 'AppsFlyer delete request failed due to a network error.',
  });
}

/**
 * probeTemplateDomainInfo - Creates a probe shortlink and extracts template domain metadata.
 */
export async function probeTemplateDomainInfo(templateId: string): Promise<TemplateDomainInfo> {
  const shortlinkUrl = await createShortlinkWithRetry(
    {
      data: {
        pid: 'probe',
      },
      templateId,
    },
    'onelink-probe',
    (message, status) => new OneLinkProbeError(message, status),
  );

  return parseTemplateDomainInfo(shortlinkUrl);
}
