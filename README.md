# OneLink Management Console

OneLink Management Console is a reference project for teams that want to integrate AppsFlyer OneLink into their own systems.

Instead of managing links only in the AppsFlyer dashboard, this project shows how to manage OneLink resources through the OneLink API in an app-friendly, automation-friendly way.

## Project Goal

The main goal is to make OneLink CRUD simple and flexible for advertisers and app owners.

This project especially focuses on supporting a collection-style creation flow similar to AppsFlyer dashboard Bulk Link Creation, but managed through APIs so it can be integrated into internal tools and workflows.

## What This Repository Provides

- API-first OneLink CRUD workflow
- Flexible link creation patterns for different campaign and deep-linking scenarios
- Collection-style bulk creation approach inspired by AppsFlyer Bulk Link Creation
- Practical integration reference for product teams building their own OneLink console

## Intended Use

This repository is provided as a reference implementation.

It is not intended to be used as-is in every environment. The primary value is to help app owners and engineering teams adopt the architecture, patterns, and implementation approach when integrating OneLink into their own systems.

## Recommended Role Management Model

For production systems, we recommend defining a role management model and operating based on it. For example, you can use the following four-level structure:

- Admin
- Manager: manages settings and permissions, including adding preset values and template IDs in `settings`
- Marketer: can edit links and link groups, but cannot change `settings` values
- Agency, affiliates, and others: can only view and use links

## Important Notice

- This is a personal project.
- This is not an official AppsFlyer product.
- No official endorsement by AppsFlyer is implied.

## API Reference (Source of Truth)

All OneLink features in this project are based on AppsFlyer OneLink API v2:

- [AppsFlyer OneLink API v2 - Create Link](https://dev.appsflyer.com/hc/reference/onelink-v2-create-link)

## Quick Start

1. Prepare your environment

- Node.js: a version compatible with Next.js 16 (recommended: v20+)
- pnpm: latest stable version

2. Install dependencies

```bash
pnpm install
```

3. Create local environment file

```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`

```bash
APPSFLYER_ONELINK_API_TOKEN=your_appsflyer_onelink_api_token_here
# Optional alias (same purpose as APPSFLYER_ONELINK_API_TOKEN)
# ONELINK_API_TOKEN=your_appsflyer_onelink_api_token_here

# Optional SQLite file override (default: .data/onelink-console.sqlite)
# ONELINK_SQLITE_PATH=/absolute/path/to/onelink-console.sqlite
```

5. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## First-Run Behavior

- On first server start, the app automatically creates a local SQLite database file and initializes required tables/indexes.
- Default local DB path is `.data/onelink-console.sqlite`.
- Local DB files are gitignored (`.data/`, `*.db`, `*.sqlite`, `*.sqlite3`) and are not included in pushes/clones.

## Runtime Requirements and Feature Scope

- `APPSFLYER_ONELINK_API_TOKEN` is required for AppsFlyer API-backed operations:
  - Template domain probe
  - OneLink create/update/delete operations
  - Group execution that calls AppsFlyer APIs
- Without the token, local pages can still load and local SQLite persistence can still work, but API-backed OneLink operations will fail.

## First Functional Check

After starting the app:

1. Open `/settings` and add a valid 4-character Template ID.
2. Open `/create/single-link` or `/create/link-group`.
3. Create a test link and verify it appears in `/links`.

## Validation Commands

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Project Structure

```text
.
├── src/                         # Next.js app source
├── design/design-system.pen     # Design token source of truth
├── design/tokens/               # Generated design token artifacts
├── scripts/                     # Automation and utility scripts
└── tasks/                       # Notes and task artifacts
```
