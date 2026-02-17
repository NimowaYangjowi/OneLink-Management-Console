# src/components/onelink/stitched

Sub-components extracted from `OneLinkStitchedPage.tsx` for the OneLink create/edit form.

## Architecture

- **Parent orchestrator**: `../OneLinkStitchedPage.tsx` owns all state and event handlers.
- **Sub-components**: Pure presentational components receiving props from the parent.

## Files

- `types.ts` - Shared type definitions (ParameterRow, props, API response types)
- `constants.ts` - MAPPED_ONELINK_FIELDS set and toBooleanFlag utility
- `fieldStyles.ts` - MUI sx style objects for form fields (filledFieldSx, plainFieldSx)
- `AutocompleteField.tsx` - Reusable labeled autocomplete input with validation
- `LinkSetupSection.tsx` - Link name, template ID, brand domain, attribution fields
- `DeepLinkingSection.tsx` - Deep link URI, redirection URLs, force deeplink toggle
- `AdditionalParametersSection.tsx` - Custom key-value parameter rows
- `SocialMediaPreviewSection.tsx` - Open Graph title/description/image with preview card
- `LinkPreviewSidebar.tsx` - Right sidebar: generated URL, short link, copy/QR buttons, submit
- `QrCodeDialog.tsx` - QR code modal dialog
