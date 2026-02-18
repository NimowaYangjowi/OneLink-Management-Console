/**
 * Link Group detail route rendering item-level execution status.
 */
import OneLinkGroupDetailPage from '@/components/onelink/OneLinkGroupDetailPage';

type LinkGroupDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkGroupDetailRoute({ params }: LinkGroupDetailRouteProps) {
  const { id } = await params;

  return <OneLinkGroupDetailPage groupId={ id } />;
}
