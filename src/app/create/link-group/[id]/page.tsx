/**
 * Legacy link-group edit route that now redirects to the group detail page.
 */
import { redirect } from 'next/navigation';

type LinkGroupEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkGroupEditPage({ params }: LinkGroupEditPageProps) {
  const { id } = await params;

  redirect(`/link-groups/${encodeURIComponent(id)}`);
}
