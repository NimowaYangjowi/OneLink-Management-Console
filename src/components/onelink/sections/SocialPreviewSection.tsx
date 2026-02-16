'use client';

/**
 * SocialPreviewSection - Open Graph metadata for social media link sharing.
 * Maps to af_og_title, af_og_description, and af_og_image
 * in the AppsFlyer OneLink API v2.
 *
 * Props:
 * @param {OneLinkFormState} state - Current form state [Required]
 * @param {Partial<Record<string, string>>} errors - Validation errors [Required]
 * @param {function} onFieldChange - Callback to update a single field [Required]
 *
 * Example usage:
 * <SocialPreviewSection state={state} errors={errors} onFieldChange={setField} />
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

function SocialPreviewSection({ state, errors, onFieldChange }: SectionProps) {
  return (
    <SectionAccordion
      title="Social Media Preview"
      subtitle="Customize the Open Graph metadata shown when sharing this link."
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField
            label="OG Title"
            value={state.af_og_title}
            onChange={(v) => onFieldChange('af_og_title', v)}
            maxLength={40}
            error={!!errors.af_og_title}
            helperText={errors.af_og_title}
          />
        </Grid>

        <Grid size={12}>
          <FormTextField
            label="OG Description"
            value={state.af_og_description}
            onChange={(v) => onFieldChange('af_og_description', v)}
            multiline
            rows={3}
            maxLength={300}
            error={!!errors.af_og_description}
            helperText={errors.af_og_description}
          />
        </Grid>

        <Grid size={12}>
          <FormTextField
            label="OG Image URL"
            value={state.af_og_image}
            onChange={(v) => onFieldChange('af_og_image', v)}
            type="url"
            error={!!errors.af_og_image}
            helperText={errors.af_og_image}
          />
        </Grid>
      </Grid>
    </SectionAccordion>
  );
}

export default SocialPreviewSection;
