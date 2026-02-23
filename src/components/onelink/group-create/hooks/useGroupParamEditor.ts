/**
 * Manages scoped parameter rows and derived deep-link parameter views for group-create steps.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  PRESET_FIELDS_BY_SECTION,
  PRESET_FIELD_LABELS,
  PRESET_FIELD_PLACEHOLDERS,
  type SettingsState,
} from '@/lib/providers/SettingsContext';
import {
  areScopesEqual,
  getScopeSpecificity,
  normalizeScopePathPrefixes,
} from '@/components/onelink/group-create/scopeUtils';
import { createClientId } from '@/components/onelink/group-create/treeUtils';
import type { ParamRow, ScopedParamRule } from '@/components/onelink/group-create/types';

type DeepLinkPresetKey = 'af_android_url' | 'af_dp' | 'af_ios_url' | 'af_web_dp';
const GLOBAL_DEEP_LINKING_PARAM_KEYS = PRESET_FIELDS_BY_SECTION.deep_linking_redirection as DeepLinkPresetKey[];
const DEEP_LINK_FIELD_DESCRIPTIONS: Record<DeepLinkPresetKey, string> = {
  af_android_url: 'Redirect destination when the Android app is not installed.',
  af_dp: 'App route to open when the app is installed.',
  af_ios_url: 'Redirect destination when the iOS app is not installed.',
  af_web_dp: 'Fallback destination for desktop and unsupported environments.',
};
const HIERARCHICAL_PARAM_KEYS = new Set(['pid', 'c', 'af_adset', 'af_ad']);

type UseGroupParamEditorArgs = {
  selectedScopePathPrefixes: string[];
  settings: SettingsState;
};

export function useGroupParamEditor({ selectedScopePathPrefixes, settings }: UseGroupParamEditorArgs) {
  const [globalParamRows, setGlobalParamRows] = useState<ParamRow[]>([]);
  const [activeParamKey, setActiveParamKey] = useState('');

  const activeParamScopeHint = selectedScopePathPrefixes.length === 0
    ? 'Current target: all links'
    : `Current target: selected branches (${selectedScopePathPrefixes.length})`;

  const normalizedGlobalParamRows = useMemo(
    () => globalParamRows.map((row) => ({
      ...row,
      key: row.key.trim(),
      scopePathPrefixes: normalizeScopePathPrefixes(row.scopePathPrefixes),
      value: row.value.trim(),
    })),
    [globalParamRows],
  );

  const deepLinkValueOptionsByKey = useMemo<Record<string, string[]>>(
    () => ({
      af_android_url: settings.presets.af_android_url,
      af_dp: settings.presets.af_dp,
      af_ios_url: settings.presets.af_ios_url,
      af_web_dp: settings.presets.af_web_dp,
    }),
    [
      settings.presets.af_android_url,
      settings.presets.af_dp,
      settings.presets.af_ios_url,
      settings.presets.af_web_dp,
    ],
  );

  const deepLinkParamValueByKey = useMemo<Record<string, string>>(() => {
    const byKey: Record<string, string> = {};
    GLOBAL_DEEP_LINKING_PARAM_KEYS.forEach((key) => {
      const matchingRow = [...normalizedGlobalParamRows]
        .reverse()
        .find(
          (row) => row.key === key && areScopesEqual(row.scopePathPrefixes, selectedScopePathPrefixes),
        );
      byKey[key] = matchingRow?.value ?? '';
    });

    return byKey;
  }, [normalizedGlobalParamRows, selectedScopePathPrefixes]);

  const deepLinkFields = useMemo(
    () => GLOBAL_DEEP_LINKING_PARAM_KEYS.map((key) => ({
      description: DEEP_LINK_FIELD_DESCRIPTIONS[key],
      key,
      label: PRESET_FIELD_LABELS[key],
      options: deepLinkValueOptionsByKey[key],
      placeholder: PRESET_FIELD_PLACEHOLDERS[key],
      value: deepLinkParamValueByKey[key] ?? '',
    })),
    [deepLinkParamValueByKey, deepLinkValueOptionsByKey],
  );

  const additionalParamRows = useMemo(
    () => globalParamRows.filter((row) => {
      const normalizedKey = row.key.trim();
      const normalizedScope = normalizeScopePathPrefixes(row.scopePathPrefixes);
      return !GLOBAL_DEEP_LINKING_PARAM_KEYS.includes(normalizedKey as DeepLinkPresetKey)
        && areScopesEqual(normalizedScope, selectedScopePathPrefixes);
    }),
    [globalParamRows, selectedScopePathPrefixes],
  );

  const additionalParamKeyOptions = useMemo(
    () => settings.presets.custom_param_key,
    [settings.presets.custom_param_key],
  );

  const additionalParamValueOptions = useMemo(
    () => settings.presets.custom_param_value,
    [settings.presets.custom_param_value],
  );

  const globalParams = useMemo(
    () => normalizedGlobalParamRows.reduce<Record<string, string>>((accumulator, row) => {
      if (!row.key || !row.value || row.scopePathPrefixes.length > 0 || HIERARCHICAL_PARAM_KEYS.has(row.key)) {
        return accumulator;
      }

      accumulator[row.key] = row.value;
      return accumulator;
    }, {}),
    [normalizedGlobalParamRows],
  );

  const scopedParams = useMemo<ScopedParamRule[]>(
    () => normalizedGlobalParamRows
      .filter((row) => row.key && row.value && row.scopePathPrefixes.length > 0 && !HIERARCHICAL_PARAM_KEYS.has(row.key))
      .map((row) => ({
        key: row.key,
        scopePathPrefixes: row.scopePathPrefixes,
        value: row.value,
      })),
    [normalizedGlobalParamRows],
  );

  const sortedScopedParams = useMemo(
    () => scopedParams
      .map((rule, index) => ({
        ...rule,
        originalIndex: index,
        specificity: getScopeSpecificity(rule.scopePathPrefixes),
      }))
      .sort((first, second) => {
        if (first.specificity !== second.specificity) {
          return first.specificity - second.specificity;
        }
        return first.originalIndex - second.originalIndex;
      }),
    [scopedParams],
  );

  const addParamRow = useCallback(() => {
    setGlobalParamRows((previous) => [
      ...previous,
      { id: createClientId(), key: '', scopePathPrefixes: selectedScopePathPrefixes, value: '' },
    ]);
  }, [selectedScopePathPrefixes]);

  const updateParamRow = useCallback((rowId: string, field: 'key' | 'value', value: string) => {
    setGlobalParamRows((previous) => previous.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      return {
        ...row,
        scopePathPrefixes: selectedScopePathPrefixes,
        [field]: value,
      };
    }));
  }, [selectedScopePathPrefixes]);

  const removeParamRow = useCallback((rowId: string) => {
    setGlobalParamRows((previous) => previous.filter((row) => row.id !== rowId));
  }, []);

  const setDeepLinkParamValue = useCallback((paramKey: string, value: string) => {
    setGlobalParamRows((previous) => {
      const nextRows = previous.filter(
        (row) =>
          !(row.key.trim() === paramKey && areScopesEqual(normalizeScopePathPrefixes(row.scopePathPrefixes), selectedScopePathPrefixes)),
      );
      if (!value.trim()) {
        return nextRows;
      }
      return [
        ...nextRows,
        { id: createClientId(), key: paramKey, scopePathPrefixes: selectedScopePathPrefixes, value },
      ];
    });
  }, [selectedScopePathPrefixes]);

  return {
    activeParamKey,
    activeParamScopeHint,
    additionalParamKeyOptions,
    additionalParamRows,
    additionalParamValueOptions,
    addParamRow,
    deepLinkFields,
    globalParamRows,
    globalParams,
    normalizedGlobalParamRows,
    removeParamRow,
    scopedParams,
    setActiveParamKey,
    setDeepLinkParamValue,
    setGlobalParamRows,
    sortedScopedParams,
    updateParamRow,
  };
}
