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

## Legacy Design Guide

- `design-guide/forma-studio` is a separate Storybook/Vite project.
- Treat it as a design reference and playground only.
- Do not import runtime code from `design-guide/forma-studio` into root `src/`.
- Storybook-related changes should stay inside `design-guide/forma-studio`.

## Documentation Language

- Write new documentation in English by default.
- Keep code comments concise and in English.

## Working Directories

- `src/app` - Next.js routes and layouts
- `src/components` - dashboard UI components
- `src/lib` - providers/utilities
- `src/styles` - theme and global style support
- `design/design-system.pen` - design source file
- `design/tokens` - generated token snapshots (`pnpm tokens:sync`)
- `design-guide/forma-studio` - design guide (non-production)

## Commands

### Dashboard (root)

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm tokens:sync
```

### Design guide (from root)

```bash
pnpm design-guide:install
pnpm design-guide:dev
pnpm design-guide:storybook
pnpm design-guide:build-storybook
```

## Skills

Custom verification and maintenance skills are defined in `.claude/skills/`.

| Skill | Purpose |
|-------|---------|
| `design-system` | Design-system token governance and usage workflow anchored to `design/design-system.pen` |
| `verify-implementation` | Sequentially runs all verify skills to generate a consolidated verification report |
| `manage-skills` | Analyzes session changes, creates/updates verification skills, and manages CLAUDE.md |

## Workflow

1. Decide whether the task targets production dashboard or design guide.
2. For dashboard tasks, modify only root project files.
3. For design guide tasks, modify only `design-guide/forma-studio`.
4. Keep dependencies isolated per project.

## Design Token Governance

- Single source of truth: `design/design-system.pen`.
- Always refresh generated token docs before token-related documentation changes:
  - `pnpm tokens:sync`
- Use generated outputs for references:
  - `design/tokens/design-tokens.generated.json`
  - `design/tokens/design-tokens.generated.md`
- Unification strategy and migration status:
  - `design/design-system-unification.md`
