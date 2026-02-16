'use client';

/**
 * FormSelect - Standardized MUI select dropdown.
 * Used for option selection across OneLink form sections.
 *
 * Props:
 * @param {string} label - Field label [Required]
 * @param {string} value - Current selected value [Required]
 * @param {function} onChange - Callback with new value string [Required]
 * @param {Array} options - Array of { value: string; label: string } [Required]
 * @param {boolean} required - Required field indicator [Optional]
 * @param {boolean} error - Error state [Optional]
 * @param {string} helperText - Helper/error text [Optional]
 *
 * Example usage:
 * <FormSelect
 *   label="Platform"
 *   value={platform}
 *   onChange={setPlatform}
 *   options={[{ value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]}
 * />
 */

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
  error,
  helperText,
}: FormSelectProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value);
  };

  return (
    <FormControl
      fullWidth
      size="small"
      error={error}
      required={required}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'text.secondary',
          },
        },
      }}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={handleChange}
        label={label}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

export default FormSelect;
