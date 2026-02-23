# Color Tokens

`design/design-system.pen` is the only source of truth for token values.

## Generated Artifacts

- `design/tokens/design-tokens.generated.json`
- `design/tokens/design-tokens.generated.md`
- `src/styles/tokens/design-tokens.css`
- `src/styles/tokens/design-tokens.ts`

Always run:

```bash
pnpm tokens:sync
```

after any `.pen` token edit.

## Current Light Baseline

These values must come from generated output, not manually maintained constants:

| Token | Value |
| --- | --- |
| `--primary` | `#4f46e5` |
| `--primary-foreground` | `#ffffff` |
| `--secondary` | `#f1f5f9` |
| `--secondary-foreground` | `#0f172a` |
| `--background` | `#f8fafc` |
| `--foreground` | `#0f172a` |
| `--card` | `#ffffff` |
| `--card-foreground` | `#0f172a` |
| `--muted` | `#f1f5f9` |
| `--muted-foreground` | `#64748b` |
| `--accent` | `#eef2ff` |
| `--accent-foreground` | `#4f46e5` |
| `--border` | `#e2e8f0` |
| `--input` | `#e2e8f0` |
| `--ring` | `#4f46e5` |

## Point Color Rule

- Keep one point hue for brand emphasis: `#4f46e5`.
- `--primary`, `--ring`, and chart tokens (`--chart-1` ... `--chart-5`) must stay in this purple family.
- Do not introduce additional brand accent hues in component code.

## Typography Tokens

| Token | Value |
| --- | --- |
| `--font-sans` | `var(--font-inter), "Helvetica Neue", Arial, sans-serif` |
| `--font-serif` | `var(--font-inter), "Helvetica Neue", Arial, sans-serif` |
| `--font-mono` | `var(--font-inter), "Helvetica Neue", Arial, sans-serif` |

## MUI Mapping

| Token | MUI path |
| --- | --- |
| `--primary` | `palette.primary.main` |
| `--primary-foreground` | `palette.primary.contrastText` |
| `--secondary` | `palette.secondary.main` |
| `--background` | `palette.background.default` |
| `--card` | `palette.background.paper` |
| `--foreground` | `palette.text.primary` |
| `--muted-foreground` | `palette.text.secondary` |
| `--border` | `palette.divider` |
| `--destructive` | `palette.error.main` |

## Usage Rules

1. Use tokenized values through MUI theme (`theme.palette`) in components.
2. Do not hardcode hex values in feature/page components.
3. Use semantic colors (`error`, `warning`, `success`, `info`) only for semantic feedback.
4. Keep icon and decorative surfaces neutral by default.
