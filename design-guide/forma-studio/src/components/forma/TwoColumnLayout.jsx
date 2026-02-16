import Box from '@mui/material/Box';

/**
 * TwoColumnLayout 컴포넌트
 *
 * Groth Studio 스타일의 2컬럼 레이아웃.
 * 메인 콘텐츠 영역(~75%) + 고정 사이드바(~25%).
 * 사이드바는 스크롤 시에도 고정 위치 유지.
 *
 * Props:
 * @param {node} children - 메인 콘텐츠 영역 [Required]
 * @param {node} sidebar - 사이드바 콘텐츠 [Required]
 * @param {number} sidebarWidth - 사이드바 너비 (px) [Optional, 기본값: 320]
 * @param {number} gap - 메인과 사이드바 간격 [Optional, 기본값: 4 (32px)]
 * @param {string} sidebarPosition - 사이드바 위치 (left/right) [Optional, 기본값: right]
 * @param {boolean} stickyHeader - 헤더 높이만큼 오프셋 적용 여부 [Optional, 기본값: true]
 * @param {number} headerHeight - 헤더 높이 (px) [Optional, 기본값: 80]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <TwoColumnLayout
 *   sidebar={<ResearchSidebar />}
 *   sidebarWidth={320}
 * >
 *   <MainContent />
 * </TwoColumnLayout>
 */
function TwoColumnLayout({
  children,
  sidebar,
  sidebarWidth = 320,
  gap = 4,
  sidebarPosition = 'right',
  stickyHeader = true,
  headerHeight = 80,
  sx = {},
}) {
  const isLeft = sidebarPosition === 'left';

  return (
    <Box
      sx={ {
        display: 'flex',
        flexDirection: { xs: 'column', md: isLeft ? 'row' : 'row' },
        gap: gap,
        minHeight: '100vh',
        ...sx,
      } }
    >
      {/* 사이드바 (왼쪽 위치일 때) */}
      { isLeft && (
        <Box
          component="aside"
          sx={ {
            width: { xs: '100%', md: sidebarWidth },
            flexShrink: 0,
            position: { xs: 'relative', md: 'sticky' },
            top: { md: stickyHeader ? headerHeight : 0 },
            height: { md: `calc(100vh - ${stickyHeader ? headerHeight : 0}px)` },
            overflowY: { md: 'auto' },
            order: { xs: 2, md: 1 },
          } }
        >
          { sidebar }
        </Box>
      ) }

      {/* 메인 콘텐츠 */}
      <Box
        component="main"
        sx={ {
          flex: 1,
          minWidth: 0,
          order: { xs: 1, md: isLeft ? 2 : 1 },
        } }
      >
        { children }
      </Box>

      {/* 사이드바 (오른쪽 위치일 때) */}
      { !isLeft && (
        <Box
          component="aside"
          sx={ {
            width: { xs: '100%', md: sidebarWidth },
            flexShrink: 0,
            position: { xs: 'relative', md: 'sticky' },
            top: { md: stickyHeader ? headerHeight : 0 },
            height: { md: `calc(100vh - ${stickyHeader ? headerHeight : 0}px)` },
            overflowY: { md: 'auto' },
            order: { xs: 2, md: 2 },
          } }
        >
          { sidebar }
        </Box>
      ) }
    </Box>
  );
}

export default TwoColumnLayout;
