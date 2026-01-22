import Box from '@mui/material/Box';
import ProjectsSection from './ProjectsSection';
import { testImages } from '../../utils/pexels-test-data';

export default {
  title: 'Section/Forma/ProjectsSection',
  component: ProjectsSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    title: { control: 'text', description: '섹션 타이틀' },
    projects: { control: 'object', description: '프로젝트 데이터 배열' },
    showDivider: { control: 'boolean', description: '상단 디바이더 표시 여부' },
    onProjectClick: { action: 'projectClicked', description: '프로젝트 클릭 핸들러' },
  },
};

const spatialImages = testImages.spatial;

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
];

export const Default = {
  args: {
    title: 'Selected Projects',
    projects: sampleProjects,
    showDivider: true,
  },
};

export const WithoutDivider = {
  args: {
    title: 'Selected Projects',
    projects: sampleProjects,
    showDivider: false,
  },
};

export const CustomTitle = {
  args: {
    title: 'Recent Work',
    projects: sampleProjects.slice(0, 2),
    showDivider: true,
  },
};

export const OnCreamBackground = {
  render: () => (
    <Box sx={ { bgcolor: 'background.default', p: 4 } }>
      <ProjectsSection
        title="Selected Projects"
        projects={ sampleProjects }
      />
    </Box>
  ),
};
