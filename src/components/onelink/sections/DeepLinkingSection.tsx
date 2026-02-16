'use client';

/**
 * DeepLinkingSection - In-app routing configuration for installed users.
 * Maps to deep_link_value, af_dp, af_force_deeplink, and deep_link_sub1-10
 * in the AppsFlyer OneLink API v2.
 *
 * Props:
 * @param {OneLinkFormState} state - Current form state [Required]
 * @param {Partial<Record<string, string>>} errors - Validation errors [Required]
 * @param {function} onFieldChange - Callback to update a single field [Required]
 *
 * Example usage:
 * <DeepLinkingSection state={state} errors={errors} onFieldChange={setField} />
 */

import { useState } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { OneLinkFormState } from '@/hooks/useOneLinkForm';
import SectionAccordion from '@/components/shared/SectionAccordion';
import FormTextField from '@/components/shared/FormTextField';
import FormToggle from '@/components/shared/FormToggle';

interface SectionProps {
  state: OneLinkFormState;
  errors: Partial<Record<string, string>>;
  onFieldChange: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
}

const DEEP_LINK_SUB_FIELDS = Array.from({ length: 10 }, (_, i) => ({
  key: `deep_link_sub${i + 1}` as keyof OneLinkFormState,
  label: `Deep Link Sub ${i + 1}`,
}));

function DeepLinkingSection({ state, errors, onFieldChange }: SectionProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <SectionAccordion
      title="Deep Linking"
      subtitle="Configure in-app routing for users who have the app installed."
    >
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField
            label="Deep Link Value"
            value={state.deep_link_value}
            onChange={(v) => onFieldChange('deep_link_value', v)}
            error={!!errors.deep_link_value}
            helperText={errors.deep_link_value}
          />
        </Grid>

        <Grid size={12}>
          <FormTextField
            label="URI Scheme Fallback"
            value={state.af_dp}
            onChange={(v) => onFieldChange('af_dp', v)}
            error={!!errors.af_dp}
            helperText={errors.af_dp}
          />
        </Grid>

        <Grid size={12}>
          <FormToggle
            label="Force Deep Link"
            checked={state.af_force_deeplink}
            onChange={(v) => onFieldChange('af_force_deeplink', v)}
          />
        </Grid>

        <Grid size={12}>
          <Box>
            <Button
              variant="text"
              size="small"
              onClick={() => setShowMore(!showMore)}
              endIcon={showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              {showMore ? 'Hide parameters' : 'Show more parameters'}
            </Button>
          </Box>
        </Grid>

        {showMore && DEEP_LINK_SUB_FIELDS.map(({ key, label }) => (
          <Grid key={key} size={{ xs: 12, md: 6 }}>
            <FormTextField
              label={label}
              value={state[key] as string}
              onChange={(v) => onFieldChange(key, v)}
              error={!!errors[key]}
              helperText={errors[key]}
            />
          </Grid>
        ))}
      </Grid>
    </SectionAccordion>
  );
}

export default DeepLinkingSection;
