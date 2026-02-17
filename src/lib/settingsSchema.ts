/**
 * Shared settings schema and sanitization utilities for OneLink console persistence.
 */

/** Create page sections that can define preset values. */
export type PresetSection =
  | 'link_setup'
  | 'deep_linking_redirection'
  | 'additional_parameters'
  | 'social_media_preview';

/** Fields that support preset values. */
export type PresetField =
  | 'link_name'
  | 'shortlink_id'
  | 'pid'
  | 'c'
  | 'af_adset'
  | 'af_ad'
  | 'af_channel'
  | 'af_dp'
  | 'af_android_url'
  | 'af_ios_url'
  | 'af_web_dp'
  | 'custom_param_key'
  | 'custom_param_value'
  | 'af_og_title'
  | 'af_og_description'
  | 'af_og_image';

/** Human-readable labels for preset sections. */
export const PRESET_SECTION_LABELS: Record<PresetSection, string> = {
  link_setup: 'Link Setup',
  deep_linking_redirection: 'Deep Linking & Redirection',
  additional_parameters: 'Additional Parameters',
  social_media_preview: 'Social Media Preview',
};

/** Preset sections in display order. */
export const PRESET_SECTIONS: PresetSection[] = [
  'link_setup',
  'deep_linking_redirection',
  'additional_parameters',
  'social_media_preview',
];

/** Human-readable labels for preset fields. */
export const PRESET_FIELD_LABELS: Record<PresetField, string> = {
  link_name: 'Link Name',
  shortlink_id: 'Short Link ID',
  pid: 'Media Source',
  c: 'Campaign',
  af_adset: 'Ad Set',
  af_ad: 'Ad Name',
  af_channel: 'Channel',
  af_dp: 'Deep Link URI',
  af_android_url: 'Android Mobile Redirection URL',
  af_ios_url: 'iOS Mobile Redirection URL',
  af_web_dp: 'Desktop Fallback URL',
  custom_param_key: 'Custom Parameter Key',
  custom_param_value: 'Custom Parameter Value',
  af_og_title: 'Open Graph Title',
  af_og_description: 'Open Graph Description',
  af_og_image: 'Open Graph Image URL',
};

/** Placeholder text used by settings preset inputs. */
export const PRESET_FIELD_PLACEHOLDERS: Record<PresetField, string> = {
  link_name: 'e.g. Summer Campaign 2024',
  shortlink_id: 'e.g. summer24',
  pid: 'e.g. Email',
  c: 'e.g. spring_sale',
  af_adset: 'e.g. lookalike_us',
  af_ad: 'e.g. video_ad_01',
  af_channel: 'e.g. paid_social',
  af_dp: 'e.g. myapp://product/123',
  af_android_url: 'e.g. https://www.website.com/promo',
  af_ios_url: 'e.g. https://www.website.com/promo',
  af_web_dp: 'e.g. https://www.website.com/promo',
  custom_param_key: 'e.g. af_sub1',
  custom_param_value: 'e.g. influencer_a',
  af_og_title: 'e.g. Get 50% Off Your First Order',
  af_og_description: 'e.g. Download our app today and save more.',
  af_og_image: 'e.g. https://assets.example.com/promo.jpg',
};

/** Preset fields grouped by create-page section. */
export const PRESET_FIELDS_BY_SECTION: Record<PresetSection, PresetField[]> = {
  link_setup: [
    'link_name',
    'shortlink_id',
    'pid',
    'c',
    'af_adset',
    'af_ad',
    'af_channel',
  ],
  deep_linking_redirection: ['af_dp', 'af_android_url', 'af_ios_url', 'af_web_dp'],
  additional_parameters: ['custom_param_key', 'custom_param_value'],
  social_media_preview: ['af_og_title', 'af_og_description', 'af_og_image'],
};

/** All preset field keys in display order. */
export const PRESET_FIELDS: PresetField[] = PRESET_SECTIONS.flatMap(
  (section) => PRESET_FIELDS_BY_SECTION[section],
);

/** Template ID must be exactly 4 alphanumeric characters (case-sensitive). */
export const TEMPLATE_ID_REGEX = /^[a-zA-Z0-9]{4}$/;

export interface TemplateDomainInfo {
  host: string;
  isBrandedDomain: boolean;
  subdomain: string;
}

export interface SettingsState {
  templateIds: string[];
  templateDomains: Record<string, TemplateDomainInfo>;
  templateBrandedDomains: Record<string, string[]>;
  presets: Record<PresetField, string[]>;
}

/**
 * createInitialSettingsState - Creates a new empty settings object.
 */
export function createInitialSettingsState(): SettingsState {
  return {
    templateIds: [],
    templateDomains: {},
    templateBrandedDomains: {},
    presets: {
      link_name: [],
      shortlink_id: [],
      pid: [],
      c: [],
      af_adset: [],
      af_ad: [],
      af_channel: [],
      af_dp: [],
      af_android_url: [],
      af_ios_url: [],
      af_web_dp: [],
      custom_param_key: [],
      custom_param_value: [],
      af_og_title: [],
      af_og_description: [],
      af_og_image: [],
    },
  };
}

/**
 * validateTemplateIdFormat - Validates required Template ID format only.
 */
export function validateTemplateIdFormat(id: string): { valid: boolean; error?: string } {
  const normalized = id.trim();

  if (!normalized) {
    return { valid: false, error: 'Template ID is required.' };
  }
  if (!TEMPLATE_ID_REGEX.test(normalized)) {
    return { valid: false, error: 'Must be exactly 4 alphanumeric characters (a-z, A-Z, 0-9).' };
  }

  return { valid: true };
}

/**
 * sanitizeTemplateIds - Normalizes Template ID values to unique, valid strings.
 */
export function sanitizeTemplateIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) {
    return [];
  }

  const uniqueIds = new Set<string>();
  ids.forEach((value) => {
    if (typeof value !== 'string') {
      return;
    }
    const normalized = value.trim();
    if (TEMPLATE_ID_REGEX.test(normalized)) {
      uniqueIds.add(normalized);
    }
  });

  return [...uniqueIds];
}

/**
 * sanitizeTemplateDomains - Normalizes template domain cache values by Template ID.
 */
export function sanitizeTemplateDomains(domains: unknown): Record<string, TemplateDomainInfo> {
  if (!domains || typeof domains !== 'object') {
    return {};
  }

  const sanitized: Record<string, TemplateDomainInfo> = {};

  Object.entries(domains as Record<string, unknown>).forEach(([templateId, value]) => {
    if (!TEMPLATE_ID_REGEX.test(templateId)) {
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }

    const candidate = value as Partial<TemplateDomainInfo>;
    const host = typeof candidate.host === 'string' ? candidate.host.trim().toLowerCase() : '';
    const subdomain = typeof candidate.subdomain === 'string' ? candidate.subdomain.trim().toLowerCase() : '';

    if (!host || !subdomain) {
      return;
    }

    sanitized[templateId] = {
      host,
      isBrandedDomain: Boolean(candidate.isBrandedDomain),
      subdomain,
    };
  });

  return sanitized;
}

/**
 * sanitizeBrandedDomains - Normalizes branded domains to unique lowercase values.
 */
export function sanitizeBrandedDomains(domains: unknown): string[] {
  if (!Array.isArray(domains)) {
    return [];
  }

  const uniqueDomains = new Set<string>();
  domains.forEach((value) => {
    if (typeof value !== 'string') {
      return;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized) {
      uniqueDomains.add(normalized);
    }
  });

  return [...uniqueDomains];
}

/**
 * sanitizeTemplateBrandedDomains - Normalizes template branded domains by Template ID.
 * Supports migration from legacy global brandedDomains array.
 */
export function sanitizeTemplateBrandedDomains(
  templateBrandedDomains: unknown,
  templateIds: string[],
  legacyBrandedDomains?: unknown,
): Record<string, string[]> {
  const sanitized: Record<string, string[]> = {};

  templateIds.forEach((templateId) => {
    sanitized[templateId] = [];
  });

  const hasTemplateMap =
    templateBrandedDomains
    && typeof templateBrandedDomains === 'object'
    && !Array.isArray(templateBrandedDomains);

  if (hasTemplateMap) {
    Object.entries(templateBrandedDomains as Record<string, unknown>).forEach(([templateId, domains]) => {
      if (!templateIds.includes(templateId)) {
        return;
      }
      sanitized[templateId] = sanitizeBrandedDomains(domains);
    });
    return sanitized;
  }

  const legacyDomains = sanitizeBrandedDomains(legacyBrandedDomains);
  if (legacyDomains.length === 0) {
    return sanitized;
  }

  templateIds.forEach((templateId) => {
    sanitized[templateId] = [...legacyDomains];
  });

  return sanitized;
}

/**
 * sanitizePresets - Normalizes preset map and removes duplicates/empty values.
 */
export function sanitizePresets(presets: unknown): Record<PresetField, string[]> {
  const defaultPresets = createInitialSettingsState().presets;

  if (!presets || typeof presets !== 'object') {
    return defaultPresets;
  }

  PRESET_FIELDS.forEach((field) => {
    const rawValues = (presets as Partial<Record<PresetField, unknown>>)[field];
    if (!Array.isArray(rawValues)) {
      defaultPresets[field] = [];
      return;
    }

    const uniqueValues = new Set<string>();
    rawValues.forEach((value) => {
      if (typeof value !== 'string') {
        return;
      }
      const trimmed = value.trim();
      if (trimmed) {
        uniqueValues.add(trimmed);
      }
    });
    defaultPresets[field] = [...uniqueValues];
  });

  return defaultPresets;
}

/**
 * sanitizeSettingsState - Ensures incoming unknown data matches SettingsState.
 */
export function sanitizeSettingsState(state: unknown): SettingsState {
  if (!state || typeof state !== 'object') {
    return createInitialSettingsState();
  }

  const partialState = state as Partial<SettingsState>;
  const templateIds = sanitizeTemplateIds(partialState.templateIds);

  return {
    templateIds,
    templateDomains: sanitizeTemplateDomains(partialState.templateDomains),
    templateBrandedDomains: sanitizeTemplateBrandedDomains(
      partialState.templateBrandedDomains,
      templateIds,
      (partialState as Partial<{ brandedDomains: unknown }>).brandedDomains,
    ),
    presets: sanitizePresets(partialState.presets),
  };
}
