'use client';

import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

export interface TabItem {
  id: string;
  label: string;
}

interface PageTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

/**
 * PageTabs 컴포넌트
 *
 * Props:
 * @param {TabItem[]} tabs - 탭 목록 배열 [Required]
 * @param {string} activeTab - 현재 활성 탭 ID [Required]
 * @param {function} onChange - 탭 변경 시 실행할 함수 [Required]
 *
 * Example usage:
 * <PageTabs tabs={tabs} activeTab="search" onChange={setActiveTab} />
 */
export default function PageTabs({
  tabs,
  activeTab,
  onChange,
}: PageTabsProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <Box
      sx={{
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: '#fafafa',
      }}
    >
      <Tabs
        value={activeIndex === -1 ? 0 : activeIndex}
        onChange={(_, newValue) => onChange(tabs[newValue].id)}
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: '#171717',
            height: 2,
          },
          '& .MuiTab-root': {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#737373',
            textTransform: 'none',
            minWidth: 'auto',
            px: 3,
            py: 1.5,
            '&.Mui-selected': {
              color: '#171717',
            },
          },
        }}
      >
        {tabs.map(tab => (
          <Tab key={tab.id} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
}
