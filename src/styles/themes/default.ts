import { createTheme } from '@mui/material/styles';
import { PEN_DEFAULT_TOKENS } from '@/styles/tokens/pen-tokens.generated';

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
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#22c55e',
    },
    info: {
      main: '#3b82f6',
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
});

export default defaultTheme;
