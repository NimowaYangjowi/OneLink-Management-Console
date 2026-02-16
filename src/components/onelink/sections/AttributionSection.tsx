'use client';

/**
 * AttributionSection - Media source and campaign hierarchy configuration.
 * Maps to the core attribution parameters of the AppsFlyer OneLink API v2.
 *
 * Props:
 * @param {OneLinkFormState} state - Current form state [Required]
 * @param {Partial<Record<string, string>>} errors - Validation errors [Required]
 * @param {function} onFieldChange - Callback to update a single field [Required]
 *
 * Example usage:
 * <AttributionSection state={state} errors={errors} onFieldChange={setField} />
 */

import { Autocomplete, TextField, Grid } from '@mui/material';
import type { OneLinkFormState } from '@/hooks/useOneLinkForm';
import SectionAccordion from '@/components/shared/SectionAccordion';
import FormTextField from '@/components/shared/FormTextField';

interface SectionProps {
  state: OneLinkFormState;
  errors: Partial<Record<string, string>>;
  onFieldChange: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
}

const MEDIA_SOURCE_OPTIONS = ['email', 'sms', 'social', 'website', 'qr_code'];

function AttributionSection({ state, errors, onFieldChange }: SectionProps) {
  return (
    <SectionAccordion
      title="Attribution"
      subtitle="Configure media source and campaign hierarchy for tracking."
      defaultExpanded
      hasRequiredFields
    >
      <Grid container spacing={2}>
        {/* Row 1: Media Source + Campaign */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            freeSolo
            options={MEDIA_SOURCE_OPTIONS}
            value={state.pid}
            onInputChange={(_event, newValue) => onFieldChange('pid', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Media Source"
                required
                size="small"
                error={!!errors.pid}
                helperText={errors.pid}
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
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Campaign"
            value={state.c}
            onChange={(v) => onFieldChange('c', v)}
            maxLength={100}
            error={!!errors.c}
            helperText={errors.c}
          />
        </Grid>

        {/* Row 2: Ad Set + Ad Set ID */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Ad Set"
            value={state.af_adset}
            onChange={(v) => onFieldChange('af_adset', v)}
            maxLength={100}
            error={!!errors.af_adset}
            helperText={errors.af_adset}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Ad Set ID"
            value={state.af_adset_id}
            onChange={(v) => onFieldChange('af_adset_id', v)}
            maxLength={24}
            error={!!errors.af_adset_id}
            helperText={errors.af_adset_id}
          />
        </Grid>

        {/* Row 3: Ad Name + Ad ID */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Ad Name"
            value={state.af_ad}
            onChange={(v) => onFieldChange('af_ad', v)}
            maxLength={100}
            error={!!errors.af_ad}
            helperText={errors.af_ad}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Ad ID"
            value={state.af_ad_id}
            onChange={(v) => onFieldChange('af_ad_id', v)}
            maxLength={24}
            error={!!errors.af_ad_id}
            helperText={errors.af_ad_id}
          />
        </Grid>

        {/* Row 4: Channel + Keywords */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Channel"
            value={state.af_channel}
            onChange={(v) => onFieldChange('af_channel', v)}
            error={!!errors.af_channel}
            helperText={errors.af_channel}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Keywords"
            value={state.af_keywords}
            onChange={(v) => onFieldChange('af_keywords', v)}
            maxLength={100}
            error={!!errors.af_keywords}
            helperText={errors.af_keywords}
          />
        </Grid>
      </Grid>
    </SectionAccordion>
  );
}

export default AttributionSection;
