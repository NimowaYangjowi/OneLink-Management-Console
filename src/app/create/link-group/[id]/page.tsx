/**
 * Legacy link-group edit route that forwards to the dedicated edit URL.
 */
import { redirect } from 'next/navigation';

type LinkGroupEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkGroupEditPage({ params }: LinkGroupEditPageProps) {
  const { id } = await params;

  redirect(`/link-groups/${encodeURIComponent(id)}/edit`);
}
