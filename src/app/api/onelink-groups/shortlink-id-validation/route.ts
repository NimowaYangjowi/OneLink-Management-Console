/**
 * API route for validating candidate short link IDs against stored OneLinks.
 */
import { NextResponse } from 'next/server';
import { sanitizeShortLinkIdBase } from '@/lib/onelinkShortLinkId';
import { findExistingShortLinkIds } from '@/lib/onelinkLinksStore';

export const runtime = 'nodejs';

type ValidationRequestPayload = {
  excludeGroupId?: string;
  shortLinkIds?: unknown;
  templateId?: unknown;
};

const MAX_VALIDATION_IDS = 3000;

export async function POST(request: Request) {
  let payload: ValidationRequestPayload;

  try {
    payload = (await request.json()) as ValidationRequestPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const templateId = typeof payload.templateId === 'string' ? payload.templateId.trim() : '';
  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required.' }, { status: 400 });
  }

  const excludeGroupId = typeof payload.excludeGroupId === 'string' ? payload.excludeGroupId.trim() : '';
  const shortLinkIds = Array.isArray(payload.shortLinkIds)
    ? Array.from(
      new Set(
        payload.shortLinkIds
          .map((value) => (typeof value === 'string' ? sanitizeShortLinkIdBase(value) : ''))
          .filter(Boolean),
      ),
    )
    : [];

  if (shortLinkIds.length > MAX_VALIDATION_IDS) {
    return NextResponse.json(
      { error: `Too many short link IDs. Maximum is ${MAX_VALIDATION_IDS}.` },
      { status: 400 },
    );
  }

  try {
    const existingIds = findExistingShortLinkIds(templateId, shortLinkIds, excludeGroupId || undefined);
    return NextResponse.json({ existingIds }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to validate short link IDs.' }, { status: 500 });
  }
}
