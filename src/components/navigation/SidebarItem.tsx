'use client';

import React from 'react';
import { Box, Tooltip } from '@mui/material';
import Link from 'next/link';

interface SidebarItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  label,
  href,
  icon,
  isCollapsed,
  isActive,
  onClick,
}: SidebarItemProps) {
  const itemContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 0,
        cursor: 'pointer',
        transition: 'all 200ms ease',
        backgroundColor: isActive ? '#f4f4f4' : 'transparent',
        color: isActive ? '#171717' : '#737373',
        '&:hover': {
          backgroundColor: isActive ? '#f4f4f4' : '#f5f5f5',
          color: '#171717',
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
        {icon}
      </Box>
      {!isCollapsed && (
        <Box
          sx={{
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </Box>
      )}
    </Box>
  );

  const content = isCollapsed ? (
    <Tooltip title={label} placement="right">
      <Box>{itemContent}</Box>
    </Tooltip>
  ) : (
    itemContent
  );

  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
}
