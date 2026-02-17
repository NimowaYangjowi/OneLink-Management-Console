# Design System Unification

## Purpose

Keep one authoritative design source while ensuring runtime tokens and docs stay synchronized.

## Single Source Of Truth

- Source: `design/design-system.pen`
- Active page composition anchor: `src/components/onelink/OneLinkStitchedPage.tsx`

The page implementation should follow `.pen`, and when style direction changes in the page, update `.pen` first (or back-port to `.pen` immediately) before finalizing runtime tokens.

## Sync Pipeline

Commands:

```bash
pnpm tokens:apply-stitch-theme
pnpm tokens:sync
```

- `tokens:apply-stitch-theme`
  - Script: `scripts/apply-onelink-stitch-theme-to-pen.mjs`
  - Purpose: back-port current stitched page Light-mode palette to `.pen` variables.
- `tokens:sync`
  - Script: `scripts/sync-pen-tokens.mjs`
  - Purpose: generate runtime/doc token artifacts directly from `.pen`.

## Generated Artifacts

- Snapshot artifacts:
  - `design/tokens/design-tokens.generated.json`
  - `design/tokens/design-tokens.generated.md`
- Runtime artifacts:
  - `src/styles/tokens/design-tokens.css`
  - `src/styles/tokens/design-tokens.ts`

## Operating Rules

1. Do not manually edit generated token artifacts.
2. After any `.pen` token change, run `pnpm tokens:sync`.
3. Before updating docs/skills that reference token values, ensure generated artifacts are refreshed.
4. In page/component code, use `theme.palette` or `pencilTokens`; avoid hardcoded hex values.
5. Use HugeIcons by default (`src/components/shared/HugeIcon.tsx`) and Lucide only as fallback.
