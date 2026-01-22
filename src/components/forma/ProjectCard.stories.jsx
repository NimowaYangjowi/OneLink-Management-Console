import Grid from '@mui/material/Grid';
import ProjectCard from './ProjectCard';
import { testImages } from '../../utils/pexels-test-data';

export default {
  title: 'Custom Component/Forma/ProjectCard',
  component: ProjectCard,
  tags: ['autodocs'],
  argTypes: {
    image: { control: 'text', description: '이미지 URL' },
    title: { control: 'text', description: '프로젝트 제목' },
    description: { control: 'text', description: '프로젝트 설명' },
    status: {
      control: 'select',
      options: ['IN PROGRESS', 'COMPLETED', 'UPCOMING'],
      description: '프로젝트 상태',
    },
    category: { control: 'text', description: '카테고리' },
    location: { control: 'text', description: '위치' },
    year: { control: 'text', description: '연도' },
    aspectRatio: {
      control: 'select',
      options: ['16/9', '4/3', '3/4', '1/1'],
      description: '이미지 비율',
    },
    showViewProject: { control: 'boolean', description: 'View Project 링크 표시' },
    onClick: { action: 'clicked', description: '클릭 핸들러' },
  },
};

const spatialImages = testImages.spatial;

export const Default = {
  args: {
    image: spatialImages[0].src.medium,
    title: 'Hannam Residence',
    description: 'A contemporary Seoul apartment transformed into a serene, light-filled sanctuary that balances Korean minimalism with warm materiality.',
    status: 'IN PROGRESS',
    category: 'Residential',
    location: 'Seoul, Korea',
    year: '2025',
    aspectRatio: '4/3',
    showViewProject: true,
  },
};

export const Completed = {
  args: {
    image: spatialImages[5].src.medium,
    title: 'Brooklyn Loft',
    description: 'An industrial loft conversion that preserves original character while introducing biophilic design elements.',
    status: 'COMPLETED',
    category: 'Residential',
    location: 'New York, USA',
    year: '2024',
    aspectRatio: '4/3',
    showViewProject: true,
  },
};

export const WithoutStatus = {
  args: {
    image: spatialImages[11].src.medium,
    title: 'Cafe Soleil',
    description: 'A neighborhood cafe featuring custom millwork, natural light, and a connection between indoor and outdoor spaces.',
    category: 'Hospitality',
    location: 'Seoul, Korea',
    year: '2024',
    aspectRatio: '4/3',
    showViewProject: true,
  },
};

export const CardGrid = {
  render: () => {
    const projects = [
      {
        image: spatialImages[0].src.medium,
        title: 'Hannam Residence',
        description: 'A contemporary Seoul apartment transformed into a serene sanctuary.',
        status: 'IN PROGRESS',
        category: 'Residential',
        location: 'Seoul, Korea',
        year: '2025',
      },
      {
        image: spatialImages[11].src.medium,
        title: 'Cafe Soleil',
        description: 'A neighborhood cafe featuring custom millwork and natural light.',
        status: 'COMPLETED',
        category: 'Hospitality',
        location: 'Seoul, Korea',
        year: '2024',
      },
      {
        image: spatialImages[5].src.medium,
        title: 'Brooklyn Loft',
        description: 'An industrial loft conversion with biophilic design elements.',
        status: 'IN PROGRESS',
        category: 'Residential',
        location: 'New York, USA',
        year: '2025',
      },
      {
        image: spatialImages[13].src.medium,
        title: 'Maison Gallery',
        description: 'A contemporary art gallery designed for artwork and natural light.',
        status: 'COMPLETED',
        category: 'Retail',
        location: 'Seoul, Korea',
        year: '2024',
      },
    ];

    return (
      <Grid container spacing={ 3 }>
        { projects.map((project, index) => (
          <Grid size={ { xs: 12, md: 6 } } key={ index }>
            <ProjectCard { ...project } />
          </Grid>
        )) }
      </Grid>
    );
  },
};
