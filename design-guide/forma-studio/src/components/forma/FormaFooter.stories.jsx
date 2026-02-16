import FormaFooter from './FormaFooter';

export default {
  title: 'Custom Component/Forma/FormaFooter',
  component: FormaFooter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    logo: { control: 'text', description: '로고 텍스트' },
    tagline: { control: 'text', description: '태그라인' },
    navItems: { control: 'object', description: '네비게이션 항목 배열' },
    contact: { control: 'object', description: '연락처 정보' },
    socialLinks: { control: 'object', description: '소셜 링크 배열' },
    copyright: { control: 'text', description: '저작권 문구' },
    onNavClick: { action: 'navClicked', description: '네비게이션 클릭 핸들러' },
    onSocialClick: { action: 'socialClicked', description: '소셜 링크 클릭 핸들러' },
  },
};

export const Default = {
  args: {
    logo: 'FORMA STUDIO',
    tagline: 'Architecture & Spatial Design',
    navItems: [
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Research', href: '/research' },
      { label: 'Contact', href: '/contact' },
    ],
    contact: {
      email: 'hello@forma.studio',
      address: 'Seoul, Korea · New York, USA',
    },
    socialLinks: [
      { type: 'instagram', href: 'https://instagram.com' },
      { type: 'linkedin', href: 'https://linkedin.com' },
      { type: 'email', href: 'mailto:hello@forma.studio' },
    ],
    copyright: '© 2025 Forma Studio. All rights reserved.',
  },
};

export const WithPhone = {
  args: {
    logo: 'FORMA STUDIO',
    tagline: 'Architecture & Spatial Design',
    navItems: [
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Contact', href: '/contact' },
    ],
    contact: {
      email: 'hello@forma.studio',
      phone: '+82 2 1234 5678',
      address: 'Seoul, Korea',
    },
    socialLinks: [
      { type: 'instagram', href: 'https://instagram.com' },
      { type: 'linkedin', href: 'https://linkedin.com' },
    ],
    copyright: '© 2025 Forma Studio. All rights reserved.',
  },
};

export const Minimal = {
  args: {
    logo: 'FORMA',
    navItems: [
      { label: 'Work', href: '/work' },
      { label: 'Info', href: '/info' },
    ],
    contact: {
      email: 'hello@forma.studio',
    },
    socialLinks: [
      { type: 'instagram', href: 'https://instagram.com' },
    ],
    copyright: '© 2025 Forma Studio',
  },
};
