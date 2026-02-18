# src/components/onelink

OneLink-specific screen and layout components for link creation and settings management.

## Files

- `ConsoleLayout.tsx` - Shared sidebar and sticky-header shell used by OneLink pages
- `OneLinkListPage.tsx` - Searchable management UI with CRUD controls for created OneLink records
- `OneLinkSettingsPage.tsx` - Settings management UI for Template IDs and attribution field presets
- `OneLinkStitchedPage.tsx` - Link create/edit page orchestrator (state + event handlers); delegates rendering to `stitched/` sub-components

## Subdirectories

- `stitched/` - Presentational sub-components extracted from OneLinkStitchedPage (see `stitched/CLAUDE.md`)
