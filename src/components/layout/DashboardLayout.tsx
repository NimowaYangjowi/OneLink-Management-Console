/**
 * Top-level dashboard layout component.
 * Combines SidebarProvider, DashboardSidebar, and main content area
 * into a horizontal flex layout.
 */
'use client';

import Box from '@mui/material/Box';
import { SidebarProvider } from '@/components/navigation/SidebarContext';
import DashboardSidebar from '@/components/navigation/DashboardSidebar';

/**
 * DashboardLayout
 *
 * Props:
 * @param {React.ReactNode} children - Page content rendered in the main area [Required]
 *
 * Example usage:
 * <DashboardLayout>
 *   <LinkCreationPage />
 * </DashboardLayout>
 */
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Box sx={ { display: 'flex', minHeight: '100vh' } }>
        <DashboardSidebar />
        <Box
          component="main"
          sx={ {
            flex: 1,
            overflowY: 'auto',
            minHeight: '100vh',
            backgroundColor: 'background.default',
          } }
        >
          { children }
        </Box>
      </Box>
    </SidebarProvider>
  );
}

export default DashboardLayout;
