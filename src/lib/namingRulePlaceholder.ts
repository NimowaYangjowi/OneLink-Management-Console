/**
 * Helpers to build user-facing naming-rule example strings and guided overlays.
 */

import type { NamingConventionRule, NamingConventionSlotRule } from '@/lib/settingsSchema';

const UNKNOWN_SLOT_FALLBACK_PREFIX = 'EX';

function toSafePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizeRegexPattern(pattern: string): string {
  let normalized = pattern.trim();
  normalized = normalized.replace(/^\^/, '').replace(/\$$/, '');
  return normalized;
}

function extractSingleAlternative(pattern: string): string {
  const exactAlternatives = pattern.match(/^\(\?:([^()]+)\)$/);
  if (!exactAlternatives) {
    return '';
  }
  const first = exactAlternatives[1]?.split('|')[0]?.trim() ?? '';
  return first.replace(/\\([\\.^$|?*+()[\]{}-])/g, '$1');
}

export function buildRegexExampleFromPattern(pattern: string): string {
  const normalized = normalizeRegexPattern(pattern);
  if (!normalized) {
    return '';
  }

  const alternative = extractSingleAlternative(normalized);
  if (alternative) {
    return alternative;
  }

  let sample = normalized;
  sample = sample
    .replace(/\\d\{(\d+)(?:,\d+)?\}/g, (_, min) => '1'.repeat(toSafePositiveInt(min, 1)))
    .replace(/\[A-Z\]\{(\d+)(?:,\d+)?\}/g, (_, min) => 'A'.repeat(toSafePositiveInt(min, 1)))
    .replace(/\[a-z\]\{(\d+)(?:,\d+)?\}/g, (_, min) => 'a'.repeat(toSafePositiveInt(min, 1)))
    .replace(/\[A-Za-z\]\{(\d+)(?:,\d+)?\}/g, (_, min) => 'Aa'.repeat(toSafePositiveInt(min, 1)).slice(0, toSafePositiveInt(min, 1)))
    .replace(/\[A-Za-z0-9\]\{(\d+)(?:,\d+)?\}/g, (_, min) => 'A1'.repeat(toSafePositiveInt(min, 1)).slice(0, toSafePositiveInt(min, 1)))
    .replace(/\\d\+/g, '11')
    .replace(/\[A-Z\]\+/g, 'AA')
    .replace(/\[a-z\]\+/g, 'aa')
    .replace(/\[A-Za-z\]\+/g, 'Aa')
    .replace(/\[A-Za-z0-9\]\+/g, 'A1')
    .replace(/\\d/g, '1')
    .replace(/\[A-Z\]/g, 'A')
    .replace(/\[a-z\]/g, 'a')
    .replace(/\[A-Za-z\]/g, 'Aa')
    .replace(/\[A-Za-z0-9\]/g, 'A1')
    .replace(/\\([\\.^$|?*+()[\]{}-])/g, '$1')
    .replace(/[()[\]{}?+*|]/g, '');

  return sample.trim();
}

export function buildNamingSlotExample(slot: NamingConventionSlotRule, index: number): string {
  const firstAllowedValue = slot.allowedValues[0]?.trim() ?? '';
  if (firstAllowedValue) {
    return firstAllowedValue;
  }

  const regexExample = buildRegexExampleFromPattern(slot.pattern);
  if (regexExample) {
    return regexExample;
  }

  const normalizedLabel = slot.label
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '');
  if (normalizedLabel) {
    return normalizedLabel;
  }

  return `${UNKNOWN_SLOT_FALLBACK_PREFIX}${index + 1}`;
}

export function buildNamingRuleExample(rule: NamingConventionRule): string {
  if (rule.slots.length === 0) {
    return '';
  }
  return rule.slots.map((slot, index) => buildNamingSlotExample(slot, index)).join(rule.delimiter);
}

export type NamingOverlayToken = {
  filled: boolean;
  text: string;
};

export function buildNamingRuleOverlayTokens(
  rule: NamingConventionRule,
  rawValue: string,
): NamingOverlayToken[] {
  if (rule.slots.length === 0) {
    return [{ filled: true, text: rawValue }];
  }

  const valueParts = rawValue.split(rule.delimiter);
  if (valueParts.length > rule.slots.length) {
    return [{ filled: true, text: rawValue }];
  }

  const tokens: NamingOverlayToken[] = [];
  rule.slots.forEach((slot, index) => {
    const typedValue = valueParts[index] ?? '';
    const filled = typedValue.length > 0;
    tokens.push({
      filled,
      text: filled ? typedValue : buildNamingSlotExample(slot, index),
    });
    if (index < rule.slots.length - 1) {
      tokens.push({ filled: true, text: rule.delimiter });
    }
  });

  return tokens;
}
