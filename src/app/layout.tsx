import type { Metadata } from 'next';
import { ThemeProvider } from '@/lib/providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'OneLink Dashboard',
  description: 'OneLink 관리 콘솔',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
