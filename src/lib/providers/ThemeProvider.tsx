/**
 * MUI ThemeProvider wrapper with CssBaseline and Emotion cache for Next.js App Router.
 * Uses AppRouterCacheProvider to ensure Emotion styles are properly streamed
 * during SSR, preventing hydration mismatches.
 * Also wraps SettingsProvider for global settings state.
 */
'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import defaultTheme from '@/styles/themes/default';
import { SettingsProvider } from '@/lib/providers/SettingsContext';

/**
 * ThemeProvider
 *
 * Props:
 * @param {React.ReactNode} children - Child components to receive theme context [Required]
 *
 * Example usage:
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={ { enableCssLayer: true } }>
      <MuiThemeProvider theme={ defaultTheme }>
        <CssBaseline />
        <SettingsProvider>
          { children }
        </SettingsProvider>
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}

export default ThemeProvider;
