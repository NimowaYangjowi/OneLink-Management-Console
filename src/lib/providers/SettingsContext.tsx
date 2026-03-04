'use client';

/**
 * SettingsContext - Global settings state with API-backed SQLite persistence.
 * Manages OneLink Template IDs and field presets used across the console.
 *
 * Template IDs: 4-character alphanumeric codes (case-sensitive)
 * Template domain cache: subdomain/host metadata discovered by probe link creation
 * Template branded domains: reusable custom domains stored per Template ID
 * Presets: Reusable values for attribution fields (pid, campaign, adset, ad, channel)
 */

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
  type ReactNode,
} from 'react';
import {
  createInitialSettingsState,
  sanitizeNamingConventionRule,
  sanitizeSettingsState,
  validateTemplateIdFormat,
  type NamingConventionRule,
  type NamingConventionTargetField,
  type NamingRuleEnforcementMode,
  type PresetField,
  type SettingsState,
} from '@/lib/settingsSchema';
export {
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
} from '@/lib/settingsSchema';
export type {
  NamingConventionRule,
  NamingConventionSlotRule,
  NamingConventionTargetField,
  NamingDelimiter,
  NamingRuleEnforcementMode,
  PresetField,
  PresetSection,
  SettingsState,
  SlotInputMode,
} from '@/lib/settingsSchema';

type SettingsAction =
  | { type: 'REMOVE_TEMPLATE_ID'; id: string }
  | { type: 'ADD_TEMPLATE_BRANDED_DOMAIN'; templateId: string; domain: string }
  | { type: 'REMOVE_TEMPLATE_BRANDED_DOMAIN'; templateId: string; domain: string }
  | { type: 'ADD_PRESET'; field: PresetField; value: string }
  | { type: 'REMOVE_PRESET'; field: PresetField; value: string }
  | { type: 'UPSERT_NAMING_RULE'; field: NamingConventionTargetField; rule: NamingConventionRule }
  | { type: 'REMOVE_NAMING_RULE'; field: NamingConventionTargetField }
  | { type: 'SET_NAMING_ENFORCEMENT_MODE'; mode: NamingRuleEnforcementMode }
  | { type: 'HYDRATE'; state: SettingsState };

interface SettingsContextValue {
  settings: SettingsState;
  addTemplateId: (id: string) => Promise<{ success: boolean; error?: string }>;
  removeTemplateId: (id: string) => void;
  addTemplateBrandedDomain: (templateId: string, domain: string) => { success: boolean; error?: string };
  removeTemplateBrandedDomain: (templateId: string, domain: string) => void;
  getTemplateBrandedDomains: (templateId: string) => string[];
  addPreset: (field: PresetField, value: string) => { success: boolean; error?: string };
  removePreset: (field: PresetField, value: string) => void;
  getPresets: (field: PresetField) => string[];
  upsertNamingConventionRule: (field: NamingConventionTargetField, rule: NamingConventionRule) => void;
  removeNamingConventionRule: (field: NamingConventionTargetField) => void;
  getNamingConventionRule: (field: NamingConventionTargetField) => NamingConventionRule | null;
  setNamingConventionEnforcementMode: (mode: NamingRuleEnforcementMode) => void;
  validateTemplateId: (id: string) => { valid: boolean; error?: string };
}

const INITIAL_STATE = createInitialSettingsState();

async function persistSettingsToApi(state: SettingsState, signal: AbortSignal): Promise<boolean> {
  try {
    const response = await fetch('/api/settings', {
      body: JSON.stringify(state),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      method: 'PUT',
      signal,
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function addTemplateIdToApi(
  templateId: string,
  signal: AbortSignal,
): Promise<{ state?: SettingsState; error?: string }> {
  try {
    const response = await fetch('/api/settings', {
      body: JSON.stringify({ templateId }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal,
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      const errorMessage =
        payload
        && typeof payload === 'object'
        && typeof (payload as { error?: unknown }).error === 'string'
          ? (payload as { error: string }).error
        : 'Failed to add template ID.';
      return { error: errorMessage };
    }

    return { state: sanitizeSettingsState(payload) };
  } catch {
    return { error: 'Failed to add template ID.' };
  }
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'REMOVE_TEMPLATE_ID': {
      const nextTemplateDomains = { ...state.templateDomains };
      const nextTemplateBrandedDomains = { ...state.templateBrandedDomains };
      delete nextTemplateDomains[action.id];
      delete nextTemplateBrandedDomains[action.id];

      return {
        ...state,
        templateIds: state.templateIds.filter((id) => id !== action.id),
        templateBrandedDomains: nextTemplateBrandedDomains,
        templateDomains: nextTemplateDomains,
      };
    }
    case 'ADD_TEMPLATE_BRANDED_DOMAIN':
      return {
        ...state,
        templateBrandedDomains: {
          ...state.templateBrandedDomains,
          [action.templateId]: [
            ...(state.templateBrandedDomains[action.templateId] ?? []),
            action.domain,
          ],
        },
      };
    case 'REMOVE_TEMPLATE_BRANDED_DOMAIN':
      return {
        ...state,
        templateBrandedDomains: {
          ...state.templateBrandedDomains,
          [action.templateId]: (state.templateBrandedDomains[action.templateId] ?? []).filter(
            (domain) => domain !== action.domain,
          ),
        },
      };
    case 'ADD_PRESET':
      return {
        ...state,
        presets: {
          ...state.presets,
          [action.field]: [...state.presets[action.field], action.value],
        },
      };
    case 'REMOVE_PRESET':
      return {
        ...state,
        presets: {
          ...state.presets,
          [action.field]: state.presets[action.field].filter((v) => v !== action.value),
        },
      };
    case 'UPSERT_NAMING_RULE':
      return {
        ...state,
        namingConvention: {
          ...state.namingConvention,
          rules: {
            ...state.namingConvention.rules,
            [action.field]: sanitizeNamingConventionRule(action.rule, action.field),
          },
        },
      };
    case 'REMOVE_NAMING_RULE': {
      const nextRules = { ...state.namingConvention.rules };
      delete nextRules[action.field];
      return {
        ...state,
        namingConvention: {
          ...state.namingConvention,
          rules: nextRules,
        },
      };
    }
    case 'SET_NAMING_ENFORCEMENT_MODE':
      return {
        ...state,
        namingConvention: {
          ...state.namingConvention,
          enforcementMode: action.mode,
        },
      };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * SettingsProvider
 *
 * Props:
 * @param {ReactNode} children - Child components [Required]
 * @param {SettingsState} initialSettings - Initial server-provided settings state [Optional]
 *
 * Example usage:
 * <SettingsProvider><App /></SettingsProvider>
 */
export function SettingsProvider({
  children,
  initialSettings = INITIAL_STATE,
}: {
  children: ReactNode;
  initialSettings?: SettingsState;
}) {
  const [settings, dispatch] = useReducer(
    settingsReducer,
    initialSettings,
    (seedState) => sanitizeSettingsState(seedState),
  );
  const lastPersistedStateRef = useRef<string>(JSON.stringify(sanitizeSettingsState(initialSettings)));

  /** Persist to server whenever settings state changes. */
  useEffect(() => {
    const serializedState = JSON.stringify(settings);
    if (serializedState === lastPersistedStateRef.current) {
      return;
    }

    const controller = new AbortController();

    const persist = async () => {
      const persisted = await persistSettingsToApi(settings, controller.signal);
      if (persisted) {
        lastPersistedStateRef.current = serializedState;
      }
    };

    void persist();

    return () => {
      controller.abort();
    };
  }, [settings]);

  const validateTemplateId = useCallback(
    (id: string): { valid: boolean; error?: string } => {
      const formatValidation = validateTemplateIdFormat(id);
      if (!formatValidation.valid) {
        return formatValidation;
      }

      const normalized = id.trim();
      if (settings.templateIds.includes(normalized)) {
        return { valid: false, error: 'This Template ID already exists.' };
      }
      return { valid: true };
    },
    [settings.templateIds]
  );

  const addTemplateId = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      const validation = validateTemplateId(id);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const controller = new AbortController();
      const result = await addTemplateIdToApi(id.trim(), controller.signal);
      if (!result.state) {
        return { success: false, error: result.error ?? 'Failed to add template ID.' };
      }

      dispatch({ type: 'HYDRATE', state: result.state });
      lastPersistedStateRef.current = JSON.stringify(result.state);
      return { success: true };
    },
    [validateTemplateId]
  );

  const removeTemplateId = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TEMPLATE_ID', id });
  }, []);

  const addTemplateBrandedDomain = useCallback(
    (templateId: string, domain: string): { success: boolean; error?: string } => {
      const normalizedTemplateId = templateId.trim();
      if (!settings.templateIds.includes(normalizedTemplateId)) {
        return { success: false, error: 'Template ID not found.' };
      }

      const normalized = domain.trim().toLowerCase();
      if (!normalized) {
        return { success: false, error: 'Branded domain is required.' };
      }

      const currentDomains = settings.templateBrandedDomains[normalizedTemplateId] ?? [];
      if (currentDomains.includes(normalized)) {
        return { success: false, error: 'This branded domain already exists in this template.' };
      }

      dispatch({
        type: 'ADD_TEMPLATE_BRANDED_DOMAIN',
        domain: normalized,
        templateId: normalizedTemplateId,
      });
      return { success: true };
    },
    [settings.templateBrandedDomains, settings.templateIds]
  );

  const removeTemplateBrandedDomain = useCallback((templateId: string, domain: string) => {
    dispatch({ type: 'REMOVE_TEMPLATE_BRANDED_DOMAIN', domain, templateId });
  }, []);

  const getTemplateBrandedDomains = useCallback(
    (templateId: string): string[] => settings.templateBrandedDomains[templateId] ?? [],
    [settings.templateBrandedDomains]
  );

  const addPreset = useCallback(
    (field: PresetField, value: string): { success: boolean; error?: string } => {
      const trimmed = value.trim();
      if (!trimmed) {
        return { success: false, error: 'Value is required.' };
      }
      if (settings.presets[field].includes(trimmed)) {
        return { success: false, error: 'This value already exists.' };
      }
      dispatch({ type: 'ADD_PRESET', field, value: trimmed });
      return { success: true };
    },
    [settings.presets]
  );

  const removePreset = useCallback((field: PresetField, value: string) => {
    dispatch({ type: 'REMOVE_PRESET', field, value });
  }, []);

  const getPresets = useCallback(
    (field: PresetField): string[] => settings.presets[field],
    [settings.presets]
  );

  const upsertNamingConventionRule = useCallback(
    (field: NamingConventionTargetField, rule: NamingConventionRule) => {
      dispatch({ type: 'UPSERT_NAMING_RULE', field, rule });
    },
    [],
  );

  const removeNamingConventionRule = useCallback((field: NamingConventionTargetField) => {
    dispatch({ type: 'REMOVE_NAMING_RULE', field });
  }, []);

  const getNamingConventionRule = useCallback(
    (field: NamingConventionTargetField): NamingConventionRule | null => settings.namingConvention.rules[field] ?? null,
    [settings.namingConvention.rules],
  );

  const setNamingConventionEnforcementMode = useCallback((mode: NamingRuleEnforcementMode) => {
    dispatch({ type: 'SET_NAMING_ENFORCEMENT_MODE', mode });
  }, []);

  const contextValue = useMemo<SettingsContextValue>(
    () => ({
      settings,
      addTemplateId,
      removeTemplateId,
      addTemplateBrandedDomain,
      removeTemplateBrandedDomain,
      getTemplateBrandedDomains,
      addPreset,
      removePreset,
      getPresets,
      upsertNamingConventionRule,
      removeNamingConventionRule,
      getNamingConventionRule,
      setNamingConventionEnforcementMode,
      validateTemplateId,
    }),
    [
      settings,
      addTemplateId,
      removeTemplateId,
      addTemplateBrandedDomain,
      removeTemplateBrandedDomain,
      getTemplateBrandedDomains,
      addPreset,
      removePreset,
      getPresets,
      upsertNamingConventionRule,
      removeNamingConventionRule,
      getNamingConventionRule,
      setNamingConventionEnforcementMode,
      validateTemplateId,
    ]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * useSettings - Access settings context.
 * Must be used within a SettingsProvider.
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
