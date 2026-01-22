import Box from '@mui/material/Box';
import FormaHeader from '../../components/forma/FormaHeader';
import FormaFooter from '../../components/forma/FormaFooter';
import TwoColumnLayout from '../../components/forma/TwoColumnLayout';
import HeroSection from '../../sections/forma/HeroSection';
import ProjectsSection from '../../sections/forma/ProjectsSection';
import ResearchSidebar from '../../sections/forma/ResearchSidebar';

/**
 * FormaHomePage 컴포넌트
 *
 * Forma Studio 홈페이지.
 * 헤더 + 2컬럼 레이아웃(메인+사이드바) + 푸터.
 *
 * Props:
 * @param {object} hero - 히어로 섹션 데이터 [Required]
 * @param {array} projects - 프로젝트 데이터 배열 [Required]
 * @param {array} research - 리서치 데이터 배열 [Required]
 * @param {function} onProjectClick - 프로젝트 클릭 핸들러 [Optional]
 * @param {function} onResearchClick - 리서치 클릭 핸들러 [Optional]
 * @param {function} onNavClick - 네비게이션 클릭 핸들러 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <FormaHomePage
 *   hero={{ title: '...', subtitle: '...' }}
 *   projects={[...]}
 *   research={[...]}
 * />
 */
function FormaHomePage({
  hero = {
    title: 'Forma Studio is an architectural and spatial design practice based in Seoul and New York.',
    subtitle: 'We create thoughtful spaces that honor materials, light, and human experience.',
  },
  projects = [],
  research = [],
  onProjectClick,
  onResearchClick,
  onNavClick,
  sx = {},
}) {
  return (
    <Box
      sx={ {
        bgcolor: 'background.default',
        minHeight: '100vh',
        ...sx,
      } }
    >
      {/* 헤더 */}
      <FormaHeader onNavClick={ onNavClick } />

      {/* 메인 콘텐츠 (2컬럼 레이아웃) */}
      <TwoColumnLayout
        sidebarWidth={ 360 }
        gap={ 0 }
        sidebarPosition="right"
        stickyHeader={ true }
        headerHeight={ 80 }
        sidebar={
          <ResearchSidebar
            items={ research }
            onItemClick={ onResearchClick }
          />
        }
      >
        <Box sx={ { px: { xs: 2, md: 6 }, pb: 6 } }>
          {/* 히어로 섹션 */}
          <HeroSection
            title={ hero.title }
            subtitle={ hero.subtitle }
          />

          {/* 프로젝트 섹션 */}
          <ProjectsSection
            projects={ projects }
            onProjectClick={ onProjectClick }
          />
        </Box>
      </TwoColumnLayout>

      {/* 푸터 */}
      <FormaFooter onNavClick={ onNavClick } />
    </Box>
  );
}

export default FormaHomePage;
