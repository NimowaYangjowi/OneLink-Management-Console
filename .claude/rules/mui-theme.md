# MUI Custom Theme (SHOULD)

MUI custom theme rules for OneLinkManagingConsole.

## Theme File

- Location: `src/styles/themes/default.ts`
- Tokens source: `design/design-system.pen` → `src/styles/tokens/design-tokens.ts`

## Color Rules

### Single Point Color

- Use one purple point color token: `--primary: #4f46e5`
- Keep action/interactive emphasis on `primary.main` and `ring`.
- Do not introduce additional brand accent hues in components.

### Neutral Surfaces

Use neutral tokens for default UI states:

```tsx
background.default  // --background
background.paper    // --card
text.primary        // --foreground
text.secondary      // --muted-foreground
divider             // --border
```

### Pencil → MUI Mapping

```tsx
const pencilTokens = {
  primary: DESIGN_TOKENS['--primary'],
  primaryForeground: DESIGN_TOKENS['--primary-foreground'],
  secondary: DESIGN_TOKENS['--secondary'],
  secondaryForeground: DESIGN_TOKENS['--secondary-foreground'],
  background: DESIGN_TOKENS['--background'],
  foreground: DESIGN_TOKENS['--foreground'],
  border: DESIGN_TOKENS['--border'],
  mutedForeground: DESIGN_TOKENS['--muted-foreground'],
  destructive: DESIGN_TOKENS['--destructive'],
};
```

## Typography Rules

- Inter must be used everywhere.
- Font tokens:
  - `--font-sans: var(--font-inter), "Helvetica Neue", Arial, sans-serif`
  - `--font-serif: var(--font-inter), "Helvetica Neue", Arial, sans-serif`
  - `--font-mono: var(--font-inter), "Helvetica Neue", Arial, sans-serif`
- Avoid local font imports that conflict with tokenized Inter.

## Elevation

Use dimmed shadow presets from theme:

```tsx
customShadows: {
  none: 'none',
  sm: '0 0 12px rgba(0, 0, 0, 0.06)',
  md: '0 0 16px rgba(0, 0, 0, 0.08)',
  lg: '0 0 20px rgba(0, 0, 0, 0.10)',
  xl: '0 0 24px rgba(0, 0, 0, 0.12)',
}
```

## Border Radius

Global shape:

```tsx
shape: {
  borderRadius: 8,
}
```

## Usage

Prefer `theme.palette` in `sx`:

```tsx
sx={{
  backgroundColor: 'background.paper',
  borderColor: 'divider',
  color: 'text.primary',
}}
```
