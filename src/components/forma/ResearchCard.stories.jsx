import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ResearchCard from './ResearchCard';
import { testImages } from '../../utils/pexels-test-data';

export default {
  title: 'Custom Component/Forma/ResearchCard',
  component: ResearchCard,
  tags: ['autodocs'],
  argTypes: {
    image: { control: 'text', description: '이미지 URL' },
    title: { control: 'text', description: '리서치 제목' },
    description: { control: 'text', description: '리서치 설명' },
    variant: {
      control: 'select',
      options: ['light', 'dark'],
      description: '색상 변형',
    },
    onClick: { action: 'clicked', description: '클릭 핸들러' },
  },
};

const posterImages = testImages.poster;

export const Default = {
  args: {
    image: posterImages[0].src.small,
    title: 'Biophilic Materials Study',
    description: 'Exploring the acoustic properties and construction possibilities of natural, regenerative material selections.',
    variant: 'light',
  },
};

export const DarkVariant = {
  args: {
    image: posterImages[2].src.small,
    title: 'Sustainable Furniture Workshop',
    description: 'A concept proposal for utilizing reclaimed wood and natural fibers to create custom furniture pieces.',
    variant: 'dark',
  },
  decorators: [
    // eslint-disable-next-line no-unused-vars
    (Story) => (
      <Box sx={ { bgcolor: 'primary.main', p: 3 } }>
        <Story />
      </Box>
    ),
  ],
};

export const SidebarExample = {
  name: 'Sidebar Layout',
  render: () => {
    const research = [
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
        title: 'Light & Space Research',
        description: 'Investigating the relationship between natural light, spatial perception, and human wellbeing.',
      },
    ];

    return (
      <Box sx={ { bgcolor: 'primary.main', p: 3, maxWidth: 320 } }>
        <Stack spacing={ 3 }>
          { research.map((item, index) => (
            <ResearchCard
              key={ index }
              { ...item }
              variant="dark"
            />
          )) }
        </Stack>
      </Box>
    );
  },
};
