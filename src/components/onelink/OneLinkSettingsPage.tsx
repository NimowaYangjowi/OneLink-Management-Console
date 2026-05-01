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
import { alpha } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import NamingRuleReadonlyView from '@/components/onelink/NamingRuleReadonlyView';
import { inferRegexPatternFromSamples } from '@/lib/namingConvention';
import { filledFieldSx } from '@/components/onelink/stitched/fieldStyles';
import {
  NAMING_CONVENTION_TARGET_FIELDS,
  NAMING_CONVENTION_TARGET_FIELD_LABELS,
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
  type NamingConventionTargetField,
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
const NAMING_TARGET_FIELDS_ON_SETTINGS: NamingConventionTargetField[] = NAMING_CONVENTION_TARGET_FIELDS.filter(
  (field) => field !== 'pid',
);

function createDefaultNamingRule(field: NamingConventionTargetField, ruleOrder: number): NamingConventionRule {
  const fieldTitle = NAMING_CONVENTION_TARGET_FIELD_LABELS[field].split('(')[0]?.trim() || field;
  return {
    delimiter: '_',
    enabled: false,
    field,
    id: `rule_${field}_${ruleOrder}`,
    name: `${fieldTitle} Rule ${ruleOrder}`,
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
    getNamingConventionRules,
    getTemplateBrandedDomains,
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
  const [selectedNamingField, setSelectedNamingField] = useState<NamingConventionTargetField>('c');
  const persistedNamingRules = useMemo(
    () => getNamingConventionRules(selectedNamingField),
    [getNamingConventionRules, selectedNamingField],
  );
  const [selectedNamingRuleId, setSelectedNamingRuleId] = useState('');
  const persistedSelectedNamingRule = useMemo(() => {
    const selectedRule = persistedNamingRules.find((rule) => rule.id === selectedNamingRuleId);
    if (selectedRule) {
      return selectedRule;
    }

    if (persistedNamingRules.length > 0) {
      return persistedNamingRules[0];
    }

    return createDefaultNamingRule(selectedNamingField, 1);
  }, [persistedNamingRules, selectedNamingField, selectedNamingRuleId]);
  const fieldLabel = useMemo(
    () => NAMING_CONVENTION_TARGET_FIELD_LABELS[selectedNamingField],
    [selectedNamingField],
  );
  const fieldShortLabel = useMemo(
    () => fieldLabel.split('(')[0]?.trim() || selectedNamingField,
    [fieldLabel, selectedNamingField],
  );
  const [campaignRuleDraft, setCampaignRuleDraft] = useState<NamingConventionRule>(persistedSelectedNamingRule);
  const [namingEnforcementModeDraft, setNamingEnforcementModeDraft] = useState<NamingRuleEnforcementMode>(
    settings.namingConvention.enforcementMode,
  );
  const [isNamingRuleReadOnlyView, setIsNamingRuleReadOnlyView] = useState(true);
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
    const persistedRuleJson = JSON.stringify(persistedSelectedNamingRule);
    const draftRuleJson = JSON.stringify(campaignRuleDraft);
    return (
      draftRuleJson !== persistedRuleJson
      || namingEnforcementModeDraft !== settings.namingConvention.enforcementMode
    );
  }, [
    campaignRuleDraft,
    namingEnforcementModeDraft,
    persistedSelectedNamingRule,
    settings.namingConvention.enforcementMode,
  ]);
  const hasPersistedSelectedRule = useMemo(
    () => persistedNamingRules.some((rule) => rule.id === campaignRuleDraft.id),
    [campaignRuleDraft.id, persistedNamingRules],
  );
  const resetNamingWizardWorkspace = useCallback(() => {
    setCampaignStructureSampleDraft('');
    setCampaignAnchorSample('');
    setCampaignAnchorParts([]);
    setActiveCampaignSlotIndex(0);
    setCampaignRegexSampleDraft('');
    setHasSampleInferenceRun(false);
  }, []);

  useEffect(() => {
    if (persistedNamingRules.length === 0) {
      if (selectedNamingRuleId) {
        setSelectedNamingRuleId('');
      }
      return;
    }

    const hasSelectedRule = persistedNamingRules.some((rule) => rule.id === selectedNamingRuleId);
    if (!hasSelectedRule) {
      setSelectedNamingRuleId(persistedNamingRules[0]?.id ?? '');
    }
  }, [persistedNamingRules, selectedNamingRuleId]);

  useEffect(() => {
    setCampaignRuleDraft(persistedSelectedNamingRule);
  }, [persistedSelectedNamingRule]);

  useEffect(() => {
    setNamingWizardStep(0);
    resetNamingWizardWorkspace();
    setIsNamingRuleReadOnlyView(true);
    setNamingFeedback(null);
  }, [resetNamingWizardWorkspace, selectedNamingField]);

  useEffect(() => {
    if (persistedNamingRules.length === 0) {
      setIsNamingRuleReadOnlyView(false);
    }
  }, [persistedNamingRules.length]);

  const handleNamingFieldChange = (field: NamingConventionTargetField) => {
    setSelectedNamingField(field);
  };

  const handleNamingRuleSelect = (ruleId: string) => {
    setSelectedNamingRuleId(ruleId);
    const selectedRule = persistedNamingRules.find((rule) => rule.id === ruleId);
    if (!selectedRule) {
      return;
    }

    setCampaignRuleDraft(selectedRule);
    setNamingWizardStep(0);
    setIsNamingRuleReadOnlyView(true);
    resetNamingWizardWorkspace();
    setNamingFeedback({
      message: `Loaded "${selectedRule.name}" for review.`,
      status: 'success',
    });
  };

  const handleEditSelectedRule = () => {
    if (!hasPersistedSelectedRule) {
      return;
    }

    setIsNamingRuleReadOnlyView(false);
    setNamingWizardStep(1);
    setNamingFeedback(null);
  };

  const handleAddNamingRule = () => {
    let ruleOrder = persistedNamingRules.length + 1;
    let ruleId = `rule_${selectedNamingField}_${ruleOrder}`;
    while (persistedNamingRules.some((rule) => rule.id === ruleId)) {
      ruleOrder += 1;
      ruleId = `rule_${selectedNamingField}_${ruleOrder}`;
    }

    const newRule = sanitizeNamingConventionRule(
      {
        ...createDefaultNamingRule(selectedNamingField, ruleOrder),
        id: ruleId,
      },
      selectedNamingField,
      ruleOrder,
    );

    upsertNamingConventionRule(selectedNamingField, newRule);
    setSelectedNamingRuleId(newRule.id);
    setCampaignRuleDraft(newRule);
    setIsNamingRuleReadOnlyView(false);
    setNamingWizardStep(1);
    resetNamingWizardWorkspace();
    setNamingFeedback({
      message: `${fieldShortLabel} rule "${newRule.name}" has been added.`,
      status: 'success',
    });
  };

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
    const normalizedRule = sanitizeNamingConventionRule(campaignRuleDraft, selectedNamingField);
    setNamingConventionEnforcementMode(namingEnforcementModeDraft);
    upsertNamingConventionRule(selectedNamingField, normalizedRule);
    setSelectedNamingRuleId(normalizedRule.id);
    setCampaignRuleDraft(normalizedRule);
    setIsNamingRuleReadOnlyView(true);
    setNamingFeedback({
      message: `${fieldShortLabel} naming convention rule has been saved.`,
      status: 'success',
    });
  };

  const handleResetNamingDraft = () => {
    setCampaignRuleDraft(persistedSelectedNamingRule);
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
    if (!campaignRuleDraft.id || !hasPersistedSelectedRule) {
      return;
    }

    removeNamingConventionRule(selectedNamingField, campaignRuleDraft.id);
    const resetRule = createDefaultNamingRule(selectedNamingField, 1);
    setCampaignRuleDraft(resetRule);
    setIsNamingRuleReadOnlyView(persistedNamingRules.length > 1);
    setNamingWizardStep(0);
    setCampaignStructureSampleDraft('');
    setCampaignAnchorSample('');
    setCampaignAnchorParts([]);
    setActiveCampaignSlotIndex(0);
    setCampaignRegexSampleDraft('');
    setHasSampleInferenceRun(false);
    setNamingFeedback({
      message: `${fieldShortLabel} naming convention rule has been removed.`,
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
        field: selectedNamingField,
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
      selectedNamingField,
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
        message: `Enter at least one sample ${fieldShortLabel.toLowerCase()} value.`,
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
                  <Typography sx={ { typography: 'sectionTitle', fontWeight: 600 } }>Template IDs</Typography>
                  <Typography sx={ { color: 'text.secondary', typography: 'bodyMd' } }>
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
                              <Typography sx={ { typography: 'titleSm', fontWeight: 600 } }>{id}</Typography>
                              <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
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
                                  <Typography sx={ { typography: 'bodyMd' } }>{domain}</Typography>
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
                              <Typography sx={ { color: 'text.secondary', typography: 'bodySm' } }>
                                No branded domains for this template yet.
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography sx={ { color: 'text.secondary', typography: 'bodySm' } }>No template IDs yet.</Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 3 } }>
              <Stack spacing={ 2 }>
                <Box>
                  <Typography sx={ { typography: 'sectionTitle', fontWeight: 600 } }>Create Rules</Typography>
                  <Typography sx={ { color: 'text.secondary', typography: 'bodyMd' } }>
                    Manage Presets and Naming Convention rules for link attributes.
                  </Typography>
                </Box>

                <Tabs
                  onChange={ (_, nextValue: 'naming' | 'presets') => setRulesTab(nextValue) }
                  value={ rulesTab }
                  variant='scrollable'
                >
                  <Tab label='Presets' value='presets' />
                  <Tab label='Naming Convention' value='naming' />
                </Tabs>

                {rulesTab === 'naming' ? (
                  <>
                {namingFeedback ? (
                  <Alert severity={ namingFeedback.status === 'success' ? 'success' : 'error' }>
                    {namingFeedback.message}
                  </Alert>
                ) : null}

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
                    <Stack
                      alignItems={ { sm: 'center', xs: 'flex-start' } }
                      direction={ { sm: 'row', xs: 'column' } }
                      spacing={ 1.25 }
                    >
                      <Typography sx={ { typography: 'bodySm', fontWeight: 600 } }>Target Field</Typography>
                      <FormControl size='small' sx={ { minWidth: 220 } }>
                        <Select
                          onChange={ (event) => handleNamingFieldChange(event.target.value as NamingConventionTargetField) }
                          value={ selectedNamingField }
                        >
                          {NAMING_TARGET_FIELDS_ON_SETTINGS.map((field) => (
                            <MenuItem key={ field } value={ field }>
                              {NAMING_CONVENTION_TARGET_FIELD_LABELS[field]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button onClick={ handleAddNamingRule } sx={ compactButtonSx } variant='contained'>
                        Add Rule
                      </Button>
                    </Stack>
                    {persistedNamingRules.length > 0 ? (
                      <Stack spacing={ 1 }>
                        <FormControl size='small' sx={ { maxWidth: 420, minWidth: 260 } }>
                          <Select
                            onChange={ (event) => handleNamingRuleSelect(event.target.value as string) }
                            value={ campaignRuleDraft.id }
                          >
                            {persistedNamingRules.map((rule) => (
                              <MenuItem key={ rule.id } value={ rule.id }>
                                {rule.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
                          Select a saved rule to load and review its slot configuration.
                        </Typography>
                        <Stack direction='row' flexWrap='wrap' gap={ 0.75 }>
                          {persistedNamingRules.map((rule) => (
                            <Chip
                              clickable
                              color={ campaignRuleDraft.id === rule.id ? 'primary' : 'default' }
                              key={ rule.id }
                              label={ rule.name }
                              onClick={ () => handleNamingRuleSelect(rule.id) }
                              variant={ campaignRuleDraft.id === rule.id ? 'filled' : 'outlined' }
                            />
                          ))}
                        </Stack>
                      </Stack>
                    ) : (
                      <Alert severity='info'>
                        No saved rules for {fieldShortLabel}. Click Add Rule to create one.
                      </Alert>
                    )}
                  </Stack>
                </Paper>

                {isNamingRuleReadOnlyView && hasPersistedSelectedRule ? (
                  <Stack spacing={ 1.5 }>
                    <NamingRuleReadonlyView
                      fieldLabel={ fieldLabel }
                      rule={ campaignRuleDraft }
                    />
                    <Stack direction='row' flexWrap='wrap' gap={ 1 }>
                      <Button
                        onClick={ handleEditSelectedRule }
                        sx={ compactButtonSx }
                        variant='contained'
                      >
                        Edit Selected Rule
                      </Button>
                      <Button
                        disabled={ !hasPersistedSelectedRule }
                        onClick={ handleRemoveCampaignRule }
                        sx={ { ...compactTextButtonSx, ...neutralTextButtonSx } }
                        variant='text'
                      >
                        Remove Selected Rule
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <>
                <Stepper activeStep={ namingWizardStep } alternativeLabel>
                  {NAMING_WIZARD_STEPS.map((stepLabel) => (
                    <Step key={ stepLabel }>
                      <StepLabel>{stepLabel}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

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
                      <Typography sx={ { typography: 'bodySm', fontWeight: 600 } }>Anchor Sample (Pinned)</Typography>
                      <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
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
                              <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
                                {campaignRuleDraft.delimiter}
                              </Typography>
                            ) : null}
                          </Box>
                        ))}
                      </Stack>
                      <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
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
                      <Typography sx={ { typography: 'bodyMd', fontWeight: 600 } }>Step 1. Analyze One Sample</Typography>
                      <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
                        Paste one sample {fieldShortLabel.toLowerCase()} value. The system infers delimiter, slot
                        count, and slot order automatically.
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
                      <Typography sx={ { typography: 'bodySm', fontWeight: 500 } }>Delimiter</Typography>
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
                      sx={ (theme) => {
                        const scrollbarThumbColor = isStep2Overflowing
                          ? alpha(theme.palette.text.secondary, 0.55)
                          : 'transparent';

                        return {
                          display: 'flex',
                          gap: 1.25,
                          overflowX: isStep2Overflowing ? 'scroll' : 'hidden',
                          overflowY: 'hidden',
                          pb: isStep2Overflowing ? 0.5 : 0,
                          scrollbarColor: `${scrollbarThumbColor} transparent`,
                          scrollbarWidth: isStep2Overflowing ? 'thin' : 'none',
                          '&::-webkit-scrollbar': {
                            height: isStep2Overflowing ? 10 : 0,
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: scrollbarThumbColor,
                            borderRadius: 999,
                          },
                          '&::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent',
                          },
                        };
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
                            <Typography sx={ { typography: 'bodySm', fontWeight: 600 } }>Slot {slotIndex + 1}</Typography>
                            <Typography
                              sx={ {
                                color: 'text.secondary',
                                typography: 'bodyXs',
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
                      <Typography sx={ { typography: 'bodySm', fontWeight: 600 } }>Step 3. Generate from Samples</Typography>
                      <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
                        Paste full {fieldShortLabel.toLowerCase()} examples (one per line). Regex patterns are
                        generated for slots set to Regex.
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
                          sx={ (theme) => {
                            const scrollbarThumbColor = isStep3Overflowing
                              ? alpha(theme.palette.text.secondary, 0.55)
                              : 'transparent';

                            return {
                              display: 'flex',
                              gap: 1.25,
                              overflowX: isStep3Overflowing ? 'scroll' : 'hidden',
                              overflowY: 'hidden',
                              pb: isStep3Overflowing ? 0.5 : 0,
                              scrollbarColor: `${scrollbarThumbColor} transparent`,
                              scrollbarWidth: isStep3Overflowing ? 'thin' : 'none',
                              '&::-webkit-scrollbar': {
                                height: isStep3Overflowing ? 10 : 0,
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: scrollbarThumbColor,
                                borderRadius: 999,
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: 'transparent',
                              },
                            };
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
                                <Typography sx={ { typography: 'bodyXs', fontWeight: 600 } }>
                                  Slot {slotIndex + 1} (Regex)
                                </Typography>
                                <Typography sx={ { color: 'text.secondary', typography: 'codeXs' } }>
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
                        <Typography sx={ { typography: 'bodySm', fontWeight: 600 } }>Step 4. Review & Save</Typography>
                        <Typography sx={ { color: 'text.secondary', typography: 'bodyXs' } }>
                          Confirm enforcement mode and save the selected rule.
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
                            label={ `Enable ${fieldShortLabel} Rule` }
                          />
                          <TextField
                            label='Rule Name'
                            onChange={ (event) => {
                              setCampaignRuleDraft((previous) => ({ ...previous, name: event.target.value }));
                              setNamingFeedback(null);
                            } }
                            size='small'
                            sx={ { minWidth: 220, ...filledFieldSx } }
                            value={ campaignRuleDraft.name }
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
                        disabled={ !hasPersistedSelectedRule }
                        onClick={ handleRemoveCampaignRule }
                        sx={ { ...compactTextButtonSx, ...neutralTextButtonSx } }
                        variant='text'
                      >
                        Remove Selected Rule
                      </Button>
                    </Stack>
                  </Stack>
                ) : null}
                  </>
                )}
                  </>
                ) : null}
              </Stack>
            </Paper>

            {rulesTab === 'presets' ? (
              <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 3 } }>
              <Stack spacing={ 3 }>
                <Box>
                  <Typography sx={ { typography: 'sectionTitle', fontWeight: 600 } }>Presets</Typography>
                  <Typography sx={ { color: 'text.secondary', typography: 'bodyMd' } }>
                    Manage reusable values by section. Retargeting and Force deeplink are intentionally excluded.
                  </Typography>
                </Box>

                {PRESET_SECTIONS.map((section) => (
                  <Box key={ section }>
                    <Typography sx={ { typography: 'headlineSm', fontWeight: 600 } }>{PRESET_SECTION_LABELS[section]}</Typography>
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
                            <Typography sx={ { typography: 'bodyMd', fontWeight: 600 } }>
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
