/**
 * Default Theme
 *
 * Pencil 디자인 시스템 색상 토큰 + Forma 디자인 원칙 통합 테마
 *
 * ## 색상 시스템 (Pencil shadcn 기반)
 * - 중립적 컬러 팔레트 (Neutral Light 테마)
 * - CSS 변수 기반 토큰을 MUI palette로 매핑
 *
 * ## 디자인 원칙 (Forma Studio 기반)
 * - **Sharp Corners**: borderRadius 0 (날카로운 모서리)
 * - **Dimmed Shadow**: offset 없이 blur만 사용하는 은은한 그림자
 * - **Architectural Typography**: 세리프(Fraunces) + 산세리프(Pretendard) 조합
 *
 * ## Pencil 토큰 매핑
 * | Pencil 변수           | MUI 매핑                    |
 * |-----------------------|-----------------------------|
 * | --primary             | palette.primary.main        |
 * | --primary-foreground  | palette.primary.contrastText|
 * | --secondary           | palette.secondary.main      |
 * | --background          | palette.background.default  |
 * | --foreground          | palette.text.primary        |
 * | --border              | palette.divider             |
 * | --destructive         | palette.error.main          |
 * | --muted-foreground    | palette.text.secondary      |
 * | --card                | palette.background.paper    |
 * | --accent              | palette.action.selected     |
 */

import { createTheme } from '@mui/material/styles';

// ============================================================
// Pencil Design Token Reference (CSS Variables → MUI)
// ============================================================
const pencilTokens = {
  // Core colors (Light mode, Neutral base)
  primary: '#171717',
  primaryForeground: '#fafafa',
  secondary: '#f5f5f5',
  secondaryForeground: '#171717',
  background: '#fafafa',
  foreground: '#0a0a0a',
  card: '#fafafa',
  cardForeground: '#0a0a0a',
  popover: '#fafafa',
  popoverForeground: '#0a0a0a',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  accent: '#f5f5f5',
  accentForeground: '#171717',
  destructive: '#e7000b',
  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#a3a3a3',
  // Sidebar specific
  sidebar: '#fafafa',
  sidebarForeground: '#09090b',
  sidebarBorder: '#e4e4e7',
  sidebarAccent: '#f4f4f4',
  sidebarAccentForeground: '#18181b',
  sidebarPrimary: '#18181b',
  sidebarPrimaryForeground: '#fafafa',
};

// ============================================================
// 1. Color Tokens (색상 토큰)
// Pencil shadcn 토큰 → MUI palette 매핑
// ============================================================
const palette = {
  mode: 'light',

  // Primary - shadcn neutral dark
  primary: {
    light: '#404040',
    main: pencilTokens.primary,        // #171717
    dark: '#0a0a0a',
    contrastText: pencilTokens.primaryForeground,  // #fafafa
  },

  // Secondary - shadcn neutral light
  secondary: {
    light: '#fafafa',
    main: pencilTokens.secondary,      // #f5f5f5
    dark: '#e5e5e5',
    contrastText: pencilTokens.secondaryForeground,  // #171717
  },

  // Error/Destructive
  error: {
    light: '#ff4d4d',
    main: pencilTokens.destructive,    // #e7000b
    dark: '#b30000',
    contrastText: '#ffffff',
  },

  // Warning
  warning: {
    light: '#ffb74d',
    main: '#f59e0b',
    dark: '#d97706',
    contrastText: '#000000',
  },

  // Success
  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#16a34a',
    contrastText: '#ffffff',
  },

  // Info
  info: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },

  // 텍스트 색상
  text: {
    primary: pencilTokens.foreground,           // #0a0a0a
    secondary: pencilTokens.mutedForeground,    // #737373
    disabled: 'rgba(0, 0, 0, 0.38)',
  },

  // 배경 색상
  background: {
    default: pencilTokens.background,   // #fafafa
    paper: pencilTokens.card,           // #fafafa
    muted: pencilTokens.muted,          // #f5f5f5
    accent: pencilTokens.accent,        // #f5f5f5
  },

  // 구분선
  divider: pencilTokens.border,         // #e5e5e5

  // 액션 상태
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(23, 23, 23, 0.08)',   // primary 기반 틴트
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(23, 23, 23, 0.12)',      // primary 기반 틴트
  },

  // Grey 스케일 (Pencil neutral 기반)
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Pencil 원본 토큰 참조용 (커스텀)
  pencil: pencilTokens,
};

// ============================================================
// 2. Typography Tokens (타이포그래피 토큰)
// Forma Studio - Fraunces(세리프) + Pretendard(산세리프) 조합
// ============================================================
const typography = {
  // 기본 폰트 패밀리 (본문용)
  fontFamily: [
    '"Pretendard Variable"',
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    'system-ui',
    'Roboto',
    '"Helvetica Neue"',
    '"Segoe UI"',
    '"Apple SD Gothic Neo"',
    '"Noto Sans KR"',
    '"Malgun Gothic"',
    'sans-serif',
  ].join(','),

  // 헤딩 폰트 패밀리 (세리프 - 건축적 느낌)
  headingFontFamily: '"Fraunces", "Noto Serif KR", Georgia, serif',

  // 디스플레이 폰트 패밀리 (로고/대형 타이틀)
  displayFontFamily: '"Pretendard Variable", Pretendard, sans-serif',

  // 폰트 크기 기준
  fontSize: 14,
  htmlFontSize: 16,

  // 폰트 굵기
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  fontWeightBlack: 900,

  // 헤딩 스타일 - Fraunces 세리프 폰트 적용
  h1: {
    fontFamily: '"Fraunces", "Noto Serif KR", Georgia, serif',
    fontWeight: 500,          // Fraunces는 미디엄 웨이트가 특징
    fontSize: '3rem',         // 48px (대형 프로젝트 제목)
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Fraunces", "Noto Serif KR", Georgia, serif',
    fontWeight: 500,
    fontSize: '2.25rem',      // 36px
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontFamily: '"Fraunces", "Noto Serif KR", Georgia, serif',
    fontWeight: 500,
    fontSize: '1.75rem',      // 28px
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: '"Fraunces", "Noto Serif KR", Georgia, serif',
    fontWeight: 500,
    fontSize: '1.5rem',       // 24px
    lineHeight: 1.25,
    letterSpacing: '0',
  },
  h5: {
    fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 600,
    fontSize: '1.25rem',      // 20px (섹션 타이틀)
    lineHeight: 1.3,
    letterSpacing: '0',
  },
  h6: {
    fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
    fontWeight: 600,
    fontSize: '1.125rem',     // 18px
    lineHeight: 1.4,
    letterSpacing: '0',
  },

  // 본문 스타일
  body1: {
    fontSize: '1rem',         // 16px
    lineHeight: 1.7,          // 여유로운 행간
    letterSpacing: '0',
  },
  body2: {
    fontSize: '0.875rem',     // 14px
    lineHeight: 1.6,
    letterSpacing: '0',
  },

  // 부제목
  subtitle1: {
    fontSize: '1rem',         // 16px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  subtitle2: {
    fontSize: '0.875rem',     // 14px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },

  // 버튼 - 산세리프, 약간의 트래킹
  button: {
    fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
    fontSize: '0.875rem',     // 14px
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: '0.02em',
    textTransform: 'none',
  },

  // 캡션
  caption: {
    fontSize: '0.75rem',      // 12px
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },

  // 오버라인 (카테고리 라벨, 상태 태그)
  overline: {
    fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
    fontSize: '0.6875rem',    // 11px
    fontWeight: 600,
    lineHeight: 2,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
};

// ============================================================
// 3. Spacing Token (간격 토큰)
// ============================================================
const spacing = 8; // 기본 단위: 8px

// ============================================================
// 4. Shape Token (모양 토큰)
// ============================================================
const shape = {
  borderRadius: 0, // Sharp corners (0px)
};

// ============================================================
// 5. Shadow Tokens (그림자 토큰)
// ============================================================
const customShadows = {
  none: 'none',
  sm: '0 0 12px rgba(0, 0, 0, 0.06)',
  md: '0 0 16px rgba(0, 0, 0, 0.08)',
  lg: '0 0 20px rgba(0, 0, 0, 0.10)',
  xl: '0 0 24px rgba(0, 0, 0, 0.12)',
};

// ============================================================
// 6. Breakpoints (브레이크포인트)
// ============================================================
const breakpoints = {
  values: {
    xs: 0,      // 모바일
    sm: 600,    // 태블릿 세로
    md: 900,    // 태블릿 가로
    lg: 1200,   // 데스크톱
    xl: 1536,   // 대형 데스크톱
  },
};

// ============================================================
// 7. Z-Index (레이어 순서)
// ============================================================
const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// ============================================================
// 8. Transitions (전환 효과)
// ============================================================
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// ============================================================
// 9. Component Overrides (컴포넌트 오버라이드)
// ============================================================
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: 'thin',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: customShadows.lg,
      },
      elevation0: {
        boxShadow: customShadows.none,
      },
      elevation1: {
        boxShadow: customShadows.sm,
      },
      elevation2: {
        boxShadow: customShadows.md,
      },
      elevation3: {
        boxShadow: customShadows.lg,
      },
      elevation4: {
        boxShadow: customShadows.xl,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        textTransform: 'none',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 0,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 4,
      },
    },
  },
};

// ============================================================
// Theme 생성
// ============================================================
const defaultTheme = createTheme({
  palette,
  typography,
  spacing,
  shape,
  breakpoints,
  zIndex,
  transitions,
  components,
});

// 커스텀 속성 추가 (타입 확장 없이 접근 가능하도록)
defaultTheme.customShadows = customShadows;

/**
 * 대시보드 스타일 설정 (Pencil 색상 + Forma 원칙)
 */
defaultTheme.dashboard = {
  style: 'pencil',
  iconStyle: 'outlined',
  iconWeight: 400,
  cardBorderRadius: 0,  // Forma 원칙: Sharp corners
  cardColors: [
    `linear-gradient(to bottom, ${pencilTokens.card} 0%, ${pencilTokens.card} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.primary} 0%, ${pencilTokens.primary} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.secondary} 0%, ${pencilTokens.secondary} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.card} 0%, ${pencilTokens.card} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
  ],
  subCardColors: [
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
    `linear-gradient(to bottom, ${pencilTokens.muted} 0%, ${pencilTokens.muted} 100%)`,
  ],
  textColor: pencilTokens.foreground,
  textSecondary: pencilTokens.mutedForeground,
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',
  border: `1px solid ${pencilTokens.border}`,
  borderColor: pencilTokens.border,
  shadow: customShadows.lg,  // Forma 원칙: Dimmed shadow
  subBorder: `1px solid ${pencilTokens.border}`,
  subShadow: '0 0 0 rgba(0, 0, 0, 0)',
  subBackdropFilter: 'blur(0px)',
  subBorderRadius: 0,  // Forma 원칙: Sharp corners
  dividerColor: pencilTokens.border,
  progressHeight: 4,
  progressTrackColor: pencilTokens.muted,
  progressBarColor: pencilTokens.primary,
  progressGradient: false,
  progressBorderRadius: 0,  // Forma 원칙: Sharp corners
  background: pencilTokens.background,
  atmosphere: `linear-gradient(to bottom, ${pencilTokens.background} 0%, ${pencilTokens.background} 100%)`,
  atmosphereOpacity: 0,
  accentColor: pencilTokens.primary,
  // Pencil 토큰 참조
  tokens: pencilTokens,
  blobs: null,
};

export default defaultTheme;

// 개별 토큰 내보내기 (문서화용)
export {
  pencilTokens,
  palette,
  typography,
  spacing,
  shape,
  customShadows,
  breakpoints,
  zIndex,
  transitions,
  components,
};
