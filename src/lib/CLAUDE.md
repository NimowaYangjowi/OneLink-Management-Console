# src/lib

Shared library code: providers, utilities, hooks, and helper functions used across the application.

## Structure

- `providers/` - React context providers (Theme, Auth, etc.)
- `onelinkApi.ts` - Server-side AppsFlyer OneLink API helpers for create/read/update/delete and probe flows
- `onelinkLinksSchema.ts` - Shared OneLink record types and payload sanitizers
- `onelinkLinksStore.ts` - Server-side repository for OneLink list persistence in SQLite
- `settingsSchema.ts` - Shared settings types and sanitization utilities for client/server
- `settingsStore.ts` - Server-side repository for loading/saving settings in SQLite
- `sqlite.ts` - Server-only SQLite connection/bootstrap module
