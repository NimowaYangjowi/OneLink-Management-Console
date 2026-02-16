# MUI Custom Theme (SHOULD)

MUI 커스텀 테마 설정 규칙 - **Pencil 색상 + Design Principles** 통합

## 테마 파일 관리

- 커스텀 테마는 별도의 파일로 관리한다
- 위치: `src/styles/themes/default.js`
- Pencil 토큰이 MUI palette로 매핑되어 있음

## Color (Pencil 기반)

### Primary Color (--primary)
```jsx
primary: {
  main: '#171717',           // Pencil --primary
  contrastText: '#fafafa',   // Pencil --primary-foreground
}
```

### Secondary Color (--secondary)
```jsx
secondary: {
  main: '#f5f5f5',           // Pencil --secondary
  contrastText: '#171717',   // Pencil --secondary-foreground
}
```

### 전체 Pencil → MUI 매핑
```jsx
// src/styles/themes/default.js 에서 정의됨
const pencilTokens = {
  primary: '#171717',
  primaryForeground: '#fafafa',
  secondary: '#f5f5f5',
  secondaryForeground: '#171717',
  background: '#fafafa',
  foreground: '#0a0a0a',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  destructive: '#e7000b',
  border: '#e5e5e5',
  // ... 등
};
```

## Typography

### 본문
- **Pretendard Variable** 버전을 웹폰트로 사용

### Headline
- **세리프 폰트**: Google Font의 **Fraunces** (h1-h4)
- **산세리프 폰트**: Pretendard (h5-h6, body)

```jsx
h1: {
  fontFamily: '"Fraunces", "Noto Serif KR", Georgia, serif',
  fontWeight: 500,
  fontSize: '3rem',
}
```

## Elevation

Paper에 기본적으로 사용되는 elevation의 box shadow 설정:

- x, y offset: **0** (Dimmed Shadow)
- opacity 값: 낮춤
- blur 값: 높임

```jsx
customShadows: {
  none: 'none',
  sm: '0 0 12px rgba(0, 0, 0, 0.06)',
  md: '0 0 16px rgba(0, 0, 0, 0.08)',
  lg: '0 0 20px rgba(0, 0, 0, 0.10)',
  xl: '0 0 24px rgba(0, 0, 0, 0.12)',
}
```

## Border Radius

모든 컴포넌트의 borderRadius는 **0** (Sharp Corners)

```jsx
shape: {
  borderRadius: 0
}
```

## 테마 사용 예시

```jsx
import defaultTheme, { pencilTokens } from '@/styles/themes/default';
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* 앱 내용 */}
    </ThemeProvider>
  );
}
```

### 컴포넌트에서 Pencil 토큰 직접 사용
```jsx
import { pencilTokens } from '@/styles/themes/default';

// sx prop에서 사용
sx={{
  backgroundColor: pencilTokens.muted,
  borderColor: pencilTokens.border,
  color: pencilTokens.foreground,
}}

// 또는 MUI palette 사용 (권장)
sx={{
  backgroundColor: 'secondary.main',    // = pencilTokens.secondary
  borderColor: 'divider',               // = pencilTokens.border
  color: 'text.primary',                // = pencilTokens.foreground
}}
```
