# Project Rules

## Primary Target

- The production project is the Next.js app in repository root.
- Main source path: `src/`
- Main runtime commands run at repository root.

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
- `design-guide/forma-studio` - design guide (non-production)

## Commands

### Dashboard (root)

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
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
| `verify-implementation` | Sequentially runs all verify skills to generate a consolidated verification report |
| `manage-skills` | Analyzes session changes, creates/updates verification skills, and manages CLAUDE.md |

## Workflow

1. Decide whether the task targets production dashboard or design guide.
2. For dashboard tasks, modify only root project files.
3. For design guide tasks, modify only `design-guide/forma-studio`.
4. Keep dependencies isolated per project.
