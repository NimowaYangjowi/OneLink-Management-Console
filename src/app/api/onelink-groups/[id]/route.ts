/**
 * API route for reading, updating, and deleting a specific Link Group.
 */
import { NextResponse } from 'next/server';
import {
  sanitizeDeleteMode,
  sanitizeGroupId,
  sanitizePageQuery,
  sanitizePageSizeQuery,
  sanitizeUpdateLinkGroupRequestPayload,
} from '@/lib/onelinkGroupSchema';
import { deleteLinkGroup, getLinkGroupDetail, updateLinkGroupAndStartExecution } from '@/lib/onelinkGroupStore';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = sanitizeGroupId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Group ID is invalid.' }, { status: 400 });
  }

  const url = new URL(request.url);
  const page = sanitizePageQuery(url.searchParams.get('page'));
  const pageSize = sanitizePageSizeQuery(url.searchParams.get('pageSize'));

  try {
    const detail = getLinkGroupDetail(id, page, pageSize);
    if (!detail) {
      return NextResponse.json({ error: 'Link group not found.' }, { status: 404 });
    }

    return NextResponse.json(detail, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to load link group detail.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = sanitizeGroupId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Group ID is invalid.' }, { status: 400 });
  }

  const url = new URL(request.url);
  const mode = sanitizeDeleteMode(url.searchParams.get('mode'));

  try {
    const result = await deleteLinkGroup(id, mode);
    if (!result.deleted) {
      return NextResponse.json({ error: 'Link group not found.' }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to delete link group.' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = sanitizeGroupId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Group ID is invalid.' }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const sanitized = sanitizeUpdateLinkGroupRequestPayload(payload);
  if (!sanitized.value) {
    return NextResponse.json({ error: sanitized.error ?? 'Invalid payload.' }, { status: 400 });
  }

  try {
    const result = updateLinkGroupAndStartExecution(id, sanitized.value);
    if (!result) {
      return NextResponse.json({ error: 'Link group not found.' }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'LINK_GROUP_RUNNING') {
      return NextResponse.json({ error: 'Group is currently running. Retry after completion.' }, { status: 409 });
    }

    if (error instanceof Error && error.message === 'LINK_GROUP_NAME_DUPLICATE') {
      return NextResponse.json({ error: 'Link group name already exists.' }, { status: 409 });
    }

    if (error instanceof Error && error.message.includes('uniq_group_variant_key')) {
      return NextResponse.json(
        { error: 'Duplicate leaf paths were detected. Please adjust the tree and retry.' },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: 'Failed to update link group.' }, { status: 500 });
  }
}
