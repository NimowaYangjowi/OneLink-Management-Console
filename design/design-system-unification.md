# Design System Unification

## Why this exists

Design-system information was split across:
- `design/design-system.pen` (Pencil source)
- `.claude/skills/design-system` (assistant behavior and references)

This document defines the unification model and current migration status.

## Single Source Of Truth

- Source of truth: `design/design-system.pen`
- Canonical extracted outputs:
  - `design/tokens/design-tokens.generated.json`
  - `design/tokens/design-tokens.generated.md`
- Refresh command:
  - `pnpm tokens:sync`

## Current Scope

`design-system.pen` currently defines variable tokens and theme axes:
- `Mode`: `Light`, `Dark`
- `Base`: `Neutral`, `Gray`, `Stone`, `Zinc`, `Slate`
- `Accent`: `Default`, `Red`, `Rose`, `Orange`, `Green`, `Blue`, `Yellow`, `Violet`

Current token extraction focuses on these variables (primarily color tokens).

## Implemented in this change

1. Added token sync automation:
   - `scripts/sync-pen-tokens.mjs`
   - `scripts/normalize-pen-fallbacks.mjs`
   - `pnpm tokens:sync`
   - `pnpm tokens:normalize-pen`
2. Added generated token artifacts under `design/tokens/`.
3. Added generated runtime token artifacts:
   - `src/styles/tokens/pen-tokens.generated.css`
   - `src/styles/tokens/pen-tokens.generated.ts`
4. Updated root docs (`README.md`, `CLAUDE.md`) to point to the same source and sync workflow.
5. Updated `.claude/skills/design-system` references to consume generated token outputs instead of hardcoded, drifting values.
6. Connected runtime token consumption:
   - `src/styles/themes/default.ts` uses generated TS tokens
   - `src/app/globals.css` imports generated CSS variables

## Operating Rules

1. For token values and theme-axis variants, use generated files only.
2. If `design/design-system.pen` changes, run `pnpm tokens:sync` before editing docs or skill references.
3. If generated output changed, update affected implementation/theme files in a separate, explicit follow-up.

## Fallback Status

Ambiguous unscoped fallback values were normalized using:

```bash
pnpm tokens:normalize-pen
```

Current generated warning state is expected to be empty:
- `design/tokens/design-tokens.generated.json` → `warnings.ambiguousFallbackTokens: []`

## Recommended Next Phase

1. Add CI step to fail when generated token files are stale.
2. Add a small visual regression check for token-dependent core components.
