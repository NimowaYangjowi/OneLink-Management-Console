'use client';

import React from 'react';
import { Box } from '@mui/material';
import { SidebarProvider } from '../navigation/SidebarContext';
import DashboardSidebar from '../navigation/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
      }}
      suppressHydrationWarning
    >
      <DashboardSidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          backgroundColor: '#fafafa',
          overflow: 'auto',
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SidebarProvider>
  );
}
