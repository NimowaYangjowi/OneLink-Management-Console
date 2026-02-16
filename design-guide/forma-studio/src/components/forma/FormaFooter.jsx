import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { Instagram, Linkedin, Mail } from 'lucide-react';
import DottedDivider from './DottedDivider';

/**
 * FormaFooter 컴포넌트
 *
 * Forma Studio 스타일의 푸터.
 * 다크 올리브 배경 + 로고 + 네비게이션 + 연락처 + 소셜 링크.
 *
 * Props:
 * @param {string} logo - 로고 텍스트 [Optional, 기본값: FORMA STUDIO]
 * @param {string} tagline - 태그라인 [Optional]
 * @param {array} navItems - 네비게이션 항목 배열 [Optional]
 * @param {object} contact - 연락처 정보 [Optional]
 * @param {array} socialLinks - 소셜 링크 배열 [Optional]
 * @param {string} copyright - 저작권 문구 [Optional]
 * @param {function} onNavClick - 네비게이션 클릭 핸들러 [Optional]
 * @param {function} onSocialClick - 소셜 링크 클릭 핸들러 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <FormaFooter
 *   logo="FORMA STUDIO"
 *   tagline="Architecture & Spatial Design"
 *   contact={{ email: 'hello@forma.studio', phone: '+82 2 1234 5678' }}
 * />
 */
function FormaFooter({
  logo = 'FORMA STUDIO',
  tagline = 'Architecture & Spatial Design',
  navItems = [
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Research', href: '/research' },
    { label: 'Contact', href: '/contact' },
  ],
  contact = {
    email: 'hello@forma.studio',
    address: 'Seoul, Korea · New York, USA',
  },
  socialLinks = [
    { type: 'instagram', href: 'https://instagram.com' },
    { type: 'linkedin', href: 'https://linkedin.com' },
    { type: 'email', href: 'mailto:hello@forma.studio' },
  ],
  copyright = '© 2025 Forma Studio. All rights reserved.',
  onNavClick,
  onSocialClick,
  sx = {},
}) {
  const getSocialIcon = (type) => {
    switch (type) {
      case 'instagram':
        return <Instagram size={ 20 } />;
      case 'linkedin':
        return <Linkedin size={ 20 } />;
      case 'email':
        return <Mail size={ 20 } />;
      default:
        return null;
    }
  };

  return (
    <Box
      component="footer"
      sx={ {
        bgcolor: 'secondary.main',
        color: 'white',
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 6 },
        ...sx,
      } }
    >
      <Grid container spacing={ { xs: 4, md: 6 } }>
        {/* 로고 & 태그라인 */}
        <Grid size={ { xs: 12, md: 4 } }>
          <Typography
            variant="h6"
            sx={ {
              fontWeight: 600,
              letterSpacing: 1,
              mb: 1,
            } }
          >
            { logo }
          </Typography>
          { tagline && (
            <Typography
              variant="body2"
              sx={ { color: 'rgba(255,255,255,0.7)' } }
            >
              { tagline }
            </Typography>
          ) }
        </Grid>

        {/* 네비게이션 */}
        <Grid size={ { xs: 12, md: 4 } }>
          <Typography
            variant="overline"
            sx={ {
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 2,
              fontSize: '0.65rem',
              display: 'block',
              mb: 2,
            } }
          >
            Navigation
          </Typography>
          <Stack spacing={ 1.5 }>
            { navItems.map((item, index) => (
              <Typography
                key={ index }
                variant="body2"
                sx={ {
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.9)',
                  '&:hover': {
                    color: 'white',
                    textDecoration: 'underline',
                  },
                } }
                onClick={ () => onNavClick && onNavClick(item) }
              >
                { item.label }
              </Typography>
            )) }
          </Stack>
        </Grid>

        {/* 연락처 & 소셜 */}
        <Grid size={ { xs: 12, md: 4 } }>
          <Typography
            variant="overline"
            sx={ {
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 2,
              fontSize: '0.65rem',
              display: 'block',
              mb: 2,
            } }
          >
            Contact
          </Typography>
          { contact.email && (
            <Typography
              variant="body2"
              sx={ { color: 'rgba(255,255,255,0.9)', mb: 0.5 } }
            >
              { contact.email }
            </Typography>
          ) }
          { contact.phone && (
            <Typography
              variant="body2"
              sx={ { color: 'rgba(255,255,255,0.9)', mb: 0.5 } }
            >
              { contact.phone }
            </Typography>
          ) }
          { contact.address && (
            <Typography
              variant="body2"
              sx={ { color: 'rgba(255,255,255,0.7)', mb: 3 } }
            >
              { contact.address }
            </Typography>
          ) }

          {/* 소셜 링크 */}
          <Stack direction="row" spacing={ 2 }>
            { socialLinks.map((link, index) => (
              <Box
                key={ index }
                sx={ {
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: 'white',
                  },
                } }
                onClick={ () => onSocialClick && onSocialClick(link) }
              >
                { getSocialIcon(link.type) }
              </Box>
            )) }
          </Stack>
        </Grid>
      </Grid>

      {/* 디바이더 & 저작권 */}
      <DottedDivider
        color="rgba(255,255,255,0.2)"
        sx={ { mt: 6, mb: 3 } }
      />
      <Typography
        variant="caption"
        sx={ { color: 'rgba(255,255,255,0.5)' } }
      >
        { copyright }
      </Typography>
    </Box>
  );
}

export default FormaFooter;
