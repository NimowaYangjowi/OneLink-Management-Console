import Box from '@mui/material/Box';
import HeroSection from './HeroSection';

export default {
  title: 'Section/Forma/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: '메인 타이틀' },
    subtitle: { control: 'text', description: '서브타이틀/설명' },
  },
};

export const Default = {
  args: {
    title: 'Forma Studio is an architectural and spatial design practice based in Seoul and New York.',
    subtitle: 'We create thoughtful spaces that honor materials, light, and human experience.',
  },
};

export const TitleOnly = {
  args: {
    title: 'Forma Studio is an architectural and spatial design practice based in Seoul and New York.',
  },
};

export const LongTitle = {
  args: {
    title: 'We believe in the transformative power of architecture to shape how people live, work, and connect with the natural world around them.',
    subtitle: 'Every project begins with careful listening and a deep respect for context.',
  },
};

export const OnCreamBackground = {
  render: () => (
    <Box sx={ { bgcolor: 'background.default', p: 4 } }>
      <HeroSection
        title="Forma Studio is an architectural and spatial design practice based in Seoul and New York."
        subtitle="We create thoughtful spaces that honor materials, light, and human experience."
      />
    </Box>
  ),
};
