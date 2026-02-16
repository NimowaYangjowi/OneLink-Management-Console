import { useState, forwardRef, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * GNB Context
 */
const GNBContext = createContext({
  isDrawerOpen: false,
  toggleDrawer: () => {},
  closeDrawer: () => {},
  isMobile: false,
});

export const useGNB = () => useContext(GNBContext);

/**
 * GNB 컴포넌트
 *
 * 반응형 GNB (Global Navigation Bar).
 * 데스크탑에서는 헤더에 네비게이션을 표시하고,
 * 모바일에서는 햄버거 메뉴 + 드로어로 전환된다.
 *
 * Props:
 * @param {node} logo - 로고 영역 (항상 표시) [Optional]
 * @param {node} navContent - 네비게이션 콘텐츠 (반응형 전환 대상) [Optional]
 * @param {node} persistent - 헤더에 항상 표시될 요소 [Optional]
 * @param {node} drawerHeader - 드로어 상단 커스텀 요소 [Optional]
 * @param {node} drawerFooter - 드로어 하단 커스텀 요소 [Optional]
 * @param {string} breakpoint - 반응형 전환 브레이크포인트 ('sm' | 'md' | 'lg') [Optional, 기본값: 'md']
 * @param {number} height - 헤더 높이 (px) [Optional, 기본값: 64]
 * @param {number} drawerWidth - 드로어 너비 (px) [Optional, 기본값: 280]
 * @param {boolean} hasBorder - 헤더 하단 보더 [Optional, 기본값: true]
 * @param {boolean} isSticky - 헤더 고정 [Optional, 기본값: true]
 * @param {boolean} isTransparent - 헤더 투명 배경 [Optional, 기본값: false]
 * @param {string} drawerVariant - 드로어 변형 ('temporary' | 'persistent') [Optional, 기본값: 'temporary']
 * @param {boolean} isOpen - 드로어 열림 상태 (controlled mode) [Optional]
 * @param {function} onOpenChange - 드로어 상태 변경 콜백 (controlled mode) [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <GNB
 *   logo={<Logo />}
 *   navContent={<NavMenu items={menuItems} />}
 *   persistent={<SearchBar />}
 * />
 */
const GNB = forwardRef(function GNB({
  logo,
  navContent,
  persistent,
  drawerHeader,
  drawerFooter,
  breakpoint = 'md',
  height = 64,
  drawerWidth = 280,
  hasBorder = true,
  isSticky = true,
  isTransparent = false,
  drawerVariant = 'temporary',
  isOpen: controlledOpen,
  onOpenChange,
  sx,
  ...props
}, ref) {
  const [internalOpen, setInternalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  const isControlled = controlledOpen !== undefined;
  const isDrawerOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = (value) => {
    if (!isControlled) setInternalOpen(value);
    if (onOpenChange) onOpenChange(value);
  };

  const toggleDrawer = () => setOpen(!isDrawerOpen);
  const closeDrawer = () => setOpen(false);

  const isPersistent = drawerVariant === 'persistent';

  /**
   * 헤더 스타일
   */
  const headerStyles = {
    position: isSticky ? 'sticky' : 'relative',
    top: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height,
    px: { xs: 2, sm: 3, md: 4 },
    backgroundColor: isTransparent ? 'transparent' : 'background.paper',
    borderBottom: hasBorder ? '1px solid' : 'none',
    borderColor: 'divider',
    backdropFilter: isTransparent ? 'blur(12px)' : 'none',
    ...(isPersistent && {
      transition: 'margin-left 225ms cubic-bezier(0, 0, 0.2, 1)',
      marginLeft: isDrawerOpen ? `${drawerWidth}px` : 0,
    }),
    ...sx,
  };

  /**
   * 드로어 콘텐츠
   */
  const renderDrawerContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: drawerWidth,
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height,
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {drawerHeader || logo}
        <IconButton
          onClick={closeDrawer}
          size="small"
          aria-label="Close menu"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 2,
          px: 2,
        }}
      >
        {navContent}
      </Box>

      {/* Drawer Footer */}
      {drawerFooter && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {drawerFooter}
        </Box>
      )}
    </Box>
  );

  return (
    <GNBContext.Provider value={{ isDrawerOpen, toggleDrawer, closeDrawer, isMobile, drawerWidth, isPersistent }}>
      {/* Header */}
      <Box ref={ref} component="header" sx={headerStyles} {...props}>
        {/* Left: Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {logo}
        </Box>

        {/* Right: Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Persistent (always visible) */}
          {persistent}

          {/* Desktop: Show navContent inline (temporary mode only) */}
          {!isMobile && !isPersistent && navContent}

          {/* Toggle button: always for persistent, mobile-only for temporary */}
          {(isPersistent || (isMobile && navContent)) && (
            <IconButton
              onClick={toggleDrawer}
              size="medium"
              aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isDrawerOpen}
            >
              {isPersistent && isDrawerOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={closeDrawer}
        variant={drawerVariant}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowY: 'auto',
          },
        }}
        {...(!isPersistent && {
          ModalProps: {
            disableEnforceFocus: true,
            BackdropProps: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              },
            },
          },
        })}
      >
        {renderDrawerContent()}
      </Drawer>
    </GNBContext.Provider>
  );
});

export { GNB };
