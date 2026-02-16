/**
 * Design tokens derived from design/index.css.
 * Hex approximations of the oklch values for MUI theme compatibility.
 * Actual rendering uses CSS custom properties with oklch values from design-tokens.css.
 */

export const DESIGN_TOKEN_SOURCE = 'design/index.css' as const;

export const DESIGN_TOKENS = {
  '--background': '#f7f9fa',
  '--foreground': '#333333',
  '--card': '#ffffff',
  '--card-foreground': '#333333',
  '--popover': '#ffffff',
  '--popover-foreground': '#333333',
  '--primary': '#ffc0cb',
  '--primary-foreground': '#000000',
  '--secondary': '#a2f4fd',
  '--secondary-foreground': '#000000',
  '--muted': '#ddd9c4',
  '--muted-foreground': '#6e6e6e',
  '--accent': '#ffff00',
  '--accent-foreground': '#000000',
  '--destructive': '#ef4444',
  '--destructive-foreground': '#ffffff',
  '--border': '#d4d4d4',
  '--input': '#d4d4d4',
  '--ring': '#ffc0cb',
  '--chart-1': '#ffc0cb',
  '--chart-2': '#87ceeb',
  '--chart-3': '#ffff00',
  '--chart-4': '#ff99cc',
  '--chart-5': '#33cc33',
  '--sidebar': '#f7f9fa',
  '--sidebar-foreground': '#333333',
  '--sidebar-primary': '#ffc0cb',
  '--sidebar-primary-foreground': '#000000',
  '--sidebar-accent': '#ffff00',
  '--sidebar-accent-foreground': '#000000',
  '--sidebar-border': '#d4d4d4',
  '--sidebar-ring': '#ffc0cb',
} as const;

export type DesignTokenName = keyof typeof DESIGN_TOKENS;

export function getDesignToken(token: DesignTokenName): string {
  return DESIGN_TOKENS[token];
}
