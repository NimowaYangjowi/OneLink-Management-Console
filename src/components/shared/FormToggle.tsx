'use client';

/**
 * FormToggle - Standardized MUI switch with label and optional helper text.
 * Used for boolean settings across OneLink form sections.
 *
 * Props:
 * @param {string} label - Toggle label text [Required]
 * @param {boolean} checked - Current toggle state [Required]
 * @param {function} onChange - Callback with new boolean value [Required]
 * @param {string} helperText - Description text below toggle [Optional]
 *
 * Example usage:
 * <FormToggle label="Enable Retargeting" checked={isEnabled} onChange={setIsEnabled} />
 */

import { FormControlLabel, Switch, Typography, Box } from '@mui/material';

interface FormToggleProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  helperText?: string;
}

function FormToggle({
  label,
  checked,
  onChange,
  helperText,
}: FormToggleProps) {
  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={
          <Typography variant="body2" color="text.primary">
            {label}
          </Typography>
        }
      />
      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', ml: 7 }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default FormToggle;
