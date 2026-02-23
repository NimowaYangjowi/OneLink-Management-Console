/**
 * Root layout for the OneLink Management Console.
 * Configures global Inter font,
 * wraps the app in MUI ThemeProvider, and sets global metadata.
 */
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeProvider from '@/lib/providers/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'OneLink Console',
  description: 'AppsFlyer OneLink management console for creating and managing deep links',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ inter.variable } suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          { children }
        </ThemeProvider>
      </body>
    </html>
  );
}
