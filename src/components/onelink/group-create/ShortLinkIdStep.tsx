/**
 * Step 3 form for selecting short link ID generation strategy.
 */
import {
  Alert,
  Autocomplete,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { LinkGroupShortLinkIdConfig } from '@/lib/onelinkGroupTypes';

export type ShortLinkFieldOption = {
  key: string;
  label: string;
};

type ShortLinkIdStepProps = {
  fieldMissingCount: number;
  fieldOptions: ShortLinkFieldOption[];
  leafPathCount: number;
  onSelectFieldKey: (fieldKey: string) => void;
  onSelectMode: (mode: LinkGroupShortLinkIdConfig['mode']) => void;
  shortLinkIdConfig: LinkGroupShortLinkIdConfig;
};

function ShortLinkIdStep({
  fieldMissingCount,
  fieldOptions,
  leafPathCount,
  onSelectFieldKey,
  onSelectMode,
  shortLinkIdConfig,
}: ShortLinkIdStepProps) {
  const selectedFieldKey = shortLinkIdConfig.mode === 'field' ? shortLinkIdConfig.fieldKey : '';
  const selectedFieldLabel = fieldOptions.find((option) => option.key === selectedFieldKey)?.label ?? '';

  return (
    <Stack spacing={ 1.5 }>
      <Stack spacing={ 0.5 }>
        <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
          Short Link ID Strategy
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          Decide how each short link ID should be generated for this group.
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          {`Current leaf paths: ${leafPathCount}`}
        </Typography>
      </Stack>

      <Divider />

      <RadioGroup
        onChange={ (event) => onSelectMode(event.target.value as LinkGroupShortLinkIdConfig['mode']) }
        value={ shortLinkIdConfig.mode }
      >
        <FormControlLabel
          control={ <Radio /> }
          label='Do not set separately (AppsFlyer random ID)'
          value='random'
        />
        <FormControlLabel
          control={ <Radio /> }
          label='Generate from a specific field value'
          value='field'
        />
      </RadioGroup>

      {shortLinkIdConfig.mode === 'field' && (
        <Stack spacing={ 1 }>
          <Autocomplete
            freeSolo
            fullWidth
            inputValue={ selectedFieldKey }
            onChange={ (_, value) => onSelectFieldKey(value ?? '') }
            onInputChange={ (_, value, reason) => {
              if (reason === 'reset') {
                return;
              }
              onSelectFieldKey(value);
            } }
            options={ fieldOptions.map((option) => option.key) }
            renderInput={ (params) => (
              <TextField
                { ...params }
                helperText={ selectedFieldLabel ? `${selectedFieldLabel} (${selectedFieldKey})` : 'e.g. pid, c, af_adset, af_ad, af_sub1' }
                label='Field Key'
                size='small'
              />
            ) }
            renderOption={ (props, option) => {
              const matched = fieldOptions.find((candidate) => candidate.key === option);
              return (
                <li { ...props } key={ option }>
                  {matched ? `${matched.label} (${matched.key})` : option}
                </li>
              );
            } }
            value={ selectedFieldKey }
          />

          {fieldMissingCount > 0 && (
            <Alert severity='warning'>
              {`${fieldMissingCount} path${fieldMissingCount === 1 ? '' : 's'} do not include this field and will use random IDs.`}
            </Alert>
          )}
        </Stack>
      )}
    </Stack>
  );
}

export default ShortLinkIdStep;
