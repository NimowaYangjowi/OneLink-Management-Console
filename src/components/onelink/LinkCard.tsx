'use client';

import React from 'react';
import { Box, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import { Edit2, Trash2 } from 'lucide-react';

export interface LinkData {
  id: string;
  title: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
}

interface LinkCardProps {
  link: LinkData;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusColor: Record<LinkData['status'], string> = {
  active: '#22c55e',
  archived: '#737373',
  draft: '#f59e0b',
};

const statusText: Record<LinkData['status'], string> = {
  active: 'Active',
  archived: 'Archived',
  draft: 'Draft',
};

/**
 * LinkCard 컴포넌트
 *
 * Props:
 * @param {LinkData} link - 링크 데이터 객체 [Required]
 * @param {function} onEdit - 편집 버튼 클릭 시 실행할 함수 [Optional]
 * @param {function} onDelete - 삭제 버튼 클릭 시 실행할 함수 [Optional]
 *
 * Example usage:
 * <LinkCard link={linkData} onEdit={handleEdit} onDelete={handleDelete} />
 */
export default function LinkCard({
  link,
  onEdit,
  onDelete,
}: LinkCardProps) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 0,
        border: '1px solid #e5e5e5',
        backgroundColor: '#fafafa',
        transition: 'all 200ms ease',
        '&:hover': {
          boxShadow: '0 0 16px rgba(0, 0, 0, 0.08)',
          borderColor: '#d4d4d4',
        },
      }}
    >
      {/* Header with title and actions */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#171717',
            flex: 1,
            wordBreak: 'break-word',
          }}
        >
          {link.title}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => onEdit?.(link.id)}
              sx={{
                color: '#737373',
                '&:hover': {
                  color: '#171717',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <Edit2 size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => onDelete?.(link.id)}
              sx={{
                color: '#737373',
                '&:hover': {
                  color: '#e7000b',
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* URL display */}
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: '#0a0a0a',
          mb: 2,
          wordBreak: 'break-all',
          fontFamily: 'monospace',
        }}
      >
        {link.shortUrl}
      </Typography>

      {/* Metadata */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {link.clicks.toLocaleString()} clicks
        </Typography>
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: '4px',
            backgroundColor: statusColor[link.status],
            color: '#fafafa',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          {statusText[link.status]}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {link.createdAt}
        </Typography>
      </Stack>
    </Box>
  );
}
