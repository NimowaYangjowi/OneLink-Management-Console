'use client';

/**
 * AttributionSection - Media source and campaign hierarchy configuration.
 * Maps to the core attribution parameters of the AppsFlyer OneLink API v2.
 *
 * Dropdown options are populated from field presets registered in Settings.
 * Users can also type custom values (freeSolo mode).
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
import { useSettings, type PresetField } from '@/lib/providers/SettingsContext';

interface SectionProps {
  state: OneLinkFormState;
  errors: Partial<Record<string, string>>;
  onFieldChange: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
}

/** Default options shown when no presets are registered. */
const DEFAULT_PID_OPTIONS = ['email', 'sms', 'social', 'website', 'qr_code'];

/** Shared Autocomplete input styles. */
const autocompleteSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'text.secondary' },
    '&.Mui-focused fieldset': { borderColor: 'text.primary', borderWidth: 1 },
  },
};

/**
 * PresetAutocomplete - Reusable autocomplete field backed by settings presets.
 */
function PresetAutocomplete({
  label,
  field,
  formField,
  value,
  onFieldChange,
  error,
  helperText,
  required = false,
  defaultOptions = [],
}: {
  label: string;
  field: PresetField;
  formField: keyof OneLinkFormState;
  value: string;
  onFieldChange: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  defaultOptions?: string[];
}) {
  const { getPresets } = useSettings();
  const presets = getPresets(field);
  const options = presets.length > 0 ? presets : defaultOptions;

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      onInputChange={(_event, newValue) => onFieldChange(formField, newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          size="small"
          error={error}
          helperText={helperText}
          sx={autocompleteSx}
        />
      )}
    />
  );
}

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
          <PresetAutocomplete
            label="Media Source"
            field="pid"
            formField="pid"
            value={state.pid}
            onFieldChange={onFieldChange}
            error={!!errors.pid}
            helperText={errors.pid}
            required
            defaultOptions={DEFAULT_PID_OPTIONS}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PresetAutocomplete
            label="Campaign"
            field="c"
            formField="c"
            value={state.c}
            onFieldChange={onFieldChange}
            error={!!errors.c}
            helperText={errors.c}
          />
        </Grid>

        {/* Row 2: Ad Set + Ad Set ID */}
        <Grid size={{ xs: 12, md: 6 }}>
          <PresetAutocomplete
            label="Ad Set"
            field="af_adset"
            formField="af_adset"
            value={state.af_adset}
            onFieldChange={onFieldChange}
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
          <PresetAutocomplete
            label="Ad Name"
            field="af_ad"
            formField="af_ad"
            value={state.af_ad}
            onFieldChange={onFieldChange}
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
          <PresetAutocomplete
            label="Channel"
            field="af_channel"
            formField="af_channel"
            value={state.af_channel}
            onFieldChange={onFieldChange}
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
