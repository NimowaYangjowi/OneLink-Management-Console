/**
 * Reusable labeled autocomplete input with optional required/error state.
 * Extracted from the renderAutocompleteField helper in OneLinkStitchedPage.
 */
'use client';

import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { filledFieldSx } from './fieldStyles';

/**
 * AutocompleteField component
 *
 * Props:
 * @param {string} label - Field label text [Required]
 * @param {string} value - Current input value [Required]
 * @param {function} onValueChange - Callback when value changes [Required]
 * @param {string[]} options - Autocomplete suggestion options [Required]
 * @param {string} placeholder - Placeholder text [Optional]
 * @param {boolean} isRequired - Show required asterisk [Optional, default: false]
 * @param {boolean} hasError - Show error state [Optional, default: false]
 * @param {string} errorMessage - Helper text when error [Optional]
 * @param {boolean} isDisabled - Disable the field [Optional, default: false]
 *
 * Example usage:
 * <AutocompleteField label="Link Name" value={name} onValueChange={setName} options={nameOptions} isRequired />
 */
function AutocompleteField({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  isRequired = false,
  hasError = false,
  errorMessage,
  isDisabled = false,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  isRequired?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  isDisabled?: boolean;
}) {
  return (
    <Box>
      <Typography sx={ { fontSize: 13, fontWeight: 500, mb: 0.75 } }>
        {label}
        {isRequired ? (
          <Box component='span' sx={ { color: 'error.main', ml: 0.5 } }>
            *
          </Box>
        ) : null}
      </Typography>
      <Autocomplete<string, false, false, true>
        disabled={ isDisabled }
        forcePopupIcon
        freeSolo
        fullWidth
        inputValue={ value }
        onChange={ (_, newValue) => onValueChange(newValue ?? '') }
        onInputChange={ (_, newInputValue) => onValueChange(newInputValue) }
        options={ options }
        renderInput={ (params) => (
          <TextField
            { ...params }
            error={ hasError }
            helperText={ hasError ? errorMessage : undefined }
            placeholder={ placeholder }
            sx={ filledFieldSx }
            disabled={ isDisabled }
          />
        ) }
        value={ value }
      />
    </Box>
  );
}

export default AutocompleteField;
