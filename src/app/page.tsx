/**
 * Root page that redirects to the dashboard.
 * The dashboard is the primary entry point for the OneLink Console.
 */
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
