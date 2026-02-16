import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import { DESIGN_TOKENS } from '@/styles/tokens/design-tokens';

const fontSans = 'Poppins, sans-serif';
const fontSerif = '"Aref Ruqaa", ui-serif, serif';

export const pencilTokens = {
  primary: DESIGN_TOKENS['--primary'],
  primaryForeground: DESIGN_TOKENS['--primary-foreground'],
  secondary: DESIGN_TOKENS['--secondary'],
  secondaryForeground: DESIGN_TOKENS['--secondary-foreground'],
  background: DESIGN_TOKENS['--background'],
  foreground: DESIGN_TOKENS['--foreground'],
  card: DESIGN_TOKENS['--card'],
  cardForeground: DESIGN_TOKENS['--card-foreground'],
  popover: DESIGN_TOKENS['--popover'],
  popoverForeground: DESIGN_TOKENS['--popover-foreground'],
  muted: DESIGN_TOKENS['--muted'],
  mutedForeground: DESIGN_TOKENS['--muted-foreground'],
  accent: DESIGN_TOKENS['--accent'],
  accentForeground: DESIGN_TOKENS['--accent-foreground'],
  destructive: DESIGN_TOKENS['--destructive'],
  border: DESIGN_TOKENS['--border'],
  input: DESIGN_TOKENS['--input'],
  ring: DESIGN_TOKENS['--ring'],
  sidebar: DESIGN_TOKENS['--sidebar'],
  sidebarForeground: DESIGN_TOKENS['--sidebar-foreground'],
  sidebarBorder: DESIGN_TOKENS['--sidebar-border'],
  sidebarAccent: DESIGN_TOKENS['--sidebar-accent'],
  sidebarAccentForeground: DESIGN_TOKENS['--sidebar-accent-foreground'],
  sidebarPrimary: DESIGN_TOKENS['--sidebar-primary'],
  sidebarPrimaryForeground: DESIGN_TOKENS['--sidebar-primary-foreground'],
  sidebarRing: DESIGN_TOKENS['--sidebar-ring'],
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
    borderRadius: 8,
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
