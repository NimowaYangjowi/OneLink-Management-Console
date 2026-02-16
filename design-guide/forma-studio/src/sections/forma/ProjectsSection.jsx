import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ProjectCard from '../../components/forma/ProjectCard';
import DottedDivider from '../../components/forma/DottedDivider';

/**
 * ProjectsSection 컴포넌트
 *
 * Forma Studio 스타일의 프로젝트 목록 섹션.
 * 섹션 타이틀 + 프로젝트 카드 리스트.
 *
 * Props:
 * @param {string} title - 섹션 타이틀 [Optional, 기본값: Selected Projects]
 * @param {array} projects - 프로젝트 데이터 배열 [Required]
 * @param {function} onProjectClick - 프로젝트 클릭 핸들러 [Optional]
 * @param {boolean} showDivider - 상단 디바이더 표시 여부 [Optional, 기본값: true]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProjectsSection
 *   title="Selected Projects"
 *   projects={[{ image: '...', title: '...', ... }]}
 *   onProjectClick={(project) => console.log(project)}
 * />
 */
function ProjectsSection({
  title = 'Selected Projects',
  projects = [],
  onProjectClick,
  showDivider = true,
  sx = {},
}) {
  return (
    <Box
      component="section"
      sx={ {
        py: { xs: 4, md: 6 },
        ...sx,
      } }
    >
      {/* 디바이더 */}
      { showDivider && <DottedDivider sx={ { mb: 4 } } /> }

      {/* 섹션 타이틀 */}
      { title && (
        <Typography
          variant="overline"
          sx={ {
            letterSpacing: 2,
            fontSize: '0.7rem',
            color: 'text.secondary',
            display: 'block',
            mb: 4,
          } }
        >
          { title }
        </Typography>
      ) }

      {/* 프로젝트 리스트 */}
      <Stack spacing={ { xs: 5, md: 8 } }>
        { projects.map((project, index) => (
          <ProjectCard
            key={ index }
            image={ project.image }
            title={ project.title }
            description={ project.description }
            status={ project.status }
            category={ project.category }
            location={ project.location }
            year={ project.year }
            aspectRatio={ project.aspectRatio || '16/9' }
            onClick={ () => onProjectClick && onProjectClick(project) }
          />
        )) }
      </Stack>
    </Box>
  );
}

export default ProjectsSection;
