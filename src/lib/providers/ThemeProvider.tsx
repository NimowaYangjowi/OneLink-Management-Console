/**
 * MUI ThemeProvider wrapper with CssBaseline.
 * Applies the project's default theme (Pencil tokens + Forma principles)
 * to all MUI components and resets browser default styles.
 */
'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import defaultTheme from '@/styles/themes/default';

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
    <MuiThemeProvider theme={ defaultTheme }>
      <CssBaseline />
      { children }
    </MuiThemeProvider>
  );
}

export default ThemeProvider;
