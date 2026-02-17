/**
 * Settings page for managing template IDs, template-level branded domains, and field presets.
 */
'use client';

import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import {
  PRESET_FIELDS,
  PRESET_FIELDS_BY_SECTION,
  PRESET_FIELD_LABELS,
  PRESET_FIELD_PLACEHOLDERS,
  PRESET_SECTIONS,
  PRESET_SECTION_LABELS,
  type PresetField,
  useSettings,
} from '@/lib/providers/SettingsContext';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    '& .MuiOutlinedInput-input': {
      fontSize: 14,
      py: 2,
    },
    '& fieldset': {
      borderColor: 'divider',
    },
    '&:hover fieldset': {
      borderColor: 'divider',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
    backgroundColor: 'background.default',
    borderRadius: 0.5,
  },
};

/**
 * OneLinkSettingsPage
 *
 * Example usage:
 * <OneLinkSettingsPage />
 */
function OneLinkSettingsPage() {
  const {
    addPreset,
    addTemplateId,
    addTemplateBrandedDomain,
    getTemplateBrandedDomains,
    removePreset,
    removeTemplateBrandedDomain,
    removeTemplateId,
    settings,
  } = useSettings();

  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [templateInput, setTemplateInput] = useState('');
  const [templateError, setTemplateError] = useState('');
  const [templateDomainInputs, setTemplateDomainInputs] = useState<Record<string, string>>({});
  const [templateDomainErrors, setTemplateDomainErrors] = useState<Record<string, string>>({});
  const [presetInputs, setPresetInputs] = useState<Record<PresetField, string>>(
    Object.fromEntries(PRESET_FIELDS.map((field) => [field, ''])) as Record<PresetField, string>,
  );
  const [presetErrors, setPresetErrors] = useState<Record<PresetField, string>>(
    Object.fromEntries(PRESET_FIELDS.map((field) => [field, ''])) as Record<PresetField, string>,
  );

  const handleTemplateAdd = async () => {
    setIsAddingTemplate(true);
    try {
      const result = await addTemplateId(templateInput);
      if (!result.success) {
        setTemplateError(result.error ?? 'Failed to add template ID.');
        return;
      }
      setTemplateInput('');
      setTemplateError('');
    } finally {
      setIsAddingTemplate(false);
    }
  };

  const handlePresetAdd = (field: PresetField) => {
    const result = addPreset(field, presetInputs[field]);
    if (!result.success) {
      setPresetErrors((previous) => ({
        ...previous,
        [field]: result.error ?? 'Failed to add preset.',
      }));
      return;
    }

    setPresetInputs((previous) => ({
      ...previous,
      [field]: '',
    }));
    setPresetErrors((previous) => ({
      ...previous,
      [field]: '',
    }));
  };

  const handleTemplateDomainAdd = (templateId: string) => {
    const input = templateDomainInputs[templateId] ?? '';
    const result = addTemplateBrandedDomain(templateId, input);
    if (!result.success) {
      setTemplateDomainErrors((previous) => ({
        ...previous,
        [templateId]: result.error ?? 'Failed to add branded domain.',
      }));
      return;
    }

    setTemplateDomainInputs((previous) => ({
      ...previous,
      [templateId]: '',
    }));
    setTemplateDomainErrors((previous) => ({
      ...previous,
      [templateId]: '',
    }));
  };

  return (
    <ConsoleLayout title='Settings'>
      <Box
        sx={ {
          display: 'flex',
          flexDirection: { xl: 'row', xs: 'column' },
          gap: 4,
          maxWidth: 1600,
          mx: 'auto',
          px: { md: 4, xs: 2 },
          py: 4,
        } }
      >
        <Box sx={ { flex: 1, minWidth: 0 } }>
          <Stack spacing={ 3 }>
            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 0.75, p: 3 } }>
              <Stack spacing={ 2 }>
                <Box>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Template IDs</Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Add 4-character alphanumeric Template IDs used for OneLink generation.
                  </Typography>
                </Box>

                <Stack direction={ { sm: 'row', xs: 'column' } } spacing={ 1.5 }>
                  <TextField
                    disabled={ isAddingTemplate }
                    error={ Boolean(templateError) }
                    fullWidth
                    helperText={
                      templateError
                      || (isAddingTemplate
                        ? 'Resolving subdomain from AppsFlyer (up to 4 attempts)...'
                        : 'Exactly 4 alphanumeric characters (case-sensitive).')
                    }
                    onChange={ (event) => {
                      setTemplateInput(event.target.value);
                      setTemplateError('');
                    } }
                    onKeyDown={ (event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void handleTemplateAdd();
                      }
                    } }
                    placeholder='e.g. A1b2'
                    sx={ fieldSx }
                    value={ templateInput }
                  />
                  <Button
                    disabled={ isAddingTemplate }
                    onClick={ () => {
                      void handleTemplateAdd();
                    } }
                    sx={ { minWidth: { sm: 120 }, px: 2.5, textTransform: 'none' } }
                    variant='contained'
                  >
                    {isAddingTemplate ? 'Resolving...' : 'Add'}
                  </Button>
                </Stack>

                <Stack spacing={ 1.5 }>
                  {settings.templateIds.length > 0 ? (
                    settings.templateIds.map((id) => (
                      <Paper
                        elevation={ 0 }
                        key={ id }
                        sx={ {
                          backgroundColor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 0.75,
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
                            <Box>
                              <Typography sx={ { fontSize: 16, fontWeight: 600 } }>{id}</Typography>
                              <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                                {settings.templateDomains[id]
                                  ? `${settings.templateDomains[id].subdomain} (${settings.templateDomains[id].host})`
                                  : 'Domain metadata not resolved yet.'}
                              </Typography>
                            </Box>
                            <Button
                              color='error'
                              onClick={ () => removeTemplateId(id) }
                              sx={ { textTransform: 'none' } }
                              variant='text'
                            >
                              Remove Template
                            </Button>
                          </Stack>

                          <Stack direction={ { sm: 'row', xs: 'column' } } spacing={ 1.5 }>
                            <TextField
                              error={ Boolean(templateDomainErrors[id]) }
                              fullWidth
                              helperText={ templateDomainErrors[id] || 'Enter branded domain for this template.' }
                              onChange={ (event) => {
                                const nextValue = event.target.value;
                                setTemplateDomainInputs((previous) => ({
                                  ...previous,
                                  [id]: nextValue,
                                }));
                                setTemplateDomainErrors((previous) => ({
                                  ...previous,
                                  [id]: '',
                                }));
                              } }
                              onKeyDown={ (event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  handleTemplateDomainAdd(id);
                                }
                              } }
                              placeholder='e.g. click.example.com'
                              sx={ fieldSx }
                              value={ templateDomainInputs[id] ?? '' }
                            />
                            <Button
                              onClick={ () => handleTemplateDomainAdd(id) }
                              sx={ { minWidth: { sm: 140 }, px: 2.5, textTransform: 'none' } }
                              variant='contained'
                            >
                              Add Domain
                            </Button>
                          </Stack>

                          <Stack spacing={ 1 }>
                            {getTemplateBrandedDomains(id).length > 0 ? (
                              getTemplateBrandedDomains(id).map((domain) => (
                                <Stack
                                  alignItems='center'
                                  direction='row'
                                  justifyContent='space-between'
                                  key={ `${id}-${domain}` }
                                  sx={ {
                                    backgroundColor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 0.5,
                                    px: 1.5,
                                    py: 1,
                                  } }
                                >
                                  <Typography sx={ { fontSize: 14 } }>{domain}</Typography>
                                  <Button
                                    color='error'
                                    onClick={ () => removeTemplateBrandedDomain(id, domain) }
                                    sx={ { minWidth: 'auto', px: 1, textTransform: 'none' } }
                                    variant='text'
                                  >
                                    Remove
                                  </Button>
                                </Stack>
                              ))
                            ) : (
                              <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
                                No branded domains for this template yet.
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>No template IDs yet.</Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 0.75, p: 3 } }>
              <Stack spacing={ 3 }>
                <Box>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Create Presets</Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Manage reusable values by section. Retargeting and Force deeplink are intentionally excluded.
                  </Typography>
                </Box>

                {PRESET_SECTIONS.map((section) => (
                  <Box key={ section }>
                    <Typography sx={ { fontSize: 18, fontWeight: 600 } }>{PRESET_SECTION_LABELS[section]}</Typography>
                    <Stack spacing={ 1.5 } sx={ { mt: 1.5 } }>
                      {PRESET_FIELDS_BY_SECTION[section].map((field) => (
                        <Paper
                          elevation={ 0 }
                          key={ field }
                          sx={ {
                            backgroundColor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 0.75,
                            p: 2,
                          } }
                        >
                          <Stack spacing={ 1.5 }>
                            <Typography sx={ { fontSize: 14, fontWeight: 600 } }>
                              {PRESET_FIELD_LABELS[field]} ({settings.presets[field].length})
                            </Typography>

                            <Stack direction={ { sm: 'row', xs: 'column' } } spacing={ 1.5 }>
                              <TextField
                                error={ Boolean(presetErrors[field]) }
                                fullWidth
                                helperText={ presetErrors[field] || 'Press Enter to add quickly.' }
                                onChange={ (event) => {
                                  setPresetInputs((previous) => ({
                                    ...previous,
                                    [field]: event.target.value,
                                  }));
                                  setPresetErrors((previous) => ({
                                    ...previous,
                                    [field]: '',
                                  }));
                                } }
                                onKeyDown={ (event) => {
                                  if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handlePresetAdd(field);
                                  }
                                } }
                                placeholder={ PRESET_FIELD_PLACEHOLDERS[field] }
                                sx={ fieldSx }
                                value={ presetInputs[field] }
                              />
                              <Button
                                onClick={ () => handlePresetAdd(field) }
                                sx={ { minWidth: { sm: 120 }, px: 2.5, textTransform: 'none' } }
                                variant='contained'
                              >
                                Add
                              </Button>
                            </Stack>

                            <Stack direction='row' flexWrap='wrap' gap={ 1 }>
                              {settings.presets[field].length > 0 ? (
                                settings.presets[field].map((value) => (
                                  <Chip
                                    key={ `${field}-${value}` }
                                    label={ value }
                                    onDelete={ () => removePreset(field, value) }
                                    variant='outlined'
                                  />
                                ))
                              ) : (
                                <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
                                  No presets for this field yet.
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Box>
        <Box sx={ { display: { xl: 'block', xs: 'none' }, flexShrink: 0, width: 384 } } />
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkSettingsPage;
