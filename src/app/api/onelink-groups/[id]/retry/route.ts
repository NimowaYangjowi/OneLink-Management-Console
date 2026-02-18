/**
 * API route for retrying failed Link Group items.
 */
import { NextResponse } from 'next/server';
import { sanitizeGroupId } from '@/lib/onelinkGroupSchema';
import { getLinkGroupDetail, retryFailedLinkGroupItems } from '@/lib/onelinkGroupStore';

export const runtime = 'nodejs';

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const id = sanitizeGroupId(rawId);
  if (!id) {
    return NextResponse.json({ error: 'Group ID is invalid.' }, { status: 400 });
  }

  const group = getLinkGroupDetail(id, 1, 1);
  if (!group) {
    return NextResponse.json({ error: 'Link group not found.' }, { status: 404 });
  }

  try {
    const result = retryFailedLinkGroupItems(id);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to retry link group items.' }, { status: 500 });
  }
}
