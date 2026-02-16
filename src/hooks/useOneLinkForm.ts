/**
 * useOneLinkForm - Custom hook for OneLink form state management.
 *
 * Manages form state via useReducer, validates fields against AppsFlyer
 * OneLink API v2 constraints, and generates the final attribution URL.
 */

import { useReducer, useMemo, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OneLinkFormState {
  // Attribution
  pid: string;
  c: string;
  af_adset: string;
  af_adset_id: string;
  af_ad: string;
  af_ad_id: string;
  af_channel: string;
  af_keywords: string;

  // Custom Parameters
  af_sub1: string;
  af_sub2: string;
  af_sub3: string;
  af_sub4: string;
  af_sub5: string;

  // Deep Linking
  deep_link_value: string;
  deep_link_sub1: string;
  deep_link_sub2: string;
  deep_link_sub3: string;
  deep_link_sub4: string;
  deep_link_sub5: string;
  deep_link_sub6: string;
  deep_link_sub7: string;
  deep_link_sub8: string;
  deep_link_sub9: string;
  deep_link_sub10: string;
  af_dp: string;
  af_force_deeplink: boolean;

  // Retargeting
  is_retargeting: boolean;
  af_reengagement_window: string;

  // Redirection
  af_r: string;
  af_ios_url: string;
  af_android_url: string;
  af_web_dp: string;

  // Social Media Preview
  af_og_title: string;
  af_og_description: string;
  af_og_image: string;

  // Link Branding
  domain: string;
  template_id: string;
  url_id: string;
}

export type FormAction =
  | { type: 'SET_FIELD'; field: keyof OneLinkFormState; value: string | boolean | number }
  | { type: 'RESET' };

export interface UseOneLinkFormReturn {
  state: OneLinkFormState;
  errors: Partial<Record<string, string>>;
  setField: (field: keyof OneLinkFormState, value: string | boolean | number) => void;
  validate: () => boolean;
  reset: () => void;
  generatedUrl: string;
  nonEmptyParams: Array<{ key: string; label: string; value: string }>;
  isValid: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_STATE: OneLinkFormState = {
  // Attribution
  pid: '',
  c: '',
  af_adset: '',
  af_adset_id: '',
  af_ad: '',
  af_ad_id: '',
  af_channel: '',
  af_keywords: '',

  // Custom Parameters
  af_sub1: '',
  af_sub2: '',
  af_sub3: '',
  af_sub4: '',
  af_sub5: '',

  // Deep Linking
  deep_link_value: '',
  deep_link_sub1: '',
  deep_link_sub2: '',
  deep_link_sub3: '',
  deep_link_sub4: '',
  deep_link_sub5: '',
  deep_link_sub6: '',
  deep_link_sub7: '',
  deep_link_sub8: '',
  deep_link_sub9: '',
  deep_link_sub10: '',
  af_dp: '',
  af_force_deeplink: false,

  // Retargeting
  is_retargeting: false,
  af_reengagement_window: '',

  // Redirection
  af_r: '',
  af_ios_url: '',
  af_android_url: '',
  af_web_dp: '',

  // Social Media Preview
  af_og_title: '',
  af_og_description: '',
  af_og_image: '',

  // Link Branding
  domain: 'click.example.com',
  template_id: '',
  url_id: '',
};

/** Human-readable labels for each form field. */
const FIELD_LABELS: Record<keyof OneLinkFormState, string> = {
  pid: 'Media Source',
  c: 'Campaign',
  af_adset: 'Ad Set',
  af_adset_id: 'Ad Set ID',
  af_ad: 'Ad Name',
  af_ad_id: 'Ad ID',
  af_channel: 'Channel',
  af_keywords: 'Keywords',

  af_sub1: 'Sub Param 1',
  af_sub2: 'Sub Param 2',
  af_sub3: 'Sub Param 3',
  af_sub4: 'Sub Param 4',
  af_sub5: 'Sub Param 5',

  deep_link_value: 'Deep Link Value',
  deep_link_sub1: 'Deep Link Sub 1',
  deep_link_sub2: 'Deep Link Sub 2',
  deep_link_sub3: 'Deep Link Sub 3',
  deep_link_sub4: 'Deep Link Sub 4',
  deep_link_sub5: 'Deep Link Sub 5',
  deep_link_sub6: 'Deep Link Sub 6',
  deep_link_sub7: 'Deep Link Sub 7',
  deep_link_sub8: 'Deep Link Sub 8',
  deep_link_sub9: 'Deep Link Sub 9',
  deep_link_sub10: 'Deep Link Sub 10',
  af_dp: 'Android URI Scheme',
  af_force_deeplink: 'Force Deep Link',

  is_retargeting: 'Retargeting',
  af_reengagement_window: 'Re-engagement Window',

  af_r: 'Redirect URL',
  af_ios_url: 'iOS Redirect URL',
  af_android_url: 'Android Redirect URL',
  af_web_dp: 'Web Fallback URL',

  af_og_title: 'OG Title',
  af_og_description: 'OG Description',
  af_og_image: 'OG Image URL',

  domain: 'Domain',
  template_id: 'Template ID',
  url_id: 'URL ID',
};

/** Fields excluded from query-string serialization (used for URL path). */
const BRANDING_FIELDS: ReadonlySet<string> = new Set([
  'domain',
  'template_id',
  'url_id',
]);

/** Fields that must conform to valid URL format. */
const URL_FIELDS: ReadonlySet<string> = new Set([
  'af_r',
  'af_ios_url',
  'af_android_url',
  'af_web_dp',
  'af_og_image',
]);

/** Maximum length constraints per field key. */
const MAX_LENGTH: Partial<Record<keyof OneLinkFormState, number>> = {
  c: 100,
  af_adset: 100,
  af_ad: 100,
  af_keywords: 100,
  af_sub1: 100,
  af_sub2: 100,
  af_sub3: 100,
  af_sub4: 100,
  af_sub5: 100,
  af_adset_id: 24,
  af_ad_id: 24,
  af_og_title: 40,
  af_og_description: 300,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateState(state: OneLinkFormState): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};

  // Required fields
  if (!state.pid.trim()) {
    errors.pid = 'Media Source (pid) is required';
  }
  if (!state.domain.trim()) {
    errors.domain = 'Domain is required';
  }

  // Max-length checks
  for (const [field, max] of Object.entries(MAX_LENGTH)) {
    const value = state[field as keyof OneLinkFormState];
    if (typeof value === 'string' && value.length > max) {
      errors[field] = `${FIELD_LABELS[field as keyof OneLinkFormState]} must be at most ${max} characters`;
    }
  }

  // URL format checks
  for (const field of URL_FIELDS) {
    const value = state[field as keyof OneLinkFormState];
    if (typeof value === 'string' && value.trim() !== '' && !isValidUrl(value)) {
      errors[field] = `${FIELD_LABELS[field as keyof OneLinkFormState]} must be a valid URL`;
    }
  }

  // Retargeting window validation
  if (state.is_retargeting && state.af_reengagement_window.trim() !== '') {
    const parsed = Number(state.af_reengagement_window);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 90) {
      errors.af_reengagement_window = 'Re-engagement Window must be an integer between 1 and 90';
    }
  }

  return errors;
}

function buildUrl(state: OneLinkFormState): string {
  const { domain, template_id, url_id } = state;
  if (!domain.trim()) return '';

  // Build path segments
  const pathSegments = [template_id, url_id].filter((s) => s.trim() !== '');
  const path = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '';

  // Build query params
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(state)) {
    if (BRANDING_FIELDS.has(key)) continue;

    if (typeof value === 'boolean') {
      // Only serialize booleans when true
      if (value) {
        params.set(key, 'true');
      }
      // Special case: serialize default reengagement window when retargeting is on
      if (key === 'is_retargeting' && value && state.af_reengagement_window.trim() === '') {
        params.set('af_reengagement_window', '30');
      }
    } else if (typeof value === 'string' && value.trim() !== '') {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return `https://${domain}${path}${queryString ? `?${queryString}` : ''}`;
}

function computeNonEmptyParams(
  state: OneLinkFormState
): Array<{ key: string; label: string; value: string }> {
  const result: Array<{ key: string; label: string; value: string }> = [];

  for (const [key, value] of Object.entries(state)) {
    if (BRANDING_FIELDS.has(key)) continue;

    const label = FIELD_LABELS[key as keyof OneLinkFormState] ?? key;

    if (typeof value === 'boolean') {
      if (value) {
        result.push({ key, label, value: 'true' });
      }
    } else if (typeof value === 'string' && value.trim() !== '') {
      result.push({ key, label, value });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function formReducer(state: OneLinkFormState, action: FormAction): OneLinkFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOneLinkForm(): UseOneLinkFormReturn {
  const [state, dispatch] = useReducer(formReducer, INITIAL_STATE);

  const errors = useMemo(() => validateState(state), [state]);

  const isValid = useMemo(
    () => Object.keys(errors).length === 0 && state.pid.trim() !== '' && state.domain.trim() !== '',
    [errors, state.pid, state.domain]
  );

  const generatedUrl = useMemo(() => buildUrl(state), [state]);

  const nonEmptyParams = useMemo(() => computeNonEmptyParams(state), [state]);

  const setField = useCallback(
    (field: keyof OneLinkFormState, value: string | boolean | number) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    []
  );

  const validate = useCallback((): boolean => {
    const currentErrors = validateState(state);
    return Object.keys(currentErrors).length === 0
      && state.pid.trim() !== ''
      && state.domain.trim() !== '';
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    errors,
    setField,
    validate,
    reset,
    generatedUrl,
    nonEmptyParams,
    isValid,
  };
}

export default useOneLinkForm;
