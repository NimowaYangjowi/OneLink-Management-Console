/**
 * Dedicated route for editing an existing Link Group.
 */
import OneLinkGroupCreatePage from '@/components/onelink/OneLinkGroupCreatePage';

type LinkGroupEditRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkGroupEditRoute({ params }: LinkGroupEditRouteProps) {
  const { id } = await params;

  return <OneLinkGroupCreatePage editGroupId={ id } />;
}
