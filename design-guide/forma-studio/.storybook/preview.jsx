import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { defaultTheme } from '../src/styles/themes';

// Google Fonts 로드 (Material Symbols + Forma Studio 폰트)
const googleFonts = [
  // Material Symbols
  'Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  'Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200',
  // Forma Studio Theme Fonts
  'Fraunces:opsz,wght@9..144,100..900',  // 세리프 헤딩 폰트 (Groth 레퍼런스)
  'Noto+Serif+KR:wght@400;500;600;700',  // 한글 세리프
  'Outfit:wght@300;400;500;600;700;800;900',  // 기존 산세리프 (대체용)
];

googleFonts.forEach((font) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
  document.head.appendChild(link);
});

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: [
          'Overview',
          'Style',
          ['Overview', 'Colors', 'Typography', 'Icons'],
          'MUI Component',
          'Custom Component',
          'Template',
          'Test Data',
        ],
        method: 'alphabetical',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <div style={{ width: '100%', paddingTop: '40px' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview;
