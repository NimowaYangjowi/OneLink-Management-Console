---
name: design-system
description: OneLinkManagingConsole design-system workflow. Use for UI styling, MUI theme work, token mapping, and component implementation. The .pen file is the single source of truth for tokens and composition.
---

# Design System

This skill standardizes design-system decisions for this repository.

## Source Priority

1. `design/design-system.pen` (single source of truth)
2. `design/tokens/design-tokens.generated.json` (generated snapshot)
3. `src/styles/tokens/design-tokens.css` (runtime CSS variables)
4. `src/styles/tokens/design-tokens.ts` (runtime TS token map)
5. `src/styles/themes/default.ts` (MUI theme mapping)

## Component-First Workflow (MUST)

When building or modifying ANY UI component or page:

1. **Read `.pen` first**: Use Pencil MCP `batch_get` with `patterns: [{ reusable: true }]`.
2. **Inspect target structures**: Read matching nodes with `readDepth: 2`.
3. **Use current page composition as implementation anchor**:
   - `src/components/onelink/OneLinkStitchedPage.tsx`
4. **Reflect style decisions back to `.pen` tokens**:
   - `pnpm tokens:apply-stitch-theme`
5. **Regenerate token artifacts after `.pen` changes**:
   - `pnpm tokens:sync`
6. **Verify implementation against `.pen`**:
   - Use `get_screenshot` for visual checks when needed.

### .pen → MUI Mapping Rules

| .pen Property | MUI Equivalent |
|--------------|----------------|
| `fill: "$--primary"` | `sx={{ backgroundColor: 'primary.main' }}` |
| `fill: "$--card"` | `sx={{ backgroundColor: 'background.paper' }}` |
| `fill: "$--secondary"` | `sx={{ backgroundColor: 'secondary.main' }}` |
| `fill: "$--muted"` | `sx={{ backgroundColor: 'grey.100' }}` |
| `stroke.fill: "$--border"` | `sx={{ borderColor: 'divider' }}` |
| `cornerRadius: 6` | `sx={{ borderRadius: '6px' }}` |
| `padding: [8, 16]` | `sx={{ py: 1, px: 2 }}` (÷8) |
| `gap: 8` | `sx={{ gap: 1 }}` (÷8) |
| `layout: "vertical"` | `<Stack direction="column">` |
| `layout: "horizontal"` / default | `<Stack direction="row">` |
| `width: "fill_container"` | `sx={{ width: '100%' }}` |
| `justifyContent: "space_between"` | `sx={{ justifyContent: 'space-between' }}` |
| icon component | `HugeIcon` wrapper (`@hugeicons/*` first, `lucide-react` fallback) |

## Token Workflow

- Source of truth: `design/design-system.pen`
- Sync command: `pnpm tokens:sync`
- Generated artifacts:
  - `design/tokens/design-tokens.generated.json`
  - `design/tokens/design-tokens.generated.md`
  - `src/styles/tokens/design-tokens.css`
  - `src/styles/tokens/design-tokens.ts`

## Guardrails

- Do not hardcode hex values when a token exists.
- Prefer neutral palette for default UI states and controls.
- Point colors only for explicit state meaning.
- Use semantic colors (`error`, `warning`, `success`, `info`) only for state meaning.
- Use `theme.palette` (or `pencilTokens`) in components, not local color maps.
- HugeIcons are primary icon source; Lucide is fallback only through `HugeIcon`.
- Do not ship UI changes without syncing token artifacts.

## References

- Unification plan: `design/design-system-unification.md`
- Color tokens: [references/color-tokens.md](references/color-tokens.md)
- Typography: [references/typography.md](references/typography.md)
- Spacing and shadows: [references/spacing-shadow.md](references/spacing-shadow.md)
- Component usage: [references/components.md](references/components.md)
