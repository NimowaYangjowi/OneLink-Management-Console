import Box from '@mui/material/Box';
import ResearchSidebar from './ResearchSidebar';
import { testImages } from '../../utils/pexels-test-data';

export default {
  title: 'Section/Forma/ResearchSidebar',
  component: ResearchSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: '섹션 타이틀' },
    items: { control: 'object', description: '리서치 항목 배열' },
    onItemClick: { action: 'itemClicked', description: '항목 클릭 핸들러' },
  },
};

const posterImages = testImages.poster;

const sampleItems = [
  {
    image: posterImages[0].src.small,
    title: 'Mycelium and Cork Composite Material Development in Catalonia',
    description: 'Exploring the acoustic properties and construction possibilities of upcycled cork waste, hemp hurd, and mycelium.',
  },
  {
    image: posterImages[2].src.small,
    title: 'Designing a Skatepark from Recovered Ocean Plastic in Havana',
    description: 'A concept proposal for utilizing plastic pollution recovered from beaches in Cuba to build a community skate park.',
  },
  {
    image: posterImages[4].src.small,
    title: 'Light & Space Research for Sustainable Architecture',
    description: 'Investigating the relationship between natural light, spatial perception, and human wellbeing in residential spaces.',
  },
];

// eslint-disable-next-line no-unused-vars
const wrapperDecorator = (Story) => (
  <Box sx={ { maxWidth: 360 } }>
    <Story />
  </Box>
);

export const Default = {
  args: {
    title: 'Research & Design',
    items: sampleItems,
  },
  decorators: [wrapperDecorator],
};

export const CustomTitle = {
  args: {
    title: 'Material Studies',
    items: sampleItems.slice(0, 2),
  },
  decorators: [wrapperDecorator],
};

export const SingleItem = {
  args: {
    title: 'Featured Research',
    items: [sampleItems[0]],
  },
  decorators: [wrapperDecorator],
};

export const FullHeight = {
  name: 'Full Height (Sidebar Style)',
  render: () => (
    <Box sx={ { height: '100vh', maxWidth: 360 } }>
      <ResearchSidebar
        title="Research & Design"
        items={ sampleItems }
        sx={ { height: '100%' } }
      />
    </Box>
  ),
};
