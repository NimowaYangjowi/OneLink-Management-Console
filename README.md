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

## Important Notice

- This is a personal project.
- This is not an official AppsFlyer product.
- No official endorsement by AppsFlyer is implied.

## API Reference (Source of Truth)

All OneLink features in this project are based on AppsFlyer OneLink API v2:

- [AppsFlyer OneLink API v2 - Create Link](https://dev.appsflyer.com/hc/reference/onelink-v2-create-link)

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Create local environment file

```bash
cp .env.example .env.local
```

3. Set your AppsFlyer API token in `.env.local`

```bash
APPSFLYER_ONELINK_API_TOKEN=your_appsflyer_onelink_api_token_here
```

4. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

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
