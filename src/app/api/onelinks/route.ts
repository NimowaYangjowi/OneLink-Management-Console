/**
 * OneLink API route for creating and listing generated OneLink records.
 */
import { NextResponse } from 'next/server';
import { validateOneLinkDataByNamingRules } from '@/lib/namingConvention';
import { OneLinkCreateError, createOneLinkShortlink } from '@/lib/onelinkApi';
import type { OneLinkCreationType } from '@/lib/onelinkLinksSchema';
import { sanitizeCreateOneLinkRequestPayload } from '@/lib/onelinkLinksSchema';
import { createOneLinkRecord, listOneLinkRecordsPage, listOneLinkTemplateOptions } from '@/lib/onelinkLinksStore';
import { loadSettings } from '@/lib/settingsStore';

export const runtime = 'nodejs';

function sanitizeCreationType(value: string | null): OneLinkCreationType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  if (normalized === 'single_link' || normalized === 'link_group') {
    return normalized;
  }

  return undefined;
}

function sanitizePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function buildNamingViolationMessage(field: string, message: string): string {
  return `Naming convention violation for "${field}": ${message}`;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = sanitizePositiveInt(url.searchParams.get('page'), 1);
    const pageSize = sanitizePositiveInt(url.searchParams.get('pageSize'), 50);
    const creationType = sanitizeCreationType(url.searchParams.get('creationType'));
    const query = url.searchParams.get('q')?.trim() || '';
    const templateId = url.searchParams.get('templateId')?.trim() || '';

    const result = listOneLinkRecordsPage({
      creationType,
      page,
      pageSize,
      query,
      templateId: templateId || undefined,
    });
    const templateOptions = listOneLinkTemplateOptions({
      creationType,
      query,
    });

    return NextResponse.json(
      {
        ...result,
        templateOptions,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to load OneLinks.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const sanitized = sanitizeCreateOneLinkRequestPayload(payload);
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
    const shortLink = await createOneLinkShortlink({
      brandDomain: sanitized.value.brandDomain,
      data: normalizedOneLinkData,
      shortLinkId: sanitized.value.shortLinkId,
      templateId: sanitized.value.templateId,
    });

    const created = createOneLinkRecord({
      brandDomain: sanitized.value.brandDomain,
      campaignName: sanitized.value.campaignName,
      channel: sanitized.value.channel,
      creationType: sanitized.value.creationType,
      linkName: sanitized.value.linkName,
      longUrl: sanitized.value.longUrlPreview,
      mediaSource: sanitized.value.mediaSource,
      shortLink,
      templateId: sanitized.value.templateId,
    });

    return NextResponse.json(
      {
        ...created,
        warnings: namingWarnings.length > 0 ? namingWarnings : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OneLinkCreateError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: 'Failed to create OneLink record.' }, { status: 500 });
  }
}
