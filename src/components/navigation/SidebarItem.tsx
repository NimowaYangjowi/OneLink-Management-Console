/**
 * Individual sidebar navigation item.
 * Renders an icon + label link with active route detection.
 * Collapses to icon-only with tooltip when sidebar is collapsed.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';
import { useSidebar } from './SidebarContext';

/**
 * SidebarItem
 *
 * Props:
 * @param {string} href - Navigation target path [Required]
 * @param {LucideIcon} icon - Lucide icon component to render [Required]
 * @param {string} label - Display text for the navigation item [Required]
 *
 * Example usage:
 * <SidebarItem href="/dashboard" icon={Link} label="Link Creation" />
 */
function SidebarItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isActive = pathname === href;

  const linkContent = (
    <Box
      sx={ {
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 0,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease, color 0.15s ease',
        backgroundColor: isActive ? 'var(--sidebar-accent)' : 'transparent',
        color: isActive
          ? 'var(--sidebar-accent-foreground)'
          : 'var(--sidebar-foreground)',
        '&:hover': {
          backgroundColor: 'var(--sidebar-accent)',
        },
      } }
    >
      <Icon size={ 20 } strokeWidth={ 1.75 } />
      { !isCollapsed && (
        <Typography
          variant="body2"
          sx={ {
            fontWeight: isActive ? 600 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          } }
        >
          { label }
        </Typography>
      ) }
    </Box>
  );

  const wrappedLink = (
    <Link href={ href } style={ { textDecoration: 'none', color: 'inherit' } }>
      { linkContent }
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip title={ label } placement="right" arrow>
        { wrappedLink }
      </Tooltip>
    );
  }

  return wrappedLink;
}

export default SidebarItem;
