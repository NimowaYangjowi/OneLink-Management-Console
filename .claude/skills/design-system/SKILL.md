---
name: design-system
description: OneLinkManagingConsole design-system workflow. Use for UI styling, MUI theme work, and token mapping. Color tokens must come from design/design-system.pen via generated files.
---

# Design System

This skill standardizes design-system decisions for this repository.

## Source Priority

1. `design/design-system.pen` (single source of truth)
2. `design/tokens/design-tokens.generated.json` (machine-readable snapshot)
3. `design/tokens/design-tokens.generated.md` (human-readable snapshot)
4. `src/styles/themes/default.ts` (runtime implementation)

## Required Workflow For Token Tasks

1. Run `pnpm tokens:sync`.
2. Read `design/tokens/design-tokens.generated.json`.
3. Apply token values from generated outputs, not from scattered docs.
4. If values conflict, trust `design/design-system.pen` and regenerate.

## Scope Split

- Color tokens: must come from `design/design-system.pen`.
- Typography, spacing, shadows, component-level decisions: currently defined in `src/styles/themes/default.ts` and documented in references.

## Guardrails

- Do not hardcode hex values when a token exists.
- Prefer neutral palette for default UI states.
- Point colors must be used only when strictly necessary.
- Allowed point-color cases: CTA emphasis, active/selected state, and explicit semantic feedback.
- Disallowed point-color cases: decorative backgrounds, ordinary body text, and non-semantic icon coloring.
- Use semantic colors (`error`, `warning`, `success`, `info`) only for state meaning.
- Design tokens are sourced exclusively from `design/` directory outputs.

## Ambiguous Fallback Handling

Some tokens in `design-system.pen` contain multiple unscoped fallback values.
Use the generated warning list in `design/tokens/design-tokens.generated.md`.
Default behavior is currently: first unscoped value is treated as canonical.

## References

- Unification plan: `design/design-system-unification.md`
- Color tokens: [references/color-tokens.md](references/color-tokens.md)
- Typography: [references/typography.md](references/typography.md)
- Spacing and shadows: [references/spacing-shadow.md](references/spacing-shadow.md)
- Component usage: [references/components.md](references/components.md)
