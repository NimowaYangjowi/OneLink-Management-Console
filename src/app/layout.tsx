import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OneLink Managing Console',
  description: 'Frontend implementation removed',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
