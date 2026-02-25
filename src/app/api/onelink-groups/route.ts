/**
 * API route for listing and creating Link Groups with Phase A batch execution.
 */
import { NextResponse } from 'next/server';
import { sanitizeCreateLinkGroupRequestPayload, sanitizeGroupId } from '@/lib/onelinkGroupSchema';
import {
  createLinkGroupAndStartExecution,
  isLinkGroupNameTaken,
  listLinkGroups,
} from '@/lib/onelinkGroupStore';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedName = url.searchParams.get('name');
    if (requestedName !== null) {
      const rawExcludeId = url.searchParams.get('excludeId');
      const excludeId = rawExcludeId ? sanitizeGroupId(rawExcludeId) : '';
      const exists = isLinkGroupNameTaken(requestedName, excludeId || undefined);
      return NextResponse.json({ exists }, { status: 200 });
    }

    const groups = listLinkGroups();
    return NextResponse.json({ groups }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to load link groups.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const sanitized = sanitizeCreateLinkGroupRequestPayload(payload);
  if (!sanitized.value) {
    return NextResponse.json({ error: sanitized.error ?? 'Invalid payload.' }, { status: 400 });
  }

  try {
    const group = createLinkGroupAndStartExecution(sanitized.value);
    return NextResponse.json(
      {
        group,
        warnings: sanitized.value.warnings,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'LINK_GROUP_NAME_DUPLICATE') {
      return NextResponse.json({ error: 'Link group name already exists.' }, { status: 409 });
    }

    if (error instanceof Error && error.message.includes('uniq_group_variant_key')) {
      return NextResponse.json(
        {
          error: 'Duplicate leaf paths were detected. Please adjust the tree and retry.',
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: 'Failed to create link group.' }, { status: 500 });
  }
}
