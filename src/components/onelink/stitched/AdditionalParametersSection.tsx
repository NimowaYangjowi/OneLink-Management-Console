/**
 * Additional Parameters section: custom key-value parameter rows with add/delete controls.
 */
'use client';

import { Delete02Icon } from '@hugeicons/core-free-icons';
import { Autocomplete, Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import HugeIcon from '@/components/shared/HugeIcon';
import { filledFieldSx } from './fieldStyles';
import type { ParameterRow } from './types';

/**
 * AdditionalParametersSection component
 *
 * Props:
 * @param {ParameterRow[]} parameters - List of parameter rows [Required]
 * @param {function} onParameterChange - Handler for key/value changes [Required]
 * @param {function} onParameterDelete - Handler for row deletion [Required]
 * @param {function} onAddParameter - Handler for adding a new row [Required]
 * @param {string[]} customParameterKeyOptions - Autocomplete options for keys [Required]
 * @param {string[]} customParameterValueOptions - Autocomplete options for values [Required]
 *
 * Example usage:
 * <AdditionalParametersSection parameters={params} onParameterChange={handleChange} ... />
 */
function AdditionalParametersSection({
  parameters,
  onParameterChange,
  onParameterDelete,
  onAddParameter,
  customParameterKeyOptions,
  customParameterValueOptions,
}: {
  parameters: ParameterRow[];
  onParameterChange: (id: number, field: 'key' | 'value', value: string) => void;
  onParameterDelete: (id: number) => void;
  onAddParameter: () => void;
  customParameterKeyOptions: string[];
  customParameterValueOptions: string[];
}) {
  return (
    <Box sx={ { borderTop: '1px solid', borderTopColor: 'divider', pt: 4 } }>
      <Box sx={ { alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 } }>
        <Box>
          <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Additional Parameters</Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
            Add custom parameters for granular tracking.
          </Typography>
        </Box>
        <Button
          onClick={ onAddParameter }
          sx={ {
            '&:hover': { color: 'text.primary', textDecoration: 'underline' },
            color: 'text.secondary',
            fontSize: 13,
            fontWeight: 600,
            minWidth: 0,
            px: 0,
            textTransform: 'none',
          } }
          variant='text'
        >
          + Add Parameter
        </Button>
      </Box>

      <Stack spacing={ 1.5 }>
        {parameters.map((param) => (
          <Stack direction='row' key={ param.id } spacing={ 1.25 }>
            <Autocomplete<string, false, false, true>
              freeSolo
              fullWidth
              inputValue={ param.key }
              onChange={ (_, newValue) => onParameterChange(param.id, 'key', newValue ?? '') }
              onInputChange={ (_, newInputValue) =>
                onParameterChange(param.id, 'key', newInputValue)
              }
              options={ customParameterKeyOptions }
              renderInput={ (params) => (
                <TextField { ...params } placeholder='Key (e.g. af_sub1)' sx={ filledFieldSx } />
              ) }
              value={ param.key }
            />
            <Autocomplete<string, false, false, true>
              freeSolo
              fullWidth
              inputValue={ param.value }
              onChange={ (_, newValue) => onParameterChange(param.id, 'value', newValue ?? '') }
              onInputChange={ (_, newInputValue) =>
                onParameterChange(param.id, 'value', newInputValue)
              }
              options={ customParameterValueOptions }
              renderInput={ (params) => <TextField { ...params } placeholder='Value' sx={ filledFieldSx } /> }
              value={ param.value }
            />
            <IconButton
              aria-label='Delete parameter'
              onClick={ () => onParameterDelete(param.id) }
              sx={ {
                '&:hover': { backgroundColor: 'action.hover' },
                borderRadius: 0.75,
                color: 'error.main',
                flexShrink: 0,
              } }
            >
              <HugeIcon color='currentColor' icon={ Delete02Icon } size={ 18 } />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

export default AdditionalParametersSection;
