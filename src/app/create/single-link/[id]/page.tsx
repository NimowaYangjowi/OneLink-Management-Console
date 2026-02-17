/**
 * Single-link edit page that reuses the OneLink stitched UI in edit mode.
 */
import OneLinkStitchedPage from '@/components/onelink/OneLinkStitchedPage';

type SingleLinkEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SingleLinkEditPage({ params }: SingleLinkEditPageProps) {
  const { id } = await params;

  return (
    <OneLinkStitchedPage
      createActionLabel='Update Link'
      creationType='single_link'
      mode='edit'
      recordId={ id }
    />
  );
}
