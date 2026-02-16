import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ResearchCard from '../../components/forma/ResearchCard';
import DottedDivider from '../../components/forma/DottedDivider';

/**
 * ResearchSidebar 컴포넌트
 *
 * Forma Studio 스타일의 리서치 사이드바.
 * 테라코타 배경 + 섹션 타이틀 + 리서치 카드 리스트.
 *
 * Props:
 * @param {string} title - 섹션 타이틀 [Optional, 기본값: Research & Design]
 * @param {array} items - 리서치 항목 배열 [Required]
 * @param {function} onItemClick - 항목 클릭 핸들러 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ResearchSidebar
 *   title="Research & Design"
 *   items={[{ image: '...', title: '...', description: '...' }]}
 *   onItemClick={(item) => console.log(item)}
 * />
 */
function ResearchSidebar({
  title = 'Research & Design',
  items = [],
  onItemClick,
  sx = {},
}) {
  return (
    <Box
      sx={ {
        bgcolor: 'primary.main',
        p: { xs: 3, md: 4 },
        minHeight: '100%',
        ...sx,
      } }
    >
      {/* 섹션 타이틀 */}
      { title && (
        <Typography
          variant="overline"
          sx={ {
            color: 'white',
            letterSpacing: 2,
            fontSize: '0.7rem',
            display: 'block',
            mb: 3,
          } }
        >
          { title }
        </Typography>
      ) }

      {/* 디바이더 */}
      <DottedDivider color="rgba(255,255,255,0.3)" sx={ { mb: 4 } } />

      {/* 리서치 카드 리스트 */}
      <Stack spacing={ 4 }>
        { items.map((item, index) => (
          <ResearchCard
            key={ index }
            image={ item.image }
            title={ item.title }
            description={ item.description }
            variant="dark"
            onClick={ () => onItemClick && onItemClick(item) }
          />
        )) }
      </Stack>
    </Box>
  );
}

export default ResearchSidebar;
