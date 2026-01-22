import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * HeroSection 컴포넌트
 *
 * Forma Studio 스타일의 히어로 섹션.
 * 큰 세리프 타이틀 + 서브텍스트.
 *
 * Props:
 * @param {string} title - 메인 타이틀 [Required]
 * @param {string} subtitle - 서브타이틀/설명 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <HeroSection
 *   title="Forma Studio is an architectural and spatial design practice."
 *   subtitle="Based in Seoul and New York."
 * />
 */
function HeroSection({
  title,
  subtitle,
  sx = {},
}) {
  return (
    <Box
      component="section"
      sx={ {
        py: { xs: 6, md: 10 },
        ...sx,
      } }
    >
      {/* 메인 타이틀 */}
      <Typography
        variant="h2"
        sx={ {
          fontFamily: '"Fraunces", "Noto Serif KR", serif',
          fontWeight: 400,
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' },
          lineHeight: 1.3,
          mb: subtitle ? 3 : 0,
          maxWidth: '90%',
        } }
      >
        { title }
      </Typography>

      {/* 서브타이틀 */}
      { subtitle && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={ {
            fontSize: { xs: '1rem', md: '1.125rem' },
            lineHeight: 1.6,
            maxWidth: 600,
          } }
        >
          { subtitle }
        </Typography>
      ) }
    </Box>
  );
}

export default HeroSection;
