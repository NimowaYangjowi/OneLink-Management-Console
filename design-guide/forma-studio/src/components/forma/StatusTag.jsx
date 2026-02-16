import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * StatusTag 컴포넌트
 *
 * 프로젝트 상태를 표시하는 태그. Groth Studio 레퍼런스 스타일.
 * 테라코타 또는 올리브 배경에 대문자 텍스트.
 *
 * Props:
 * @param {string} status - 상태 텍스트 [Required]
 * @param {string} variant - 스타일 변형 (primary/secondary/outlined) [Optional, 기본값: primary]
 * @param {string} size - 크기 (small/medium) [Optional, 기본값: small]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <StatusTag status="IN PROGRESS" />
 * <StatusTag status="COMPLETED" variant="secondary" />
 */
function StatusTag({
  status,
  variant = 'primary',
  size = 'small',
  sx = {},
}) {
  const variants = {
    primary: {
      bgcolor: 'primary.main',
      color: 'white',
    },
    secondary: {
      bgcolor: 'secondary.main',
      color: 'white',
    },
    outlined: {
      bgcolor: 'transparent',
      color: 'text.primary',
      border: '1px solid',
      borderColor: 'text.primary',
    },
  };

  const sizes = {
    small: {
      px: 1,
      py: 0.25,
      fontSize: '0.625rem',
      letterSpacing: '0.08em',
    },
    medium: {
      px: 1.5,
      py: 0.5,
      fontSize: '0.6875rem',
      letterSpacing: '0.1em',
    },
  };

  return (
    <Box
      component="span"
      sx={ {
        display: 'inline-block',
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
        fontWeight: 600,
        textTransform: 'uppercase',
        lineHeight: 1.5,
        ...variants[variant],
        ...sizes[size],
        ...sx,
      } }
    >
      { status }
    </Box>
  );
}

export default StatusTag;
