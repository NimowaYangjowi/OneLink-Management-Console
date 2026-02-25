/**
 * Shared type definitions for OneLinkGroupCreatePage feature modules.
 */
import type { LinkGroupNodeLevel, LinkGroupShortLinkIdConfig } from '@/lib/onelinkGroupTypes';

export type ApplyMode = 'all' | 'failed_only' | 'new_only';

export type EditorTreeNode = {
  children: EditorTreeNode[];
  id: string;
  level: LinkGroupNodeLevel;
  value: string;
};

export type ParamRow = {
  id: string;
  isDisabled: boolean;
  key: string;
  scopePathPrefixes: string[];
  value: string;
};

export type ScopedParamRule = {
  isDisabled?: boolean;
  key: string;
  scopePathPrefixes: string[];
  value: string;
};

export type NodeInsertResult = {
  nodes: EditorTreeNode[];
  warnings: string[];
};

export type GroupExecutionItem = {
  errorMessage: string;
  id: string;
  pathLabel: string;
  shortLink: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
};

export type GroupExecutionDetail = {
  failedCount: number;
  id: string;
  items: GroupExecutionItem[];
  plannedCount: number;
  status: 'draft' | 'running' | 'completed' | 'partial_failed' | 'failed';
  successCount: number;
};

export type SnippetPreview = {
  fullUrl: string;
  nodeIds: string[];
  pathLabel: string;
  payload: Record<string, string>;
};

export type SnippetDisplayResult = {
  hasHighlight: boolean;
  prefix: string;
  prefixEllipsis: boolean;
  suffix: string;
  suffixEllipsis: boolean;
  text: string;
  token: string;
};

export type OneLinkGroupCreatePageProps = {
  editGroupId?: string;
};

export type EditSeedResponse = {
  brandDomain: string;
  error?: string;
  globalParams?: Record<string, string>;
  id: string;
  name: string;
  shortLinkIdConfig?: LinkGroupShortLinkIdConfig;
  scopedParams?: ScopedParamRule[];
  templateId: string;
  treeConfigJson: string;
};
