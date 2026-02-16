'use client';

import React from 'react';
import {
  Box,
  Stack,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import SidebarItem from './SidebarItem';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface DashboardSidebarProps {
  menuItems?: MenuItem[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    href: '/dashboard',
  },
  {
    id: 'manage-links',
    label: 'Manage Links',
    icon: <LinkIcon size={20} />,
    href: '/dashboard/manage-links',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 size={20} />,
    href: '/dashboard/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />,
    href: '/dashboard/settings',
  },
];

export default function DashboardSidebar({
  menuItems = defaultMenuItems,
  activeItem,
  onItemClick,
}: DashboardSidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const sidebarWidth = isCollapsed ? 72 : 256;
  const transitionDuration = 200;

  return (
    <Box
      component="aside"
      sx={{
        width: sidebarWidth,
        height: '100vh',
        backgroundColor: '#fafafa',
        borderRight: '1px solid',
        borderColor: '#e4e4e7',
        display: 'flex',
        flexDirection: 'column',
        transition: `width ${transitionDuration}ms ease`,
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 64,
          borderBottom: '1px solid #e4e4e7',
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#171717',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            OneLink
          </Typography>
        )}
      </Box>

      {/* Sidebar Content */}
      <Stack
        component="nav"
        spacing={0.5}
        sx={{
          flex: 1,
          p: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {menuItems.map(item => (
          <SidebarItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            href={item.href}
            isCollapsed={isCollapsed}
            isActive={activeItem === item.id}
            onClick={() => onItemClick?.(item.id)}
          />
        ))}
      </Stack>

      {/* Sidebar Footer - Toggle Button */}
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid #e4e4e7',
          display: 'flex',
          justifyContent: 'center',
          height: 56,
        }}
      >
        <Tooltip title={isCollapsed ? 'Expand' : 'Collapse'}>
          <IconButton
            size="small"
            onClick={toggleSidebar}
            sx={{
              color: '#737373',
              '&:hover': {
                backgroundColor: '#f4f4f4',
                color: '#171717',
              },
            }}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
