'use client';

/**
 * Settings page - OneLink Template ID management and field preset configuration.
 *
 * Two sections:
 * 1. Template IDs: Add/remove 4-character alphanumeric OneLink Template IDs
 * 2. Field Presets: Register reusable values for attribution fields
 *    (Media Source, Campaign, Ad Set, Ad Name, Channel)
 *    that appear as dropdown options in the link creation form.
 */

import { useState, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SectionAccordion from '@/components/shared/SectionAccordion';
import {
  useSettings,
  PRESET_FIELDS,
  PRESET_FIELD_LABELS,
  type PresetField,
} from '@/lib/providers/SettingsContext';

/** Shared input styles for consistency. */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'text.secondary' },
    '&.Mui-focused fieldset': { borderColor: 'text.primary', borderWidth: 1 },
  },
};

// ---------------------------------------------------------------------------
// Template ID Section
// ---------------------------------------------------------------------------

function TemplateIdSection() {
  const { settings, addTemplateId, removeTemplateId, validateTemplateId } = useSettings();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const id = inputValue.trim();
    if (!id) return;

    const validation = validateTemplateId(id);
    if (!validation.valid) {
      setError(validation.error ?? '');
      return;
    }

    const result = addTemplateId(id);
    if (result.success) {
      setInputValue('');
      setError('');
    } else {
      setError(result.error ?? '');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (error) setError('');
  };

  return (
    <SectionAccordion
      title="OneLink Template IDs"
      subtitle="Manage your OneLink template identifiers. Each ID is a 4-character alphanumeric code (case-sensitive)."
      defaultExpanded
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label="Template ID"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Ab1X"
            size="small"
            error={!!error}
            helperText={error || 'Exactly 4 alphanumeric characters (a-z, A-Z, 0-9)'}
            slotProps={{
              htmlInput: { maxLength: 4 },
              formHelperText: { component: 'div' as const },
            }}
            sx={{ ...inputSx, flex: 1, maxWidth: 280 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            sx={{ borderRadius: 0, minWidth: 64, mt: '1px' }}
          >
            Add
          </Button>
        </Box>

        {settings.templateIds.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {settings.templateIds.map((id) => (
              <Chip
                key={id}
                label={id}
                onDelete={() => removeTemplateId(id)}
                variant="outlined"
                sx={{
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  borderColor: 'divider',
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No template IDs registered yet.
          </Typography>
        )}
      </Stack>
    </SectionAccordion>
  );
}

// ---------------------------------------------------------------------------
// Field Presets Section
// ---------------------------------------------------------------------------

function FieldPresetsSection() {
  const { settings, addPreset, removePreset } = useSettings();
  const [activeTab, setActiveTab] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const activeField = PRESET_FIELDS[activeTab];
  const presets = settings.presets[activeField];

  const handleAdd = () => {
    const value = inputValue.trim();
    if (!value) return;

    const result = addPreset(activeField, value);
    if (result.success) {
      setInputValue('');
      setError('');
    } else {
      setError(result.error ?? '');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setInputValue('');
    setError('');
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (error) setError('');
  };

  return (
    <SectionAccordion
      title="Field Presets"
      subtitle="Register reusable values for link creation fields. These appear as dropdown options when creating links."
      defaultExpanded
    >
      <Stack spacing={2}>
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          Presets registered here will appear as selectable options in the link creation form.
        </Alert>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 36,
              textTransform: 'none',
              fontSize: '0.8125rem',
            },
          }}
        >
          {PRESET_FIELDS.map((field) => (
            <Tab
              key={field}
              label={`${PRESET_FIELD_LABELS[field]} (${settings.presets[field].length})`}
            />
          ))}
        </Tabs>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label={`New ${PRESET_FIELD_LABELS[activeField]} value`}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder(activeField)}
            size="small"
            error={!!error}
            helperText={error || ' '}
            slotProps={{
              formHelperText: { component: 'div' as const },
            }}
            sx={{ ...inputSx, flex: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdd}
            disabled={!inputValue.trim()}
            sx={{ borderRadius: 0, minWidth: 64, mt: '1px' }}
          >
            Add
          </Button>
        </Box>

        {presets.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {presets.map((value) => (
              <Chip
                key={value}
                label={value}
                onDelete={() => removePreset(activeField, value)}
                variant="outlined"
                sx={{ borderRadius: 0, borderColor: 'divider' }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No presets for {PRESET_FIELD_LABELS[activeField]} yet.
          </Typography>
        )}
      </Stack>
    </SectionAccordion>
  );
}

/** Placeholder text per field. */
function getPlaceholder(field: PresetField): string {
  switch (field) {
    case 'pid': return 'e.g., email, sms, social';
    case 'c': return 'e.g., summer_sale_2025';
    case 'af_adset': return 'e.g., retargeting_users';
    case 'af_ad': return 'e.g., banner_300x250';
    case 'af_channel': return 'e.g., facebook, google';
    default: return '';
  }
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage template IDs and configure field presets for your OneLink console.
      </Typography>

      <Stack spacing={0}>
        <TemplateIdSection />
        <FieldPresetsSection />
      </Stack>
    </Box>
  );
}
