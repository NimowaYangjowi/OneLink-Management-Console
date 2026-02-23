/**
 * Reusable button-style dropdown selector used by OneLink list filters.
 */
'use client';

import { Button, Menu, MenuItem, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import type { FilterChipSelectProps } from './types';

function FilterChipSelect<T extends string>({
  label,
  onChange,
  options,
  value,
}: FilterChipSelectProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const selectedOption = options.find((option) => option.value === value);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        endIcon={
          <Typography component='span' sx={ { color: 'text.secondary', fontSize: 12, lineHeight: 1 } }>
            ▾
          </Typography>
        }
        onClick={ handleOpen }
        sx={ {
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 0.75,
          color: 'text.primary',
          fontSize: 14,
          fontWeight: 500,
          minHeight: 40,
          px: 1.5,
          py: 1,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'text.disabled',
          },
        } }
      >
        {`${label}: ${selectedOption?.label ?? value}`}
      </Button>
      <Menu anchorEl={ anchorEl } onClose={ handleClose } open={ open }>
        {options.map((option) => (
          <MenuItem
            key={ option.value }
            onClick={ () => {
              onChange(option.value);
              handleClose();
            } }
            selected={ option.value === value }
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default FilterChipSelect;
