/**
 * Forma Studio Theme
 *
 * 공간 디자인 & 건축 컨설팅 스튜디오 "Forma Studio"의 디자인 토큰입니다.
 * Groth Studio 웹사이트 레퍼런스를 기반으로 제작되었습니다.
 *
 * ## 핵심 철학
 * - **Sharp Corners**: borderRadius 0 (날카로운 모서리)
 * - **Dimmed Shadow**: offset 없이 blur만 사용하는 은은한 그림자
 * - **Warm Cream**: 따뜻한 크림 베이지 배경 (#F5F0E8)
 * - **Terracotta Accent**: 테라코타 오렌지 (#C65D3B)
 * - **Architectural Typography**: 세리프(Fraunces) + 산세리프(Pretendard) 조합
 *
 * ## 브랜드 정보
 * - **브랜드명**: Forma Studio
 * - **슬로건**: Shaping Spaces, Crafting Experiences
 * - **분야**: 공간 디자인 & 건축 컨설팅
 * - **위치**: Seoul, Korea / New York, USA
 */

import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// ============================================================
// 1. Color Tokens (색상 토큰)
// Forma Studio 브랜드 색상 - Groth Studio 레퍼런스 기반
// ============================================================
const palette = {
  mode: 'light',

  // 브랜드 색상 - Terracotta/Burnt Orange
  primary: {
    light: '#D4836A',      // 밝은 테라코타
    main: '#C65D3B',       // 메인 테라코타 (Groth 레퍼런스)
    dark: '#A34A2E',       // 어두운 테라코타
    contrastText: '#FFFFFF',
  },

  // 보조 색상 - Dark Olive/Forest
  secondary: {
    light: '#5A6B5A',      // 밝은 올리브
    main: '#3D4A3D',       // 다크 올리브 (푸터 배경)
    dark: '#2A332A',       // 매우 어두운 올리브
    contrastText: '#FFFFFF',
  },

  // 상태 색상 (Feedback) - 톤 다운된 버전
  error: {
    light: '#E57373',
    main: '#C65D3B',       // 테라코타와 유사하게
    dark: '#A34A2E',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#FFB74D',
    main: '#F5A623',
    dark: '#E09000',
    contrastText: '#000000',
  },
  success: {
    light: '#81C784',
    main: '#4A7C4A',       // 올리브 그린 계열
    dark: '#3D4A3D',
    contrastText: '#FFFFFF',
  },
  info: {
    light: '#90CAF9',
    main: '#5C7A8A',       // 뮤트된 블루그레이
    dark: '#445660',
    contrastText: '#FFFFFF',
  },

  // 텍스트 색상 - 깊은 블랙
  text: {
    primary: '#000000',           // 순수 블랙 (Groth 스타일)
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },

  // 배경 색상 - Warm Cream
  background: {
    default: '#F5F0E8',           // 크림 베이지 (Groth 메인 배경)
    paper: '#FFFFFF',             // 카드/모달용 화이트
    cream: '#F5F0E8',             // 크림 베이지
    accent: '#C65D3B',            // 액센트 배경 (사이드바)
    dark: '#3D4A3D',              // 다크 배경 (푸터)
  },

  // 구분선 - 점선 스타일 참조용
  divider: 'rgba(0, 0, 0, 0.15)',

  // 액션 상태
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(198, 93, 59, 0.12)',  // 테라코타 틴트
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    focus: 'rgba(198, 93, 59, 0.2)',      // 테라코타 틴트
  },

  // Grey 스케일
  grey: {
    50: '#FAFAF8',         // 워밍 업된 그레이
    100: '#F5F3F0',
    200: '#E8E5E0',
    300: '#D5D0C8',
    400: '#B0AAA0',
    500: '#8A8478',
    600: '#6B6560',
    700: '#4D4844',
    800: '#2E2B28',
    900: '#1A1817',
  },

  // 커스텀 브랜드 색상
  brand: {
    terracotta: '#C65D3B',
    cream: '#F5F0E8',
    olive: '#3D4A3D',
    sand: '#E8DFD0',
    charcoal: '#2E2B28',
  },
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
 * Forma Studio 대시보드 스타일 설정
 */
defaultTheme.dashboard = {
  style: 'forma',
  iconStyle: 'outlined',
  iconWeight: 400,
  cardBorderRadius: 0,
  cardColors: [
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',  // 크림
    'linear-gradient(to bottom, #C65D3B 0%, #C65D3B 100%)',  // 테라코타
    'linear-gradient(to bottom, #3D4A3D 0%, #3D4A3D 100%)',  // 올리브
    'linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 100%)',
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
  ],
  subCardColors: [
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
    'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
  ],
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',
  border: '1px solid transparent',
  borderColor: 'transparent',
  shadow: customShadows.lg,
  subBorder: '1px solid rgba(0, 0, 0, 0.08)',
  subShadow: '0 0 0 rgba(0, 0, 0, 0)',
  subBackdropFilter: 'blur(0px)',
  subBorderRadius: 0,
  dividerColor: 'rgba(0, 0, 0, 0.15)',
  progressHeight: 4,
  progressTrackColor: 'rgba(0, 0, 0, 0.08)',
  progressBarColor: palette.primary.main,
  progressGradient: false,
  progressBorderRadius: 0,
  background: '#F5F0E8',  // 크림 배경
  atmosphere: 'linear-gradient(to bottom, #F5F0E8 0%, #F5F0E8 100%)',
  atmosphereOpacity: 0,
  accentColor: palette.primary.main,
  accentColors: {
    terracotta: '#C65D3B',
    olive: '#3D4A3D',
    sand: '#E8DFD0',
    cream: '#F5F0E8',
  },
  blobs: null,
};

/**
 * Forma Studio 브랜드 정보
 */
defaultTheme.brand = {
  name: 'Forma Studio',
  tagline: 'Shaping Spaces, Crafting Experiences',
  description: 'An architectural and spatial design studio specializing in consciously designed environments for businesses, nonprofits, and people.',
  locations: [
    { city: 'Seoul', country: 'Korea', timezone: 'KST' },
    { city: 'New York', country: 'USA', timezone: 'ET' },
  ],
  navigation: ['Projects', 'Research', 'About', 'Contact'],
  sidebarTitle: 'Research & Design',
};

export default defaultTheme;

// 개별 토큰 내보내기 (문서화용)
export {
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
