# Spacing & Shadow

Spacing, shadow, and shape tokens.

Sources:
- `src/styles/themes/default.ts`
- `design/design-system.pen` (`--radius`, `--shadow*`, `--spacing`)

## Spacing (간격)

### 기본 단위: 8px

```jsx
// theme.spacing 사용
sx={{ p: 1 }}   // 8px
sx={{ p: 2 }}   // 16px
sx={{ p: 3 }}   // 24px
sx={{ p: 4 }}   // 32px
sx={{ p: 6 }}   // 48px
sx={{ p: 8 }}   // 64px
```

### 일반적인 사용 패턴

| 용도 | 값 | 코드 |
|------|-----|------|
| 아이콘-텍스트 간격 | 8px | `gap: 1` |
| 요소 내부 패딩 | 16px | `p: 2` |
| 카드 내부 패딩 | 24px | `p: 3` |
| 섹션 간격 | 48-64px | `my: 6` 또는 `my: 8` |
| 리스트 아이템 간격 | 8-16px | `gap: 1` 또는 `gap: 2` |

### ❌ 금지: 직접 값 사용

```jsx
// ❌ 하드코딩
sx={{ padding: '16px', marginTop: '24px' }}

// ✅ spacing 사용
sx={{ p: 2, mt: 3 }}
```

## Shadow (그림자)

### Design Principle: Dimmed Shadow

- x, y offset: **0** (그림자 방향 없음)
- blur만 사용하여 은은한 효과

### Custom Shadows

```jsx
// theme.customShadows
customShadows: {
  none: 'none',
  sm: '0 0 12px rgba(0, 0, 0, 0.06)',
  md: '0 0 16px rgba(0, 0, 0, 0.08)',
  lg: '0 0 20px rgba(0, 0, 0, 0.10)',
  xl: '0 0 24px rgba(0, 0, 0, 0.12)',
}
```

### 사용법

```jsx
// 카드
<Paper sx={{ boxShadow: theme.customShadows.lg }} />

// 모달/다이얼로그
<Dialog sx={{ '& .MuiPaper-root': { boxShadow: theme.customShadows.xl } }} />

// 그림자 없음
<Paper elevation={0} />
```

### MUI elevation 매핑

```jsx
elevation0: customShadows.none
elevation1: customShadows.sm
elevation2: customShadows.md
elevation3: customShadows.lg
elevation4: customShadows.xl
```

## Shape (모양)

### Design Principle: Subtle Rounded Corners

```jsx
// 기본 설정 (테마에서)
shape: {
  borderRadius: 8
}

// 모든 컴포넌트에 자동 적용됨
<Button />  // borderRadius: 8 기반
<Card />   // borderRadius: 8 기반
<Paper />  // borderRadius: 8 기반
```

Use local overrides only when the `.pen` component spec explicitly requires it.

## Breakpoints (반응형)

```jsx
breakpoints: {
  xs: 0,      // 모바일
  sm: 600,    // 태블릿 세로
  md: 900,    // 태블릿 가로
  lg: 1200,   // 데스크톱
  xl: 1536,   // 대형 데스크톱
}
```

### 사용법

```jsx
<Box sx={{
  p: { xs: 2, md: 3, lg: 4 },  // 반응형 패딩
  display: { xs: 'block', md: 'flex' },
}} />
```

## Z-Index (레이어)

```jsx
zIndex: {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
}
```

## Transitions (전환 효과)

```jsx
transitions: {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,  // 기본
    complex: 375,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
}
```

### 사용법

```jsx
<Box sx={{
  transition: theme => theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    backgroundColor: 'grey.100',
  },
}} />
```

## 실제 예시: 카드 컴포넌트

```jsx
<Box sx={{
  // Subtle rounded corners
  borderRadius: 1,

  // Dimmed shadow
  boxShadow: theme => theme.customShadows.lg,

  // 내부 패딩
  p: 3,  // 24px

  // 배경 (중립색)
  backgroundColor: 'background.paper',

  // 테두리 (중립색)
  border: '1px solid',
  borderColor: 'divider',

  // hover 효과
  transition: theme => theme.transitions.create('box-shadow'),
  '&:hover': {
    boxShadow: theme => theme.customShadows.xl,
  },
}} />
```
