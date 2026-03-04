/**
 * Shared naming-convention composition and validation helpers for OneLink fields.
 */

import type {
  NamingConventionRule,
  NamingConventionSlotRule,
  NamingConventionTargetField,
} from '@/lib/settingsSchema';

export type NamingConventionValidationErrorCode =
  | 'SLOT_COUNT_MISMATCH'
  | 'SLOT_REQUIRED'
  | 'SLOT_DELIMITER_NOT_ALLOWED'
  | 'SLOT_LENGTH_EXCEEDED'
  | 'SLOT_VALUE_NOT_ALLOWED'
  | 'SLOT_REGEX_INVALID'
  | 'SLOT_REGEX_MISMATCH';

export interface NamingConventionValidationError {
  code: NamingConventionValidationErrorCode;
  expected?: string;
  field: NamingConventionTargetField;
  message: string;
  slotIndex?: number;
  slotLabel?: string;
}

type SlotValuesInput = Record<string, string> | string[];

function escapeRegexLiteral(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function allValuesMatch(values: string[], pattern: RegExp): boolean {
  return values.every((value) => pattern.test(value));
}

function buildLengthQuantifier(minLength: number, maxLength: number): string {
  if (minLength === maxLength) {
    return `{${minLength}}`;
  }
  return `{${minLength},${maxLength}}`;
}

function longestCommonPrefix(values: string[]): string {
  if (values.length === 0) {
    return '';
  }

  let prefix = values[0] ?? '';
  for (let index = 1; index < values.length; index += 1) {
    const candidate = values[index] ?? '';
    let cursor = 0;
    while (cursor < prefix.length && cursor < candidate.length && prefix[cursor] === candidate[cursor]) {
      cursor += 1;
    }
    prefix = prefix.slice(0, cursor);
    if (!prefix) {
      break;
    }
  }

  return prefix;
}

function longestCommonSuffix(values: string[]): string {
  if (values.length === 0) {
    return '';
  }

  const reversed = values.map((value) => value.split('').reverse().join(''));
  return longestCommonPrefix(reversed).split('').reverse().join('');
}

function inferRegexUnitForCharacters(characters: string[]): string | null {
  if (characters.length === 0) {
    return null;
  }

  const uniqueCharacters = new Set(characters);
  if (uniqueCharacters.size === 1) {
    const first = characters[0];
    return first ? escapeRegexLiteral(first) : null;
  }

  if (characters.every((char) => /^\d$/.test(char))) {
    return '\\d';
  }
  if (characters.every((char) => /^[A-Z]$/.test(char))) {
    return '[A-Z]';
  }
  if (characters.every((char) => /^[a-z]$/.test(char))) {
    return '[a-z]';
  }
  if (characters.every((char) => /^[A-Za-z]$/.test(char))) {
    return '[A-Za-z]';
  }
  if (characters.every((char) => /^[A-Za-z0-9]$/.test(char))) {
    return '[A-Za-z0-9]';
  }

  return null;
}

function compressRegexUnits(units: string[]): string {
  if (units.length === 0) {
    return '';
  }

  const compressed: string[] = [];
  let runUnit = units[0] ?? '';
  let runCount = 1;

  for (let index = 1; index < units.length; index += 1) {
    const unit = units[index] ?? '';
    if (unit === runUnit) {
      runCount += 1;
      continue;
    }

    compressed.push(runCount > 1 ? `${runUnit}{${runCount}}` : runUnit);
    runUnit = unit;
    runCount = 1;
  }

  compressed.push(runCount > 1 ? `${runUnit}{${runCount}}` : runUnit);
  return compressed.join('');
}

function inferPatternFromEqualLengthSamples(values: string[]): string | null {
  if (values.length === 0) {
    return null;
  }

  const sampleLength = values[0]?.length ?? 0;
  if (sampleLength === 0 || !values.every((value) => value.length === sampleLength)) {
    return null;
  }

  const units: string[] = [];
  for (let index = 0; index < sampleLength; index += 1) {
    const characters = values.map((value) => value[index] ?? '');
    const unit = inferRegexUnitForCharacters(characters);
    if (!unit) {
      return null;
    }
    units.push(unit);
  }

  return `^${compressRegexUnits(units)}$`;
}

function inferCharacterClass(values: string[]): string {
  let hasUpper = false;
  let hasLower = false;
  let hasDigit = false;
  const literals = new Set<string>();

  values.forEach((value) => {
    for (const character of value) {
      if (/^[A-Z]$/.test(character)) {
        hasUpper = true;
      } else if (/^[a-z]$/.test(character)) {
        hasLower = true;
      } else if (/^\d$/.test(character)) {
        hasDigit = true;
      } else if (character === '-') {
        literals.add('\\-');
      } else if (character === '.') {
        literals.add('\\.');
      } else if (character === '_') {
        literals.add('_');
      } else {
        literals.add(escapeRegexLiteral(character));
      }
    }
  });

  const classParts: string[] = [];
  if (hasUpper) {
    classParts.push('A-Z');
  }
  if (hasLower) {
    classParts.push('a-z');
  }
  if (hasDigit) {
    classParts.push('0-9');
  }
  classParts.push(...[...literals].sort());

  return classParts.length > 0 ? `[${classParts.join('')}]` : '.';
}

/**
 * inferRegexPatternFromSamples - Builds a practical regex pattern from sample values.
 */
export function inferRegexPatternFromSamples(sampleValues: string[]): string {
  const uniqueValues = [...new Set(sampleValues.map((value) => value.trim()).filter(Boolean))];
  if (uniqueValues.length === 0) {
    return '^$';
  }

  if (uniqueValues.length === 1) {
    return `^${escapeRegexLiteral(uniqueValues[0] ?? '')}$`;
  }

  if (allValuesMatch(uniqueValues, /^\d+$/)) {
    const lengths = uniqueValues.map((value) => value.length);
    return `^\\d${buildLengthQuantifier(Math.min(...lengths), Math.max(...lengths))}$`;
  }
  if (allValuesMatch(uniqueValues, /^[A-Z]+$/)) {
    const lengths = uniqueValues.map((value) => value.length);
    return `^[A-Z]${buildLengthQuantifier(Math.min(...lengths), Math.max(...lengths))}$`;
  }
  if (allValuesMatch(uniqueValues, /^[a-z]+$/)) {
    const lengths = uniqueValues.map((value) => value.length);
    return `^[a-z]${buildLengthQuantifier(Math.min(...lengths), Math.max(...lengths))}$`;
  }

  const equalLengthPattern = inferPatternFromEqualLengthSamples(uniqueValues);
  if (equalLengthPattern) {
    return equalLengthPattern;
  }

  const prefix = longestCommonPrefix(uniqueValues);
  const suffix = longestCommonSuffix(uniqueValues);
  const middleValues = uniqueValues.map((value) => value.slice(prefix.length, value.length - suffix.length));

  if (
    middleValues.length > 0
    && middleValues.every((value) => value.length > 0)
    && allValuesMatch(middleValues, /^\d+$/)
  ) {
    const middleLengths = middleValues.map((value) => value.length);
    return `^${escapeRegexLiteral(prefix)}\\d${buildLengthQuantifier(
      Math.min(...middleLengths),
      Math.max(...middleLengths),
    )}${escapeRegexLiteral(suffix)}$`;
  }

  const fallbackLengths = uniqueValues.map((value) => value.length);
  if (uniqueValues.length > 20) {
    const classPattern = inferCharacterClass(uniqueValues);
    return `^${classPattern}${buildLengthQuantifier(Math.min(...fallbackLengths), Math.max(...fallbackLengths))}$`;
  }

  return `^(?:${uniqueValues.map((value) => escapeRegexLiteral(value)).join('|')})$`;
}

function normalizeSlotInputValue(slot: NamingConventionSlotRule, value: string): string {
  const trimmed = value.trim();
  if (slot.mode === 'select') {
    return trimmed.toLowerCase();
  }

  return trimmed;
}

function getSlotRawValue(slot: NamingConventionSlotRule, slotIndex: number, slotValues: SlotValuesInput): string {
  if (Array.isArray(slotValues)) {
    return typeof slotValues[slotIndex] === 'string' ? slotValues[slotIndex] : '';
  }

  return typeof slotValues[slot.id] === 'string' ? slotValues[slot.id] : '';
}

/**
 * composeValueFromSlots - Composes a final field value from slot values using the rule delimiter.
 */
export function composeValueFromSlots(rule: NamingConventionRule, slotValues: SlotValuesInput): string {
  return rule.slots
    .map((slot, index) => normalizeSlotInputValue(slot, getSlotRawValue(slot, index, slotValues)))
    .join(rule.delimiter);
}

/**
 * splitValueToSlots - Splits a raw composed value into slot-sized values.
 */
export function splitValueToSlots(rule: NamingConventionRule, rawValue: string): string[] {
  if (!rawValue.trim()) {
    return rule.slots.map(() => '');
  }

  const parts = rawValue.split(rule.delimiter);
  if (parts.length !== rule.slots.length) {
    return [];
  }

  return parts.map((part) => part.trim());
}

/**
 * validateSlotValues - Validates slot values against rule constraints.
 */
export function validateSlotValues(
  rule: NamingConventionRule,
  slotValues: SlotValuesInput,
): {
  errors: NamingConventionValidationError[];
  normalizedSlots: string[];
  valid: boolean;
} {
  const errors: NamingConventionValidationError[] = [];
  const normalizedSlots = rule.slots.map((slot, index) => normalizeSlotInputValue(slot, getSlotRawValue(slot, index, slotValues)));

  rule.slots.forEach((slot, index) => {
    const slotValue = normalizedSlots[index];
    const slotIndex = index + 1;
    const slotLabel = slot.label;

    if (!slotValue) {
      if (slot.required) {
        errors.push({
          code: 'SLOT_REQUIRED',
          field: rule.field,
          message: `Slot ${slotIndex} (${slotLabel}) is required.`,
          slotIndex,
          slotLabel,
        });
      }
      return;
    }

    if (slotValue.includes(rule.delimiter)) {
      errors.push({
        code: 'SLOT_DELIMITER_NOT_ALLOWED',
        expected: `Must not include delimiter "${rule.delimiter}".`,
        field: rule.field,
        message: `Slot ${slotIndex} (${slotLabel}) must not include delimiter "${rule.delimiter}".`,
        slotIndex,
        slotLabel,
      });
    }

    if (slotValue.length > slot.maxLength) {
      errors.push({
        code: 'SLOT_LENGTH_EXCEEDED',
        expected: `<= ${slot.maxLength}`,
        field: rule.field,
        message: `Slot ${slotIndex} (${slotLabel}) exceeds max length ${slot.maxLength}.`,
        slotIndex,
        slotLabel,
      });
    }

    if (slot.mode === 'select') {
      if (!slot.allowedValues.includes(slotValue)) {
        errors.push({
          code: 'SLOT_VALUE_NOT_ALLOWED',
          expected: slot.allowedValues.join(', '),
          field: rule.field,
          message: `Slot ${slotIndex} (${slotLabel}) must be one of allowed values.`,
          slotIndex,
          slotLabel,
        });
      }
      return;
    }

    if (slot.mode === 'regex') {
      if (!slot.pattern) {
        errors.push({
          code: 'SLOT_REGEX_INVALID',
          field: rule.field,
          message: `Slot ${slotIndex} (${slotLabel}) has no regex pattern configured.`,
          slotIndex,
          slotLabel,
        });
        return;
      }

      let expression: RegExp;
      try {
        expression = new RegExp(slot.pattern);
      } catch {
        errors.push({
          code: 'SLOT_REGEX_INVALID',
          expected: slot.pattern,
          field: rule.field,
          message: `Slot ${slotIndex} (${slotLabel}) regex pattern is invalid.`,
          slotIndex,
          slotLabel,
        });
        return;
      }

      if (!expression.test(slotValue)) {
        errors.push({
          code: 'SLOT_REGEX_MISMATCH',
          expected: slot.pattern,
          field: rule.field,
          message: `Slot ${slotIndex} (${slotLabel}) does not match regex.`,
          slotIndex,
          slotLabel,
        });
      }
    }
  });

  return {
    errors,
    normalizedSlots,
    valid: errors.length === 0,
  };
}

/**
 * validateValueAgainstRule - Validates one composed value against a naming rule.
 */
export function validateValueAgainstRule(
  rule: NamingConventionRule,
  value: string,
): {
  errors: NamingConventionValidationError[];
  normalizedSlots: string[];
  valid: boolean;
} {
  const splitSlots = splitValueToSlots(rule, value);
  if (splitSlots.length !== rule.slots.length) {
    return {
      errors: [{
        code: 'SLOT_COUNT_MISMATCH',
        expected: `${rule.slots.length} slots`,
        field: rule.field,
        message: `${rule.field} must have exactly ${rule.slots.length} slots separated by "${rule.delimiter}".`,
      }],
      normalizedSlots: [],
      valid: false,
    };
  }

  return validateSlotValues(rule, splitSlots);
}

/**
 * validateOneLinkDataByNamingRules - Validates OneLink payload fields against active naming rules.
 */
export function validateOneLinkDataByNamingRules(
  oneLinkData: Record<string, string>,
  rules: Partial<Record<NamingConventionTargetField, NamingConventionRule>>,
): {
  errors: NamingConventionValidationError[];
  normalizedData: Record<string, string>;
  valid: boolean;
} {
  const errors: NamingConventionValidationError[] = [];
  const normalizedData = { ...oneLinkData };

  Object.values(rules).forEach((rule) => {
    if (!rule || !rule.enabled) {
      return;
    }

    const rawValue = oneLinkData[rule.field];
    if (typeof rawValue !== 'string' || !rawValue.trim()) {
      return;
    }

    const result = validateValueAgainstRule(rule, rawValue);
    if (!result.valid) {
      errors.push(...result.errors);
      return;
    }

    normalizedData[rule.field] = composeValueFromSlots(rule, result.normalizedSlots);
  });

  return {
    errors,
    normalizedData,
    valid: errors.length === 0,
  };
}
