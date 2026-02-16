import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AspectMedia from '../media/AspectMedia';
import StatusTag from './StatusTag';

/**
 * ProjectCard 컴포넌트
 *
 * 프로젝트 카드. Groth Studio 스타일.
 * 이미지 + 상태태그 + 제목(세리프) + 설명 + 메타정보 + View Project 링크.
 *
 * Props:
 * @param {string} image - 이미지 URL [Required]
 * @param {string} title - 프로젝트 제목 [Required]
 * @param {string} description - 프로젝트 설명 [Required]
 * @param {string} status - 상태 (IN PROGRESS/COMPLETED 등) [Optional]
 * @param {string} category - 카테고리 (Residential/Hospitality 등) [Optional]
 * @param {string} location - 위치 [Optional]
 * @param {string} year - 연도 [Optional]
 * @param {string} aspectRatio - 이미지 비율 [Optional, 기본값: 4/3]
 * @param {function} onClick - 클릭 핸들러 [Optional]
 * @param {boolean} showViewProject - View Project 링크 표시 여부 [Optional, 기본값: true]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProjectCard
 *   image="https://..."
 *   title="Hannam Residence"
 *   description="A contemporary Seoul apartment..."
 *   status="IN PROGRESS"
 *   category="Residential"
 *   location="Seoul, Korea"
 *   year="2025"
 * />
 */
function ProjectCard({
  image,
  title,
  description,
  status,
  category,
  location,
  year,
  aspectRatio = '4/3',
  onClick,
  showViewProject = true,
  sx = {},
}) {
  const metaItems = [category, location, year].filter(Boolean);

  return (
    <Box
      sx={ {
        cursor: onClick ? 'pointer' : 'default',
        '&:hover .view-project': {
          color: 'primary.main',
        },
        ...sx,
      } }
      onClick={ onClick }
    >
      {/* 이미지 */}
      <AspectMedia
        src={ image }
        alt={ title }
        aspectRatio={ aspectRatio }
        sx={ { mb: 2 } }
      />

      {/* 콘텐츠 */}
      <Box>
        {/* 상태 태그 */}
        { status && (
          <Box sx={ { mb: 1 } }>
            <StatusTag
              status={ status }
              variant={ status === 'IN PROGRESS' ? 'primary' : 'secondary' }
            />
          </Box>
        ) }

        {/* 제목 (세리프) */}
        <Typography
          variant="h4"
          sx={ {
            fontFamily: '"Fraunces", "Noto Serif KR", serif',
            fontWeight: 500,
            mb: 1,
            lineHeight: 1.2,
          } }
        >
          { title }
        </Typography>

        {/* 설명 */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={ {
            mb: 1.5,
            lineHeight: 1.6,
          } }
        >
          { description }
        </Typography>

        {/* 메타 정보 */}
        { metaItems.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={ { display: 'block', mb: 1.5 } }
          >
            { metaItems.join(' · ') }
          </Typography>
        ) }

        {/* View Project 링크 */}
        { showViewProject && (
          <Typography
            className="view-project"
            variant="body2"
            sx={ {
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              transition: 'color 0.2s ease',
            } }
          >
            View Project →
          </Typography>
        ) }
      </Box>
    </Box>
  );
}

export default ProjectCard;
