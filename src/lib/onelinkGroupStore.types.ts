/**
 * Shared constants and type contracts for OneLink group store modules.
 */

import type { LinkGroupApplyMode, ScopedParamRule } from '@/lib/onelinkGroupSchema';
import type { LinkGroupItemStatus, LinkGroupStatus } from '@/lib/onelinkGroupTypes';

export const DEFAULT_LIST_LIMIT = 200;
export const EXECUTION_CONCURRENCY = 3;
export const ITEMS_PAGE_SIZE_DEFAULT = 50;

export interface GroupRow {
  brand_domain: string;
  created_at: string;
  failed_count: number;
  global_params_json?: string;
  scoped_params_json?: string;
  id: string;
  name: string;
  planned_count: number;
  status: LinkGroupStatus;
  success_count: number;
  template_id: string;
  tree_config_json: string;
  updated_at: string;
}

export interface GroupItemRow {
  created_at: string;
  error_message: string;
  id: string;
  leaf_node_id: string;
  path_label: string;
  payload_json: string;
  retry_count: number;
  short_link: string;
  status: LinkGroupItemStatus;
  updated_at: string;
  variant_key: string;
}

export interface GroupNodeSeed {
  id: string;
  isLeaf: boolean;
  level: string;
  parentNodeId: string | null;
  pathKey: string;
  sortOrder: number;
  value: string;
}

export interface GroupItemSeed {
  id: string;
  leafNodeId: string;
  pathLabel: string;
  payloadJson: string;
  variantKey: string;
}

export interface LinkGroupSummary {
  createdAt: string;
  failedCount: number;
  id: string;
  name: string;
  plannedCount: number;
  status: LinkGroupStatus;
  successCount: number;
  templateId: string;
  updatedAt: string;
}

export interface LinkGroupItemRecord {
  createdAt: string;
  errorMessage: string;
  id: string;
  leafNodeId: string;
  pathLabel: string;
  payloadJson: string;
  retryCount: number;
  shortLink: string;
  status: LinkGroupItemStatus;
  updatedAt: string;
  variantKey: string;
}

export interface LinkGroupDetail {
  brandDomain: string;
  createdAt: string;
  failedCount: number;
  globalParams: Record<string, string>;
  id: string;
  items: LinkGroupItemRecord[];
  name: string;
  page: number;
  pageSize: number;
  plannedCount: number;
  scopedParams: ScopedParamRule[];
  status: LinkGroupStatus;
  successCount: number;
  templateId: string;
  totalItems: number;
  totalPages: number;
  treeConfigJson: string;
  updatedAt: string;
}

export interface ExistingGroupItemSnapshot {
  errorMessage: string;
  pathLabel: string;
  retryCount: number;
  shortLink: string;
  status: LinkGroupItemStatus;
  variantKey: string;
}

export interface LinkGroupUpdateDiff {
  addedPaths: string[];
  changedPaths: string[];
  failedPaths: string[];
  removedPaths: string[];
  unchangedPaths: string[];
}

export interface LinkGroupUpdateResult {
  diff: LinkGroupUpdateDiff;
  execution: {
    appliedMode: LinkGroupApplyMode;
    status: LinkGroupStatus;
    targetedItemCount: number;
  };
  group: LinkGroupSummary;
}

export interface GroupExecutionConfig {
  brandDomain: string;
  groupName: string;
  groupId: string;
  templateId: string;
}

export interface ClaimedPendingItem {
  id: string;
  pathLabel: string;
  payloadJson: string;
}
