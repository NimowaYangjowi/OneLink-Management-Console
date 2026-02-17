/**
 * OneLink API route for creating and listing generated OneLink records.
 */
import { NextResponse } from 'next/server';
import { OneLinkCreateError, createOneLinkShortlink } from '@/lib/onelinkApi';
import { sanitizeCreateOneLinkRequestPayload } from '@/lib/onelinkLinksSchema';
import { createOneLinkRecord, listOneLinkRecords } from '@/lib/onelinkLinksStore';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const records = listOneLinkRecords();
    return NextResponse.json(records, { status: 200 });
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

  try {
    const shortLink = await createOneLinkShortlink({
      brandDomain: sanitized.value.brandDomain,
      data: sanitized.value.oneLinkData,
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof OneLinkCreateError) {
      const status = error.status >= 400 && error.status < 600 ? error.status : 502;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: 'Failed to create OneLink record.' }, { status: 500 });
  }
}
