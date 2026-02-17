/**
 * Root page that redirects to the create route.
 */
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/create');
}
