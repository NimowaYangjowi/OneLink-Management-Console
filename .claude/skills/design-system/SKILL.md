---
name: design-system
description: OneLinkManagingConsole design-system workflow. Use for UI styling, MUI theme work, token mapping, and component implementation. The .pen file is the single source of truth for both tokens and component specs. Always read .pen components before building UI.
---

# Design System

This skill standardizes design-system decisions for this repository.

## Source Priority

1. `design/design-system.pen` (single source of truth for tokens AND components)
2. `src/styles/tokens/design-tokens.css` (CSS custom properties, oklch values)
3. `src/styles/tokens/design-tokens.ts` (hex approximations for MUI)
4. `src/styles/themes/default.ts` (MUI theme implementation)

## Component-First Workflow (MUST)

When building or modifying ANY UI component or page:

1. **Read `.pen` components**: Use Pencil MCP `batch_get` with `patterns: [{ reusable: true }]` to list available components.
2. **Inspect target component**: Use `batch_get` with `nodeIds` and `readDepth: 2` to read structure, spacing, colors, and children.
3. **Check screen compositions**: The `.pen` file contains dashboard screens (`dashboard-utility`, `dashboard-revenue`, `dashboard-football`). Read them to understand how components are composed.
4. **Implement in MUI**: Translate the `.pen` component spec into MUI code, matching layout, spacing, token usage, and visual hierarchy.
5. **Verify visually**: Use `get_screenshot` on the `.pen` node to compare against your implementation.

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
| `iconFontFamily: "lucide"` | `import { IconName } from 'lucide-react'` |

### .pen Component Categories

- **Buttons**: Default, Secondary, Outline, Ghost (+ Large, Icon variants)
- **Cards**: Card, Card Action, Card Plain, Card Image
- **Inputs**: Input Group, Select Group, Textarea Group, Combobox, Input OTP
- **Tables**: Data Table, Table Row, Table Cell, Column Header
- **Navigation**: Sidebar, Tabs, Breadcrumb, Pagination
- **Feedback**: Dialog, Modal (Left/Center/Icon), Alert, Tooltip, Dropdown
- **Data Display**: Badge, Avatar, Accordion, Progress
- **Controls**: Checkbox, Radio, Switch

## Token Workflow

- CSS variables (oklch): `src/styles/tokens/design-tokens.css` → imported in `globals.css`
- MUI hex tokens: `src/styles/tokens/design-tokens.ts` → imported in `default.ts`
- Token source: `design/index.css` (exported from `.pen`)

## Guardrails

- Do not hardcode hex values when a token exists.
- Prefer neutral palette for default UI states.
- Point colors only for: CTA emphasis, active/selected state, explicit semantic feedback.
- Use semantic colors (`error`, `warning`, `success`, `info`) only for state meaning.
- Design tokens are sourced exclusively from `design/` directory outputs.
- **Always read `.pen` component specs before creating new UI components.**
- **Do not invent component styles that contradict `.pen` definitions.**

## References

- Unification plan: `design/design-system-unification.md`
- Color tokens: [references/color-tokens.md](references/color-tokens.md)
- Typography: [references/typography.md](references/typography.md)
- Spacing and shadows: [references/spacing-shadow.md](references/spacing-shadow.md)
- Component usage: [references/components.md](references/components.md)
