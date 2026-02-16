'use client';

/**
 * LinkBrandingSection - Short URL domain and path customization.
 * Maps to the domain, template_id, and url_id branding fields
 * in the AppsFlyer OneLink API v2.
 *
 * Props:
 * @param {OneLinkFormState} state - Current form state [Required]
 * @param {Partial<Record<string, string>>} errors - Validation errors [Required]
 * @param {function} onFieldChange - Callback to update a single field [Required]
 *
 * Example usage:
 * <LinkBrandingSection state={state} errors={errors} onFieldChange={setField} />
 */

import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import type { OneLinkFormState } from '@/hooks/useOneLinkForm';
import SectionAccordion from '@/components/shared/SectionAccordion';
import FormTextField from '@/components/shared/FormTextField';

interface SectionProps {
  state: OneLinkFormState;
  errors: Partial<Record<string, string>>;
  onFieldChange: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
}

const DOMAIN_OPTIONS = ['click.example.com'];

function LinkBrandingSection({ state, errors, onFieldChange }: SectionProps) {
  const previewUrl = `https://${state.domain || '...'}/${state.template_id || '...'}/${state.url_id || '...'}`;

  return (
    <SectionAccordion
      title="Link Branding"
      subtitle="Customize the short URL domain and path."
      defaultExpanded
      hasRequiredFields
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
            https://
          </Typography>

          <Autocomplete
            freeSolo
            options={DOMAIN_OPTIONS}
            value={state.domain}
            onInputChange={(_event, newValue) => onFieldChange('domain', newValue)}
            sx={{ minWidth: 200, flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Domain"
                required
                size="small"
                error={!!errors.domain}
                helperText={errors.domain}
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

          <Typography variant="body2" color="text.secondary">
            /
          </Typography>

          <Box sx={{ flex: 1, minWidth: 120 }}>
            <FormTextField
              label="Template"
              value={state.template_id}
              onChange={(v) => onFieldChange('template_id', v)}
              placeholder="template"
              error={!!errors.template_id}
              helperText={errors.template_id}
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            /
          </Typography>

          <Box sx={{ flex: 1, minWidth: 120 }}>
            <FormTextField
              label="URL ID"
              value={state.url_id}
              onChange={(v) => onFieldChange('url_id', v)}
              placeholder="url-id"
              error={!!errors.url_id}
              helperText={errors.url_id}
            />
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary">
          The final URL will be: {previewUrl}
        </Typography>
      </Box>
    </SectionAccordion>
  );
}

export default LinkBrandingSection;
