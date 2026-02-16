# OneLink Managing Console

This repository contains two separated projects with different purposes:

- Production app: Next.js dashboard at repository root
- Design reference app: Storybook/Vite guide at `design-guide/forma-studio`

## Repository Structure

```text
.
├── src/                     # OneLink dashboard source (Next.js App Router)
├── design/design-system.pen # Pencil source file
├── design-guide/forma-studio/ # Storybook/Vite design guide (reference only)
└── tasks/                   # implementation notes and checklists
```

## Dashboard (Primary)

```bash
pnpm install
pnpm dev
```

- URL: [http://localhost:3000](http://localhost:3000)
- Main routes:
  - `/dashboard`
  - `/dashboard/manage-links`

## Design Guide (Reference Only)

The Storybook project is intentionally isolated from production runtime.

```bash
pnpm design-guide:install
pnpm design-guide:storybook
```

or:

```bash
cd design-guide/forma-studio
pnpm install
pnpm storybook
```

## Build and Validation

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Cleanup Rules

- Do not import runtime code from `design-guide/forma-studio` into `src/`.
- Keep dashboard dependencies in root `package.json`.
- Keep Storybook dependencies in `design-guide/forma-studio/package.json`.
