# Color Tokens

This repository uses `design/design-system.pen` as the authoritative token source.

## Canonical Files

- `design/design-system.pen`
- `design/tokens/design-tokens.generated.json`
- `design/tokens/design-tokens.generated.md`

Always run `pnpm tokens:sync` before token-related updates.

## Theme Axes

- `Mode`: `Light`, `Dark`
- `Base`: `Neutral`, `Gray`, `Stone`, `Zinc`, `Slate`
- `Accent`: `Default`, `Red`, `Rose`, `Orange`, `Green`, `Blue`, `Yellow`, `Violet`

## Default Token Baseline (Light + Neutral + Default)

| Token | Value |
| --- | --- |
| `--primary` | `#171717` |
| `--primary-foreground` | `#fafafa` |
| `--secondary` | `#f5f5f5` |
| `--secondary-foreground` | `#171717` |
| `--background` | `#fafafa` |
| `--foreground` | `#0a0a0a` |
| `--card` | `#fafafa` |
| `--card-foreground` | `#0a0a0a` |
| `--popover` | `#fafafa` |
| `--popover-foreground` | `#0a0a0a` |
| `--muted` | `#f5f5f5` |
| `--muted-foreground` | `#737373` |
| `--accent` | `#f5f5f5` |
| `--accent-foreground` | `#171717` |
| `--destructive` | `#e7000b` |
| `--border` | `#e5e5e5` |
| `--input` | `#e5e5e5` |
| `--ring` | `#a3a3a3` |

## Sidebar Tokens

| Token | Value |
| --- | --- |
| `--sidebar` | `#fafafa` |
| `--sidebar-foreground` | `#09090b` |
| `--sidebar-border` | `#e4e4e7` |
| `--sidebar-accent` | `#f4f4f4` |
| `--sidebar-accent-foreground` | `#18181b` |
| `--sidebar-primary` | `#18181b` |
| `--sidebar-primary-foreground` | `#fafafa` |
| `--sidebar-ring` | `#71717a` |

## MUI Mapping Guidance

| Pencil token | MUI path |
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
| `--ring` | focus/ring helper tokens in component styles |

## Usage Rules

1. Prefer neutral tokens (`text.*`, `background.*`, `divider`) for default UI.
2. Point colors must be used only when strictly necessary.
3. Use `primary` for CTA/active selection only.
4. Use semantic colors (`error`, `warning`, `success`, `info`) only for true state semantics.
5. Do not use point colors for decorative backgrounds, ordinary content text, or non-semantic icon styling.
6. Avoid hardcoded hex when a token path exists.

## Fallback Integrity

Ambiguous unscoped fallback values are normalized with:

```bash
pnpm tokens:normalize-pen
pnpm tokens:sync
```

Expected state:
- `design/tokens/design-tokens.generated.json` has `warnings.ambiguousFallbackTokens: []`.
