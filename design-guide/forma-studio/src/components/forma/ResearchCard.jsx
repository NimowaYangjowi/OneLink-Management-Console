import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AspectMedia from '../media/AspectMedia';

/**
 * ResearchCard 컴포넌트
 *
 * Research & Design 사이드바용 소형 카드. Groth Studio 스타일.
 * 가로 레이아웃: 작은 이미지 + 제목 + 설명 + View Project 링크.
 *
 * Props:
 * @param {string} image - 이미지 URL [Required]
 * @param {string} title - 리서치 제목 [Required]
 * @param {string} description - 리서치 설명 [Required]
 * @param {function} onClick - 클릭 핸들러 [Optional]
 * @param {string} variant - 색상 변형 (light/dark) [Optional, 기본값: light]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ResearchCard
 *   image="https://..."
 *   title="Biophilic Materials Study"
 *   description="Exploring acoustic properties..."
 *   variant="light"
 * />
 */
function ResearchCard({
  image,
  title,
  description,
  onClick,
  variant = 'light',
  sx = {},
}) {
  const isDark = variant === 'dark';

  return (
    <Stack
      direction="row"
      spacing={ 2 }
      sx={ {
        cursor: onClick ? 'pointer' : 'default',
        '&:hover .view-project': {
          textDecoration: 'underline',
        },
        ...sx,
      } }
      onClick={ onClick }
    >
      {/* 이미지 (정사각형) */}
      <Box sx={ { width: 100, flexShrink: 0 } }>
        <AspectMedia
          src={ image }
          alt={ title }
          aspectRatio="1/1"
        />
      </Box>

      {/* 콘텐츠 */}
      <Box sx={ { flex: 1, minWidth: 0 } }>
        {/* 제목 */}
        <Typography
          variant="subtitle2"
          sx={ {
            fontWeight: 600,
            mb: 0.5,
            lineHeight: 1.3,
            color: isDark ? 'white' : 'text.primary',
          } }
        >
          { title }
        </Typography>

        {/* 설명 */}
        <Typography
          variant="caption"
          sx={ {
            mb: 1,
            lineHeight: 1.4,
            color: isDark ? 'rgba(255,255,255,0.8)' : 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          } }
        >
          { description }
        </Typography>

        {/* View Project 링크 */}
        <Typography
          className="view-project"
          variant="caption"
          sx={ {
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: isDark ? 'white' : 'text.primary',
          } }
        >
          View Project →
        </Typography>
      </Box>
    </Stack>
  );
}

export default ResearchCard;
