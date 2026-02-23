/**
 * Legacy Link Group list route that now forwards to the unified /links page.
 */
import { redirect } from 'next/navigation';

export default function LinkGroupsPage() {
  redirect('/links?type=link_group');
}
