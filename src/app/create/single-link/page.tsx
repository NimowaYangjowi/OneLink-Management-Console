/**
 * Single-link creation page that reuses the existing create UI.
 */
import OneLinkStitchedPage from '@/components/onelink/OneLinkStitchedPage';

export default function SingleLinkCreatePage() {
  return <OneLinkStitchedPage createActionLabel='Create Link' creationType='single_link' />;
}
