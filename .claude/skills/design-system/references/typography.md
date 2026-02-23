# Typography

Dashboard typography system.

Sources:
- `design/design-system.pen` (font tokens)
- `src/styles/themes/default.ts` (MUI typography variants)

## Font Family Policy

Use Inter everywhere through tokenized font variables.

| Token | Value |
| --- | --- |
| `--font-sans` | `var(--font-inter), "Helvetica Neue", Arial, sans-serif` |
| `--font-serif` | `var(--font-inter), "Helvetica Neue", Arial, sans-serif` |
| `--font-mono` | `var(--font-inter), "Helvetica Neue", Arial, sans-serif` |

Implementation rules:
1. Global font must come from `var(--font-sans)`.
2. MUI `typography.*.fontFamily` must use `var(--font-sans)` or `var(--font-serif)`.
3. Do not add local font imports for Poppins/Fraunces/Roboto Mono.

## Typography Variants

```jsx
<Typography variant="h1">3rem (48px)</Typography>
<Typography variant="h2">2.25rem (36px)</Typography>
<Typography variant="h3">1.75rem (28px)</Typography>
<Typography variant="h4">1.5rem (24px)</Typography>
<Typography variant="h5">1.25rem (20px)</Typography>
<Typography variant="h6">1.125rem (18px)</Typography>
<Typography variant="body1">1rem (16px)</Typography>
<Typography variant="body2">0.875rem (14px)</Typography>
```

## Color Usage

```jsx
<Typography color="text.primary">Primary text</Typography>
<Typography color="text.secondary">Secondary text</Typography>
<Typography color="text.disabled">Disabled text</Typography>
```

Do not use `primary.main` as normal body text color. Keep the purple point color for actions, highlights, and interactive states.
