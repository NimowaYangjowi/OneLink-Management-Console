import Stack from '@mui/material/Stack';
import TimezoneClock from './TimezoneClock';

export default {
  title: 'Custom Component/Forma/TimezoneClock',
  component: TimezoneClock,
  tags: ['autodocs'],
  argTypes: {
    city: {
      control: 'text',
      description: '도시 이름',
    },
    timezone: {
      control: 'text',
      description: 'IANA 타임존 (예: America/New_York)',
    },
    label: {
      control: 'text',
      description: '타임존 라벨 (예: ET, KST)',
    },
    showIndicator: {
      control: 'boolean',
      description: '상태 표시 점 표시 여부',
    },
  },
};

export const Default = {
  args: {
    city: 'NEW YORK',
    timezone: 'America/New_York',
    label: 'ET',
    showIndicator: true,
  },
};

export const MultipleTimezones = {
  render: () => (
    <Stack direction="row" spacing={ 4 }>
      <TimezoneClock
        city="SEOUL"
        timezone="Asia/Seoul"
        label="KST"
      />
      <TimezoneClock
        city="NEW YORK"
        timezone="America/New_York"
        label="ET"
      />
      <TimezoneClock
        city="LONDON"
        timezone="Europe/London"
        label="GMT"
      />
    </Stack>
  ),
};

export const FormaStudioStyle = {
  name: 'Forma Studio Header Style',
  render: () => (
    <Stack direction="row" spacing={ 3 }>
      <TimezoneClock
        city="SEOUL"
        timezone="Asia/Seoul"
        label="KST"
      />
      <TimezoneClock
        city="NEW YORK"
        timezone="America/New_York"
        label="ET"
      />
    </Stack>
  ),
};
