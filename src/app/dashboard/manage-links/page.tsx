'use client';

import { useState } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import PageTabs from '@/components/shared/PageTabs';
import FilterChip from '@/components/shared/FilterChip';
import LinkCard from '@/components/onelink/LinkCard';
import type { LinkData } from '@/components/onelink/LinkCard';

const mockLinks: LinkData[] = [
  {
    id: '1',
    title: 'Marketing Campaign 2024',
    shortUrl: 'https://onelink.io/mkt2024',
    originalUrl: 'https://example.com/very/long/marketing/campaign/url?param=1&param2=2',
    clicks: 1234,
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Blog Post Links',
    shortUrl: 'https://onelink.io/blog',
    originalUrl: 'https://medium.com/very-long-article-url',
    clicks: 567,
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Product Launch',
    shortUrl: 'https://onelink.io/launch',
    originalUrl: 'https://product.example.com/launch-page',
    clicks: 2345,
    status: 'active',
    createdAt: '2024-01-05',
  },
  {
    id: '4',
    title: 'Old Campaign',
    shortUrl: 'https://onelink.io/old',
    originalUrl: 'https://archive.example.com/campaign',
    clicks: 456,
    status: 'archived',
    createdAt: '2023-12-20',
  },
  {
    id: '5',
    title: 'Draft Campaign',
    shortUrl: 'https://onelink.io/draft',
    originalUrl: 'https://draft.example.com/campaign',
    clicks: 0,
    status: 'draft',
    createdAt: '2024-01-20',
  },
];

const filterOptions = ['All', 'Active', 'Archived', 'Draft'];

/**
 * Manage Links 페이지
 *
 * 기능:
 * 1. Link Search 탭: 기존 링크 검색 및 필터링
 * 2. Create Link 탭: 새로운 링크 생성 폼
 * 3. 필터 칩: 상태별 필터링 (All, Active, Archived, Draft)
 * 4. 링크 카드: 각 링크의 정보 표시 및 편집/삭제 기능
 */
export default function ManageLinksPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [links] = useState<LinkData[]>(mockLinks);

  const tabs = [
    { id: 'search', label: 'Link Search' },
    { id: 'create', label: 'Create Link' },
  ];

  const handleFilterClick = (filter: string) => {
    if (filter === 'All') {
      setSelectedFilters(['All']);
    } else {
      const newFilters = selectedFilters.filter(f => f !== 'All');
      if (newFilters.includes(filter)) {
        setSelectedFilters(newFilters.filter(f => f !== filter));
      } else {
        setSelectedFilters([...newFilters, filter]);
      }
    }
  };

  const filteredLinks = selectedFilters.includes('All')
    ? links
    : links.filter(link =>
        selectedFilters.some(
          filter => filter.toLowerCase() === link.status.toLowerCase()
        )
      );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Tabs */}
      <PageTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as 'search' | 'create')}
      />

      {/* Content */}
      <Box sx={{ p: 4 }}>
        {activeTab === 'search' && (
          <Stack spacing={4}>
            {/* Filters */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#171717',
                  mb: 2,
                }}
              >
                Status Filter
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {filterOptions.map(filter => (
                  <FilterChip
                    key={filter}
                    label={filter}
                    isSelected={selectedFilters.includes(filter)}
                    onClick={() => handleFilterClick(filter)}
                  />
                ))}
              </Stack>
            </Box>

            {/* Links List */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: '#171717',
                  mb: 2,
                }}
              >
                Links ({filteredLinks.length})
              </Typography>
              <Stack spacing={2}>
                {filteredLinks.length > 0 ? (
                  filteredLinks.map(link => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onEdit={(id) => console.log('Edit:', id)}
                      onDelete={(id) => console.log('Delete:', id)}
                    />
                  ))
                ) : (
                  <Box
                    sx={{
                      py: 6,
                      textAlign: 'center',
                      color: '#737373',
                    }}
                  >
                    <Typography>No links found</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        )}

        {activeTab === 'create' && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#171717',
                mb: 3,
              }}
            >
              Create New Link
            </Typography>
            <Stack spacing={2} sx={{ maxWidth: '500px' }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Original URL *
                </Typography>
                <Box
                  component="input"
                  type="url"
                  placeholder="https://example.com/very/long/url"
                  sx={{
                    width: '100%',
                    p: 1.5,
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                    fontSize: '0.875rem',
                    '&:focus': {
                      outline: 'none',
                      borderColor: '#171717',
                      boxShadow: '0 0 0 1px #171717',
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Custom Alias (Optional)
                </Typography>
                <Box
                  component="input"
                  type="text"
                  placeholder="my-campaign"
                  sx={{
                    width: '100%',
                    p: 1.5,
                    border: '1px solid #e5e5e5',
                    borderRadius: 0,
                    fontSize: '0.875rem',
                    '&:focus': {
                      outline: 'none',
                      borderColor: '#171717',
                      boxShadow: '0 0 0 1px #171717',
                    },
                  }}
                />
              </Box>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: '#171717',
                  color: '#fafafa',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#0a0a0a',
                  },
                }}
              >
                Create Link
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
