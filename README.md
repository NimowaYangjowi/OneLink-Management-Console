# OneLink Managing Console

Production app: Next.js dashboard at repository root.

## Repository Structure

```text
.
├── src/                     # OneLink dashboard source (Next.js App Router)
├── design/design-system.pen # Pencil source file
├── design/tokens/           # Generated token snapshots from .pen
└── tasks/                   # implementation notes and checklists
```

## Design Token Source Of Truth

`design/design-system.pen` is the only source of truth for design-token variables.

Generate synchronized token documents:

```bash
pnpm tokens:sync
```

Generated outputs:
- `design/tokens/design-tokens.generated.json`
- `design/tokens/design-tokens.generated.md`

Governance and unification plan:
- `design/design-system-unification.md`

## Dashboard (Primary)

```bash
pnpm install
pnpm dev
```

- URL: [http://localhost:3000](http://localhost:3000)
- Main routes:
  - `/dashboard`
  - `/dashboard/manage-links`

## Build and Validation

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Claude to Codex Bridge

This repository contains Claude-specific runtime config under `.claude/`.
Use the bridge commands below to reuse those rules in Codex.

```bash
# Regenerate AGENTS.md from CLAUDE.md + .claude/skills + .claude/rules + .claude/settings.json
pnpm bridge:codex

# Run the same auto-commit stop hook that Claude uses
pnpm codex:stop-hook

# Optional: start Codex CLI with automatic stop-hook execution on exit
pnpm codex:bridge-cli -- --help
```
