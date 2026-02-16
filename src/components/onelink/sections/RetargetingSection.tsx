'use client';

/**
 * RetargetingSection - Retargeting configuration for re-engaging existing users.
 * Maps to is_retargeting and af_reengagement_window in the AppsFlyer OneLink API v2.
 *
 * Props:
 * @param {OneLinkFormState} state - Current form state [Required]
 * @param {Partial<Record<string, string>>} errors - Validation errors [Required]
 * @param {function} onFieldChange - Callback to update a single field [Required]
 *
 * Example usage:
 * <RetargetingSection state={state} errors={errors} onFieldChange={setField} />
 */

import { Grid } from '@mui/material';
import type { OneLinkFormState } from '@/hooks/useOneLinkForm';
import SectionAccordion from '@/components/shared/SectionAccordion';
import FormTextField from '@/components/shared/FormTextField';
import FormToggle from '@/components/shared/FormToggle';

interface SectionProps {
  state: OneLinkFormState;
  errors: Partial<Record<string, string>>;
  onFieldChange: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
}

function RetargetingSection({ state, errors, onFieldChange }: SectionProps) {
  return (
    <SectionAccordion
      title="Retargeting"
      subtitle="Enable retargeting for re-engaging existing or past users."
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormToggle
            label="Enable Retargeting"
            checked={state.is_retargeting}
            onChange={(v) => onFieldChange('is_retargeting', v)}
          />
        </Grid>

        {state.is_retargeting && (
          <Grid size={12}>
            <FormTextField
              label="Re-engagement Window (days)"
              value={state.af_reengagement_window}
              onChange={(v) => onFieldChange('af_reengagement_window', v)}
              type="number"
              placeholder="30"
              error={!!errors.af_reengagement_window}
              helperText={
                errors.af_reengagement_window || 'Range: 1-90 days. Default: 30'
              }
            />
          </Grid>
        )}
      </Grid>
    </SectionAccordion>
  );
}

export default RetargetingSection;
