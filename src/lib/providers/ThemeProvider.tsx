'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import defaultTheme from '@/styles/themes/default';

/**
 * ThemeProvider 컴포넌트
 *
 * MUI ThemeProvider를 래핑하여 Pencil 색상 토큰 + Forma 디자인 원칙 테마를 적용합니다.
 *
 * Props:
 * @param {React.ReactNode} children - 테마를 적용할 자식 컴포넌트 [Required]
 *
 * Example usage:
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={defaultTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
