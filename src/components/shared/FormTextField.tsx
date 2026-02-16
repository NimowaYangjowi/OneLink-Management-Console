'use client';

/**
 * FormTextField - Standardized MUI text input with optional character counter.
 * Used across all form sections in the OneLink Management Console.
 *
 * Props:
 * @param {string} label - Field label text [Required]
 * @param {string} value - Current field value [Required]
 * @param {function} onChange - Callback with new value string [Required]
 * @param {number} maxLength - Maximum character count [Optional]
 * @param {boolean} required - Required field indicator [Optional, default: false]
 * @param {boolean} error - Error state [Optional]
 * @param {string} helperText - Helper/error text [Optional]
 * @param {boolean} multiline - Multiline textarea mode [Optional, default: false]
 * @param {number} rows - Textarea rows [Optional, default: 4]
 * @param {string} placeholder - Placeholder text [Optional]
 * @param {string} type - Input type [Optional, default: 'text']
 *
 * Example usage:
 * <FormTextField label="Campaign Name" value={name} onChange={setName} maxLength={100} required />
 */

import { TextField, Box, Typography } from '@mui/material';

interface FormTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  type?: string;
}

function FormTextField({
  label,
  value,
  onChange,
  maxLength,
  required = false,
  error,
  helperText,
  multiline = false,
  rows = 4,
  placeholder,
  type = 'text',
}: FormTextFieldProps) {
  const characterCounter = maxLength
    ? `${value.length}/${maxLength}`
    : null;

  const renderHelperText = () => {
    if (!helperText && !characterCounter) return undefined;

    return (
      <Box
        component="span"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Typography
          component="span"
          variant="caption"
          sx={{ color: error ? 'error.main' : 'text.secondary' }}
        >
          {helperText || ''}
        </Typography>
        {characterCounter && (
          <Typography
            component="span"
            variant="caption"
            sx={{ color: 'text.secondary' }}
          >
            {characterCounter}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      error={error}
      helperText={renderHelperText()}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      placeholder={placeholder}
      type={type}
      variant="outlined"
      fullWidth
      size="small"
      slotProps={{
        htmlInput: {
          maxLength: maxLength,
        },
        formHelperText: {
          component: 'div',
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          '& fieldset': {
            borderColor: 'divider',
          },
          '&:hover fieldset': {
            borderColor: 'text.secondary',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'text.primary',
            borderWidth: 1,
          },
        },
      }}
    />
  );
}

export default FormTextField;
