'use client';

import React from 'react';
import { Box } from '@mui/material';

interface FilterChipProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * FilterChip 컴포넌트
 *
 * Props:
 * @param {string} label - 칩에 표시할 텍스트 [Required]
 * @param {boolean} isSelected - 선택 여부 [Optional, 기본값: false]
 * @param {function} onClick - 칩 클릭 시 실행할 함수 [Optional]
 *
 * Example usage:
 * <FilterChip label="Active" isSelected={true} onClick={handleClick} />
 */
export default function FilterChip({
  label,
  isSelected = false,
  onClick,
}: FilterChipProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 2,
        py: 0.75,
        borderRadius: '4px',
        border: '1px solid',
        borderColor: isSelected ? '#171717' : '#e5e5e5',
        backgroundColor: isSelected ? '#171717' : 'transparent',
        color: isSelected ? '#fafafa' : '#171717',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 200ms ease',
        userSelect: 'none',
        '&:hover': {
          borderColor: '#171717',
          backgroundColor: isSelected ? '#171717' : '#f5f5f5',
        },
      }}
    >
      {label}
    </Box>
  );
}
