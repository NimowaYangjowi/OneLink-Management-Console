import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import { Menu, X } from 'lucide-react';
import TimezoneClock from './TimezoneClock';
import DottedDivider from './DottedDivider';

/**
 * FormaHeader 컴포넌트
 *
 * Forma Studio 스타일의 헤더.
 * 로고 + 타임존 시계 + 네비게이션 + 메뉴 버튼.
 * 모바일에서는 햄버거 메뉴로 전환.
 *
 * Props:
 * @param {string} logo - 로고 텍스트 [Optional, 기본값: FORMA STUDIO]
 * @param {array} navItems - 네비게이션 항목 배열 [Optional]
 * @param {array} timezones - 타임존 배열 [Optional]
 * @param {function} onNavClick - 네비게이션 클릭 핸들러 [Optional]
 * @param {function} onLogoClick - 로고 클릭 핸들러 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <FormaHeader
 *   logo="FORMA STUDIO"
 *   navItems={[{ label: 'About', href: '/about' }]}
 *   timezones={[{ city: 'SEOUL', timezone: 'Asia/Seoul', label: 'KST' }]}
 * />
 */
function FormaHeader({
  logo = 'FORMA STUDIO',
  navItems = [
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Contact', href: '/contact' },
  ],
  timezones = [
    { city: 'SEOUL', timezone: 'Asia/Seoul', label: 'KST' },
    { city: 'NEW YORK', timezone: 'America/New_York', label: 'ET' },
  ],
  onNavClick,
  onLogoClick,
  sx = {},
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (item) => {
    if (onNavClick) {
      onNavClick(item);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Box
        component="header"
        sx={ {
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          ...sx,
        } }
      >
        <Box
          sx={ {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            py: 2,
            minHeight: 80,
          } }
        >
          {/* 로고 */}
          <Typography
            variant="h6"
            sx={ {
              fontWeight: 600,
              letterSpacing: 1,
              cursor: onLogoClick ? 'pointer' : 'default',
              fontSize: { xs: '0.875rem', md: '1rem' },
            } }
            onClick={ onLogoClick }
          >
            { logo }
          </Typography>

          {/* 데스크탑: 타임존 + 네비게이션 */}
          <Box
            sx={ {
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 4,
            } }
          >
            {/* 타임존 시계들 */}
            <Stack direction="row" spacing={ 3 }>
              { timezones.map((tz, index) => (
                <TimezoneClock
                  key={ index }
                  city={ tz.city }
                  timezone={ tz.timezone }
                  label={ tz.label }
                  showIndicator={ false }
                />
              )) }
            </Stack>

            {/* 네비게이션 */}
            <Stack direction="row" spacing={ 3 }>
              { navItems.map((item, index) => (
                <Typography
                  key={ index }
                  variant="body2"
                  sx={ {
                    cursor: 'pointer',
                    fontWeight: 500,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  } }
                  onClick={ () => handleNavClick(item) }
                >
                  { item.label }
                </Typography>
              )) }
            </Stack>
          </Box>

          {/* 모바일: 메뉴 버튼 */}
          <IconButton
            sx={ { display: { xs: 'flex', md: 'none' } } }
            onClick={ () => setMobileMenuOpen(true) }
            aria-label="Open menu"
          >
            <Menu size={ 24 } />
          </IconButton>
        </Box>
      </Box>

      {/* 모바일 메뉴 Drawer */}
      <Drawer
        anchor="left"
        open={ mobileMenuOpen }
        onClose={ () => setMobileMenuOpen(false) }
        PaperProps={ {
          sx: {
            width: '100%',
            maxWidth: 400,
            bgcolor: 'background.default',
          },
        } }
        ModalProps={ {
          BackdropProps: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        } }
      >
        <Box sx={ { p: 3 } }>
          {/* 닫기 버튼 */}
          <Box sx={ { display: 'flex', justifyContent: 'flex-end', mb: 4 } }>
            <IconButton
              onClick={ () => setMobileMenuOpen(false) }
              aria-label="Close menu"
            >
              <X size={ 24 } />
            </IconButton>
          </Box>

          {/* 네비게이션 */}
          <Stack spacing={ 3 } sx={ { mb: 4 } }>
            { navItems.map((item, index) => (
              <Typography
                key={ index }
                variant="h5"
                sx={ {
                  fontFamily: '"Fraunces", "Noto Serif KR", serif',
                  fontWeight: 400,
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                  },
                } }
                onClick={ () => handleNavClick(item) }
              >
                { item.label }
              </Typography>
            )) }
          </Stack>

          <DottedDivider sx={ { my: 4 } } />

          {/* 타임존 */}
          <Stack spacing={ 2 }>
            { timezones.map((tz, index) => (
              <TimezoneClock
                key={ index }
                city={ tz.city }
                timezone={ tz.timezone }
                label={ tz.label }
                showIndicator={ false }
              />
            )) }
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

export default FormaHeader;
