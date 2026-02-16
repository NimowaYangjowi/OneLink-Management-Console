'use client';

/**
 * SettingsContext - Global settings state with localStorage persistence.
 * Manages OneLink Template IDs and field presets used across the console.
 *
 * Template IDs: 4-character alphanumeric codes (case-sensitive)
 * Presets: Reusable values for attribution fields (pid, campaign, adset, ad, channel)
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Fields that support preset values. */
export type PresetField = 'pid' | 'c' | 'af_adset' | 'af_ad' | 'af_channel';

/** Human-readable labels for preset fields. */
export const PRESET_FIELD_LABELS: Record<PresetField, string> = {
  pid: 'Media Source',
  c: 'Campaign',
  af_adset: 'Ad Set',
  af_ad: 'Ad Name',
  af_channel: 'Channel',
};

/** All preset field keys in display order. */
export const PRESET_FIELDS: PresetField[] = ['pid', 'c', 'af_adset', 'af_ad', 'af_channel'];

export interface SettingsState {
  templateIds: string[];
  presets: Record<PresetField, string[]>;
}

type SettingsAction =
  | { type: 'ADD_TEMPLATE_ID'; id: string }
  | { type: 'REMOVE_TEMPLATE_ID'; id: string }
  | { type: 'ADD_PRESET'; field: PresetField; value: string }
  | { type: 'REMOVE_PRESET'; field: PresetField; value: string }
  | { type: 'HYDRATE'; state: SettingsState };

interface SettingsContextValue {
  settings: SettingsState;
  addTemplateId: (id: string) => { success: boolean; error?: string };
  removeTemplateId: (id: string) => void;
  addPreset: (field: PresetField, value: string) => { success: boolean; error?: string };
  removePreset: (field: PresetField, value: string) => void;
  getPresets: (field: PresetField) => string[];
  validateTemplateId: (id: string) => { valid: boolean; error?: string };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'onelink-console-settings';

const INITIAL_STATE: SettingsState = {
  templateIds: [],
  presets: {
    pid: [],
    c: [],
    af_adset: [],
    af_ad: [],
    af_channel: [],
  },
};

/** Template ID must be exactly 4 alphanumeric characters (case-sensitive). */
const TEMPLATE_ID_REGEX = /^[a-zA-Z0-9]{4}$/;

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'ADD_TEMPLATE_ID':
      return {
        ...state,
        templateIds: [...state.templateIds, action.id],
      };
    case 'REMOVE_TEMPLATE_ID':
      return {
        ...state,
        templateIds: state.templateIds.filter((id) => id !== action.id),
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

  /** Hydrate state from localStorage on mount. */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SettingsState;
        if (parsed.templateIds && parsed.presets) {
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      }
    } catch {
      // Ignore parse errors, use defaults
    }
  }, []);

  /** Persist to localStorage on every change. */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors (e.g., quota exceeded)
    }
  }, [settings]);

  const validateTemplateId = useCallback(
    (id: string): { valid: boolean; error?: string } => {
      if (!id.trim()) {
        return { valid: false, error: 'Template ID is required.' };
      }
      if (!TEMPLATE_ID_REGEX.test(id)) {
        return { valid: false, error: 'Must be exactly 4 alphanumeric characters (a-z, A-Z, 0-9).' };
      }
      if (settings.templateIds.includes(id)) {
        return { valid: false, error: 'This Template ID already exists.' };
      }
      return { valid: true };
    },
    [settings.templateIds]
  );

  const addTemplateId = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const validation = validateTemplateId(id);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      dispatch({ type: 'ADD_TEMPLATE_ID', id });
      return { success: true };
    },
    [validateTemplateId]
  );

  const removeTemplateId = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TEMPLATE_ID', id });
  }, []);

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

  const contextValue = useMemo<SettingsContextValue>(
    () => ({
      settings,
      addTemplateId,
      removeTemplateId,
      addPreset,
      removePreset,
      getPresets,
      validateTemplateId,
    }),
    [settings, addTemplateId, removeTemplateId, addPreset, removePreset, getPresets, validateTemplateId]
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
