/**
 * Shared type definitions for Link Group tree, payload generation, and persistence.
 */

export type LinkGroupNodeLevel = 'media_source' | 'campaign' | 'adset' | 'ad';

export const LINK_GROUP_LEVEL_ORDER: LinkGroupNodeLevel[] = [
  'media_source',
  'campaign',
  'adset',
  'ad',
];

export interface LinkGroupTreeNode {
  children: LinkGroupTreeNode[];
  level: LinkGroupNodeLevel;
  value: string;
}

export interface LinkGroupTreeConfig {
  roots: LinkGroupTreeNode[];
  version: 1;
}

export type LinkGroupShortLinkIdConfig =
  | { mode: 'random' }
  | { fieldKey: string; mode: 'field' };

export interface LinkGroupLeafPath {
  af_ad?: string;
  af_adset?: string;
  c?: string;
  pathLabel: string;
  pid: string;
}

export type LinkGroupStatus = 'draft' | 'running' | 'completed' | 'partial_failed' | 'failed';

export type LinkGroupItemStatus = 'pending' | 'processing' | 'success' | 'failed';
