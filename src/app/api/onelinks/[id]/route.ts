/**
 * OneLink detail API route for reading, updating, and deleting an existing link record.
 */
import { NextResponse } from 'next/server';
import { validateOneLinkDataByNamingRules } from '@/lib/namingConvention';
import {
  OneLinkDeleteError,
  OneLinkGetError,
  OneLinkUpdateError,
  deleteOneLinkShortlink,
  extractShortLinkIdFromUrl,
  getOneLinkShortlinkData,
  updateOneLinkShortlink,
} from '@/lib/onelinkApi';
import { sanitizeOneLinkData } from '@/lib/onelinkLinksSchema';
import {
  deleteOneLinkRecord,
  getOneLinkRecordById,
  updateOneLinkRecord,
} from '@/lib/onelinkLinksStore';
import { loadSettings } from '@/lib/settingsStore';

export const runtime = 'nodejs';

const IPV4_HOSTNAME_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

type UpdateOneLinkRequestPayload = {
  brandDomain: string;
  linkName: string;
  oneLinkData: Record<string, string>;
  ttl: string;
};

function sanitizeOptionalString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function sanitizeRecordId(value: string): string {
  return value.trim().slice(0, 128);
}

function isPublicHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized || normalized === 'localhost' || normalized.endsWith('.localhost')) {
    return false;
  }

  if (normalized.includes(':') || IPV4_HOSTNAME_REGEX.test(normalized)) {
    return false;
  }

  if (!normalized.includes('.')) {
    return false;
  }

  const tld = normalized.split('.').pop() || '';
  return /^[a-z]{2,63}$/i.test(tld);
}

function sanitizeBrandDomain(value: unknown): { error?: string; value: string } {
  const normalized = sanitizeOptionalString(value, 255).toLowerCase();
  if (!normalized) {
    return { value: '' };
  }

  if (!isPublicHostname(normalized)) {
    return {
      error: 'Brand domain must be a public domain (no localhost or IP address).',
      value: '',
    };
  }

  return { value: normalized };
}

function sanitizeUpdatePayload(payload: unknown): {
  error?: string;
  value?: UpdateOneLinkRequestPayload;
} {
  if (!payload || typeof payload !== 'object') {
    return { error: 'Invalid payload.' };
  }

  const candidate = payload as Record<string, unknown>;
  const linkName = sanitizeOptionalString(candidate.linkName, 160);
  if (!linkName) {
    return { error: 'Link name is required.' };
  }

  const brandDomain = sanitizeBrandDomain(candidate.brandDomain);
  if (brandDomain.error) {
    return { error: brandDomain.error };
  }

  const ttl = sanitizeOptionalString(candidate.ttl, 16);
  const oneLinkData = sanitizeOneLinkData(candidate.oneLinkData);
  if (oneLinkData.error) {
    return { error: oneLinkData.error };
  }

  return {
    value: {
      brandDomain: brandDomain.value,
      linkName,
      oneLinkData: oneLinkData.value,
      ttl,
    },
  };
}

function buildNamingViolationMessage(field: string, message: string): string {
  return `Naming convention violation for "${field}": ${message}`;
}

function buildLongUrlPreview(templateId: string, oneLinkData: Record<string, string>): string {
  const query = new URLSearchParams(oneLinkData).toString();
  if (!query) {
    return `https://app.onelink.me/${templateId}`;
  }

  return `https://app.onelink.me/${templateId}?${query}`;
}

async function resolveRecord(params: Promise<{ id: string }>): Promise<{
  id: string;
  record: NonNullable<ReturnType<typeof getOneLinkRecordById>>;
  shortLinkId: string;
}> {
  const { id: rawId } = await params;
  const id = sanitizeRecordId(rawId);
  if (!id) {
    throw new Error('INVALID_ID');
  }

  const record = getOneLinkRecordById(id);
  if (!record) {
    throw new Error('NOT_FOUND');
  }

  const shortLinkId = extractShortLinkIdFromUrl(record.shortLink, record.templateId);
  if (!shortLinkId) {
    throw new Error('SHORTLINK_ID_NOT_FOUND');
  }

  return {
    id,
    record,
    shortLinkId,
  };
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let resolved;

  try {
    resolved = await resolveRecord(params);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_ID') {
        return NextResponse.json({ error: 'Link ID is invalid.' }, { status: 400 });
      }
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'OneLink record not found.' }, { status: 404 });
      }
      if (error.message === 'SHORTLINK_ID_NOT_FOUND') {
        return NextResponse.json({ error: 'Failed to parse shortlink ID from stored URL.' }, { status: 422 });
      }
    }

    return NextResponse.json({ error: 'Failed to resolve OneLink record.' }, { status: 500 });
  }

  try {
    const remote = await getOneLinkShortlinkData(resolved.record.templateId, resolved.shortLinkId);

    return NextResponse.json(
      {
        record: resolved.record,
        remote: {
          ...remote,
          shortLinkId: resolved.shortLinkId,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof OneLinkGetError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: 'Failed to load OneLink detail.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let resolved;

  try {
    resolved = await resolveRecord(params);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_ID') {
        return NextResponse.json({ error: 'Link ID is invalid.' }, { status: 400 });
      }
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'OneLink record not found.' }, { status: 404 });
      }
      if (error.message === 'SHORTLINK_ID_NOT_FOUND') {
        return NextResponse.json({ error: 'Failed to parse shortlink ID from stored URL.' }, { status: 422 });
      }
    }

    return NextResponse.json({ error: 'Failed to resolve OneLink record.' }, { status: 500 });
  }

  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const sanitized = sanitizeUpdatePayload(payload);
  if (!sanitized.value) {
    return NextResponse.json({ error: sanitized.error ?? 'Invalid payload.' }, { status: 400 });
  }

  const settings = loadSettings();
  const namingValidation = validateOneLinkDataByNamingRules(
    sanitized.value.oneLinkData,
    settings.namingConvention.rules,
  );
  const namingWarnings = namingValidation.valid ? [] : namingValidation.errors;

  if (!namingValidation.valid && settings.namingConvention.enforcementMode === 'strict') {
    const firstError = namingValidation.errors[0];
    if (!firstError) {
      return NextResponse.json(
        { error: 'Naming convention validation failed.', errors: namingValidation.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        error: buildNamingViolationMessage(firstError.field, firstError.message),
        errors: namingValidation.errors,
      },
      { status: 400 },
    );
  }

  const normalizedOneLinkData = namingValidation.normalizedData;

  try {
    const shortLink = await updateOneLinkShortlink({
      brandDomain: sanitized.value.brandDomain,
      data: normalizedOneLinkData,
      shortLinkId: resolved.shortLinkId,
      templateId: resolved.record.templateId,
      ttl: sanitized.value.ttl,
    });

    const updatedRecord = updateOneLinkRecord({
      brandDomain: sanitized.value.brandDomain,
      campaignName: normalizedOneLinkData.c || '',
      channel: normalizedOneLinkData.af_channel || '',
      id: resolved.id,
      linkName: sanitized.value.linkName,
      longUrl: buildLongUrlPreview(resolved.record.templateId, normalizedOneLinkData),
      mediaSource: normalizedOneLinkData.pid || '',
    });

    if (!updatedRecord) {
      return NextResponse.json({ error: 'OneLink record not found.' }, { status: 404 });
    }

    return NextResponse.json(
      {
        record: {
          ...updatedRecord,
          shortLink,
        },
        warnings: namingWarnings.length > 0 ? namingWarnings : undefined,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof OneLinkUpdateError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: 'Failed to update OneLink.' }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let resolved;

  try {
    resolved = await resolveRecord(params);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'INVALID_ID') {
        return NextResponse.json({ error: 'Link ID is invalid.' }, { status: 400 });
      }
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'OneLink record not found.' }, { status: 404 });
      }
      if (error.message === 'SHORTLINK_ID_NOT_FOUND') {
        return NextResponse.json({ error: 'Failed to parse shortlink ID from stored URL.' }, { status: 422 });
      }
    }

    return NextResponse.json({ error: 'Failed to resolve OneLink record.' }, { status: 500 });
  }

  let remoteDeleted = true;

  try {
    await deleteOneLinkShortlink(resolved.record.templateId, resolved.shortLinkId);
  } catch (error) {
    if (error instanceof OneLinkDeleteError && error.status === 404) {
      remoteDeleted = false;
    } else if (error instanceof OneLinkDeleteError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ error: error.message }, { status });
    } else {
      return NextResponse.json({ error: 'Failed to delete OneLink from AppsFlyer.' }, { status: 500 });
    }
  }

  const deleted = deleteOneLinkRecord(resolved.id);
  if (!deleted) {
    return NextResponse.json({ error: 'OneLink record not found.' }, { status: 404 });
  }

  return NextResponse.json({ deleted: true, remoteDeleted }, { status: 200 });
}
