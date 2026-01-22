import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import DottedDivider from './DottedDivider';

export default {
  title: 'Custom Component/Forma/DottedDivider',
  component: DottedDivider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: '구분선 방향',
    },
    spacing: {
      control: { type: 'number', min: 0, max: 10 },
      description: '상하/좌우 여백 (theme.spacing 단위)',
    },
    color: {
      control: 'text',
      description: '점선 색상 (theme.palette 경로)',
    },
  },
};

export const Default = {
  args: {
    orientation: 'horizontal',
    spacing: 4,
    color: 'divider',
  },
  render: (args) => (
    <Box sx={ { width: '100%' } }>
      <Typography variant="body1">Content Above</Typography>
      <DottedDivider { ...args } />
      <Typography variant="body1">Content Below</Typography>
    </Box>
  ),
};

export const Vertical = {
  render: () => (
    <Stack direction="row" sx={ { height: 100 } }>
      <Typography variant="body1">Left</Typography>
      <DottedDivider orientation="vertical" spacing={ 2 } />
      <Typography variant="body1">Right</Typography>
    </Stack>
  ),
};

export const CustomColor = {
  render: () => (
    <Stack spacing={ 0 }>
      <Typography variant="body1">Terracotta Divider</Typography>
      <DottedDivider color="primary.main" spacing={ 2 } />
      <Typography variant="body1">Content Below</Typography>
    </Stack>
  ),
};
