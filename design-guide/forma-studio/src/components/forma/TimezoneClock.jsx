import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/**
 * TimezoneClock 컴포넌트
 *
 * 특정 도시의 현재 시간을 표시. Groth Studio 헤더 스타일.
 * "5:14AM ET" 형식으로 시간과 타임존 약어 표시.
 *
 * Props:
 * @param {string} city - 도시 이름 [Required]
 * @param {string} timezone - IANA 타임존 (예: 'America/New_York') [Required]
 * @param {string} label - 타임존 라벨 (예: 'ET', 'KST') [Required]
 * @param {boolean} showIndicator - 상태 표시 점 표시 여부 [Optional, 기본값: true]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <TimezoneClock city="NEW YORK" timezone="America/New_York" label="ET" />
 * <TimezoneClock city="SEOUL" timezone="Asia/Seoul" label="KST" />
 */
function TimezoneClock({
  city,
  timezone,
  label,
  showIndicator = true,
  sx = {},
}) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };

      try {
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const formattedTime = formatter.format(now);
        // "5:14 AM" -> "5:14AM"
        setTime(formattedTime.replace(' ', ''));
      } catch {
        setTime('--:--');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={ 1 }
      sx={ {
        ...sx,
      } }
    >
      { showIndicator && (
        <Box
          sx={ {
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'text.primary',
          } }
        />
      ) }
      <Box>
        <Typography
          variant="caption"
          sx={ {
            fontFamily: 'monospace',
            fontSize: '0.625rem',
            letterSpacing: '0.05em',
            lineHeight: 1.2,
            display: 'block',
          } }
        >
          { time } { label }
        </Typography>
        <Typography
          variant="caption"
          sx={ {
            fontSize: '0.5625rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'text.secondary',
            lineHeight: 1.2,
            display: 'block',
          } }
        >
          { city }
        </Typography>
      </Box>
    </Stack>
  );
}

export default TimezoneClock;
