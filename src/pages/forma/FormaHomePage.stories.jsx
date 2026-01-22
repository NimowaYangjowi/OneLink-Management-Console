import FormaHomePage from './FormaHomePage';
import { testImages } from '../../utils/pexels-test-data';

export default {
  title: 'Page/Forma/FormaHomePage',
  component: FormaHomePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    hero: { control: 'object', description: '히어로 섹션 데이터' },
    projects: { control: 'object', description: '프로젝트 데이터 배열' },
    research: { control: 'object', description: '리서치 데이터 배열' },
    onProjectClick: { action: 'projectClicked', description: '프로젝트 클릭 핸들러' },
    onResearchClick: { action: 'researchClicked', description: '리서치 클릭 핸들러' },
    onNavClick: { action: 'navClicked', description: '네비게이션 클릭 핸들러' },
  },
};

const spatialImages = testImages.spatial;
const posterImages = testImages.poster;

const sampleProjects = [
  {
    image: spatialImages[0].src.large,
    title: 'Hannam Residence',
    description: 'A contemporary Seoul apartment transformed into a serene, light-filled sanctuary that balances Korean minimalism with warm materiality.',
    status: 'IN PROGRESS',
    category: 'Residential',
    location: 'Seoul, Korea',
    year: '2025',
  },
  {
    image: spatialImages[5].src.large,
    title: 'Brooklyn Loft',
    description: 'An industrial loft conversion that preserves original character while introducing biophilic design elements and sustainable materials.',
    status: 'COMPLETED',
    category: 'Residential',
    location: 'New York, USA',
    year: '2024',
  },
  {
    image: spatialImages[11].src.large,
    title: 'Cafe Soleil',
    description: 'A neighborhood cafe featuring custom millwork, natural light, and a seamless connection between indoor and outdoor spaces.',
    status: 'COMPLETED',
    category: 'Hospitality',
    location: 'Seoul, Korea',
    year: '2024',
  },
  {
    image: spatialImages[13].src.large,
    title: 'Maison Gallery',
    description: 'A contemporary art gallery designed to let artwork breathe while maximizing natural light and visitor flow.',
    status: 'IN PROGRESS',
    category: 'Retail',
    location: 'Seoul, Korea',
    year: '2025',
  },
];

const sampleResearch = [
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

export const Default = {
  args: {
    hero: {
      title: 'Forma Studio is an architectural and spatial design practice based in Seoul and New York.',
      subtitle: 'We create thoughtful spaces that honor materials, light, and human experience.',
    },
    projects: sampleProjects,
    research: sampleResearch,
  },
};

export const WithMoreProjects = {
  args: {
    hero: {
      title: 'Forma Studio is an architectural and spatial design practice based in Seoul and New York.',
      subtitle: 'We create thoughtful spaces that honor materials, light, and human experience.',
    },
    projects: [
      ...sampleProjects,
      {
        image: spatialImages[2].src.large,
        title: 'Seongsu Studio',
        description: 'A creative studio space in the heart of Seongsu, blending industrial heritage with contemporary design.',
        status: 'COMPLETED',
        category: 'Commercial',
        location: 'Seoul, Korea',
        year: '2024',
      },
      {
        image: spatialImages[8].src.large,
        title: 'Jeju Villa',
        description: 'A private retreat on Jeju Island that harmonizes with the natural landscape through local stone and timber.',
        status: 'IN PROGRESS',
        category: 'Residential',
        location: 'Jeju, Korea',
        year: '2025',
      },
    ],
    research: sampleResearch,
  },
};

export const MinimalResearch = {
  args: {
    hero: {
      title: 'We believe in the transformative power of architecture to shape how people live, work, and connect.',
      subtitle: 'Every project begins with careful listening and a deep respect for context.',
    },
    projects: sampleProjects.slice(0, 2),
    research: sampleResearch.slice(0, 1),
  },
};
