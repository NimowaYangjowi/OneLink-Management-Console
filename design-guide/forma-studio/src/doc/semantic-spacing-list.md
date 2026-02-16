# Semantic Spacing Token List

Based on analysis of 25 components in the project.

## Summary

- **Total Components Analyzed**: 25
- **Components with Spacing**: 21
- **Most Used Values**: 2, 3, 4 (MUI units = 16px, 24px, 32px)
- **Base Unit**: 8px (MUI default)

---

## 1. Component Internal (inset)

Internal padding for components like cards and containers.

| Token | MUI Value | Pixel Value | Used By |
|-------|-----------|-------------|---------|
| `inset.none` | 0 | 0px | CardContainer, CustomCard |
| `inset.sm` | 2 | 16px | CardContainer, CustomCard |
| `inset.md` | 3 | 24px | CardContainer, CustomCard |
| `inset.lg` | 4 | 32px | CardContainer, CustomCard |

---

## 2. Gap (gap)

Space between child elements in flex/grid layouts.

| Token | MUI Value | Pixel Value | Used By |
|-------|-----------|-------------|---------|
| `gap.none` | 0 | 0px | SplitScreen, LineGrid |
| `gap.xs` | 0.5 | 4px | Section, Title |
| `gap.sm` | 1 | 8px | NavMenu, Indicator |
| `gap.md` | 2 | 16px | SmartGrid, BentoGrid, AppShell |
| `gap.lg` | 3 | 24px | Visual Examples |
| `gap.xl` | 4 | 32px | Page sections |

---

## 3. Section (section)

Vertical spacing between major content sections.

| Token | MUI Value | Pixel Value | Used By |
|-------|-----------|-------------|---------|
| `section.sm` | 3 | 24px | SectionTitle mb |
| `section.md` | 4 | 32px | SectionTitle mt |
| `section.lg` | 6 | 48px | PageContainer pb |

---

## 4. Page (page)

Page-level spacing for gutters and margins.

| Token | MUI Value | Pixel Value | Used By |
|-------|-----------|-------------|---------|
| `page.gutter.xs` | 2 | 16px | PageContainer px (mobile) |
| `page.gutter.sm` | 3 | 24px | PageContainer px (tablet) |
| `page.gutter.md` | 4 | 32px | PageContainer px (desktop) |
| `page.top` | 8-12 | 64-96px | PageContainer pt |
| `page.bottom` | 4-6 | 32-48px | PageContainer pb |

---

## 5. Navigation (nav)

Spacing for navigation elements.

| Token | Value | Used By |
|-------|-------|---------|
| `nav.item.sm` | 6px 12px | NavMenu padding |
| `nav.item.md` | 8px 16px | NavMenu padding |
| `nav.item.lg` | 12px 20px | NavMenu padding |
| `nav.header` | 64px | AppShell header height |
| `nav.drawer` | 280px | AppShell drawer width |

---

## 6. Inline (inline)

Spacing for inline elements within text.

| Token | Value | Used By |
|-------|-------|---------|
| `inline.icon` | 0.1em | InlineTypography |
| `inline.object` | 0.2em | InlineTypography |

---

## 7. Interactive (interactive)

Spacing for interactive UI elements.

| Token | MUI Value | Pixel Value | Used By |
|-------|-----------|-------------|---------|
| `interactive.indicator` | 1 | 8px | Indicator gap |
| `interactive.arrow` | - | 8px | ImageCarousel arrow position |
| `interactive.control` | 2 | 16px | ImageCarousel indicator position |

---

## Components Analyzed

### Layout Components
- PhiSplit
- SmartGrid
- FullPageContainer
- SplitScreen
- BentoGrid
- RatioContainer
- LineGrid

### Card Components
- CustomCard
- CardContainer

### Navigation Components
- NavMenu
- AppShell

### Documentation Components
- DocumentTitle
- SectionTitle
- PageContainer

### Typography Components
- Title
- FitText
- HighlightedTypography
- InlineTypography
- QuotedContainer
- StyledParagraph

### Media Components
- AspectMedia
- VideoScrubbing
- ImageCarousel
- ImageTransition

### Common UI Components
- Indicator

---

## Implementation Notes

### Theme Integration

```jsx
// src/styles/theme.js
const theme = createTheme({
  spacing: 8, // base unit
  customSpacing: {
    inset: { none: 0, sm: 2, md: 3, lg: 4 },
    gap: { none: 0, xs: 0.5, sm: 1, md: 2, lg: 3, xl: 4 },
    section: { sm: 3, md: 4, lg: 6 },
    page: {
      gutter: { xs: 2, sm: 3, md: 4 },
      top: { xs: 8, sm: 10, md: 12 },
      bottom: { xs: 4, sm: 5, md: 6 },
    },
  },
});
```

### Usage Example

```jsx
// Before (magic numbers)
<Box sx={{ p: 3, mb: 4, gap: 2 }}>

// After (semantic tokens)
<Box sx={{
  p: theme => theme.customSpacing.inset.md,
  mb: theme => theme.customSpacing.section.md,
  gap: theme => theme.customSpacing.gap.md,
}}>
```
