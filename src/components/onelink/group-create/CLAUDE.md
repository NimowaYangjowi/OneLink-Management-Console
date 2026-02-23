# src/components/onelink/group-create

Feature modules extracted from `OneLinkGroupCreatePage.tsx`.

## Architecture

- **Parent orchestrator**: `../OneLinkGroupCreatePage.tsx` owns state, effects, and API handlers.
- **Sub-components**: Step-level and panel-level UI modules receive data and callbacks via props.
- **Utilities**: Tree editing and snippet rendering helpers are isolated for readability and testability.

## Files

- `types.ts` - Shared type definitions for group create modules
- `constants.ts` - Step labels and snippet wheel UI constants
- `treeUtils.ts` - Tree node serialization and mutation helpers
- `snippetUtils.ts` - Snippet display/highlight formatting helpers
- `NodeList.tsx` - Recursive tree editor node list
- `BaseSetupStep.tsx` - Step 1 UI (base setup)
- `TreeBuilderStep.tsx` - Step 2 UI (tree editing)
- `GlobalParametersStep.tsx` - Step 3 UI (global parameters)
- `ReviewExecuteStep.tsx` - Step 4 UI (review and execute)
- `LinkPreviewPanel.tsx` - Link preview wheel/full preview sidebar
- `TreePreviewPanel.tsx` - Collapsible tree stats and hierarchy preview
