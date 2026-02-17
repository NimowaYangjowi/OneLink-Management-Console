# Project Rules

## Primary Target

- The production project is the Next.js app in repository root.
- Main source path: `src/`
- Main runtime commands run at repository root.

## Core API Reference

- All feature development is based on the **AppsFlyer OneLink API v2**.
- API guide: <https://dev.appsflyer.com/hc/reference/onelink-v2-create-link>
- When implementing link creation, management, or any OneLink-related features, always refer to this API documentation as the single source of truth for request/response schemas, parameters, and behavior.
- OneLink API key is managed via environment variables (e.g. `.env.local`), **not** through an in-app settings page. Never hardcode or expose API keys in client-side code.

## Documentation Language

- Write new documentation in English by default.
- Keep code comments concise and in English.

## File & Folder Documentation

- When creating a new folder, always add a `CLAUDE.md` inside it describing the folder's role and contents.
- When creating a new file, always include a brief summary comment at the top of the file explaining its purpose.

## Working Directories

- `src/app` - Next.js routes and layouts
- `src/components` - dashboard UI components
- `src/lib` - providers/utilities
- `src/styles` - theme and global style support
- `design/design-system.pen` - design source file
- `design/tokens` - generated token snapshots (`pnpm tokens:sync`)
## Commands

### Dashboard (root)

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm tokens:apply-stitch-theme
pnpm tokens:sync
```

## Skills

Custom verification and maintenance skills are defined in `.claude/skills/`.

| Skill | Purpose |
|-------|---------|
| `design-system` | Design-system token governance and usage workflow anchored to `design/design-system.pen` |
| `verify-implementation` | Sequentially runs all verify skills to generate a consolidated verification report |
| `manage-skills` | Analyzes session changes, creates/updates verification skills, and manages CLAUDE.md |

## Workflow

1. All tasks target the production dashboard at repository root.
2. Modify only root project files under `src/`.

## Design System (MUST)

`design/design-system.pen` is the single source of truth for **both** design tokens and component specifications.

### Component-First Development

When building or modifying any UI:

1. **Read `.pen` first**: Use Pencil MCP tools (`batch_get`) to read component specs from `design/design-system.pen` before writing any UI code.
2. **Match `.pen` structure**: Implement using MUI components, but match the layout, spacing, colors, and visual structure defined in the `.pen` components.
3. **Current production composition**: `src/components/onelink/OneLinkStitchedPage.tsx` is the active page and must be reflected back into `.pen` and token decisions.
4. **Component mapping**: Map `.pen` reusable components to MUI equivalents (e.g., `.pen` Card → MUI Card with matching sx props).

### Token Governance

- Single source of truth: `design/design-system.pen`.
- Palette back-port command for current OneLink page style: `pnpm tokens:apply-stitch-theme`.
- Runtime tokens: `src/styles/tokens/design-tokens.css` (CSS variables) and `src/styles/tokens/design-tokens.ts` (hex for MUI).
- Snapshot artifacts: `design/tokens/design-tokens.generated.json` and `design/tokens/design-tokens.generated.md`.
- Unification strategy: `design/design-system-unification.md`
