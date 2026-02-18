/**
 * API route for reading and deleting a specific Link Group.
 */
import { NextResponse } from 'next/server';
import {
  sanitizeDeleteMode,
  sanitizeGroupId,
  sanitizePageQuery,
  sanitizePageSizeQuery,
} from '@/lib/onelinkGroupSchema';
import { deleteLinkGroup, getLinkGroupDetail } from '@/lib/onelinkGroupStore';

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
