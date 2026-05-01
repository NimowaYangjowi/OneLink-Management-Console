/**
 * Read-only summary panel for a saved naming convention rule.
 */
'use client';

import {
  Alert,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { NamingConventionRule } from '@/lib/providers/SettingsContext';

/**
 * NamingRuleReadonlyView
 *
 * Props:
 * @param {NamingConventionRule} rule - Selected naming rule [Required]
 * @param {string} fieldLabel - Target field display label [Required]
 *
 * Example usage:
 * <NamingRuleReadonlyView rule={ rule } fieldLabel='Campaign (c)' />
 */
function NamingRuleReadonlyView({
  rule,
  fieldLabel,
}: {
  rule: NamingConventionRule;
  fieldLabel: string;
}) {
  return (
    <Paper
      elevation={ 0 }
      sx={ {
        backgroundColor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
      } }
    >
      <Stack spacing={ 1.5 }>
        <Stack
          alignItems={ { sm: 'center', xs: 'flex-start' } }
          direction={ { sm: 'row', xs: 'column' } }
          justifyContent='space-between'
          spacing={ 1 }
        >
          <BoxTitle
            label='Saved Rule'
            value={ rule.name }
          />
          <Chip
            color={ rule.enabled ? 'success' : 'default' }
            label={ rule.enabled ? 'Enabled' : 'Disabled' }
            size='small'
            variant={ rule.enabled ? 'filled' : 'outlined' }
          />
        </Stack>

        <Stack direction='row' flexWrap='wrap' gap={ 1 }>
          <Chip label={ `Field: ${fieldLabel}` } size='small' variant='outlined' />
          <Chip label={ `Delimiter: ${rule.delimiter}` } size='small' variant='outlined' />
          <Chip label={ `Slots: ${rule.slots.length}` } size='small' variant='outlined' />
        </Stack>

        {rule.slots.length === 0 ? (
          <Alert severity='info'>No slots configured for this rule.</Alert>
        ) : (
          <Stack spacing={ 1 }>
            {rule.slots.map((slot, index) => (
              <Paper
                elevation={ 0 }
                key={ `${slot.id}-${index}` }
                sx={ {
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 1.5,
                  py: 1.25,
                } }
              >
                <Stack spacing={ 0.75 }>
                  <Stack
                    alignItems='center'
                    direction='row'
                    justifyContent='space-between'
                    spacing={ 1 }
                  >
                    <Typography sx={ { typography: 'bodySm', fontWeight: 600 } }>
                      Slot {index + 1}: {slot.label}
                    </Typography>
                    <Chip
                      label={ slot.mode === 'regex' ? 'Regex' : 'Preset' }
                      size='small'
                      variant='outlined'
                    />
                  </Stack>
                  {slot.mode === 'regex' ? (
                    <Typography sx={ { color: 'text.secondary', typography: 'codeXs' } }>
                      {slot.pattern || '(empty regex pattern)'}
                    </Typography>
                  ) : (
                    <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
                      Preset mode
                    </Typography>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function BoxTitle({ label, value }: { label: string; value: string }) {
  return (
    <Stack spacing={ 0.25 }>
      <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>{label}</Typography>
      <Typography sx={ { typography: 'bodyLg', fontWeight: 600 } }>{value}</Typography>
    </Stack>
  );
}

export default NamingRuleReadonlyView;
