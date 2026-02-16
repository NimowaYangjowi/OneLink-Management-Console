import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TwoColumnLayout from './TwoColumnLayout';
import ProjectCard from './ProjectCard';
import ResearchCard from './ResearchCard';
import DottedDivider from './DottedDivider';
import { testImages } from '../../utils/pexels-test-data';

export default {
  title: 'Custom Component/Forma/TwoColumnLayout',
  component: TwoColumnLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    sidebarWidth: {
      control: { type: 'number', min: 200, max: 500 },
      description: '사이드바 너비 (px)',
    },
    gap: {
      control: { type: 'number', min: 0, max: 10 },
      description: '메인과 사이드바 간격',
    },
    sidebarPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: '사이드바 위치',
    },
    stickyHeader: {
      control: 'boolean',
      description: '헤더 높이 오프셋 적용 여부',
    },
    headerHeight: {
      control: { type: 'number', min: 0, max: 200 },
      description: '헤더 높이 (px)',
    },
  },
};

const spatialImages = testImages.spatial;
const posterImages = testImages.poster;

// 샘플 메인 콘텐츠
const SampleMainContent = () => (
  <Box sx={ { p: 4 } }>
    <Typography variant="h3" sx={ { fontFamily: '"Fraunces", serif', mb: 3 } }>
      Our Work
    </Typography>
    <Stack spacing={ 4 }>
      <ProjectCard
        image={ spatialImages[0].src.medium }
        title="Hannam Residence"
        description="A contemporary Seoul apartment transformed into a serene, light-filled sanctuary that balances Korean minimalism with warm materiality."
        status="IN PROGRESS"
        category="Residential"
        location="Seoul, Korea"
        year="2025"
      />
      <ProjectCard
        image={ spatialImages[5].src.medium }
        title="Brooklyn Loft"
        description="An industrial loft conversion that preserves original character while introducing biophilic design elements."
        status="COMPLETED"
        category="Residential"
        location="New York, USA"
        year="2024"
      />
    </Stack>
  </Box>
);

// 샘플 사이드바 콘텐츠
const SampleSidebarContent = () => (
  <Box sx={ { bgcolor: 'primary.main', p: 3, height: '100%' } }>
    <Typography
      variant="overline"
      sx={ { color: 'white', mb: 2, display: 'block' } }
    >
      Research & Design
    </Typography>
    <DottedDivider color="rgba(255,255,255,0.3)" sx={ { mb: 3 } } />
    <Stack spacing={ 3 }>
      <ResearchCard
        image={ posterImages[0].src.small }
        title="Mycelium and Cork Composite Material Development"
        description="Exploring the acoustic properties and construction possibilities of upcycled cork waste, hemp hurd, and mycelium."
        variant="dark"
      />
      <ResearchCard
        image={ posterImages[2].src.small }
        title="Ocean Plastic Skatepark Design"
        description="A concept proposal for utilizing plastic pollution recovered from beaches to build a community skate park."
        variant="dark"
      />
      <ResearchCard
        image={ posterImages[4].src.small }
        title="Light & Space Research"
        description="Investigating the relationship between natural light, spatial perception, and human wellbeing."
        variant="dark"
      />
    </Stack>
  </Box>
);

export const Default = {
  args: {
    sidebarWidth: 320,
    gap: 0,
    sidebarPosition: 'right',
    stickyHeader: false,
    headerHeight: 80,
  },
  render: (args) => (
    <TwoColumnLayout
      { ...args }
      sidebar={ <SampleSidebarContent /> }
    >
      <SampleMainContent />
    </TwoColumnLayout>
  ),
};

export const LeftSidebar = {
  args: {
    sidebarWidth: 320,
    gap: 0,
    sidebarPosition: 'left',
    stickyHeader: false,
  },
  render: (args) => (
    <TwoColumnLayout
      { ...args }
      sidebar={ <SampleSidebarContent /> }
    >
      <SampleMainContent />
    </TwoColumnLayout>
  ),
};

export const FormaStudioStyle = {
  name: 'Forma Studio Layout',
  render: () => (
    <Box sx={ { bgcolor: 'background.default', minHeight: '100vh' } }>
      <TwoColumnLayout
        sidebarWidth={ 360 }
        gap={ 0 }
        sidebarPosition="right"
        stickyHeader={ false }
        sidebar={
          <Box sx={ { bgcolor: 'primary.main', p: 4, minHeight: '100vh' } }>
            <Typography
              variant="overline"
              sx={ {
                color: 'white',
                letterSpacing: 2,
                fontSize: '0.7rem',
                mb: 3,
                display: 'block',
              } }
            >
              Research & Design
            </Typography>
            <DottedDivider color="rgba(255,255,255,0.3)" sx={ { mb: 4 } } />
            <Stack spacing={ 4 }>
              { posterImages.slice(0, 3).map((img, index) => (
                <ResearchCard
                  key={ index }
                  image={ img.src.small }
                  title={ [
                    'Mycelium and Cork Composite Material Development in Catalonia',
                    'Designing a Skatepark from Recovered Ocean Plastic in Havana',
                    'Light & Space Research for Sustainable Architecture',
                  ][index] }
                  description={ [
                    'Exploring the acoustic properties and construction possibilities of upcycled cork waste, hemp hurd, and mycelium.',
                    'A concept proposal for utilizing plastic pollution recovered from beaches in Cuba to build a community skate park.',
                    'Investigating the relationship between natural light, spatial perception, and human wellbeing in residential spaces.',
                  ][index] }
                  variant="dark"
                />
              )) }
            </Stack>
          </Box>
        }
      >
        <Box sx={ { p: { xs: 2, md: 6 } } }>
          <Typography
            variant="h2"
            sx={ {
              fontFamily: '"Fraunces", "Noto Serif KR", serif',
              fontWeight: 400,
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2,
              mb: 2,
            } }
          >
            Forma Studio is an architectural and spatial design practice based in Seoul and New York.
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={ { mb: 6, maxWidth: 600 } }
          >
            We create thoughtful spaces that honor materials, light, and human experience.
          </Typography>

          <Stack spacing={ 6 }>
            { spatialImages.slice(0, 4).map((img, index) => (
              <ProjectCard
                key={ index }
                image={ img.src.large }
                title={ [
                  'Hannam Residence',
                  'Brooklyn Loft',
                  'Cafe Soleil',
                  'Maison Gallery',
                ][index] }
                description={ [
                  'A contemporary Seoul apartment transformed into a serene, light-filled sanctuary that balances Korean minimalism with warm materiality.',
                  'An industrial loft conversion that preserves original character while introducing biophilic design elements and sustainable materials.',
                  'A neighborhood cafe featuring custom millwork, natural light, and a seamless connection between indoor and outdoor spaces.',
                  'A contemporary art gallery designed to let artwork breathe while maximizing natural light and visitor flow.',
                ][index] }
                status={ index % 2 === 0 ? 'IN PROGRESS' : 'COMPLETED' }
                category={ ['Residential', 'Residential', 'Hospitality', 'Retail'][index] }
                location={ ['Seoul, Korea', 'New York, USA', 'Seoul, Korea', 'Seoul, Korea'][index] }
                year={ index < 2 ? '2025' : '2024' }
                aspectRatio="16/9"
              />
            )) }
          </Stack>
        </Box>
      </TwoColumnLayout>
    </Box>
  ),
};
