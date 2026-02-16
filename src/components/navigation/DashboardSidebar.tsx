/**
 * Dashboard sidebar navigation component.
 * Fixed sidebar with app logo, navigation items, and collapse toggle.
 * Uses CSS variables (--sidebar-*) for theming from Pencil design tokens.
 */
'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import {
  Link as LinkIcon,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import SidebarItem from './SidebarItem';

const SIDEBAR_WIDTH_EXPANDED = 256;
const SIDEBAR_WIDTH_COLLAPSED = 72;

/**
 * DashboardSidebar
 *
 * Renders the full sidebar with three sections:
 * 1. Top: App logo/title area
 * 2. Middle: Navigation items (scrollable)
 * 3. Bottom: Collapse toggle button
 *
 * Example usage:
 * <DashboardSidebar />
 */
function DashboardSidebar() {
  const { isCollapsed, toggle } = useSidebar();

  const sidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  return (
    <Box
      component="nav"
      sx={ {
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100dvh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--sidebar)',
        borderRight: '1px solid var(--sidebar-border)',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      } }
    >
      {/* Top: Logo / Title */}
      <Box
        sx={ {
          px: 2,
          py: 3,
          borderBottom: '1px solid var(--sidebar-border)',
        } }
      >
        <Typography
          variant="subtitle1"
          sx={ {
            fontWeight: 600,
            color: 'var(--sidebar-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          } }
        >
          { isCollapsed ? 'OL' : 'OneLink Console' }
        </Typography>
      </Box>

      {/* Middle: Navigation Items */}
      <Box
        sx={ {
          flex: 1,
          px: 1,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          overflowY: 'auto',
        } }
      >
        <SidebarItem
          href="/dashboard"
          icon={ LinkIcon }
          label="Link Creation"
        />
        <SidebarItem
          href="/dashboard/settings"
          icon={ Settings }
          label="Settings"
        />
      </Box>

      {/* Bottom: Collapse Toggle */}
      <Box
        sx={ {
          px: 1,
          py: 2,
          borderTop: '1px solid var(--sidebar-border)',
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
        } }
      >
        <Tooltip
          title={ isCollapsed ? 'Expand sidebar' : 'Collapse sidebar' }
          placement="right"
          arrow
        >
          <IconButton
            onClick={ toggle }
            size="small"
            sx={ {
              borderRadius: 0,
              color: 'var(--sidebar-foreground)',
              '&:hover': {
                backgroundColor: 'var(--sidebar-accent)',
              },
            } }
          >
            { isCollapsed ? (
              <PanelLeftOpen size={ 20 } strokeWidth={ 1.75 } />
            ) : (
              <PanelLeftClose size={ 20 } strokeWidth={ 1.75 } />
            ) }
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default DashboardSidebar;
