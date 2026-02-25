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
  doesPathMatchScope,
  getScopeSpecificity,
  normalizeScopePathPrefixes,
} from '@/components/onelink/group-create/scopeUtils';
import { createClientId } from '@/components/onelink/group-create/treeUtils';
import type { ParamRow, ScopedParamRule } from '@/components/onelink/group-create/types';

type DeepLinkPresetKey = 'af_android_url' | 'af_dp' | 'af_ios_url' | 'af_web_dp';
const GLOBAL_DEEP_LINKING_PARAM_KEYS = PRESET_FIELDS_BY_SECTION.deep_linking_redirection as DeepLinkPresetKey[];
const FORCE_DEEPLINK_PARAM_KEY = 'af_force_deeplink';
const RETARGETING_PARAM_KEY = 'is_retargeting';
const DEEP_LINK_FIELD_DESCRIPTIONS: Record<DeepLinkPresetKey, string> = {
  af_android_url: 'Redirect destination when the Android app is not installed.',
  af_dp: 'App route to open when the app is installed.',
  af_ios_url: 'Redirect destination when the iOS app is not installed.',
  af_web_dp: 'Fallback destination for desktop and unsupported environments.',
};
const HIERARCHICAL_PARAM_KEYS = new Set(['pid', 'c', 'af_adset', 'af_ad']);
const INHERITED_ROW_ID_PREFIX = '__inherited__::';

function toBooleanFlag(value: string | null | undefined): boolean {
  const normalized = value?.trim().toLowerCase() || '';
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

type UseGroupParamEditorArgs = {
  selectedScopePathPrefixes: string[];
  settings: SettingsState;
};

export function useGroupParamEditor({ selectedScopePathPrefixes, settings }: UseGroupParamEditorArgs) {
  const [globalParamRows, setGlobalParamRows] = useState<ParamRow[]>(() => [
    {
      id: createClientId(),
      isDisabled: false,
      key: RETARGETING_PARAM_KEY,
      scopePathPrefixes: [],
      value: 'true',
    },
  ]);
  const [activeParamKey, setActiveParamKey] = useState('');
  const normalizedSelectedScopePathPrefixes = useMemo(
    () => normalizeScopePathPrefixes(selectedScopePathPrefixes),
    [selectedScopePathPrefixes],
  );

  const activeParamScopeHint = normalizedSelectedScopePathPrefixes.length === 0
    ? 'Current target: all links'
    : `Current target: selected branches (${normalizedSelectedScopePathPrefixes.length})`;

  const normalizedGlobalParamRows = useMemo(
    () => globalParamRows.map((row) => ({
      ...row,
      isDisabled: Boolean(row.isDisabled),
      key: row.key.trim(),
      scopePathPrefixes: normalizeScopePathPrefixes(row.scopePathPrefixes),
      value: row.value.trim(),
    })),
    [globalParamRows],
  );
  const sortedNormalizedParamRows = useMemo(
    () => normalizedGlobalParamRows
      .filter((row) => row.key && !HIERARCHICAL_PARAM_KEYS.has(row.key))
      .map((row, index) => ({
        ...row,
        originalIndex: index,
        specificity: getScopeSpecificity(row.scopePathPrefixes),
      }))
      .sort((first, second) => {
        if (first.specificity !== second.specificity) {
          return first.specificity - second.specificity;
        }
        return first.originalIndex - second.originalIndex;
      }),
    [normalizedGlobalParamRows],
  );

  const resolveScopedValue = useCallback((key: string): string | null | undefined => {
    if (!key.trim()) {
      return undefined;
    }

    if (normalizedSelectedScopePathPrefixes.length === 0) {
      const matchingRow = [...normalizedGlobalParamRows]
        .reverse()
        .find((row) => row.key === key && row.scopePathPrefixes.length === 0);
      if (!matchingRow || matchingRow.isDisabled || !matchingRow.value) {
        return undefined;
      }
      return matchingRow.value;
    }

    const resolvedByPath = normalizedSelectedScopePathPrefixes.map((pathLabel) => {
      let resolvedValue: string | undefined;

      sortedNormalizedParamRows.forEach((row) => {
        if (row.key !== key || !doesPathMatchScope(pathLabel, row.scopePathPrefixes)) {
          return;
        }

        if (row.isDisabled) {
          resolvedValue = undefined;
          return;
        }

        if (!row.value) {
          return;
        }

        resolvedValue = row.value;
      });

      return resolvedValue;
    });

    const uniqueResolvedValues = Array.from(new Set(
      resolvedByPath.filter((value): value is string => typeof value === 'string' && value.length > 0),
    ));
    if (uniqueResolvedValues.length === 0) {
      return undefined;
    }
    if (uniqueResolvedValues.length === 1) {
      return uniqueResolvedValues[0];
    }

    return null;
  }, [normalizedGlobalParamRows, normalizedSelectedScopePathPrefixes, sortedNormalizedParamRows]);

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
      const resolvedValue = resolveScopedValue(key);
      byKey[key] = resolvedValue && resolvedValue !== null ? resolvedValue : '';
    });

    return byKey;
  }, [resolveScopedValue]);

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
  const forceDeeplink = useMemo(
    () => toBooleanFlag(resolveScopedValue(FORCE_DEEPLINK_PARAM_KEY)),
    [resolveScopedValue],
  );
  const isRetargeting = useMemo(
    () => toBooleanFlag(resolveScopedValue(RETARGETING_PARAM_KEY)),
    [resolveScopedValue],
  );

  const explicitAdditionalRowsForSelectedScope = useMemo(
    () => globalParamRows.filter((row) => {
      const normalizedKey = row.key.trim();
      const normalizedScope = normalizeScopePathPrefixes(row.scopePathPrefixes);
      return !GLOBAL_DEEP_LINKING_PARAM_KEYS.includes(normalizedKey as DeepLinkPresetKey)
        && normalizedKey !== FORCE_DEEPLINK_PARAM_KEY
        && normalizedKey !== RETARGETING_PARAM_KEY
        && !HIERARCHICAL_PARAM_KEYS.has(normalizedKey)
        && areScopesEqual(normalizedScope, normalizedSelectedScopePathPrefixes);
    }),
    [globalParamRows, normalizedSelectedScopePathPrefixes],
  );
  const inheritedAdditionalParamValueByKey = useMemo(() => {
    if (normalizedSelectedScopePathPrefixes.length === 0) {
      return new Map<string, string>();
    }

    const explicitKeys = new Set(
      explicitAdditionalRowsForSelectedScope
        .map((row) => row.key.trim())
        .filter(Boolean),
    );
    const candidateKeys = Array.from(
      new Set(
        normalizedGlobalParamRows
          .map((row) => row.key)
          .filter(
            (key) =>
              key
              && key !== FORCE_DEEPLINK_PARAM_KEY
              && key !== RETARGETING_PARAM_KEY
              && !GLOBAL_DEEP_LINKING_PARAM_KEYS.includes(key as DeepLinkPresetKey)
              && !HIERARCHICAL_PARAM_KEYS.has(key),
          ),
      ),
    );
    const inheritedMap = new Map<string, string>();

    candidateKeys.forEach((key) => {
      if (explicitKeys.has(key)) {
        return;
      }
      const resolvedValue = resolveScopedValue(key);
      if (typeof resolvedValue !== 'string' || !resolvedValue) {
        return;
      }
      inheritedMap.set(key, resolvedValue);
    });

    return inheritedMap;
  }, [
    explicitAdditionalRowsForSelectedScope,
    normalizedGlobalParamRows,
    normalizedSelectedScopePathPrefixes.length,
    resolveScopedValue,
  ]);
  const additionalParamRows = useMemo(
    () => [
      ...explicitAdditionalRowsForSelectedScope,
      ...Array.from(inheritedAdditionalParamValueByKey.entries())
        .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
        .map(([key, value]) => ({
          id: `${INHERITED_ROW_ID_PREFIX}${key}`,
          isDisabled: false,
          key,
          scopePathPrefixes: normalizedSelectedScopePathPrefixes,
          value,
        })),
    ],
    [
      explicitAdditionalRowsForSelectedScope,
      inheritedAdditionalParamValueByKey,
      normalizedSelectedScopePathPrefixes,
    ],
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
      if (
        !row.key
        || row.isDisabled
        || !row.value
        || row.scopePathPrefixes.length > 0
        || HIERARCHICAL_PARAM_KEYS.has(row.key)
      ) {
        return accumulator;
      }

      accumulator[row.key] = row.value;
      return accumulator;
    }, {}),
    [normalizedGlobalParamRows],
  );

  const scopedParams = useMemo<ScopedParamRule[]>(
    () => normalizedGlobalParamRows
      .filter(
        (row) =>
          row.key
          && row.scopePathPrefixes.length > 0
          && !HIERARCHICAL_PARAM_KEYS.has(row.key)
          && (row.value || row.isDisabled),
      )
      .map((row) => ({
        isDisabled: row.isDisabled || undefined,
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
      {
        id: createClientId(),
        isDisabled: false,
        key: '',
        scopePathPrefixes: normalizedSelectedScopePathPrefixes,
        value: '',
      },
    ]);
  }, [normalizedSelectedScopePathPrefixes]);

  const removeRowsForKeyAtSelectedScope = useCallback((rows: ParamRow[], key: string): ParamRow[] => rows.filter(
    (row) => !(row.key.trim() === key && areScopesEqual(
      normalizeScopePathPrefixes(row.scopePathPrefixes),
      normalizedSelectedScopePathPrefixes,
    )),
  ), [normalizedSelectedScopePathPrefixes]);

  const applyValueToSelectedScope = useCallback((rows: ParamRow[], key: string, rawValue: string): ParamRow[] => {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      return rows;
    }

    const nextRows = removeRowsForKeyAtSelectedScope(rows, normalizedKey);
    const normalizedValue = rawValue.trim();

    if (normalizedSelectedScopePathPrefixes.length === 0) {
      if (!normalizedValue) {
        return nextRows;
      }

      return [
        ...nextRows,
        {
          id: createClientId(),
          isDisabled: false,
          key: normalizedKey,
          scopePathPrefixes: [],
          value: rawValue,
        },
      ];
    }

    if (!normalizedValue) {
      return [
        ...nextRows,
        {
          id: createClientId(),
          isDisabled: true,
          key: normalizedKey,
          scopePathPrefixes: normalizedSelectedScopePathPrefixes,
          value: '',
        },
      ];
    }

    return [
      ...nextRows,
      {
        id: createClientId(),
        isDisabled: false,
        key: normalizedKey,
        scopePathPrefixes: normalizedSelectedScopePathPrefixes,
        value: rawValue,
      },
    ];
  }, [normalizedSelectedScopePathPrefixes, removeRowsForKeyAtSelectedScope]);

  const updateParamRow = useCallback((rowId: string, field: 'key' | 'value', value: string) => {
    setGlobalParamRows((previous) => {
      const existingRow = previous.find((row) => row.id === rowId);
      if (existingRow) {
        const nextRows = previous.filter((row) => row.id !== rowId);
        const nextRow = {
          ...existingRow,
          isDisabled: false,
          scopePathPrefixes: normalizedSelectedScopePathPrefixes,
          [field]: value,
        };
        const normalizedNextKey = nextRow.key.trim();
        const normalizedNextValue = nextRow.value.trim();

        if (
          field === 'value'
          && normalizedSelectedScopePathPrefixes.length > 0
          && normalizedNextKey
          && !normalizedNextValue
        ) {
          return applyValueToSelectedScope(nextRows, normalizedNextKey, '');
        }

        if (
          field === 'key'
          && existingRow.isDisabled
          && normalizedSelectedScopePathPrefixes.length > 0
          && normalizedNextKey
          && !normalizedNextValue
        ) {
          nextRow.isDisabled = true;
          nextRow.value = '';
        }

        const dedupedRows = normalizedNextKey
          ? removeRowsForKeyAtSelectedScope(nextRows, normalizedNextKey)
          : nextRows;
        return [...dedupedRows, nextRow];
      }

      if (!rowId.startsWith(INHERITED_ROW_ID_PREFIX)) {
        return previous;
      }

      const inheritedKey = rowId.slice(INHERITED_ROW_ID_PREFIX.length).trim();
      if (!inheritedKey) {
        return previous;
      }

      if (field === 'value') {
        return applyValueToSelectedScope(previous, inheritedKey, value);
      }

      const inheritedValue = inheritedAdditionalParamValueByKey.get(inheritedKey) ?? '';
      const materializedRow: ParamRow = {
        id: createClientId(),
        isDisabled: false,
        key: value,
        scopePathPrefixes: normalizedSelectedScopePathPrefixes,
        value: inheritedValue,
      };
      const normalizedMaterializedKey = materializedRow.key.trim();
      const withoutInheritedKey = removeRowsForKeyAtSelectedScope(previous, inheritedKey);
      const dedupedRows = normalizedMaterializedKey
        ? removeRowsForKeyAtSelectedScope(withoutInheritedKey, normalizedMaterializedKey)
        : withoutInheritedKey;
      return [...dedupedRows, materializedRow];
    });
  }, [
    applyValueToSelectedScope,
    inheritedAdditionalParamValueByKey,
    normalizedSelectedScopePathPrefixes,
    removeRowsForKeyAtSelectedScope,
  ]);

  const removeParamRow = useCallback((rowId: string) => {
    setGlobalParamRows((previous) => {
      const existingRow = previous.find((row) => row.id === rowId);

      if (existingRow) {
        const nextRows = previous.filter((row) => row.id !== rowId);
        const normalizedKey = existingRow.key.trim();
        if (normalizedSelectedScopePathPrefixes.length === 0 || !normalizedKey) {
          return nextRows;
        }
        if (existingRow.isDisabled || !existingRow.value.trim()) {
          return nextRows;
        }
        return applyValueToSelectedScope(nextRows, normalizedKey, '');
      }

      if (!rowId.startsWith(INHERITED_ROW_ID_PREFIX) || normalizedSelectedScopePathPrefixes.length === 0) {
        return previous;
      }

      const inheritedKey = rowId.slice(INHERITED_ROW_ID_PREFIX.length).trim();
      if (!inheritedKey) {
        return previous;
      }
      return applyValueToSelectedScope(previous, inheritedKey, '');
    });
  }, [applyValueToSelectedScope, normalizedSelectedScopePathPrefixes.length]);

  const setDeepLinkParamValue = useCallback((paramKey: string, value: string) => {
    setGlobalParamRows((previous) => applyValueToSelectedScope(previous, paramKey, value));
  }, [applyValueToSelectedScope]);
  const setForceDeeplink = useCallback((checked: boolean) => {
    setGlobalParamRows((previous) => applyValueToSelectedScope(previous, FORCE_DEEPLINK_PARAM_KEY, checked ? 'true' : ''));
  }, [applyValueToSelectedScope]);
  const setRetargeting = useCallback((checked: boolean) => {
    setGlobalParamRows((previous) => applyValueToSelectedScope(previous, RETARGETING_PARAM_KEY, checked ? 'true' : ''));
  }, [applyValueToSelectedScope]);

  return {
    activeParamKey,
    activeParamScopeHint,
    additionalParamKeyOptions,
    additionalParamRows,
    additionalParamValueOptions,
    addParamRow,
    deepLinkFields,
    forceDeeplink,
    isRetargeting,
    globalParamRows,
    globalParams,
    normalizedGlobalParamRows,
    removeParamRow,
    scopedParams,
    setActiveParamKey,
    setDeepLinkParamValue,
    setForceDeeplink,
    setRetargeting,
    setGlobalParamRows,
    sortedScopedParams,
    updateParamRow,
  };
}
