/**
 * OneLink management route that displays and manages created records.
 */
import { redirect } from 'next/navigation';
import OneLinkListPage from '@/components/onelink/OneLinkListPage';
import { getCreationTypeFromSearchParams } from '@/components/onelink/list/utils';

type LinksPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LinksPage({ searchParams }: LinksPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialCreationType = getCreationTypeFromSearchParams({
    get: (key: string) => {
      const value = resolvedSearchParams[key];
      if (Array.isArray(value)) {
        return value[0] ?? null;
      }
      return value ?? null;
    },
  });

  if (initialCreationType === 'link_group') {
    redirect('/link-groups');
  }

  return <OneLinkListPage initialCreationType={ initialCreationType } />;
}
