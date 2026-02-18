/**
 * Request payload sanitizers and limits for Link Group Phase A APIs.
 */

import { computeLeafCount, getAllowedChildLevel } from '@/lib/onelinkGroupTree';
import type { LinkGroupNodeLevel, LinkGroupTreeConfig, LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';

const TEMPLATE_ID_REGEX = /^[a-zA-Z0-9]{4}$/;
const IPV4_HOSTNAME_REGEX =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export const LINK_GROUP_HARD_CAP = 2000;
export const LINK_GROUP_WARNING_THRESHOLD = 200;

const MAX_GLOBAL_PARAMS = 100;
const MAX_GLOBAL_PARAM_KEY_LENGTH = 128;
const MAX_GLOBAL_PARAM_VALUE_LENGTH = 1024;
const MAX_NODE_VALUE_LENGTH = 100;

const HIERARCHICAL_KEYS = new Set(['pid', 'c', 'af_adset', 'af_ad']);

function sanitizeOptionalString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function isPublicHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized || normalized === 'localhost' || normalized.endsWith('.localhost')) {
    return false;
  }

  if (normalized.includes(':') || IPV4_HOSTNAME_REGEX.test(normalized)) {
    return false;
  }

  if (!normalized.includes('.')) {
    return false;
  }

  const tld = normalized.split('.').pop() || '';
  return /^[a-z]{2,63}$/i.test(tld);
}

function sanitizeBrandDomain(value: unknown): { error?: string; value: string } {
  const normalized = sanitizeOptionalString(value, 255).toLowerCase();
  if (!normalized) {
    return { value: '' };
  }

  if (!isPublicHostname(normalized)) {
    return {
      error: 'Brand domain must be a public domain (no localhost or IP address).',
      value: '',
    };
  }

  return { value: normalized };
}

function sanitizeGlobalParams(value: unknown): {
  params: Record<string, string>;
  warnings: string[];
  error?: string;
} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      params: {},
      warnings: [],
    };
  }

  const warnings: string[] = [];
  const params: Record<string, string> = {};

  for (const [rawKey, rawValue] of Object.entries(value as Record<string, unknown>)) {
    const key = rawKey.trim().slice(0, MAX_GLOBAL_PARAM_KEY_LENGTH);
    if (!key) {
      continue;
    }

    if (HIERARCHICAL_KEYS.has(key)) {
      warnings.push(`Global parameter "${key}" was ignored because it is controlled by tree hierarchy.`);
      continue;
    }

    if (typeof rawValue !== 'string') {
      return {
        error: `Global parameter value for "${key}" must be a string.`,
        params: {},
        warnings,
      };
    }

    const normalizedValue = rawValue.trim().slice(0, MAX_GLOBAL_PARAM_VALUE_LENGTH);
    if (!normalizedValue) {
      continue;
    }

    params[key] = normalizedValue;

    if (Object.keys(params).length > MAX_GLOBAL_PARAMS) {
      return {
        error: `Too many global parameters. Maximum is ${MAX_GLOBAL_PARAMS}.`,
        params: {},
        warnings,
      };
    }
  }

  return {
    params,
    warnings,
  };
}

function sanitizeLevel(value: unknown): LinkGroupNodeLevel | null {
  if (typeof value !== 'string') {
    return null;
  }

  if (value === 'media_source' || value === 'campaign' || value === 'adset' || value === 'ad') {
    return value;
  }

  return null;
}

function sanitizeTreeNodes(
  nodes: unknown,
  expectedLevel: LinkGroupNodeLevel,
  warnings: string[],
): { error?: string; value: LinkGroupTreeNode[] } {
  if (!Array.isArray(nodes)) {
    return {
      error: 'Tree roots must be an array.',
      value: [],
    };
  }

  const sanitized: LinkGroupTreeNode[] = [];
  const siblingValues = new Set<string>();

  for (const rawNode of nodes) {
    if (!rawNode || typeof rawNode !== 'object' || Array.isArray(rawNode)) {
      return {
        error: 'Each tree node must be an object.',
        value: [],
      };
    }

    const node = rawNode as Record<string, unknown>;
    const level = sanitizeLevel(node.level);
    if (!level) {
      return {
        error: 'Tree node level is invalid.',
        value: [],
      };
    }

    if (level !== expectedLevel) {
      return {
        error: `Invalid tree level order. Expected ${expectedLevel}, received ${level}.`,
        value: [],
      };
    }

    const normalizedValue = sanitizeOptionalString(node.value, MAX_NODE_VALUE_LENGTH);
    if (!normalizedValue) {
      return {
        error: `Tree node value is required for level ${level}.`,
        value: [],
      };
    }

    const siblingDedupKey = normalizedValue.toLowerCase();
    if (siblingValues.has(siblingDedupKey)) {
      warnings.push(`Duplicate value "${normalizedValue}" under ${level} was deduplicated.`);
      continue;
    }
    siblingValues.add(siblingDedupKey);

    const nextExpectedLevel = getAllowedChildLevel(level);
    let children: LinkGroupTreeNode[] = [];

    if (nextExpectedLevel) {
      const childSanitized = sanitizeTreeNodes(node.children ?? [], nextExpectedLevel, warnings);
      if (childSanitized.error) {
        return {
          error: childSanitized.error,
          value: [],
        };
      }
      children = childSanitized.value;
    }

    sanitized.push({
      children,
      level,
      value: normalizedValue,
    });
  }

  return {
    value: sanitized,
  };
}

export interface CreateLinkGroupRequestPayload {
  brandDomain: string;
  globalParams: Record<string, string>;
  name: string;
  plannedCount: number;
  templateId: string;
  treeConfig: LinkGroupTreeConfig;
  warnings: string[];
}

export function sanitizeCreateLinkGroupRequestPayload(payload: unknown): {
  error?: string;
  value?: CreateLinkGroupRequestPayload;
} {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { error: 'Invalid payload.' };
  }

  const candidate = payload as Record<string, unknown>;
  const name = sanitizeOptionalString(candidate.name, 120);
  if (!name) {
    return { error: 'Group name is required.' };
  }

  const templateId = sanitizeOptionalString(candidate.templateId, 16);
  if (!templateId) {
    return { error: 'Template ID is required.' };
  }

  if (!TEMPLATE_ID_REGEX.test(templateId)) {
    return { error: 'Template ID must be exactly 4 alphanumeric characters.' };
  }

  const brandDomain = sanitizeBrandDomain(candidate.brandDomain);
  if (brandDomain.error) {
    return { error: brandDomain.error };
  }

  const warnings: string[] = [];
  const globalParamsSanitized = sanitizeGlobalParams(candidate.globalParams);
  if (globalParamsSanitized.error) {
    return { error: globalParamsSanitized.error };
  }

  warnings.push(...globalParamsSanitized.warnings);

  const rawTreeConfig = candidate.treeConfig ?? candidate.tree;
  if (!rawTreeConfig || typeof rawTreeConfig !== 'object' || Array.isArray(rawTreeConfig)) {
    return { error: 'Tree config is required.' };
  }

  const treeCandidate = rawTreeConfig as Record<string, unknown>;
  const rootsSanitized = sanitizeTreeNodes(treeCandidate.roots, 'media_source', warnings);
  if (rootsSanitized.error) {
    return { error: rootsSanitized.error };
  }

  if (rootsSanitized.value.length === 0) {
    return { error: 'At least one MediaSource is required.' };
  }

  const plannedCount = computeLeafCount(rootsSanitized.value);
  if (plannedCount < 1) {
    return { error: 'At least one valid leaf path is required.' };
  }

  if (plannedCount > LINK_GROUP_HARD_CAP) {
    return { error: `Planned link count exceeds hard cap (${LINK_GROUP_HARD_CAP}).` };
  }

  if (plannedCount > LINK_GROUP_WARNING_THRESHOLD) {
    warnings.push(`Large group warning: ${plannedCount} links exceed warning threshold (${LINK_GROUP_WARNING_THRESHOLD}).`);
  }

  return {
    value: {
      brandDomain: brandDomain.value,
      globalParams: globalParamsSanitized.params,
      name,
      plannedCount,
      templateId,
      treeConfig: {
        roots: rootsSanitized.value,
        version: 1,
      },
      warnings,
    },
  };
}

export function sanitizeGroupId(value: string): string {
  return sanitizeOptionalString(value, 128);
}

export function sanitizePageQuery(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }
  return Math.min(parsed, 9999);
}

export function sanitizePageSizeQuery(value: string | null, fallback = 50): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, 200);
}

export function sanitizeDeleteMode(value: string | null): 'local_only' | 'local_and_remote' {
  if (value === 'local_and_remote') {
    return 'local_and_remote';
  }

  return 'local_only';
}
