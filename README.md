# OneLink Managing Console

Production app: Next.js dashboard at repository root.

## Repository Structure

```text
.
├── src/                         # Next.js App Router source
├── design/design-system.pen     # Design source of truth (tokens + composition)
├── design/tokens/               # Generated token snapshots
├── scripts/                     # Token and bridge scripts
└── tasks/                       # Implementation notes/checklists
```

## Current Frontend Entry

- Route: `/`
- Page component: `src/components/onelink/OneLinkStitchedPage.tsx`

## Token Source Of Truth

`design/design-system.pen` is the only source of truth for design tokens.

Sync generated artifacts:

```bash
pnpm tokens:sync
```

Generated outputs:

- `design/tokens/design-tokens.generated.json`
- `design/tokens/design-tokens.generated.md`
- `src/styles/tokens/design-tokens.css`
- `src/styles/tokens/design-tokens.ts`

If you need to re-apply the current stitched page palette to Light-mode `.pen` token values:

```bash
pnpm tokens:apply-stitch-theme
pnpm tokens:sync
```

## Development

```bash
pnpm install
pnpm dev
```

- URL: [http://localhost:3000](http://localhost:3000)

## Build and Validation

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Claude to Codex Bridge

```bash
pnpm bridge:codex
pnpm codex:stop-hook
pnpm codex:bridge-cli -- --help
```
# OneLink-Management-Console
