import Stack from '@mui/material/Stack';
import StatusTag from './StatusTag';

export default {
  title: 'Custom Component/Forma/StatusTag',
  component: StatusTag,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'text',
      description: '상태 텍스트',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outlined'],
      description: '스타일 변형',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: '크기',
    },
  },
};

export const Default = {
  args: {
    status: 'IN PROGRESS',
    variant: 'primary',
    size: 'small',
  },
};

export const Variants = {
  render: () => (
    <Stack direction="row" spacing={ 2 } alignItems="center">
      <StatusTag status="IN PROGRESS" variant="primary" />
      <StatusTag status="COMPLETED" variant="secondary" />
      <StatusTag status="UPCOMING" variant="outlined" />
    </Stack>
  ),
};

export const Sizes = {
  render: () => (
    <Stack direction="row" spacing={ 2 } alignItems="center">
      <StatusTag status="IN PROGRESS" size="small" />
      <StatusTag status="IN PROGRESS" size="medium" />
    </Stack>
  ),
};
