'use client';

/**
 * RedirectionSection - Platform-specific redirect URL overrides.
 * Maps to af_r, af_ios_url, af_android_url, and af_web_dp
 * in the AppsFlyer OneLink API v2.
 *
 * Props:
 * @param {OneLinkFormState} state - Current form state [Required]
 * @param {Partial<Record<string, string>>} errors - Validation errors [Required]
 * @param {function} onFieldChange - Callback to update a single field [Required]
 *
 * Example usage:
 * <RedirectionSection state={state} errors={errors} onFieldChange={setField} />
 */

import { Grid } from '@mui/material';
import type { OneLinkFormState } from '@/hooks/useOneLinkForm';
import SectionAccordion from '@/components/shared/SectionAccordion';
import FormTextField from '@/components/shared/FormTextField';

interface SectionProps {
  state: OneLinkFormState;
  errors: Partial<Record<string, string>>;
  onFieldChange: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
}

function RedirectionSection({ state, errors, onFieldChange }: SectionProps) {
  return (
    <SectionAccordion
      title="Redirection"
      subtitle="Override default redirection behavior by platform."
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField
            label="Redirect URL (All Platforms)"
            value={state.af_r}
            onChange={(v) => onFieldChange('af_r', v)}
            type="url"
            error={!!errors.af_r}
            helperText={errors.af_r}
          />
        </Grid>

        <Grid size={12}>
          <FormTextField
            label="iOS Redirect URL"
            value={state.af_ios_url}
            onChange={(v) => onFieldChange('af_ios_url', v)}
            type="url"
            error={!!errors.af_ios_url}
            helperText={errors.af_ios_url}
          />
        </Grid>

        <Grid size={12}>
          <FormTextField
            label="Android Redirect URL"
            value={state.af_android_url}
            onChange={(v) => onFieldChange('af_android_url', v)}
            type="url"
            error={!!errors.af_android_url}
            helperText={errors.af_android_url}
          />
        </Grid>

        <Grid size={12}>
          <FormTextField
            label="Desktop Redirect URL"
            value={state.af_web_dp}
            onChange={(v) => onFieldChange('af_web_dp', v)}
            type="url"
            error={!!errors.af_web_dp}
            helperText={errors.af_web_dp}
          />
        </Grid>
      </Grid>
    </SectionAccordion>
  );
}

export default RedirectionSection;
