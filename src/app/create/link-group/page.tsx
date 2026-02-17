/**
 * Link-group creation page that reuses the existing create UI.
 */
import OneLinkStitchedPage from '@/components/onelink/OneLinkStitchedPage';

export default function LinkGroupCreatePage() {
  return <OneLinkStitchedPage createActionLabel='Create Link Group' creationType='link_group' />;
}
