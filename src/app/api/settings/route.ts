/**
 * Settings API route for reading and persisting console settings to SQLite.
 */
import { NextResponse } from 'next/server';
import { OneLinkProbeError, probeTemplateDomainInfo } from '@/lib/onelinkApi';
import { validateTemplateIdFormat } from '@/lib/settingsSchema';
import { loadSettings, saveSettings } from '@/lib/settingsStore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json(loadSettings(), { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to load settings.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  try {
    const savedState = saveSettings(payload);
    return NextResponse.json(savedState, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    console.error('[settings:POST] Invalid JSON payload');
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const templateId =
    payload
    && typeof payload === 'object'
    && typeof (payload as { templateId?: unknown }).templateId === 'string'
      ? (payload as { templateId: string }).templateId.trim()
      : '';

  const validation = validateTemplateIdFormat(templateId);
  if (!validation.valid) {
    console.error('[settings:POST] Template ID validation failed', {
      payload,
      templateId,
      validationError: validation.error,
    });
    return NextResponse.json({ error: validation.error ?? 'Invalid template ID.' }, { status: 400 });
  }

  try {
    console.info('[settings:POST] Add template requested', { templateId });
    const currentSettings = loadSettings();

    if (currentSettings.templateIds.includes(templateId)) {
      console.error('[settings:POST] Duplicate template ID', { templateId });
      return NextResponse.json({ error: 'This Template ID already exists.' }, { status: 409 });
    }

    const cachedDomainInfo = currentSettings.templateDomains[templateId];
    if (cachedDomainInfo) {
      console.info('[settings:POST] Using cached template domain info', { cachedDomainInfo, templateId });
    }
    const resolvedDomainInfo = cachedDomainInfo ?? (await probeTemplateDomainInfo(templateId));
    console.info('[settings:POST] Resolved template domain info', { resolvedDomainInfo, templateId });

    const savedState = saveSettings({
      ...currentSettings,
      templateBrandedDomains: {
        ...currentSettings.templateBrandedDomains,
        [templateId]: currentSettings.templateBrandedDomains[templateId] ?? [],
      },
      templateDomains: {
        ...currentSettings.templateDomains,
        [templateId]: resolvedDomainInfo,
      },
      templateIds: [...currentSettings.templateIds, templateId],
    });

    return NextResponse.json(savedState, { status: 200 });
  } catch (error) {
    if (error instanceof OneLinkProbeError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      console.error('[settings:POST] OneLink probe error', {
        message: error.message,
        status,
        templateId,
      });
      return NextResponse.json({ error: error.message }, { status });
    }

    console.error('[settings:POST] Unexpected failure', {
      error,
      templateId,
    });
    return NextResponse.json({ error: 'Failed to add template ID.' }, { status: 500 });
  }
}
