/**
 * Link-group edit route that reuses the stepper page in edit mode.
 */
import OneLinkGroupCreatePage from '@/components/onelink/OneLinkGroupCreatePage';

type LinkGroupEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkGroupEditPage({ params }: LinkGroupEditPageProps) {
  const { id } = await params;

  return <OneLinkGroupCreatePage editGroupId={ id } />;
}
