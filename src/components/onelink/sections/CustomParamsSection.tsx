'use client';

/**
 * CustomParamsSection - Custom subscriber parameters for raw data reports.
 * Maps to af_sub1 through af_sub5 in the AppsFlyer OneLink API v2.
 *
 * Props:
 * @param {OneLinkFormState} state - Current form state [Required]
 * @param {Partial<Record<string, string>>} errors - Validation errors [Required]
 * @param {function} onFieldChange - Callback to update a single field [Required]
 *
 * Example usage:
 * <CustomParamsSection state={state} errors={errors} onFieldChange={setField} />
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

function CustomParamsSection({ state, errors, onFieldChange }: SectionProps) {
  return (
    <SectionAccordion
      title="Custom Parameters"
      subtitle="Add custom subscriber parameters for raw data reports."
    >
      <Grid container spacing={2}>
        {/* Row 1 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Sub Param 1"
            value={state.af_sub1}
            onChange={(v) => onFieldChange('af_sub1', v)}
            maxLength={100}
            error={!!errors.af_sub1}
            helperText={errors.af_sub1}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Sub Param 2"
            value={state.af_sub2}
            onChange={(v) => onFieldChange('af_sub2', v)}
            maxLength={100}
            error={!!errors.af_sub2}
            helperText={errors.af_sub2}
          />
        </Grid>

        {/* Row 2 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Sub Param 3"
            value={state.af_sub3}
            onChange={(v) => onFieldChange('af_sub3', v)}
            maxLength={100}
            error={!!errors.af_sub3}
            helperText={errors.af_sub3}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Sub Param 4"
            value={state.af_sub4}
            onChange={(v) => onFieldChange('af_sub4', v)}
            maxLength={100}
            error={!!errors.af_sub4}
            helperText={errors.af_sub4}
          />
        </Grid>

        {/* Row 3 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Sub Param 5"
            value={state.af_sub5}
            onChange={(v) => onFieldChange('af_sub5', v)}
            maxLength={100}
            error={!!errors.af_sub5}
            helperText={errors.af_sub5}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Intentionally empty for grid alignment */}
        </Grid>
      </Grid>
    </SectionAccordion>
  );
}

export default CustomParamsSection;
