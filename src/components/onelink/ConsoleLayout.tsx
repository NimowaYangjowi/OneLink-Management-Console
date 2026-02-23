/**
 * Shared console layout with sidebar navigation for link creation and settings pages.
 */
'use client';

import { Add01Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import { Box, Button, IconButton, Skeleton, Stack, Typography, useMediaQuery } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import HugeIcon from '@/components/shared/HugeIcon';

type ConsoleLayoutProps = {
  actions?: ReactNode;
  children: ReactNode;
  title: string;
};

type NavItem = {
  fallbackIcon?: typeof List;
  href: string;
  icon?: IconSvgElement;
  label: string;
};

const navigationItems: NavItem[] = [
  { fallbackIcon: List, href: '/links', label: 'OneLink Management' },
  { href: '/create', label: 'Create OneLink', icon: Add01Icon },
  { href: '/settings', label: 'Settings', icon: Settings02Icon },
];

const SIDEBAR_COLLAPSED_WIDTH = 76;
const SIDEBAR_EXPANDED_WIDTH = 220;

/**
 * ConsoleLayout
 *
 * Props:
 * @param {ReactNode} children - Main page content [Required]
 * @param {string} title - Sticky header title [Required]
 * @param {ReactNode} actions - Optional header action area [Optional]
 *
 * Example usage:
 * <ConsoleLayout title='Create New OneLink'><Content /></ConsoleLayout>
 */
function ConsoleLayout({ actions, children, title }: ConsoleLayoutProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isNarrowViewport = useMediaQuery(theme.breakpoints.down('lg'));
  const isSidebarCollapsedForLayout = isNarrowViewport || isSidebarCollapsed;

  return (
    <Box
      sx={ {
        backgroundColor: 'background.default',
        display: 'flex',
        maxWidth: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        width: '100%',
      } }
    >
      <Box
        component='aside'
        sx={ {
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderRightColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          left: 0,
          position: 'fixed',
          top: 0,
          transition: 'width 180ms ease',
          width: isSidebarCollapsedForLayout ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
          zIndex: 30,
        } }
      >
        <Box sx={ { px: 1.5, py: 1 } }>
          <Stack
            alignItems='center'
            direction='row'
            justifyContent={ isSidebarCollapsedForLayout ? 'center' : 'flex-start' }
            spacing={ 0.75 }
            sx={ { minHeight: 44 } }
          >
            {!isSidebarCollapsedForLayout && (
              <Box
                alt='OneLink Console'
                component='img'
                src='/console-logo.png'
                sx={ { display: 'block', height: 'auto', maxWidth: '100%', objectFit: 'contain', width: 160 } }
              />
            )}
          </Stack>
        </Box>

        <Stack spacing={ 0.5 } sx={ { flex: 1, overflowY: 'auto', px: 1, py: 2 } }>
          {navigationItems.map((item) => {
            const isActive =
              item.href === '/create'
                ? pathname.startsWith('/create')
                : item.href === '/links'
                  ? pathname.startsWith('/links')
                  : pathname === item.href;
            return (
              <Button
                aria-label={ item.label }
                component={ Link }
                href={ item.href }
                key={ item.label }
                startIcon={
                  <HugeIcon color='currentColor' fallback={ item.fallbackIcon } icon={ item.icon } size={ 19 } />
                }
                sx={ {
                  '& .MuiButton-startIcon': {
                    m: 0,
                    mr: isSidebarCollapsedForLayout ? 0 : 1,
                  },
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'text.primary',
                  },
                  backgroundColor: isActive ? 'secondary.main' : 'transparent',
                  borderRadius: 0.75,
                  color: isActive ? 'text.primary' : 'text.secondary',
                  fontSize: 14,
                  fontWeight: 500,
                  justifyContent: isSidebarCollapsedForLayout ? 'center' : 'flex-start',
                  minHeight: 40,
                  minWidth: 0,
                  px: isSidebarCollapsedForLayout ? 0.5 : 1,
                  textTransform: 'none',
                } }
                variant='text'
              >
                {!isSidebarCollapsedForLayout ? item.label : null}
              </Button>
            );
          })}
        </Stack>

        <Box sx={ { borderTop: '1px solid', borderTopColor: 'divider', p: 1.5 } }>
          <Stack alignItems='center' direction='row' spacing={ 1.25 }>
            <Skeleton animation='wave' height={ 36 } sx={ { flexShrink: 0 } } variant='circular' width={ 36 } />
            {!isSidebarCollapsedForLayout && (
              <Box sx={ { minWidth: 0, width: '100%' } }>
                <Skeleton
                  animation='wave'
                  height={ 16 }
                  sx={ { mb: 0.5, transform: 'none' } }
                  variant='rounded'
                  width='65%'
                />
                <Skeleton animation='wave' height={ 12 } sx={ { transform: 'none' } } variant='rounded' width='82%' />
              </Box>
            )}
          </Stack>
        </Box>
        {!isNarrowViewport && (
          <IconButton
            aria-label={ isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar' }
            onClick={ () => setIsSidebarCollapsed((previous) => !previous) }
            size='small'
            sx={ {
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 999,
              bottom: 14,
              boxShadow: theme.shadows[1],
              color: 'text.secondary',
              position: 'absolute',
              right: -14,
              '&:hover': {
                backgroundColor: 'secondary.main',
              },
            } }
          >
            <HugeIcon fallback={ isSidebarCollapsed ? ChevronRight : ChevronLeft } size={ 16 } />
          </IconButton>
        )}
      </Box>

      <Box
        component='main'
        sx={ {
          flex: '0 0 auto',
          minHeight: '100vh',
          ml: {
            lg: `${isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH}px`,
            xs: `${SIDEBAR_COLLAPSED_WIDTH}px`,
          },
          overflowX: 'hidden',
          pb: 8,
          transition: theme.transitions.create('margin-left', {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.easeInOut,
          }),
          width: {
            lg: `calc(100% - ${isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH}px)`,
            xs: `calc(100% - ${SIDEBAR_COLLAPSED_WIDTH}px)`,
          },
        } }
      >
        <Box
          component='header'
          sx={ {
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            backgroundColor: alpha(theme.palette.background.default, 0.84),
            display: 'flex',
            justifyContent: 'space-between',
            px: { md: 4, xs: 2 },
            py: 2,
            position: 'sticky',
            top: 0,
            zIndex: 20,
          } }
        >
          <Typography sx={ { color: 'text.primary', fontSize: 22, fontWeight: 600 } }>
            {title}
          </Typography>
          <Box>{actions}</Box>
        </Box>
        {children}
      </Box>
    </Box>
  );
}

export default ConsoleLayout;
