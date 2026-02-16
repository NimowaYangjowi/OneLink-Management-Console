import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard/manage-links');
}
