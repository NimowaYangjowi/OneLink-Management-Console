import { ImageCard } from '../../../components/card/ImageCard';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

export default {
  title: 'Custom Component/Card/ImageCard',
  component: ImageCard,
  tags: ['autodocs'],
};

export const Default = {
  render: () => (
    <Box sx={{ maxWidth: 400, p: 2 }}>
      <ImageCard
        src="https://images.pexels.com/photos/3131971/pexels-photo-3131971.jpeg?auto=compress&cs=tinysrgb&w=600"
        title="Neon City Vibes"
        tags={['Neon', 'City', 'Night']}
        onLike={() => console.log('Liked!')}
        onAddToBoard={() => console.log('Added to board!')}
      />
    </Box>
  ),
};

export const MasonryGrid = {
  render: () => (
    <Box sx={{ maxWidth: 1000, p: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ImageCard
            src="https://images.pexels.com/photos/3131971/pexels-photo-3131971.jpeg?auto=compress&cs=tinysrgb&w=600"
            title="Neon City"
            tags={['Cyberpunk']}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ImageCard
            src="https://images.pexels.com/photos/3945659/pexels-photo-3945659.jpeg?auto=compress&cs=tinysrgb&w=600"
            title="Product Shot"
            tags={['Minimal']}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <ImageCard
            src="https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600"
            title="Abstract"
            tags={['Art']}
          />
        </Grid>
      </Grid>
    </Box>
  ),
};

