/**
 * Step 3 form for managing global query parameters.
 */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ParamRow } from './types';

type DeepLinkField = {
  description: string;
  key: string;
  label: string;
  options: string[];
  placeholder: string;
  value: string;
};

type GlobalParametersStepProps = {
  additionalParamKeyOptions: string[];
  additionalParamRows: ParamRow[];
  additionalParamValueOptions: string[];
  deepLinkFields: DeepLinkField[];
  forceDeeplink: boolean;
  isRetargeting: boolean;
  onAddParamRow: () => void;
  onRemoveParamRow: (rowId: string) => void;
  onSetDeepLinkParamValue: (paramKey: string, value: string) => void;
  onSetForceDeeplink: (checked: boolean) => void;
  onSetRetargeting: (checked: boolean) => void;
  onSetActiveParamKey: (value: string) => void;
  onUpdateParamRow: (rowId: string, field: 'key' | 'value', value: string) => void;
  scopeHint: string;
};

function GlobalParametersStep({
  additionalParamKeyOptions,
  additionalParamRows,
  additionalParamValueOptions,
  deepLinkFields,
  forceDeeplink,
  isRetargeting,
  onAddParamRow,
  onRemoveParamRow,
  onSetDeepLinkParamValue,
  onSetForceDeeplink,
  onSetRetargeting,
  onSetActiveParamKey,
  onUpdateParamRow,
  scopeHint,
}: GlobalParametersStepProps) {
  return (
    <Stack spacing={ 1.5 }>
      <Stack spacing={ 0.5 }>
        <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
          Link Parameters
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          Configure default deep-link behavior and optional extra query parameters for this link group.
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          {scopeHint}
        </Typography>
      </Stack>

      <Accordion
        defaultExpanded={ false }
        disableGutters
        elevation={ 0 }
        sx={ {
          '&.Mui-expanded': { m: 0 },
          '&:before': { display: 'none' },
          '&:last-of-type': { borderBottom: '1px solid', borderColor: 'divider' },
          backgroundColor: 'transparent',
          borderColor: 'divider',
          borderRadius: 0,
          borderTop: '1px solid',
          boxShadow: 'none',
        } }
      >
        <AccordionSummary expandIcon={ <ExpandMoreIcon /> } sx={ { px: 0.5 } }>
          <Typography sx={ { fontSize: 14, fontWeight: 700 } }>Retargeting</Typography>
        </AccordionSummary>
        <AccordionDetails sx={ { px: 0.5, pt: 0, pb: 1.5 } }>
          <Stack spacing={ 1.25 }>
            <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
              Keep this enabled for consistent retargeting attribution.
            </Typography>
            <Divider />
            <FormControlLabel
              control={
                <Checkbox
                  checked={ isRetargeting }
                  onChange={ (event) => {
                    onSetRetargeting(event.target.checked);
                    onSetActiveParamKey('is_retargeting');
                  } }
                />
              }
              label='Retargeting measurement (is_retargeting=true)'
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion
        defaultExpanded={ false }
        disableGutters
        elevation={ 0 }
        sx={ {
          '&.Mui-expanded': { m: 0 },
          '&:before': { display: 'none' },
          '&:last-of-type': { borderBottom: '1px solid', borderColor: 'divider' },
          backgroundColor: 'transparent',
          borderColor: 'divider',
          borderRadius: 0,
          borderTop: '1px solid',
          boxShadow: 'none',
        } }
      >
        <AccordionSummary expandIcon={ <ExpandMoreIcon /> } sx={ { px: 0.5 } }>
          <Typography sx={ { fontSize: 14, fontWeight: 700 } }>Deep Linking &amp; Redirection</Typography>
        </AccordionSummary>
        <AccordionDetails sx={ { px: 0.5, pt: 0, pb: 1.5 } }>
          <Stack spacing={ 1.25 }>
            <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
              These parameters are always available for group-level defaults.
            </Typography>
            <Divider />
            <FormControlLabel
              control={
                <Checkbox
                  checked={ forceDeeplink }
                  onChange={ (event) => {
                    onSetForceDeeplink(event.target.checked);
                    onSetActiveParamKey('af_force_deeplink');
                  } }
                />
              }
              label='Force deeplink (af_force_deeplink=true)'
            />
            {deepLinkFields.map((field, index) => (
              <Stack
                key={ field.key }
                sx={ index > 0 ? { borderColor: 'divider', borderTop: '1px solid', pt: 1.25 } : undefined }
              >
                <Autocomplete<string, false, false, true>
                  freeSolo
                  fullWidth
                  inputValue={ field.value }
                  onChange={ (_, newValue) => {
                    onSetDeepLinkParamValue(field.key, newValue ?? '');
                    onSetActiveParamKey(field.key);
                  } }
                  onInputChange={ (_, newInputValue, reason) => {
                    if (reason === 'reset') {
                      return;
                    }
                    onSetDeepLinkParamValue(field.key, newInputValue);
                    onSetActiveParamKey(field.key);
                  } }
                  options={ field.options }
                  renderInput={ (params) => (
                    <TextField
                      { ...params }
                      helperText={ `${field.key} · ${field.description}` }
                      label={ field.label }
                      onFocus={ () => onSetActiveParamKey(field.key) }
                      placeholder={ field.placeholder }
                      size='small'
                    />
                  ) }
                  value={ field.value }
                />
              </Stack>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion
        defaultExpanded={ false }
        disableGutters
        elevation={ 0 }
        sx={ {
          '&.Mui-expanded': { m: 0 },
          '&:before': { display: 'none' },
          '&:last-of-type': { borderBottom: '1px solid', borderColor: 'divider' },
          backgroundColor: 'transparent',
          borderColor: 'divider',
          borderRadius: 0,
          borderTop: '1px solid',
          boxShadow: 'none',
        } }
      >
        <AccordionSummary expandIcon={ <ExpandMoreIcon /> } sx={ { px: 0.5 } }>
          <Typography sx={ { fontSize: 14, fontWeight: 700 } }>Additional Parameters</Typography>
        </AccordionSummary>
        <AccordionDetails sx={ { px: 0.5, pt: 0, pb: 1.5 } }>
          <Stack spacing={ 1.25 }>
            <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
              Add custom key-value pairs for any extra tracking context.
            </Typography>
            <Divider />
            <Button onClick={ onAddParamRow } sx={ { textTransform: 'none', width: 150 } } variant='outlined'>
              Add Parameter
            </Button>
            {additionalParamRows.map((row, index) => (
              <Stack
                direction={ { md: 'row', xs: 'column' } }
                key={ row.id }
                spacing={ 1 }
                sx={ index > 0 ? { borderColor: 'divider', borderTop: '1px solid', pt: 1.25 } : undefined }
              >
                <Autocomplete<string, false, false, true>
                  freeSolo
                  fullWidth
                  inputValue={ row.key }
                  onChange={ (_, newValue) => {
                    const nextKey = newValue ?? '';
                    onUpdateParamRow(row.id, 'key', nextKey);
                    onSetActiveParamKey(nextKey.trim());
                  } }
                  onInputChange={ (_, newInputValue, reason) => {
                    if (reason === 'reset') {
                      return;
                    }
                    onUpdateParamRow(row.id, 'key', newInputValue);
                    onSetActiveParamKey(newInputValue.trim());
                  } }
                  options={ additionalParamKeyOptions }
                  renderInput={ (params) => (
                    <TextField
                      { ...params }
                      label='Key'
                      onFocus={ () => onSetActiveParamKey(row.key.trim()) }
                      size='small'
                    />
                  ) }
                  value={ row.key }
                />
                <Autocomplete<string, false, false, true>
                  freeSolo
                  fullWidth
                  inputValue={ row.value }
                  onChange={ (_, newValue) => onUpdateParamRow(row.id, 'value', newValue ?? '') }
                  onInputChange={ (_, newInputValue, reason) => {
                    if (reason === 'reset') {
                      return;
                    }
                    onUpdateParamRow(row.id, 'value', newInputValue);
                  } }
                  options={ additionalParamValueOptions }
                  renderInput={ (params) => (
                    <TextField
                      { ...params }
                      label='Value'
                      onFocus={ () => onSetActiveParamKey(row.key.trim()) }
                      size='small'
                    />
                  ) }
                  value={ row.value }
                />
                <Button
                  color='error'
                  onClick={ () => onRemoveParamRow(row.id) }
                  sx={ { textTransform: 'none' } }
                  variant='text'
                >
                  Remove
                </Button>
              </Stack>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}

export default GlobalParametersStep;
