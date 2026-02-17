# Component Guidelines

This reference defines implementation rules for the current OneLink page composition.

## Current Composition Anchor

- Primary page: `src/components/onelink/OneLinkStitchedPage.tsx`
- Source of truth for tokens/composition: `design/design-system.pen`

## Core Rules

1. Build UI with MUI primitives and `sx`.
2. Use `theme.palette.*` (or `pencilTokens`) for color values.
3. Do not hardcode hex values in component code.
4. Keep default UI states neutral; reserve point colors for explicit semantic meaning.
5. Keep border radius and shadows aligned with `src/styles/themes/default.ts`.

## Icons

### HugeIcons first

```tsx
import { Settings02Icon } from '@hugeicons/core-free-icons';
import HugeIcon from '@/components/shared/HugeIcon';

<HugeIcon icon={Settings02Icon} size={20} color="currentColor" />
```

### Lucide fallback (only when HugeIcons replacement is not available)

```tsx
import { Orbit } from 'lucide-react';
import HugeIcon from '@/components/shared/HugeIcon';

<HugeIcon fallback={Orbit} size={20} color="currentColor" />
```

### Do not

- Import `lucide-react` directly in feature UI when `HugeIcon` is sufficient.
- Mix multiple icon systems in one component unless there is an explicit fallback reason.

## Form Controls

Use one shared field style shape and bind colors to theme tokens:

```tsx
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.default',
    borderRadius: 0.5,
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'divider' },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
  },
};
```

## Section/Card Surfaces

- Use `Paper` with `elevation={0}` and explicit `borderColor: 'divider'`.
- Prefer `background.default` for muted blocks and `background.paper` for primary surfaces.

## Review Checklist

1. Token usage is palette-based (`theme.palette` or `pencilTokens`).
2. Icons use HugeIcons via `HugeIcon`.
3. No direct hex color literals in page components.
4. Layout/spacing values are consistent with `.pen` structure.
