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
  useState,
  type ReactNode,
} from 'react';
import {
  createInitialSettingsState,
  sanitizeSettingsState,
  validateTemplateIdFormat,
  type PresetField,
  type SettingsState,
} from '@/lib/settingsSchema';
export {
  PRESET_FIELDS,
  PRESET_FIELDS_BY_SECTION,
  PRESET_FIELD_LABELS,
  PRESET_FIELD_PLACEHOLDERS,
  PRESET_SECTIONS,
  PRESET_SECTION_LABELS,
} from '@/lib/settingsSchema';
export type { PresetField, PresetSection, SettingsState } from '@/lib/settingsSchema';

type SettingsAction =
  | { type: 'REMOVE_TEMPLATE_ID'; id: string }
  | { type: 'ADD_TEMPLATE_BRANDED_DOMAIN'; templateId: string; domain: string }
  | { type: 'REMOVE_TEMPLATE_BRANDED_DOMAIN'; templateId: string; domain: string }
  | { type: 'ADD_PRESET'; field: PresetField; value: string }
  | { type: 'REMOVE_PRESET'; field: PresetField; value: string }
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
  validateTemplateId: (id: string) => { valid: boolean; error?: string };
}

const INITIAL_STATE = createInitialSettingsState();

async function fetchSettingsFromApi(signal: AbortSignal): Promise<SettingsState | null> {
  try {
    const response = await fetch('/api/settings', {
      cache: 'no-store',
      method: 'GET',
      signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    return sanitizeSettingsState(payload);
  } catch {
    return null;
  }
}

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
 *
 * Example usage:
 * <SettingsProvider><App /></SettingsProvider>
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, INITIAL_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const lastPersistedStateRef = useRef<string>(JSON.stringify(INITIAL_STATE));
  const hasLocalChangesRef = useRef(false);

  /** Hydrate state from server on mount. */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const hydrate = async () => {
      const loadedSettings = await fetchSettingsFromApi(controller.signal);

      if (!isMounted) {
        return;
      }

      if (loadedSettings && !hasLocalChangesRef.current) {
        dispatch({ type: 'HYDRATE', state: loadedSettings });
        lastPersistedStateRef.current = JSON.stringify(loadedSettings);
      }

      setIsHydrated(true);
    };

    void hydrate();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  /** Persist to server on every change after initial hydration. */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

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
  }, [isHydrated, settings]);

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

      hasLocalChangesRef.current = true;
      dispatch({ type: 'HYDRATE', state: result.state });
      lastPersistedStateRef.current = JSON.stringify(result.state);
      return { success: true };
    },
    [validateTemplateId]
  );

  const removeTemplateId = useCallback((id: string) => {
    hasLocalChangesRef.current = true;
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

      hasLocalChangesRef.current = true;
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
    hasLocalChangesRef.current = true;
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
      hasLocalChangesRef.current = true;
      dispatch({ type: 'ADD_PRESET', field, value: trimmed });
      return { success: true };
    },
    [settings.presets]
  );

  const removePreset = useCallback((field: PresetField, value: string) => {
    hasLocalChangesRef.current = true;
    dispatch({ type: 'REMOVE_PRESET', field, value });
  }, []);

  const getPresets = useCallback(
    (field: PresetField): string[] => settings.presets[field],
    [settings.presets]
  );

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
