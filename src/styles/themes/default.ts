import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import { PEN_DEFAULT_TOKENS } from '@/styles/tokens/pen-tokens.generated';

const fontSans = '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const fontSerif = 'var(--font-fraunces), "Fraunces", "Noto Serif KR", Georgia, serif';

export const pencilTokens = {
  primary: PEN_DEFAULT_TOKENS['--primary'],
  primaryForeground: PEN_DEFAULT_TOKENS['--primary-foreground'],
  secondary: PEN_DEFAULT_TOKENS['--secondary'],
  secondaryForeground: PEN_DEFAULT_TOKENS['--secondary-foreground'],
  background: PEN_DEFAULT_TOKENS['--background'],
  foreground: PEN_DEFAULT_TOKENS['--foreground'],
  card: PEN_DEFAULT_TOKENS['--card'],
  cardForeground: PEN_DEFAULT_TOKENS['--card-foreground'],
  popover: PEN_DEFAULT_TOKENS['--popover'],
  popoverForeground: PEN_DEFAULT_TOKENS['--popover-foreground'],
  muted: PEN_DEFAULT_TOKENS['--muted'],
  mutedForeground: PEN_DEFAULT_TOKENS['--muted-foreground'],
  accent: PEN_DEFAULT_TOKENS['--accent'],
  accentForeground: PEN_DEFAULT_TOKENS['--accent-foreground'],
  destructive: PEN_DEFAULT_TOKENS['--destructive'],
  border: PEN_DEFAULT_TOKENS['--border'],
  input: PEN_DEFAULT_TOKENS['--input'],
  ring: PEN_DEFAULT_TOKENS['--ring'],
  sidebar: PEN_DEFAULT_TOKENS['--sidebar'],
  sidebarForeground: PEN_DEFAULT_TOKENS['--sidebar-foreground'],
  sidebarBorder: PEN_DEFAULT_TOKENS['--sidebar-border'],
  sidebarAccent: PEN_DEFAULT_TOKENS['--sidebar-accent'],
  sidebarAccentForeground: PEN_DEFAULT_TOKENS['--sidebar-accent-foreground'],
  sidebarPrimary: PEN_DEFAULT_TOKENS['--sidebar-primary'],
  sidebarPrimaryForeground: PEN_DEFAULT_TOKENS['--sidebar-primary-foreground'],
  sidebarRing: PEN_DEFAULT_TOKENS['--sidebar-ring'],
};

export const customShadows = {
  none: 'none',
  sm: '0 0 12px rgba(0, 0, 0, 0.06)',
  md: '0 0 16px rgba(0, 0, 0, 0.08)',
  lg: '0 0 20px rgba(0, 0, 0, 0.10)',
  xl: '0 0 24px rgba(0, 0, 0, 0.12)',
} as const;

const dimmedShadows: Shadows = Array.from(
  { length: 25 },
  () => customShadows.none,
) as Shadows;
dimmedShadows[1] = customShadows.sm;
dimmedShadows[2] = customShadows.md;
dimmedShadows[3] = customShadows.lg;
dimmedShadows[4] = customShadows.xl;

const defaultTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: pencilTokens.primary,
      contrastText: pencilTokens.primaryForeground,
    },
    secondary: {
      main: pencilTokens.secondary,
      contrastText: pencilTokens.secondaryForeground,
    },
    error: {
      main: pencilTokens.destructive,
    },
    text: {
      primary: pencilTokens.foreground,
      secondary: pencilTokens.mutedForeground,
    },
    background: {
      default: pencilTokens.background,
      paper: pencilTokens.card,
    },
    divider: pencilTokens.border,
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: fontSans,
    h1: {
      fontFamily: fontSerif,
      fontWeight: 500,
      fontSize: '3rem',
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: fontSerif,
      fontWeight: 500,
      fontSize: '2.25rem',
      lineHeight: 1.15,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: fontSerif,
      fontWeight: 500,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h4: {
      fontFamily: fontSerif,
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.25,
    },
    h5: {
      fontFamily: fontSans,
      fontSize: '1.25rem',
      lineHeight: 1.35,
    },
    h6: {
      fontFamily: fontSans,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: fontSans,
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontFamily: fontSans,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontFamily: fontSans,
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    subtitle2: {
      fontFamily: fontSans,
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    button: {
      fontFamily: fontSans,
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
    caption: {
      fontFamily: fontSans,
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontFamily: fontSans,
      fontSize: '0.6875rem',
      letterSpacing: '0.1em',
      lineHeight: 1.5,
      textTransform: 'uppercase',
    },
  },
  shadows: dimmedShadows,
});

export default defaultTheme;
