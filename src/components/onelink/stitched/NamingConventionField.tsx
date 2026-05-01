/**
 * Input field with preset suggestions and naming-convention rule selection.
 */
'use client';

import { Autocomplete, Box, Chip, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { composeValueFromSlots } from '@/lib/namingConvention';
import type { NamingConventionRule } from '@/lib/providers/SettingsContext';
import { buildNamingRuleExample, buildNamingSlotExample } from '@/lib/namingRulePlaceholder';
import { filledFieldSx, inputSurfaceSx } from './fieldStyles';

type NamingConventionFieldProps = {
  errorMessage?: string;
  isRequired?: boolean;
  label: string;
  namingRules: NamingConventionRule[];
  onRuleSelect: (ruleId: string) => void;
  onValueChange: (value: string) => void;
  placeholder?: string;
  presetOptions: string[];
  selectedRuleId: string;
  value: string;
};

const NAMING_RULE_OPTION_PREFIX = '[Naming Rule] ';

function parseRuleValueToSlots(rule: NamingConventionRule, rawValue: string): string[] {
  const empty = rule.slots.map(() => '');
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return empty;
  }

  const parts = trimmed.split(rule.delimiter);
  if (parts.length <= rule.slots.length) {
    return rule.slots.map((_, index) => (parts[index] ?? '').trim());
  }

  const overflowStart = Math.max(rule.slots.length - 1, 0);
  const head = parts.slice(0, overflowStart);
  const tail = parts.slice(overflowStart).join(rule.delimiter);
  return [...head, tail].map((part) => part.trim());
}

function estimateSlotWidth(slotValue: string, slotPlaceholder: string) {
  const seed = slotValue || slotPlaceholder;
  const estimated = seed.length * 7 + 52;
  return Math.min(240, Math.max(96, estimated));
}

function NamingConventionField({
  errorMessage,
  isRequired = false,
  label,
  namingRules,
  onRuleSelect,
  onValueChange,
  placeholder,
  presetOptions,
  selectedRuleId,
  value,
}: NamingConventionFieldProps) {
  const selectedRule = namingRules.find((rule) => rule.id === selectedRuleId) ?? null;
  const inputPlaceholder = selectedRule ? buildNamingRuleExample(selectedRule) : placeholder;
  const ruleOptions = namingRules.map((rule) => ({
    label: `${NAMING_RULE_OPTION_PREFIX}${rule.name}`,
    ruleId: rule.id,
  }));
  const optionLabels = [...ruleOptions.map((option) => option.label), ...presetOptions];
  const helperText = errorMessage || ' ';
  const slotValues = useMemo(
    () => (selectedRule ? parseRuleValueToSlots(selectedRule, value) : []),
    [selectedRule, value],
  );
  const slotRowRef = useRef<HTMLDivElement | null>(null);
  const [showOverflowIndicator, setShowOverflowIndicator] = useState(false);

  const updateSlotValue = (slotIndex: number, nextRawValue: string) => {
    if (!selectedRule) {
      return;
    }

    const nextSlots = [...slotValues];
    nextSlots[slotIndex] = nextRawValue.trim();
    onValueChange(composeValueFromSlots(selectedRule, nextSlots));
  };

  useEffect(() => {
    const node = slotRowRef.current;
    if (!selectedRule || !node) {
      const rafId = requestAnimationFrame(() => {
        setShowOverflowIndicator(false);
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    const syncOverflow = () => {
      const overflow = node.scrollWidth > node.clientWidth + 1;
      const reachedEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1;

      const shouldShow = overflow && !reachedEnd;
      setShowOverflowIndicator((previous) => (previous === shouldShow ? previous : shouldShow));
    };

    const resizeObserver = new ResizeObserver(() => {
      syncOverflow();
    });

    const handleScroll = () => {
      syncOverflow();
    };

    resizeObserver.observe(node);
    node.addEventListener('scroll', handleScroll, { passive: true });

    const rafId = requestAnimationFrame(() => {
      syncOverflow();
    });

    return () => {
      cancelAnimationFrame(rafId);
      node.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [selectedRule, value]);

  return (
    <Box>
      <Stack alignItems='center' direction='row' spacing={ 0.75 } sx={ { mb: 0.75 } }>
        <Typography sx={ { typography: 'bodySm', fontWeight: 500 } }>
          {label}
          {isRequired ? (
            <Box component='span' sx={ { color: 'error.main', ml: 0.5 } }>
              *
            </Box>
          ) : null}
        </Typography>
        {selectedRule ? (
          <Chip
            color='primary'
            label={ selectedRule.name }
            onDelete={ () => onRuleSelect('') }
            size='small'
            variant='outlined'
          />
        ) : null}
      </Stack>

      {!selectedRule ? (
        <Autocomplete<string, false, false, true>
          forcePopupIcon
          freeSolo
          fullWidth
          inputValue={ value }
          onChange={ (_, nextValue, reason) => {
            if (reason !== 'selectOption' || !nextValue) {
              return;
            }

            const selectedRuleOption = ruleOptions.find((option) => option.label === nextValue);
            if (selectedRuleOption) {
              onRuleSelect(selectedRuleOption.ruleId);
              return;
            }

            onValueChange(nextValue);
          } }
          onInputChange={ (_, newInputValue, reason) => {
            if (reason === 'reset' || reason === 'selectOption') {
              return;
            }
            onValueChange(newInputValue);
          } }
          options={ optionLabels }
          renderInput={ (params) => (
            <TextField
              { ...params }
              error={ Boolean(errorMessage) }
              helperText={ helperText }
              placeholder={ inputPlaceholder }
              sx={ filledFieldSx }
            />
          ) }
          value={ null }
        />
      ) : (
        <Box>
          <Box
            sx={ {
              ...inputSurfaceSx,
              border: '1px solid',
              borderColor: errorMessage ? 'error.main' : 'divider',
              borderRadius: 1,
              minHeight: 56,
              position: 'relative',
              px: 1,
              py: 0.75,
            } }
          >
            <Box
              ref={ slotRowRef }
              sx={ {
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: 0.5,
                overflowX: 'auto',
                overflowY: 'hidden',
                pb: 0.25,
                pr: showOverflowIndicator ? 4 : 0,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              } }
            >
              {selectedRule.slots.map((slot, index) => {
                const slotValue = slotValues[index] ?? '';
                const slotPlaceholder = buildNamingSlotExample(slot, index);
                const slotOptions = slot.allowedValues;
                const hasDropdown = slotOptions.length > 0;

                return (
                  <Box key={ slot.id } sx={ { alignItems: 'center', display: 'flex', flex: '0 0 auto', gap: 0.5 } }>
                    <Autocomplete<string, false, false, true>
                      autoHighlight
                      forcePopupIcon={ hasDropdown }
                      freeSolo
                      inputValue={ slotValue }
                      onChange={ (_, nextValue) => {
                        updateSlotValue(index, nextValue ?? '');
                      } }
                      onInputChange={ (_, nextValue, reason) => {
                        if (reason === 'reset') {
                          return;
                        }
                        updateSlotValue(index, nextValue);
                      } }
                      openOnFocus={ hasDropdown }
                      options={ slotOptions }
                      renderInput={ (params) => (
                        <TextField
                          { ...params }
                          placeholder={ slotPlaceholder }
                          size='small'
                          sx={ {
                            '& .MuiInputBase-input': {
                              typography: 'codeSm',
                              px: 1,
                              py: 0.5,
                            },
                            '& .MuiOutlinedInput-root': {
                              minHeight: 32,
                            },
                          } }
                        />
                      ) }
                      sx={ {
                        flex: '0 0 auto',
                        width: estimateSlotWidth(slotValue, slotPlaceholder),
                      } }
                      value={ null }
                    />
                    {index < selectedRule.slots.length - 1 ? (
                      <Typography
                        sx={ {
                          color: 'text.secondary',
                          typography: 'codeSm',
                          fontWeight: 500,
                        } }
                      >
                        {selectedRule.delimiter}
                      </Typography>
                    ) : null}
                  </Box>
                );
              })}
            </Box>
            {showOverflowIndicator ? (
              <Box
                sx={ {
                  alignItems: 'center',
                  background: (theme) => `linear-gradient(90deg, transparent 0%, ${theme.palette.background.default} 40%)`,
                  display: 'flex',
                  insetY: 0,
                  pointerEvents: 'none',
                  position: 'absolute',
                  right: 0,
                  width: 30,
                } }
              >
                <Typography
                  sx={ {
                    color: 'text.disabled',
                    typography: 'codeMd',
                    fontWeight: 600,
                    pl: 0.75,
                  } }
                >
                  ...
                </Typography>
              </Box>
            ) : null}
          </Box>
          <Typography
            sx={ {
              color: errorMessage ? 'error.main' : 'text.secondary',
              typography: 'bodyXs',
              minHeight: 20,
              mt: 0.75,
              px: 1.75,
            } }
          >
            {errorMessage || ' '}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default NamingConventionField;
