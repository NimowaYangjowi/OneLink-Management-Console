/**
 * Settings page for managing template IDs, template-level branded domains, and field presets.
 */
'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import { inferRegexPatternFromSamples } from '@/lib/namingConvention';
import { filledFieldSx } from '@/components/onelink/stitched/fieldStyles';
import {
  NAMING_RULE_ENFORCEMENT_MODE_LABELS,
  PRESET_FIELDS,
  PRESET_FIELDS_BY_SECTION,
  PRESET_FIELD_LABELS,
  PRESET_FIELD_PLACEHOLDERS,
  PRESET_SECTIONS,
  PRESET_SECTION_LABELS,
  sanitizeNamingConventionRule,
  type NamingConventionRule,
  type NamingConventionSlotRule,
  type NamingRuleEnforcementMode,
  type PresetField,
  useSettings,
} from '@/lib/providers/SettingsContext';

const compactButtonSx = {
  minWidth: 0,
  px: 2,
  whiteSpace: 'nowrap',
};

const compactTextButtonSx = {
  minWidth: 0,
  px: 2,
};

const neutralTextButtonSx = {
  color: 'text.secondary',
  '&:hover': {
    backgroundColor: 'action.hover',
    color: 'text.primary',
  },
};

const HIDDEN_PRESET_FIELDS_ON_SETTINGS: ReadonlySet<PresetField> = new Set([
  'link_name',
  'shortlink_id',
]);

function createDefaultCampaignRule(): NamingConventionRule {
  return {
    delimiter: '_',
    enabled: false,
    field: 'c',
    slots: [
      {
        allowedValues: [],
        id: 'slot_1',
        label: 'Slot 1',
        maxLength: 50,
        mode: 'select',
        order: 1,
        pattern: '',
        required: true,
      },
    ],
  };
}

function createSlotDraft(order: number): NamingConventionSlotRule {
  return {
    allowedValues: [],
    id: `slot_${order}`,
    label: `Slot ${order}`,
    maxLength: 50,
    mode: 'select',
    order,
    pattern: '',
    required: true,
  };
}

const NAMING_WIZARD_STEPS = [
  'Analyze Sample',
  'Configure Slots',
  'Generate Regex',
  'Review & Save',
] as const;

function detectSampleStructure(
  sampleValue: string,
): { delimiter: NamingConventionRule['delimiter']; parts: string[] } | null {
  const trimmed = sampleValue.trim();
  if (!trimmed) {
    return null;
  }

  const delimiterCandidates: NamingConventionRule['delimiter'][] = ['_', '-'];
  const candidates: Array<{ delimiter: NamingConventionRule['delimiter']; parts: string[] }> = delimiterCandidates
    .map((delimiter) => ({
      delimiter,
      parts: trimmed.split(delimiter).map((part) => part.trim()),
    }))
    .filter((candidate) => candidate.parts.length >= 2 && candidate.parts.every((part) => Boolean(part)));

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => b.parts.length - a.parts.length);
  return candidates[0] ?? null;
}

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
    getNamingConventionRule,
    removePreset,
    removeNamingConventionRule,
    removeTemplateBrandedDomain,
    removeTemplateId,
    setNamingConventionEnforcementMode,
    settings,
    upsertNamingConventionRule,
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
  const persistedCampaignRule = useMemo(
    () => getNamingConventionRule('c') ?? createDefaultCampaignRule(),
    [getNamingConventionRule],
  );
  const [campaignRuleDraft, setCampaignRuleDraft] = useState<NamingConventionRule>(persistedCampaignRule);
  const [namingEnforcementModeDraft, setNamingEnforcementModeDraft] = useState<NamingRuleEnforcementMode>(
    settings.namingConvention.enforcementMode,
  );
  const [namingWizardStep, setNamingWizardStep] = useState(0);
  const [rulesTab, setRulesTab] = useState<'naming' | 'presets'>('naming');
  const [campaignStructureSampleDraft, setCampaignStructureSampleDraft] = useState('');
  const [campaignAnchorSample, setCampaignAnchorSample] = useState('');
  const [campaignAnchorParts, setCampaignAnchorParts] = useState<string[]>([]);
  const [activeCampaignSlotIndex, setActiveCampaignSlotIndex] = useState(0);
  const [campaignRegexSampleDraft, setCampaignRegexSampleDraft] = useState('');
  const [hasSampleInferenceRun, setHasSampleInferenceRun] = useState(false);
  const step2SlotsContainerRef = useRef<HTMLDivElement | null>(null);
  const step3SlotsContainerRef = useRef<HTMLDivElement | null>(null);
  const [isStep2Overflowing, setIsStep2Overflowing] = useState(false);
  const [isStep3Overflowing, setIsStep3Overflowing] = useState(false);
  const [namingFeedback, setNamingFeedback] = useState<{ message: string; status: 'error' | 'success' } | null>(
    null,
  );
  const isNamingDirty = useMemo(() => {
    const persistedRuleJson = JSON.stringify(persistedCampaignRule);
    const draftRuleJson = JSON.stringify(campaignRuleDraft);
    return (
      draftRuleJson !== persistedRuleJson
      || namingEnforcementModeDraft !== settings.namingConvention.enforcementMode
    );
  }, [
    campaignRuleDraft,
    namingEnforcementModeDraft,
    persistedCampaignRule,
    settings.namingConvention.enforcementMode,
  ]);

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

  const handleCampaignRuleEnabledChange = (enabled: boolean) => {
    setCampaignRuleDraft((previous) => ({
      ...previous,
      enabled,
    }));
    setNamingFeedback(null);
  };

  const handleCampaignDelimiterChange = (delimiter: NamingConventionRule['delimiter']) => {
    setCampaignRuleDraft((previous) => ({
      ...previous,
      delimiter,
    }));
    setHasSampleInferenceRun(false);
    setNamingFeedback(null);
  };

  const handleCampaignSlotUpdate = (
    slotId: string,
    updater: (slot: NamingConventionSlotRule) => NamingConventionSlotRule,
  ) => {
    setCampaignRuleDraft((previous) => ({
      ...previous,
      slots: previous.slots.map((slot) => (slot.id === slotId ? updater(slot) : slot)),
    }));
    setHasSampleInferenceRun(false);
    setNamingFeedback(null);
  };

  const handleCampaignSlotCountChange = (nextCountInput: string) => {
    const parsed = Number.parseInt(nextCountInput, 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    const nextCount = Math.max(1, Math.min(20, parsed));
    setCampaignRuleDraft((previous) => {
      const nextSlots = previous.slots.slice(0, nextCount);
      for (let index = nextSlots.length; index < nextCount; index += 1) {
        const anchorPart = campaignAnchorParts[index]?.trim() ?? '';
        const nextSlot = createSlotDraft(index + 1);
        nextSlots.push({
          ...nextSlot,
          allowedValues: anchorPart ? [anchorPart.toLowerCase()] : nextSlot.allowedValues,
          maxLength: anchorPart ? Math.max(1, Math.min(100, anchorPart.length)) : nextSlot.maxLength,
        });
      }

      return {
        ...previous,
        slots: nextSlots.map((slot, index) => ({
          ...slot,
          id: `slot_${index + 1}`,
          label: slot.label.trim() || `Slot ${index + 1}`,
          order: index + 1,
        })),
      };
    });
    setActiveCampaignSlotIndex((previous) => Math.min(previous, nextCount - 1));
    setHasSampleInferenceRun(false);
    setNamingFeedback(null);
  };

  const handleSaveNamingConvention = () => {
    const normalizedRule = sanitizeNamingConventionRule(campaignRuleDraft, 'c');
    setNamingConventionEnforcementMode(namingEnforcementModeDraft);
    upsertNamingConventionRule('c', normalizedRule);
    setCampaignRuleDraft(normalizedRule);
    setNamingFeedback({
      message: 'Campaign naming convention has been saved.',
      status: 'success',
    });
  };

  const handleResetNamingDraft = () => {
    setCampaignRuleDraft(persistedCampaignRule);
    setNamingEnforcementModeDraft(settings.namingConvention.enforcementMode);
    setNamingWizardStep(0);
    setCampaignStructureSampleDraft('');
    setCampaignAnchorSample('');
    setCampaignAnchorParts([]);
    setActiveCampaignSlotIndex(0);
    setCampaignRegexSampleDraft('');
    setHasSampleInferenceRun(false);
    setNamingFeedback(null);
  };

  const handleRemoveCampaignRule = () => {
    removeNamingConventionRule('c');
    const resetRule = createDefaultCampaignRule();
    setCampaignRuleDraft(resetRule);
    setNamingWizardStep(0);
    setCampaignStructureSampleDraft('');
    setCampaignAnchorSample('');
    setCampaignAnchorParts([]);
    setActiveCampaignSlotIndex(0);
    setCampaignRegexSampleDraft('');
    setHasSampleInferenceRun(false);
    setNamingFeedback({
      message: 'Campaign naming convention has been removed.',
      status: 'success',
    });
  };

  const handleAnalyzeCampaignSample = () => {
    const detectedStructure = detectSampleStructure(campaignStructureSampleDraft);
    if (!detectedStructure) {
      setNamingFeedback({
        message: 'Enter a sample with at least 2 slots separated by "_" or "-".',
        status: 'error',
      });
      return;
    }

    const nextRule = sanitizeNamingConventionRule(
      {
        ...campaignRuleDraft,
        delimiter: detectedStructure.delimiter,
        enabled: true,
        field: 'c',
        slots: detectedStructure.parts.map((part, index) => {
          const slot = createSlotDraft(index + 1);
          return {
            ...slot,
            allowedValues: [part.toLowerCase()],
            maxLength: Math.max(1, Math.min(100, Math.max(slot.maxLength, part.length))),
            mode: 'select',
            pattern: '',
          };
        }),
      },
      'c',
    );

    setCampaignRuleDraft(nextRule);
    setCampaignAnchorSample(campaignStructureSampleDraft.trim());
    setCampaignAnchorParts(detectedStructure.parts);
    setCampaignRegexSampleDraft(campaignStructureSampleDraft.trim());
    setActiveCampaignSlotIndex(0);
    setHasSampleInferenceRun(false);
    setNamingWizardStep(1);
    setNamingFeedback({
      message:
        `Detected delimiter "${detectedStructure.delimiter}" with ${detectedStructure.parts.length} slots. `
        + 'Regex patterns are generated later in Step 3.',
      status: 'success',
    });
  };

  const handleGenerateCampaignRegexFromSamples = () => {
    const sampleLines = campaignRegexSampleDraft
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (sampleLines.length === 0) {
      setNamingFeedback({
        message: 'Enter at least one sample campaign value.',
        status: 'error',
      });
      return;
    }

    if (campaignRuleDraft.slots.length === 0) {
      setNamingFeedback({
        message: 'Add at least one slot before generating regex.',
        status: 'error',
      });
      return;
    }

    const slotSamples = campaignRuleDraft.slots.map(() => [] as string[]);

    for (let lineIndex = 0; lineIndex < sampleLines.length; lineIndex += 1) {
      const line = sampleLines[lineIndex] ?? '';
      const parts = line.split(campaignRuleDraft.delimiter).map((part) => part.trim());
      if (parts.length !== campaignRuleDraft.slots.length) {
        setNamingFeedback({
          message: `Line ${lineIndex + 1} has ${parts.length} slots, expected ${campaignRuleDraft.slots.length} by delimiter "${campaignRuleDraft.delimiter}".`,
          status: 'error',
        });
        return;
      }

      parts.forEach((part, slotIndex) => {
        slotSamples[slotIndex]?.push(part);
      });
    }

    setCampaignRuleDraft((previous) => ({
      ...previous,
      slots: previous.slots.map((slot, slotIndex) => {
        if (slot.mode === 'regex') {
          return {
            ...slot,
            pattern: inferRegexPatternFromSamples(slotSamples[slotIndex] ?? []),
          };
        }

        if (slot.mode === 'select') {
          const uniqueValues = [
            ...new Set((slotSamples[slotIndex] ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean)),
          ];
          return {
            ...slot,
            allowedValues: uniqueValues,
          };
        }

        return slot;
      }),
    }));
    const regexSlotCount = campaignRuleDraft.slots.filter((slot) => slot.mode === 'regex').length;
    const selectSlotCount = campaignRuleDraft.slots.filter((slot) => slot.mode === 'select').length;
    setNamingFeedback({
      message:
        `Applied sample inference from ${sampleLines.length} line(s): `
        + `${regexSlotCount} regex pattern(s), ${selectSlotCount} preset slot value set(s).`,
      status: 'success',
    });
    setHasSampleInferenceRun(true);
  };

  const hasCampaignAnchorPreview = campaignAnchorParts.length > 0;
  const previewSlotParts = campaignRuleDraft.slots.map((slot, index) => {
    const anchorPart = campaignAnchorParts[index]?.trim();
    return anchorPart || `[${slot.label}]`;
  });
  const regexPreviewSlots = campaignRuleDraft.slots
    .map((slot, slotIndex) => ({ slot, slotIndex }))
    .filter(({ slot }) => slot.mode === 'regex');

  useEffect(() => {
    const updateOverflowState = () => {
      const step2Element = step2SlotsContainerRef.current;
      const step3Element = step3SlotsContainerRef.current;
      setIsStep2Overflowing(Boolean(step2Element && step2Element.scrollWidth > step2Element.clientWidth + 1));
      setIsStep3Overflowing(Boolean(step3Element && step3Element.scrollWidth > step3Element.clientWidth + 1));
    };

    const animationFrame = window.requestAnimationFrame(updateOverflowState);
    const resizeObserver = new ResizeObserver(updateOverflowState);

    if (step2SlotsContainerRef.current) {
      resizeObserver.observe(step2SlotsContainerRef.current);
    }
    if (step3SlotsContainerRef.current) {
      resizeObserver.observe(step3SlotsContainerRef.current);
    }

    window.addEventListener('resize', updateOverflowState);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateOverflowState);
      resizeObserver.disconnect();
    };
  }, [campaignRuleDraft.slots.length, namingWizardStep, regexPreviewSlots.length]);

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
            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 3 } }>
              <Stack spacing={ 2 }>
                <Box>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Template IDs</Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Add 4-character alphanumeric Template IDs used for OneLink generation.
                  </Typography>
                </Box>

                <Stack
                  alignItems={ { sm: 'flex-start', xs: 'stretch' } }
                  direction={ { sm: 'row', xs: 'column' } }
                  spacing={ 1.5 }
                >
                  <TextField
                    disabled={ isAddingTemplate }
                    error={ Boolean(templateError) }
                    fullWidth
                    helperText={
                      templateError
                      || (isAddingTemplate
                        ? 'Resolving subdomain from AppsFlyer (up to 4 attempts)...'
                        : '4 alphanumeric characters (case-sensitive).')
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
                    sx={ filledFieldSx }
                    value={ templateInput }
                  />
                  <Button
                    color='secondary'
                    disabled={ isAddingTemplate }
                    onClick={ () => {
                      void handleTemplateAdd();
                    } }
                    sx={ compactButtonSx }
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
                          borderRadius: 1,
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
                              onClick={ () => removeTemplateId(id) }
                              sx={ { ...compactTextButtonSx, ...neutralTextButtonSx } }
                              variant='text'
                            >
                              Remove Template
                            </Button>
                          </Stack>

                          <Stack
                            alignItems={ { sm: 'flex-start', xs: 'stretch' } }
                            direction={ { sm: 'row', xs: 'column' } }
                            spacing={ 1.5 }
                          >
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
                              sx={ filledFieldSx }
                              value={ templateDomainInputs[id] ?? '' }
                            />
                            <Button
                              color='secondary'
                              onClick={ () => handleTemplateDomainAdd(id) }
                              sx={ compactButtonSx }
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
                                    borderRadius: 0.75,
                                    px: 1.5,
                                    py: 1,
                                  } }
                                >
                                  <Typography sx={ { fontSize: 14 } }>{domain}</Typography>
                                  <Button
                                    onClick={ () => removeTemplateBrandedDomain(id, domain) }
                                    sx={ {
                                      ...compactTextButtonSx,
                                      ...neutralTextButtonSx,
                                      minWidth: 'auto',
                                    } }
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

            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 3 } }>
              <Stack spacing={ 2 }>
                <Box>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Create Rules</Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Manage Presets and Naming Convention rules for campaign generation.
                  </Typography>
                </Box>

                <Tabs
                  onChange={ (_, nextValue: 'naming' | 'presets') => setRulesTab(nextValue) }
                  value={ rulesTab }
                  variant='scrollable'
                >
                  <Tab label='Naming Convention' value='naming' />
                  <Tab label='Presets' value='presets' />
                </Tabs>

                {rulesTab === 'naming' ? (
                  <>
                <Stepper activeStep={ namingWizardStep } alternativeLabel>
                  {NAMING_WIZARD_STEPS.map((stepLabel) => (
                    <Step key={ stepLabel }>
                      <StepLabel>{stepLabel}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {namingFeedback ? (
                  <Alert severity={ namingFeedback.status === 'success' ? 'success' : 'error' }>
                    {namingFeedback.message}
                  </Alert>
                ) : null}

                {hasCampaignAnchorPreview ? (
                  <Paper
                    elevation={ 0 }
                    sx={ {
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    } }
                  >
                    <Stack spacing={ 1 }>
                      <Typography sx={ { fontSize: 13, fontWeight: 600 } }>Anchor Sample (Pinned)</Typography>
                      <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                        Click a slot chip or slot card to focus that segment while editing.
                      </Typography>
                      <Stack direction='row' flexWrap='wrap' gap={ 0.75 }>
                        {previewSlotParts.map((part, index) => (
                          <Box key={ `${index}-${part}` } sx={ { alignItems: 'center', display: 'inline-flex', gap: 0.75 } }>
                            <Chip
                              color={ activeCampaignSlotIndex === index ? 'primary' : 'default' }
                              label={ part }
                              onClick={ () => setActiveCampaignSlotIndex(index) }
                              variant={ activeCampaignSlotIndex === index ? 'filled' : 'outlined' }
                            />
                            {index < previewSlotParts.length - 1 ? (
                              <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                                {campaignRuleDraft.delimiter}
                              </Typography>
                            ) : null}
                          </Box>
                        ))}
                      </Stack>
                      <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                        Sample: {campaignAnchorSample}
                      </Typography>
                    </Stack>
                  </Paper>
                ) : null}

                {namingWizardStep === 0 ? (
                  <Paper
                    elevation={ 0 }
                    sx={ {
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    } }
                  >
                    <Stack spacing={ 1.5 }>
                      <Typography sx={ { fontSize: 14, fontWeight: 600 } }>Step 1. Analyze One Sample</Typography>
                      <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                        Paste one sample campaign value. The system infers delimiter, slot count, and slot order
                        automatically.
                      </Typography>
                      <TextField
                        fullWidth
                        onChange={ (event) => setCampaignStructureSampleDraft(event.target.value) }
                        placeholder='e.g. AND0008_MX_090525_UAC1.0_FF_TA01_LAN'
                        sx={ filledFieldSx }
                        value={ campaignStructureSampleDraft }
                      />
                      <Stack direction='row' spacing={ 1 }>
                        <Button
                          onClick={ handleAnalyzeCampaignSample }
                          sx={ compactButtonSx }
                          variant='contained'
                        >
                          Analyze Sample
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}

                {namingWizardStep === 1 ? (
                  <Stack spacing={ 1.5 }>
                    <Stack
                      alignItems={ { sm: 'center', xs: 'flex-start' } }
                      direction={ { sm: 'row', xs: 'column' } }
                      spacing={ 1.5 }
                    >
                      <Typography sx={ { fontSize: 13, fontWeight: 500 } }>Delimiter</Typography>
                      <FormControl size='small' sx={ { minWidth: 120 } }>
                        <Select
                          onChange={ (event) => handleCampaignDelimiterChange(event.target.value as NamingConventionRule['delimiter']) }
                          value={ campaignRuleDraft.delimiter }
                        >
                          <MenuItem value='_'>Underscore (_)</MenuItem>
                          <MenuItem value='-'>Hyphen (-)</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        inputProps={ { max: 20, min: 1 } }
                        label='Slot Count'
                        onChange={ (event) => handleCampaignSlotCountChange(event.target.value) }
                        size='small'
                        sx={ { maxWidth: 160, ...filledFieldSx } }
                        type='number'
                        value={ campaignRuleDraft.slots.length }
                      />
                    </Stack>

                    <Box
                      ref={ step2SlotsContainerRef }
                      sx={ {
                        display: 'flex',
                        gap: 1.25,
                        overflowX: isStep2Overflowing ? 'scroll' : 'hidden',
                        overflowY: 'hidden',
                        pb: isStep2Overflowing ? 0.5 : 0,
                        scrollbarColor: isStep2Overflowing ? 'rgba(148, 163, 184, 0.85) transparent' : 'transparent transparent',
                        scrollbarWidth: isStep2Overflowing ? 'thin' : 'none',
                        '&::-webkit-scrollbar': {
                          height: isStep2Overflowing ? 10 : 0,
                        },
                        '&::-webkit-scrollbar-thumb': {
                          backgroundColor: isStep2Overflowing ? 'rgba(148, 163, 184, 0.85)' : 'transparent',
                          borderRadius: 999,
                        },
                        '&::-webkit-scrollbar-track': {
                          backgroundColor: 'transparent',
                        },
                      } }
                    >
                      {campaignRuleDraft.slots.map((slot, slotIndex) => (
                        <Paper
                          elevation={ 0 }
                          key={ slot.id }
                          onClick={ () => setActiveCampaignSlotIndex(slotIndex) }
                          sx={ {
                            backgroundColor: 'background.default',
                            border: '1px solid',
                            borderColor: activeCampaignSlotIndex === slotIndex ? 'secondary.main' : 'divider',
                            borderRadius: 1,
                            cursor: 'pointer',
                            flex: '0 0 240px',
                            p: 1.5,
                          } }
                        >
                          <Stack spacing={ 1 }>
                            <Typography sx={ { fontSize: 13, fontWeight: 600 } }>Slot {slotIndex + 1}</Typography>
                            <Typography
                              sx={ {
                                color: 'text.secondary',
                                fontSize: 12,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              } }
                            >
                              Sample part: {campaignAnchorParts[slotIndex] ?? '(not in anchor sample)'}
                            </Typography>
                            <FormControl size='small' sx={ { width: '100%' } }>
                              <Select
                                onChange={ (event) => {
                                  const nextMode = event.target.value as NamingConventionSlotRule['mode'];
                                  handleCampaignSlotUpdate(slot.id, (previous) => ({
                                    ...previous,
                                    mode: nextMode,
                                    pattern: nextMode === 'regex' ? previous.pattern : '',
                                  }));
                                } }
                                value={ slot.mode === 'regex' ? 'regex' : 'select' }
                              >
                                <MenuItem value='select'>Preset</MenuItem>
                                <MenuItem value='regex'>Regex</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                        </Paper>
                      ))}
                    </Box>

                    <Stack direction='row' justifyContent='space-between' spacing={ 1 }>
                      <Button
                        onClick={ () => setNamingWizardStep(0) }
                        sx={ compactTextButtonSx }
                        variant='text'
                      >
                        Back
                      </Button>
                      <Button
                        onClick={ () => setNamingWizardStep(2) }
                        sx={ compactButtonSx }
                        variant='contained'
                      >
                        Continue to Sample Inference
                      </Button>
                    </Stack>
                  </Stack>
                ) : null}

                {namingWizardStep === 2 ? (
                  <Paper
                    elevation={ 0 }
                    sx={ {
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    } }
                  >
                    <Stack spacing={ 1.25 }>
                      <Typography sx={ { fontSize: 13, fontWeight: 600 } }>Step 3. Generate from Samples</Typography>
                      <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                        Paste full campaign examples (one per line). Regex patterns are generated for slots set to Regex.
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={ 4 }
                        onChange={ (event) => {
                          setCampaignRegexSampleDraft(event.target.value);
                          setHasSampleInferenceRun(false);
                        } }
                        placeholder={[
                          'AND0028_BR_130126_UAC2.5_FF_TA01_return-user',
                          'AND0005_MX_140223_UAC2.5_FF_TA01_LAN_return-user',
                          'AND0008_MX_090525_UAC1.0_FF_TA01_LAN',
                        ].join('\n') }
                        sx={ filledFieldSx }
                        value={ campaignRegexSampleDraft }
                      />
                      {regexPreviewSlots.length > 0 ? (
                        <Box
                          ref={ step3SlotsContainerRef }
                          sx={ {
                            display: 'flex',
                            gap: 1.25,
                            overflowX: isStep3Overflowing ? 'scroll' : 'hidden',
                            overflowY: 'hidden',
                            pb: isStep3Overflowing ? 0.5 : 0,
                            scrollbarColor: isStep3Overflowing ? 'rgba(148, 163, 184, 0.85) transparent' : 'transparent transparent',
                            scrollbarWidth: isStep3Overflowing ? 'thin' : 'none',
                            '&::-webkit-scrollbar': {
                              height: isStep3Overflowing ? 10 : 0,
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: isStep3Overflowing ? 'rgba(148, 163, 184, 0.85)' : 'transparent',
                              borderRadius: 999,
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: 'transparent',
                            },
                          } }
                        >
                          {regexPreviewSlots.map(({ slot, slotIndex }) => (
                            <Paper
                              elevation={ 0 }
                              key={ `${slot.id}-preview` }
                              sx={ {
                                backgroundColor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                flex: '0 0 280px',
                                p: 1.25,
                              } }
                            >
                              <Stack spacing={ 0.75 }>
                                <Typography sx={ { fontSize: 12, fontWeight: 600 } }>
                                  Slot {slotIndex + 1} (Regex)
                                </Typography>
                                <Typography sx={ { color: 'text.secondary', fontFamily: 'monospace', fontSize: 12 } }>
                                  {slot.pattern || '(empty)'}
                                </Typography>
                              </Stack>
                            </Paper>
                          ))}
                        </Box>
                      ) : (
                        <Alert severity='info'>No Regex slots selected in Step 2.</Alert>
                      )}
                      <Stack direction='row' justifyContent='space-between' spacing={ 1 }>
                        <Button
                          onClick={ () => setNamingWizardStep(1) }
                          sx={ compactTextButtonSx }
                          variant='text'
                        >
                          Back
                        </Button>
                        <Stack direction='row' spacing={ 1 }>
                          <Button
                            onClick={ handleGenerateCampaignRegexFromSamples }
                            sx={ compactButtonSx }
                            variant='contained'
                          >
                            Generate from Samples
                          </Button>
                          <Button
                            disabled={ !hasSampleInferenceRun }
                            onClick={ () => setNamingWizardStep(3) }
                            sx={ compactButtonSx }
                            variant='outlined'
                          >
                            Continue to Review
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}

                {namingWizardStep === 3 ? (
                  <Stack spacing={ 1.5 }>
                    <Paper
                      elevation={ 0 }
                      sx={ {
                        backgroundColor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                      } }
                    >
                      <Stack spacing={ 1.25 }>
                        <Typography sx={ { fontSize: 13, fontWeight: 600 } }>Step 4. Review & Save</Typography>
                        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                          Confirm enforcement mode and save the campaign rule.
                        </Typography>
                        <Stack
                          alignItems={ { sm: 'center', xs: 'flex-start' } }
                          direction={ { sm: 'row', xs: 'column' } }
                          justifyContent='space-between'
                          spacing={ 1.5 }
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={ campaignRuleDraft.enabled }
                                onChange={ (event) => handleCampaignRuleEnabledChange(event.target.checked) }
                              />
                            }
                            label='Enable Campaign Rule'
                          />
                          <FormControl size='small' sx={ { minWidth: 180 } }>
                            <Select
                              onChange={ (event) => {
                                setNamingEnforcementModeDraft(event.target.value as NamingRuleEnforcementMode);
                                setNamingFeedback(null);
                              } }
                              value={ namingEnforcementModeDraft }
                            >
                              {Object.entries(NAMING_RULE_ENFORCEMENT_MODE_LABELS).map(([mode, label]) => (
                                <MenuItem key={ mode } value={ mode }>
                                  {label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Stack>
                      </Stack>
                    </Paper>

                    <Stack direction='row' flexWrap='wrap' gap={ 1 }>
                      <Button
                        onClick={ () => setNamingWizardStep(2) }
                        sx={ compactTextButtonSx }
                        variant='text'
                      >
                        Back
                      </Button>
                      <Button
                        disabled={ !isNamingDirty }
                        onClick={ handleSaveNamingConvention }
                        sx={ compactButtonSx }
                        variant='contained'
                      >
                        Save Naming Rule
                      </Button>
                      <Button
                        disabled={ !isNamingDirty }
                        onClick={ handleResetNamingDraft }
                        sx={ compactTextButtonSx }
                        variant='text'
                      >
                        Reset Draft
                      </Button>
                      <Button
                        onClick={ handleRemoveCampaignRule }
                        sx={ { ...compactTextButtonSx, ...neutralTextButtonSx } }
                        variant='text'
                      >
                        Remove Campaign Rule
                      </Button>
                    </Stack>
                  </Stack>
                ) : null}
                  </>
                ) : null}
              </Stack>
            </Paper>

            {rulesTab === 'presets' ? (
              <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 3 } }>
              <Stack spacing={ 3 }>
                <Box>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Presets</Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Manage reusable values by section. Retargeting and Force deeplink are intentionally excluded.
                  </Typography>
                </Box>

                {PRESET_SECTIONS.map((section) => (
                  <Box key={ section }>
                    <Typography sx={ { fontSize: 18, fontWeight: 600 } }>{PRESET_SECTION_LABELS[section]}</Typography>
                    <Stack spacing={ 1.5 } sx={ { mt: 1.5 } }>
                      {PRESET_FIELDS_BY_SECTION[section]
                        .filter((field) => !HIDDEN_PRESET_FIELDS_ON_SETTINGS.has(field))
                        .map((field) => (
                        <Paper
                          elevation={ 0 }
                          key={ field }
                          sx={ {
                            backgroundColor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 2,
                          } }
                        >
                          <Stack spacing={ 1.5 }>
                            <Typography sx={ { fontSize: 14, fontWeight: 600 } }>
                              {PRESET_FIELD_LABELS[field]} ({settings.presets[field].length})
                            </Typography>

                            <Stack
                              alignItems={ { sm: 'flex-start', xs: 'stretch' } }
                              direction={ { sm: 'row', xs: 'column' } }
                              spacing={ 1.5 }
                            >
                              <TextField
                                error={ Boolean(presetErrors[field]) }
                                fullWidth
                                helperText={ presetErrors[field] || undefined }
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
                                sx={ filledFieldSx }
                                value={ presetInputs[field] }
                              />
                              <Button
                                color='secondary'
                                onClick={ () => handlePresetAdd(field) }
                                sx={ compactButtonSx }
                                variant='contained'
                              >
                                Add
                              </Button>
                            </Stack>

                            {settings.presets[field].length > 0 ? (
                              <Stack direction='row' flexWrap='wrap' gap={ 1 }>
                                {settings.presets[field].map((value) => (
                                  <Chip
                                    key={ `${field}-${value}` }
                                    label={ value }
                                    onDelete={ () => removePreset(field, value) }
                                    variant='outlined'
                                  />
                                ))}
                              </Stack>
                            ) : null}
                          </Stack>
                        </Paper>
                        ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
              </Paper>
            ) : null}
          </Stack>
        </Box>
        <Box sx={ { display: { xl: 'block', xs: 'none' }, flexShrink: 0, width: 384 } } />
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkSettingsPage;
