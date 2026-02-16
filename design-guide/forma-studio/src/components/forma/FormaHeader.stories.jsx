import Box from '@mui/material/Box';
import FormaHeader from './FormaHeader';

export default {
  title: 'Custom Component/Forma/FormaHeader',
  component: FormaHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    logo: { control: 'text', description: '로고 텍스트' },
    navItems: { control: 'object', description: '네비게이션 항목 배열' },
    timezones: { control: 'object', description: '타임존 배열' },
    onNavClick: { action: 'navClicked', description: '네비게이션 클릭 핸들러' },
    onLogoClick: { action: 'logoClicked', description: '로고 클릭 핸들러' },
  },
};

export const Default = {
  args: {
    logo: 'FORMA STUDIO',
    navItems: [
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Contact', href: '/contact' },
    ],
    timezones: [
      { city: 'SEOUL', timezone: 'Asia/Seoul', label: 'KST' },
      { city: 'NEW YORK', timezone: 'America/New_York', label: 'ET' },
    ],
  },
};

export const CustomTimezones = {
  args: {
    logo: 'FORMA STUDIO',
    navItems: [
      { label: 'About', href: '/about' },
      { label: 'Projects', href: '/projects' },
      { label: 'Contact', href: '/contact' },
    ],
    timezones: [
      { city: 'LONDON', timezone: 'Europe/London', label: 'GMT' },
      { city: 'TOKYO', timezone: 'Asia/Tokyo', label: 'JST' },
      { city: 'LOS ANGELES', timezone: 'America/Los_Angeles', label: 'PT' },
    ],
  },
};

export const MinimalNav = {
  args: {
    logo: 'FORMA',
    navItems: [
      { label: 'Work', href: '/work' },
      { label: 'Info', href: '/info' },
    ],
    timezones: [
      { city: 'SEOUL', timezone: 'Asia/Seoul', label: 'KST' },
    ],
  },
};

export const WithPageContent = {
  name: 'With Page Content',
  render: () => (
    <Box sx={ { bgcolor: 'background.default', minHeight: '150vh' } }>
      <FormaHeader />
      <Box sx={ { p: 4 } }>
        <Box sx={ { height: 200, bgcolor: 'grey.100', mb: 2 } } />
        <Box sx={ { height: 200, bgcolor: 'grey.100', mb: 2 } } />
        <Box sx={ { height: 200, bgcolor: 'grey.100', mb: 2 } } />
        <Box sx={ { height: 200, bgcolor: 'grey.100', mb: 2 } } />
        <Box sx={ { height: 200, bgcolor: 'grey.100' } } />
      </Box>
    </Box>
  ),
};
