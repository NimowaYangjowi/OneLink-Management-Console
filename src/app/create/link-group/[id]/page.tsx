/**
 * Link-group edit page that reuses the OneLink stitched UI in edit mode.
 */
import OneLinkStitchedPage from '@/components/onelink/OneLinkStitchedPage';

type LinkGroupEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LinkGroupEditPage({ params }: LinkGroupEditPageProps) {
  const { id } = await params;

  return (
    <OneLinkStitchedPage
      createActionLabel='Update Link Group'
      creationType='link_group'
      mode='edit'
      recordId={ id }
    />
  );
}
