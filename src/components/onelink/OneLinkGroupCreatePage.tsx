/**
 * Link Group creation page orchestrator with modularized step and panel components.
 */
'use client';

import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import {
  computeLeafCount,
  generateLeafPaths,
  getAllowedChildLevel,
  parseMultiValueInput,
} from '@/lib/onelinkGroupTree';
import type { LinkGroupNodeLevel, LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';
import {
  PRESET_FIELDS_BY_SECTION,
  PRESET_FIELD_LABELS,
  PRESET_FIELD_PLACEHOLDERS,
  useSettings,
} from '@/lib/providers/SettingsContext';
import BaseSetupStep from './group-create/BaseSetupStep';
import {
  GROUP_CREATE_STEPS,
  SNIPPET_WHEEL_ITEM_HEIGHT,
} from './group-create/constants';
import GlobalParametersStep from './group-create/GlobalParametersStep';
import LinkPreviewPanel from './group-create/LinkPreviewPanel';
import type { NodeListProps } from './group-create/NodeList';
import ReviewExecuteStep from './group-create/ReviewExecuteStep';
import {
  appendUniqueChildren,
  computeMaxDepth,
  countDescendants,
  createClientId,
  findNodeById,
  flattenTreeNodes,
  formatLevelLabel,
  getParamKeyForLevel,
  hydrateEditorNodes,
  insertChildrenUnderNode,
  removeNodeById,
  toSerializedNodes,
} from './group-create/treeUtils';
import TreeBuilderStep from './group-create/TreeBuilderStep';
import TreePreviewPanel from './group-create/TreePreviewPanel';
import type {
  EditSeedResponse,
  EditorTreeNode,
  GroupExecutionDetail,
  OneLinkGroupCreatePageProps,
  ParamRow,
  ScopedParamRule,
  SnippetPreview,
} from './group-create/types';

type LassoMode = 'add' | 'replace' | 'subtract' | 'toggle';

type LassoRectState = {
  height: number;
  left: number;
  top: number;
  width: number;
};

const LASSO_START_THRESHOLD_PX = 6;
const TREE_LEVEL_DEPTH: Record<LinkGroupNodeLevel, number> = {
  ad: 3,
  adset: 2,
  campaign: 1,
  media_source: 0,
};
type DeepLinkPresetKey = 'af_android_url' | 'af_dp' | 'af_ios_url' | 'af_web_dp';
const GLOBAL_DEEP_LINKING_PARAM_KEYS = PRESET_FIELDS_BY_SECTION.deep_linking_redirection as DeepLinkPresetKey[];
const DEEP_LINK_FIELD_DESCRIPTIONS: Record<DeepLinkPresetKey, string> = {
  af_android_url: 'Redirect destination when the Android app is not installed.',
  af_dp: 'App route to open when the app is installed.',
  af_ios_url: 'Redirect destination when the iOS app is not installed.',
  af_web_dp: 'Fallback destination for desktop and unsupported environments.',
};
const HIERARCHICAL_PARAM_KEYS = new Set(['pid', 'c', 'af_adset', 'af_ad']);

function normalizeScopePathPrefixes(scopePathPrefixes: string[]): string[] {
  return Array.from(new Set(scopePathPrefixes.map((prefix) => prefix.trim()).filter(Boolean))).sort((first, second) => {
    const firstDepth = first.split(' > ').length;
    const secondDepth = second.split(' > ').length;
    if (firstDepth !== secondDepth) {
      return firstDepth - secondDepth;
    }
    return first.localeCompare(second);
  });
}

function areScopesEqual(first: string[], second: string[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((prefix, index) => prefix === second[index]);
}

function getScopeSpecificity(scopePathPrefixes: string[]): number {
  return scopePathPrefixes.reduce((maxDepth, prefix) => {
    const depth = prefix.split(' > ').length;
    return Math.max(maxDepth, depth);
  }, 0);
}

function doesPathMatchScope(pathLabel: string, scopePathPrefixes: string[]): boolean {
  if (scopePathPrefixes.length === 0) {
    return true;
  }

  return scopePathPrefixes.some((scopePrefix) => pathLabel === scopePrefix || pathLabel.startsWith(`${scopePrefix} > `));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveLassoMode(event: {
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}): LassoMode {
  if (event.altKey) {
    return 'subtract';
  }
  if (event.metaKey || event.ctrlKey) {
    return 'toggle';
  }
  if (event.shiftKey) {
    return 'add';
  }
  return 'replace';
}

function OneLinkGroupCreatePage({ editGroupId }: OneLinkGroupCreatePageProps) {
  const { settings } = useSettings();
  const isEditMode = Boolean(editGroupId);

  const [activeStep, setActiveStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [dismissedAutoBrandDomainTemplateId, setDismissedAutoBrandDomainTemplateId] = useState('');
  const [roots, setRoots] = useState<EditorTreeNode[]>([]);
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({ root: '' });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [globalParamRows, setGlobalParamRows] = useState<ParamRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPollingExecution, setIsPollingExecution] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdGroupId, setCreatedGroupId] = useState('');
  const [executionDetail, setExecutionDetail] = useState<GroupExecutionDetail | null>(null);
  const [isTreePreviewExpanded, setIsTreePreviewExpanded] = useState(true);
  const [focusedSnippetIndex, setFocusedSnippetIndex] = useState(0);
  const [lassoRect, setLassoRect] = useState<LassoRectState | null>(null);
  const [lassoFrozenExpandedNodeIds, setLassoFrozenExpandedNodeIds] = useState<string[]>([]);
  const [fallbackExpandedNodeIds, setFallbackExpandedNodeIds] = useState<string[]>([]);
  const [selectedTreeNodeIds, setSelectedTreeNodeIds] = useState<string[]>([]);
  const [selectionAnchorNodeId, setSelectionAnchorNodeId] = useState('');
  const [activeTreeFieldLevel, setActiveTreeFieldLevel] = useState<LinkGroupNodeLevel | null>(null);
  const [activeParamKey, setActiveParamKey] = useState('');
  const [applyMode, setApplyMode] = useState<'all' | 'failed_only' | 'new_only'>('all');
  const [isLoadingEditSeed, setIsLoadingEditSeed] = useState(isEditMode);
  const [editSeedError, setEditSeedError] = useState('');

  const snippetWheelRef = useRef<HTMLDivElement | null>(null);
  const treeEditorScrollRef = useRef<HTMLDivElement | null>(null);
  const lassoSelectionStateRef = useRef<{
    active: boolean;
    baseSelectionIds: string[];
    baseSelectionLevel: LinkGroupNodeLevel | null;
    currentClientX: number;
    currentClientY: number;
    engaged: boolean;
    mode: LassoMode;
    startClientX: number;
    startClientY: number;
  }>({
    active: false,
    baseSelectionIds: [],
    baseSelectionLevel: null,
    currentClientX: 0,
    currentClientY: 0,
    engaged: false,
    mode: 'replace',
    startClientX: 0,
    startClientY: 0,
  });
  const lassoAutoScrollFrameRef = useRef<number | null>(null);
  const isEditHydrating = isEditMode && isLoadingEditSeed;

  const serializedRoots = useMemo(() => toSerializedNodes(roots), [roots]);
  const leafCount = useMemo(() => computeLeafCount(serializedRoots), [serializedRoots]);
  const maxDepth = useMemo(() => computeMaxDepth(serializedRoots), [serializedRoots]);
  const leafPaths = useMemo(() => generateLeafPaths(serializedRoots), [serializedRoots]);
  const allTreeNodes = useMemo(() => flattenTreeNodes(roots), [roots]);
  const treeNodeById = useMemo(
    () => new Map(allTreeNodes.map((node) => [node.id, node])),
    [allTreeNodes],
  );
  const parentNodeById = useMemo(() => {
    const parentMap = new Map<string, string | null>();

    const visit = (nodes: EditorTreeNode[], parentId: string | null) => {
      nodes.forEach((node) => {
        parentMap.set(node.id, parentId);
        visit(node.children, node.id);
      });
    };

    visit(roots, null);
    return parentMap;
  }, [roots]);
  const getFallbackExpandedNodeIdsForDeselection = useCallback((nodeId: string): string[] => {
    if (!nodeId) {
      return [];
    }

    const directParentId = parentNodeById.get(nodeId);
    if (!directParentId) {
      return [];
    }

    const fallbackExpanded = new Set<string>();
    let currentId = parentNodeById.get(directParentId) ?? null;

    while (currentId) {
      fallbackExpanded.add(currentId);
      currentId = parentNodeById.get(currentId) ?? null;
    }

    return Array.from(fallbackExpanded);
  }, [parentNodeById]);
  const selectedTreeNodes = useMemo(
    () => selectedTreeNodeIds
      .map((nodeId) => treeNodeById.get(nodeId))
      .filter((node): node is EditorTreeNode => Boolean(node)),
    [selectedTreeNodeIds, treeNodeById],
  );
  const selectedTreeNodeLevel = selectedTreeNodes[0]?.level ?? null;
  const selectedChildLevel = selectedTreeNodeLevel ? getAllowedChildLevel(selectedTreeNodeLevel) : null;
  const selectedTreeNodeSet = useMemo(
    () => new Set(selectedTreeNodeIds),
    [selectedTreeNodeIds],
  );
  const selectedScopePathPrefixes = useMemo(
    () => normalizeScopePathPrefixes(selectedTreeNodes.map((node) => {
      const labels = [node.value];
      let currentId = node.id;

      while (true) {
        const parentId = parentNodeById.get(currentId);
        if (!parentId) {
          break;
        }

        const parentNode = treeNodeById.get(parentId);
        if (!parentNode) {
          break;
        }

        labels.unshift(parentNode.value);
        currentId = parentId;
      }

      return labels.join(' > ');
    })),
    [parentNodeById, selectedTreeNodes, treeNodeById],
  );
  const activeParamScopeHint = selectedScopePathPrefixes.length === 0
    ? 'Current target: all links'
    : `Current target: selected branches (${selectedScopePathPrefixes.length})`;
  const normalizedGlobalParamRows = useMemo(
    () => globalParamRows.map((row) => ({
      ...row,
      key: row.key.trim(),
      scopePathPrefixes: normalizeScopePathPrefixes(row.scopePathPrefixes),
      value: row.value.trim(),
    })),
    [globalParamRows],
  );
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
      const matchingRow = [...normalizedGlobalParamRows]
        .reverse()
        .find(
          (row) => row.key === key && areScopesEqual(row.scopePathPrefixes, selectedScopePathPrefixes),
        );
      byKey[key] = matchingRow?.value ?? '';
    });

    return byKey;
  }, [normalizedGlobalParamRows, selectedScopePathPrefixes]);
  const deepLinkFields = useMemo(() => GLOBAL_DEEP_LINKING_PARAM_KEYS.map((key) => ({
    description: DEEP_LINK_FIELD_DESCRIPTIONS[key],
    key,
    label: PRESET_FIELD_LABELS[key],
    options: deepLinkValueOptionsByKey[key],
    placeholder: PRESET_FIELD_PLACEHOLDERS[key],
    value: deepLinkParamValueByKey[key] ?? '',
  })), [deepLinkParamValueByKey, deepLinkValueOptionsByKey]);
  const additionalParamRows = useMemo(
    () => globalParamRows.filter((row) => {
      const normalizedKey = row.key.trim();
      const normalizedScope = normalizeScopePathPrefixes(row.scopePathPrefixes);
      return !GLOBAL_DEEP_LINKING_PARAM_KEYS.includes(normalizedKey as DeepLinkPresetKey)
        && areScopesEqual(normalizedScope, selectedScopePathPrefixes);
    }),
    [globalParamRows, selectedScopePathPrefixes],
  );
  const additionalParamKeyOptions = useMemo(
    () => settings.presets.custom_param_key,
    [settings.presets.custom_param_key],
  );
  const additionalParamValueOptions = useMemo(
    () => settings.presets.custom_param_value,
    [settings.presets.custom_param_value],
  );
  const lassoFrozenExpandedNodeSet = useMemo(
    () => new Set(lassoFrozenExpandedNodeIds),
    [lassoFrozenExpandedNodeIds],
  );
  const expandedTreeNodeSet = useMemo(() => {
    const expanded = new Set<string>();

    const expandImmediateChildren = (node: EditorTreeNode) => {
      if (node.children.length > 0) {
        expanded.add(node.id);
      }
    };

    const expandAncestors = (nodeId: string) => {
      let currentId = nodeId;
      while (true) {
        const parentId = parentNodeById.get(currentId);
        if (!parentId) {
          break;
        }

        expanded.add(parentId);
        currentId = parentId;
      }
    };

    selectedTreeNodes.forEach((node) => {
      expandAncestors(node.id);
      expandImmediateChildren(node);
    });

    if (selectedTreeNodes.length === 0) {
      fallbackExpandedNodeIds.forEach((nodeId) => expanded.add(nodeId));
    }

    return expanded;
  }, [fallbackExpandedNodeIds, parentNodeById, selectedTreeNodes]);

  const templateOptions = useMemo(
    () => [...new Set(settings.templateIds)].filter(Boolean),
    [settings.templateIds],
  );
  const resolvedTemplateId = useMemo(() => {
    const normalized = templateId.trim();
    if (normalized) {
      return normalized;
    }
    if (templateOptions.length === 1) {
      return templateOptions[0];
    }
    return '';
  }, [templateId, templateOptions]);
  const brandDomainOptions = useMemo(
    () => (resolvedTemplateId ? settings.templateBrandedDomains[resolvedTemplateId] ?? [] : []),
    [resolvedTemplateId, settings.templateBrandedDomains],
  );
  const resolvedBrandDomain = useMemo(() => {
    const normalized = brandDomain.trim();
    if (normalized) {
      return normalized;
    }
    if (!resolvedTemplateId) {
      return '';
    }
    if (resolvedTemplateId === dismissedAutoBrandDomainTemplateId) {
      return '';
    }
    if (brandDomainOptions.length === 1) {
      return brandDomainOptions[0];
    }
    return '';
  }, [brandDomain, brandDomainOptions, dismissedAutoBrandDomainTemplateId, resolvedTemplateId]);
  const getPresetOptionsForLevel = useCallback((level: LinkGroupNodeLevel): string[] => {
    if (level === 'media_source') {
      return settings.presets.pid;
    }
    if (level === 'campaign') {
      return settings.presets.c;
    }
    if (level === 'adset') {
      return settings.presets.af_adset;
    }
    return settings.presets.af_ad;
  }, [settings.presets.af_ad, settings.presets.af_adset, settings.presets.c, settings.presets.pid]);

  useEffect(() => {
    if (!editGroupId) {
      setIsLoadingEditSeed(false);
      setEditSeedError('');
      return;
    }

    let isDisposed = false;

    const loadEditSeed = async () => {
      setIsLoadingEditSeed(true);
      setEditSeedError('');

      try {
        const response = await fetch(
          `/api/onelink-groups/${encodeURIComponent(editGroupId)}?page=1&pageSize=1`,
          { cache: 'no-store', method: 'GET' },
        );
        const payload = (await response.json().catch(() => null)) as EditSeedResponse | null;

        if (!response.ok || !payload?.id) {
          if (!isDisposed) {
            setEditSeedError(payload?.error || 'Failed to load existing group data.');
          }
          return;
        }

        const parsedTree = JSON.parse(payload.treeConfigJson) as { roots?: LinkGroupTreeNode[] } | null;
        if (!parsedTree || !Array.isArray(parsedTree.roots)) {
          if (!isDisposed) {
            setEditSeedError('Stored tree config is invalid.');
          }
          return;
        }

        if (isDisposed) {
          return;
        }

        setGroupName(payload.name);
        setTemplateId(payload.templateId);
        setBrandDomain(payload.brandDomain);
        setRoots(hydrateEditorNodes(parsedTree.roots));

        const globalRows = Object.entries(payload.globalParams ?? {}).map(([key, value]) => ({
          id: createClientId(),
          key,
          scopePathPrefixes: [],
          value,
        }));
        const scopedRows = (payload.scopedParams ?? []).map((rule) => ({
          id: createClientId(),
          key: rule.key,
          scopePathPrefixes: normalizeScopePathPrefixes(rule.scopePathPrefixes),
          value: rule.value,
        }));
        setGlobalParamRows([...globalRows, ...scopedRows]);

        setSelectedTreeNodeIds([]);
        setSelectionAnchorNodeId('');
        setCreatedGroupId('');
        setExecutionDetail(null);
        setWarnings([]);
      } catch {
        if (!isDisposed) {
          setEditSeedError('Failed to load existing group data.');
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingEditSeed(false);
        }
      }
    };

    void loadEditSeed();

    return () => {
      isDisposed = true;
    };
  }, [editGroupId]);

  const canProceedFromStep = useMemo(() => {
    if (isEditHydrating) {
      return false;
    }

    if (activeStep === 0) {
      return Boolean(groupName.trim() && resolvedTemplateId.trim());
    }

    if (activeStep === 1) {
      return leafCount > 0 && leafCount <= 2000;
    }

    return true;
  }, [activeStep, groupName, isEditHydrating, leafCount, resolvedTemplateId]);

  const globalParams = useMemo(() => {
    return normalizedGlobalParamRows.reduce<Record<string, string>>((accumulator, row) => {
      if (!row.key || !row.value || row.scopePathPrefixes.length > 0 || HIERARCHICAL_PARAM_KEYS.has(row.key)) {
        return accumulator;
      }

      accumulator[row.key] = row.value;
      return accumulator;
    }, {});
  }, [normalizedGlobalParamRows]);
  const scopedParams = useMemo<ScopedParamRule[]>(
    () => normalizedGlobalParamRows
      .filter((row) => row.key && row.value && row.scopePathPrefixes.length > 0 && !HIERARCHICAL_PARAM_KEYS.has(row.key))
      .map((row) => ({
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

  const previewSnippets = useMemo<SnippetPreview[]>(() => {
    const normalizedTemplateId = resolvedTemplateId.trim() || 'template';
    const normalizedBrandDomain = resolvedBrandDomain.trim();
    const baseUrl = normalizedBrandDomain
      ? `https://${normalizedBrandDomain}/${normalizedTemplateId}`
      : `https://app.onelink.me/${normalizedTemplateId}`;

    if (roots.length === 0) {
      if (activeStep === 1) {
        return [];
      }

      const skeleton = `${baseUrl}?pid={media_source}&c={campaign}&af_adset={adset}&af_ad={ad}`;
      return [{
        pathLabel: 'No tree path selected',
        fullUrl: skeleton,
        nodeIds: [],
        payload: {},
      }];
    }

    const snippets: SnippetPreview[] = [];
    const visit = (
      node: EditorTreeNode,
      payloadAccumulator: Record<string, string>,
      nodeIds: string[],
      labels: string[],
    ) => {
      const nextPayload = { ...payloadAccumulator };
      const nextNodeIds = [...nodeIds, node.id];
      const nextLabels = [...labels, node.value];
      const hierarchicalKey = getParamKeyForLevel(node.level);

      nextPayload[hierarchicalKey] = node.value;

      if (node.children.length === 0) {
        const pathLabel = nextLabels.join(' > ');
        const payload = {
          ...globalParams,
          ...nextPayload,
        };
        sortedScopedParams.forEach((rule) => {
          if (!doesPathMatchScope(pathLabel, rule.scopePathPrefixes)) {
            return;
          }
          payload[rule.key] = rule.value;
        });
        const query = new URLSearchParams(payload).toString();
        const fullUrl = query ? `${baseUrl}?${query}` : baseUrl;
        snippets.push({
          pathLabel,
          fullUrl,
          nodeIds: nextNodeIds,
          payload,
        });
        return;
      }

      node.children.forEach((child) => {
        visit(child, nextPayload, nextNodeIds, nextLabels);
      });
    };

    roots.forEach((rootNode) => {
      visit(rootNode, {}, [], []);
    });

    return snippets;
  }, [activeStep, globalParams, resolvedBrandDomain, resolvedTemplateId, roots, sortedScopedParams]);

  const filteredSnippets = useMemo(() => {
    if (activeStep !== 1 || selectedTreeNodeIds.length === 0) {
      return previewSnippets;
    }

    return previewSnippets.filter((snippet) => snippet.nodeIds.some((nodeId) => selectedTreeNodeSet.has(nodeId)));
  }, [activeStep, previewSnippets, selectedTreeNodeIds.length, selectedTreeNodeSet]);

  const activeSnippetContextLabel = useMemo(() => {
    if (selectedTreeNodes.length === 0) {
      return '';
    }

    if (selectedTreeNodes.length === 1) {
      return selectedTreeNodes[0].value;
    }

    return `${selectedTreeNodes.length} ${formatLevelLabel(selectedTreeNodeLevel)} nodes`;
  }, [selectedTreeNodeLevel, selectedTreeNodes]);

  const snippetHighlightToken = useMemo(() => {
    if (activeStep === 1 && activeTreeFieldLevel) {
      const paramKey = getParamKeyForLevel(activeTreeFieldLevel);
      return `${paramKey}=`;
    }

    const normalizedParamKey = activeParamKey.trim();
    if (activeStep === 2 && normalizedParamKey) {
      return `${encodeURIComponent(normalizedParamKey)}=`;
    }

    return '';
  }, [activeParamKey, activeStep, activeTreeFieldLevel]);

  const isSnippetWheelMode = activeStep !== 3;

  const scrollSnippetWheelToIndex = useCallback((targetIndex: number, behavior: ScrollBehavior = 'smooth') => {
    const wheelNode = snippetWheelRef.current;
    if (!wheelNode || filteredSnippets.length === 0) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(filteredSnippets.length - 1, targetIndex));
    wheelNode.scrollTo({
      behavior,
      top: clampedIndex * SNIPPET_WHEEL_ITEM_HEIGHT,
    });
  }, [filteredSnippets.length]);

  const handleSnippetWheelScroll = useCallback(() => {
    if (!isSnippetWheelMode) {
      return;
    }

    const wheelNode = snippetWheelRef.current;
    if (!wheelNode || filteredSnippets.length === 0) {
      return;
    }

    const estimatedIndex = Math.round(wheelNode.scrollTop / SNIPPET_WHEEL_ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(filteredSnippets.length - 1, estimatedIndex));
    setFocusedSnippetIndex(clampedIndex);
  }, [filteredSnippets.length, isSnippetWheelMode]);

  const handleSelectSnippet = useCallback((index: number) => {
    setFocusedSnippetIndex(index);
    if (isSnippetWheelMode) {
      scrollSnippetWheelToIndex(index);
    }
  }, [isSnippetWheelMode, scrollSnippetWheelToIndex]);

  const computeNextSelectionFromLasso = useCallback((
    hitNodes: Array<{ id: string; level: LinkGroupNodeLevel }>,
    mode: LassoMode,
    baseSelectionIds: string[],
    baseSelectionLevel: LinkGroupNodeLevel | null,
  ): { nextLevel: LinkGroupNodeLevel | null; nextSelectionIds: string[] } => {
    const normalizedBaseSelectionIds = baseSelectionLevel
      ? baseSelectionIds.filter((nodeId) => treeNodeById.get(nodeId)?.level === baseSelectionLevel)
      : [];
    const levelCounts = hitNodes.reduce<Map<LinkGroupNodeLevel, number>>((counts, hit) => {
      counts.set(hit.level, (counts.get(hit.level) ?? 0) + 1);
      return counts;
    }, new Map<LinkGroupNodeLevel, number>());
    const mostFrequentHitLevel = Array.from(levelCounts.entries())
      .sort((a, b) => {
        if (a[1] !== b[1]) {
          return b[1] - a[1];
        }
        return TREE_LEVEL_DEPTH[b[0]] - TREE_LEVEL_DEPTH[a[0]];
      })[0]?.[0] ?? null;

    let targetLevel: LinkGroupNodeLevel | null = null;
    if (mode === 'replace') {
      targetLevel = mostFrequentHitLevel;
    } else {
      targetLevel = baseSelectionLevel ?? mostFrequentHitLevel;
    }

    if (!targetLevel) {
      return {
        nextLevel: null,
        nextSelectionIds: mode === 'replace' ? [] : normalizedBaseSelectionIds,
      };
    }

    const hitIds = hitNodes
      .filter((hit) => hit.level === targetLevel)
      .map((hit) => hit.id);
    const hitSet = new Set(hitIds);

    if (mode === 'replace') {
      if (hitIds.length === 0) {
        return {
          nextLevel: null,
          nextSelectionIds: [],
        };
      }

      return {
        nextLevel: targetLevel,
        nextSelectionIds: hitIds,
      };
    }

    if (mode === 'add') {
      const merged = [...normalizedBaseSelectionIds];
      hitIds.forEach((nodeId) => {
        if (!merged.includes(nodeId)) {
          merged.push(nodeId);
        }
      });
      return {
        nextLevel: merged.length > 0 ? targetLevel : null,
        nextSelectionIds: merged,
      };
    }

    if (mode === 'subtract') {
      const reduced = normalizedBaseSelectionIds.filter((nodeId) => !hitSet.has(nodeId));
      return {
        nextLevel: reduced.length > 0 ? targetLevel : null,
        nextSelectionIds: reduced,
      };
    }

    const toggled = [...normalizedBaseSelectionIds];
    hitIds.forEach((nodeId) => {
      const existingIndex = toggled.indexOf(nodeId);
      if (existingIndex >= 0) {
        toggled.splice(existingIndex, 1);
      } else {
        toggled.push(nodeId);
      }
    });

    return {
      nextLevel: toggled.length > 0 ? targetLevel : null,
      nextSelectionIds: toggled,
    };
  }, [treeNodeById]);

  const updateLassoSelection = useCallback((
    clientX: number,
    clientY: number,
    options?: { finalize?: boolean },
  ) => {
    const lassoState = lassoSelectionStateRef.current;
    const container = treeEditorScrollRef.current;

    if (!lassoState.active || !container) {
      return;
    }

    lassoState.currentClientX = clientX;
    lassoState.currentClientY = clientY;

    const deltaX = Math.abs(clientX - lassoState.startClientX);
    const deltaY = Math.abs(clientY - lassoState.startClientY);
    if (!lassoState.engaged && Math.max(deltaX, deltaY) < LASSO_START_THRESHOLD_PX) {
      return;
    }
    if (!lassoState.engaged) {
      lassoState.engaged = true;
    }

    const containerRect = container.getBoundingClientRect();
    const startX = clamp(lassoState.startClientX, containerRect.left, containerRect.right);
    const startY = clamp(lassoState.startClientY, containerRect.top, containerRect.bottom);
    const currentX = clamp(clientX, containerRect.left, containerRect.right);
    const currentY = clamp(clientY, containerRect.top, containerRect.bottom);

    const viewportRect = {
      bottom: Math.max(startY, currentY),
      left: Math.min(startX, currentX),
      right: Math.max(startX, currentX),
      top: Math.min(startY, currentY),
    };
    const nextRect = {
      height: viewportRect.bottom - viewportRect.top,
      left: viewportRect.left - containerRect.left + container.scrollLeft,
      top: viewportRect.top - containerRect.top + container.scrollTop,
      width: viewportRect.right - viewportRect.left,
    };

    setLassoRect((previous) => {
      if (
        previous
        && previous.height === nextRect.height
        && previous.left === nextRect.left
        && previous.top === nextRect.top
        && previous.width === nextRect.width
      ) {
        return previous;
      }

      return nextRect;
    });

    const chipElements = Array.from(container.querySelectorAll<HTMLElement>('[data-tree-chip-node-id]'));
    const hitNodes = chipElements
      .filter((chipElement) => {
        const chipRect = chipElement.getBoundingClientRect();
        return (
          chipRect.right >= viewportRect.left
          && chipRect.left <= viewportRect.right
          && chipRect.bottom >= viewportRect.top
          && chipRect.top <= viewportRect.bottom
        );
      })
      .map((chipElement) => ({
        id: chipElement.dataset.treeChipNodeId ?? '',
        level: chipElement.dataset.treeChipLevel as LinkGroupNodeLevel | undefined,
      }))
      .filter((chip): chip is { id: string; level: LinkGroupNodeLevel } => Boolean(chip.id && chip.level));

    if (lassoState.mode === 'replace' && hitNodes.length === 0 && !options?.finalize) {
      setSelectedTreeNodeIds((previous) => (
        previous.length === lassoState.baseSelectionIds.length
          && previous.every((nodeId, index) => nodeId === lassoState.baseSelectionIds[index])
          ? previous
          : lassoState.baseSelectionIds
      ));
      setActiveTreeFieldLevel((previous) => (
        previous === lassoState.baseSelectionLevel ? previous : lassoState.baseSelectionLevel
      ));
      return;
    }

    const nextSelection = computeNextSelectionFromLasso(
      hitNodes,
      lassoState.mode,
      lassoState.baseSelectionIds,
      lassoState.baseSelectionLevel,
    );
    setSelectedTreeNodeIds((previous) => (
      previous.length === nextSelection.nextSelectionIds.length
        && previous.every((nodeId, index) => nodeId === nextSelection.nextSelectionIds[index])
        ? previous
        : nextSelection.nextSelectionIds
    ));
    setActiveTreeFieldLevel((previous) => (
      previous === nextSelection.nextLevel ? previous : nextSelection.nextLevel
    ));
  }, [computeNextSelectionFromLasso]);

  const stopLassoAutoScroll = useCallback(() => {
    if (lassoAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(lassoAutoScrollFrameRef.current);
      lassoAutoScrollFrameRef.current = null;
    }
  }, []);

  const startLassoAutoScroll = useCallback(() => {
    if (lassoAutoScrollFrameRef.current !== null) {
      return;
    }

    const tick = () => {
      const lassoState = lassoSelectionStateRef.current;
      const container = treeEditorScrollRef.current;

      if (!lassoState.active || !container) {
        lassoAutoScrollFrameRef.current = null;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const scrollThreshold = 36;
      let delta = 0;

      if (lassoState.currentClientY < containerRect.top + scrollThreshold) {
        delta = -Math.ceil((containerRect.top + scrollThreshold - lassoState.currentClientY) / 6);
      } else if (lassoState.currentClientY > containerRect.bottom - scrollThreshold) {
        delta = Math.ceil((lassoState.currentClientY - (containerRect.bottom - scrollThreshold)) / 6);
      }

      if (delta !== 0) {
        const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
        const nextScrollTop = clamp(container.scrollTop + delta, 0, maxScrollTop);
        if (nextScrollTop !== container.scrollTop) {
          container.scrollTop = nextScrollTop;
          updateLassoSelection(lassoState.currentClientX, lassoState.currentClientY);
        }
      }

      lassoAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
    };

    lassoAutoScrollFrameRef.current = window.requestAnimationFrame(tick);
  }, [updateLassoSelection]);

  const handleTreeEditorMouseDown = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (activeStep !== 1 || event.button !== 0) {
      return;
    }

    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('[data-tree-chip-node-id],button,input,textarea,[contenteditable="true"],[role="button"]')) {
      return;
    }

    const mode = resolveLassoMode(event);

    lassoSelectionStateRef.current.active = true;
    lassoSelectionStateRef.current.baseSelectionIds = selectedTreeNodeIds;
    lassoSelectionStateRef.current.baseSelectionLevel = selectedTreeNodeLevel;
    lassoSelectionStateRef.current.currentClientX = event.clientX;
    lassoSelectionStateRef.current.currentClientY = event.clientY;
    lassoSelectionStateRef.current.engaged = false;
    lassoSelectionStateRef.current.mode = mode;
    lassoSelectionStateRef.current.startClientX = event.clientX;
    lassoSelectionStateRef.current.startClientY = event.clientY;

    setLassoFrozenExpandedNodeIds(Array.from(expandedTreeNodeSet));
    setLassoRect(null);
    startLassoAutoScroll();
    event.preventDefault();
  }, [
    activeStep,
    expandedTreeNodeSet,
    selectedTreeNodeIds,
    selectedTreeNodeLevel,
    startLassoAutoScroll,
  ]);

  useEffect(() => {
    if (filteredSnippets.length === 0) {
      setFocusedSnippetIndex(0);
      return;
    }

    setFocusedSnippetIndex((previous) => Math.min(previous, filteredSnippets.length - 1));
  }, [filteredSnippets.length]);

  useEffect(() => {
    if (!isSnippetWheelMode || filteredSnippets.length === 0) {
      return;
    }

    const wheelNode = snippetWheelRef.current;
    if (!wheelNode) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(filteredSnippets.length - 1, focusedSnippetIndex));
    wheelNode.scrollTo({
      behavior: 'auto',
      top: clampedIndex * SNIPPET_WHEEL_ITEM_HEIGHT,
    });
  }, [filteredSnippets.length, focusedSnippetIndex, isSnippetWheelMode]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!lassoSelectionStateRef.current.active) {
        return;
      }

      updateLassoSelection(event.clientX, event.clientY);
    };

    const handleMouseUp = () => {
      const lassoState = lassoSelectionStateRef.current;
      if (!lassoState.active) {
        return;
      }

      if (lassoState.engaged) {
        updateLassoSelection(lassoState.currentClientX, lassoState.currentClientY, { finalize: true });
      }

      lassoState.active = false;
      lassoState.engaged = false;
      setLassoRect(null);
      setLassoFrozenExpandedNodeIds([]);
      stopLassoAutoScroll();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      stopLassoAutoScroll();
    };
  }, [stopLassoAutoScroll, updateLassoSelection]);

  useEffect(() => {
    setSelectedTreeNodeIds((previous) => {
      const next = previous.filter((nodeId) => treeNodeById.has(nodeId));
      return next.length === previous.length ? previous : next;
    });
    setFallbackExpandedNodeIds((previous) => {
      const next = previous.filter((nodeId) => treeNodeById.has(nodeId));
      return next.length === previous.length ? previous : next;
    });
  }, [treeNodeById]);

  const previousSelectedTreeNodeIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const previousSelectionIds = previousSelectedTreeNodeIdsRef.current;
    const hadPreviousSelection = previousSelectionIds.length > 0;
    const hasCurrentSelection = selectedTreeNodeIds.length > 0;

    if (hasCurrentSelection) {
      setFallbackExpandedNodeIds((previous) => (previous.length > 0 ? [] : previous));
      previousSelectedTreeNodeIdsRef.current = selectedTreeNodeIds;
      return;
    }

    if (!hadPreviousSelection) {
      previousSelectedTreeNodeIdsRef.current = selectedTreeNodeIds;
      return;
    }

    const referenceNodeId = treeNodeById.has(selectionAnchorNodeId)
      ? selectionAnchorNodeId
      : previousSelectionIds.find((nodeId) => treeNodeById.has(nodeId)) ?? '';
    const nextFallbackExpanded = getFallbackExpandedNodeIdsForDeselection(referenceNodeId);

    setFallbackExpandedNodeIds((previous) => (
      previous.length === nextFallbackExpanded.length
      && previous.every((nodeId, index) => nodeId === nextFallbackExpanded[index])
        ? previous
        : nextFallbackExpanded
    ));
    previousSelectedTreeNodeIdsRef.current = selectedTreeNodeIds;
  }, [
    getFallbackExpandedNodeIdsForDeselection,
    selectedTreeNodeIds,
    selectionAnchorNodeId,
    treeNodeById,
  ]);

  useEffect(() => {
    if (!selectionAnchorNodeId) {
      return;
    }

    if (!treeNodeById.has(selectionAnchorNodeId)) {
      setSelectionAnchorNodeId('');
    }
  }, [selectionAnchorNodeId, treeNodeById]);

  useEffect(() => {
    if (activeStep === 1) {
      return;
    }

    lassoSelectionStateRef.current.active = false;
    lassoSelectionStateRef.current.engaged = false;
    setLassoRect(null);
    setLassoFrozenExpandedNodeIds([]);
    stopLassoAutoScroll();
  }, [activeStep, stopLassoAutoScroll]);

  const loadExecutionDetail = useCallback(async (groupId: string) => {
    const response = await fetch(`/api/onelink-groups/${encodeURIComponent(groupId)}?page=1&pageSize=50`, {
      cache: 'no-store',
      method: 'GET',
    });

    const payload = (await response.json().catch(() => null)) as (GroupExecutionDetail & { error?: string }) | null;
    if (!response.ok || !payload || !payload.id) {
      throw new Error(payload?.error || 'Failed to load execution status.');
    }

    setExecutionDetail({
      failedCount: payload.failedCount,
      id: payload.id,
      items: payload.items,
      plannedCount: payload.plannedCount,
      status: payload.status,
      successCount: payload.successCount,
    });

    return payload;
  }, []);

  useEffect(() => {
    if (!createdGroupId) {
      return;
    }

    let isDisposed = false;
    let timer: number | null = null;

    const stopTimer = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const startTimer = () => {
      if (timer !== null) {
        return;
      }

      timer = window.setInterval(() => {
        void poll();
      }, 2000);
    };

    const poll = async () => {
      try {
        const detail = await loadExecutionDetail(createdGroupId);
        if (isDisposed) {
          return;
        }

        if (detail.status === 'running') {
          setIsPollingExecution(true);
          startTimer();
        } else {
          setIsPollingExecution(false);
          stopTimer();
        }
      } catch {
        if (!isDisposed) {
          setIsPollingExecution(false);
          stopTimer();
        }
      }
    };

    void poll();

    return () => {
      isDisposed = true;
      stopTimer();
    };
  }, [createdGroupId, loadExecutionDetail]);

  const executionProgressPercent = useMemo(() => {
    if (!executionDetail || executionDetail.plannedCount < 1) {
      return 0;
    }

    const processed = executionDetail.successCount + executionDetail.failedCount;
    return Math.min(100, Math.round((processed / executionDetail.plannedCount) * 100));
  }, [executionDetail]);

  const canRetryFailedItems = useMemo(() => {
    if (!executionDetail) {
      return false;
    }

    return executionDetail.failedCount > 0 && executionDetail.status !== 'running' && !isRetrying;
  }, [executionDetail, isRetrying]);

  const setDraft = useCallback((draftKey: string, value: string) => {
    setInputDrafts((previous) => ({
      ...previous,
      [draftKey]: value,
    }));
  }, []);

  const filterDuplicateWarnings = useCallback((nextWarnings: string[]) => (
    nextWarnings.filter((warning) => !warning.startsWith('Duplicate value '))
  ), []);

  const addRootNodes = useCallback((rawInputOverride?: string) => {
    const rawInput = rawInputOverride ?? inputDrafts.root ?? '';
    const parsed = parseMultiValueInput(rawInput, {
      maxCharPerValue: 100,
      maxValues: 500,
    });

    if (parsed.values.length === 0) {
      setWarnings(parsed.warnings.length > 0 ? parsed.warnings : ['No valid MediaSource values were detected.']);
      return;
    }

    const appended = appendUniqueChildren(roots, 'media_source', parsed.values);
    setRoots(appended.appendedChildren);
    setWarnings(filterDuplicateWarnings([...parsed.warnings, ...appended.warnings]));
    setDraft('root', '');
  }, [filterDuplicateWarnings, inputDrafts.root, roots, setDraft]);

  const addChildrenToSelection = useCallback((rawInputOverride?: string) => {
    if (!selectedChildLevel || !selectedTreeNodeLevel || selectedTreeNodeIds.length === 0) {
      return;
    }

    const draftKey = `selection:${selectedTreeNodeLevel}`;
    const rawInput = rawInputOverride ?? inputDrafts[draftKey] ?? '';

    const parsed = parseMultiValueInput(rawInput, {
      maxCharPerValue: 100,
      maxValues: 500,
    });

    if (parsed.values.length === 0) {
      setWarnings(parsed.warnings.length > 0 ? parsed.warnings : ['No valid child values were detected.']);
      return;
    }

    let nextRoots = roots;
    const insertionWarnings: string[] = [];

    selectedTreeNodeIds.forEach((nodeId) => {
      const result = insertChildrenUnderNode(nextRoots, nodeId, selectedChildLevel, parsed.values);
      nextRoots = result.nodes;
      insertionWarnings.push(...result.warnings);
    });

    setRoots(nextRoots);
    setWarnings(filterDuplicateWarnings([...parsed.warnings, ...insertionWarnings]));
    setDraft(draftKey, '');
  }, [
    filterDuplicateWarnings,
    inputDrafts,
    roots,
    selectedChildLevel,
    selectedTreeNodeIds,
    selectedTreeNodeLevel,
    setDraft,
  ]);

  const removeNode = useCallback((nodeId: string) => {
    const targetNode = findNodeById(roots, nodeId);
    if (targetNode) {
      const descendantCount = countDescendants(targetNode);
      if (descendantCount > 0) {
        const confirmed = window.confirm(
          `Delete ${targetNode.value} and its ${descendantCount} child node${descendantCount > 1 ? 's' : ''}?`,
        );
        if (!confirmed) {
          return;
        }
      }
    }

    setRoots((previous) => removeNodeById(previous, nodeId));
  }, [roots]);

  const addParamRow = useCallback(() => {
    setGlobalParamRows((previous) => [
      ...previous,
      { id: createClientId(), key: '', scopePathPrefixes: selectedScopePathPrefixes, value: '' },
    ]);
  }, [selectedScopePathPrefixes]);

  const updateParamRow = useCallback((rowId: string, field: 'key' | 'value', value: string) => {
    setGlobalParamRows((previous) => previous.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      return {
        ...row,
        scopePathPrefixes: selectedScopePathPrefixes,
        [field]: value,
      };
    }));
  }, [selectedScopePathPrefixes]);

  const removeParamRow = useCallback((rowId: string) => {
    setGlobalParamRows((previous) => previous.filter((row) => row.id !== rowId));
  }, []);
  const setDeepLinkParamValue = useCallback((paramKey: string, value: string) => {
    setGlobalParamRows((previous) => {
      const nextRows = previous.filter(
        (row) =>
          !(row.key.trim() === paramKey && areScopesEqual(normalizeScopePathPrefixes(row.scopePathPrefixes), selectedScopePathPrefixes)),
      );
      if (!value.trim()) {
        return nextRows;
      }
      return [
        ...nextRows,
        { id: createClientId(), key: paramKey, scopePathPrefixes: selectedScopePathPrefixes, value },
      ];
    });
  }, [selectedScopePathPrefixes]);

  const handleTemplateIdChange = useCallback((nextValue: string) => {
    setTemplateId(nextValue);
    setDismissedAutoBrandDomainTemplateId('');
  }, []);

  const handleBrandDomainChange = useCallback((nextValue: string) => {
    const normalized = nextValue.trim();
    if (!normalized) {
      setBrandDomain('');
      setDismissedAutoBrandDomainTemplateId(resolvedTemplateId);
      return;
    }
    setDismissedAutoBrandDomainTemplateId('');
    setBrandDomain(nextValue);
  }, [resolvedTemplateId]);

  const handleExecute = useCallback(async () => {
    if (isEditHydrating) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setCreatedGroupId('');
    setExecutionDetail(null);
    setIsPollingExecution(false);

    try {
      const basePayload = {
        brandDomain: resolvedBrandDomain.trim(),
        globalParams,
        name: groupName.trim(),
        scopedParams,
        templateId: resolvedTemplateId.trim(),
        treeConfig: {
          roots: serializedRoots,
          version: 1,
        },
      };

      const isEditRequest = Boolean(editGroupId);
      const response = await fetch(isEditRequest ? `/api/onelink-groups/${encodeURIComponent(editGroupId as string)}` : '/api/onelink-groups', {
        body: JSON.stringify(
          isEditRequest
            ? {
              ...basePayload,
              applyMode,
            }
            : basePayload,
        ),
        headers: {
          'content-type': 'application/json',
        },
        method: isEditRequest ? 'PUT' : 'POST',
      });

      const payload = (await response.json().catch(() => null)) as (
        {
          diff?: {
            addedPaths: string[];
            failedPaths: string[];
            removedPaths: string[];
            unchangedPaths: string[];
          };
          error?: string;
          execution?: {
            status?: string;
            targetedItemCount?: number;
          };
          group?: { id: string };
          warnings?: string[];
        }
      ) | null;

      if (!response.ok || !payload?.group?.id) {
        setSubmitError(payload?.error || (isEditRequest ? 'Failed to update link group.' : 'Failed to create link group.'));
        return;
      }

      if (isEditRequest) {
        const diffSummary: string[] = [];
        if (payload.diff) {
          if (payload.diff.addedPaths.length > 0) {
            diffSummary.push(`Added paths: ${payload.diff.addedPaths.length}`);
          }
          if (payload.diff.removedPaths.length > 0) {
            diffSummary.push(`Removed paths: ${payload.diff.removedPaths.length}`);
          }
          if (payload.diff.failedPaths.length > 0) {
            diffSummary.push(`Previously failed paths retained: ${payload.diff.failedPaths.length}`);
          }
          diffSummary.push(`Unchanged paths: ${payload.diff.unchangedPaths.length}`);
        }

        setWarnings(diffSummary);
      } else {
        setWarnings(payload.warnings ?? []);
      }

      setCreatedGroupId(payload.group.id);

      const shouldPoll = payload.execution?.status === 'running'
        && (payload.execution.targetedItemCount ?? leafPaths.length) > 0;
      setIsPollingExecution(shouldPoll);

      if (shouldPoll) {
        await loadExecutionDetail(payload.group.id);
      }

      setActiveStep(3);
    } catch {
      setSubmitError(isEditMode ? 'Failed to update link group.' : 'Failed to create link group.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    applyMode,
    editGroupId,
    globalParams,
    groupName,
    isEditHydrating,
    isEditMode,
    leafPaths.length,
    loadExecutionDetail,
    resolvedBrandDomain,
    resolvedTemplateId,
    scopedParams,
    serializedRoots,
  ]);

  const handleRetryFailedItems = useCallback(async () => {
    if (!executionDetail || !canRetryFailedItems) {
      return;
    }

    setIsRetrying(true);
    setSubmitError('');

    try {
      const response = await fetch(`/api/onelink-groups/${encodeURIComponent(executionDetail.id)}/retry`, {
        method: 'POST',
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setSubmitError(payload?.error || 'Failed to retry failed items.');
        return;
      }

      setIsPollingExecution(true);
      await loadExecutionDetail(executionDetail.id);
    } catch {
      setSubmitError('Failed to retry failed items.');
    } finally {
      setIsRetrying(false);
    }
  }, [canRetryFailedItems, executionDetail, loadExecutionDetail]);

  const addNodeRangeSelection = useCallback((nodeIds: string[], level: LinkGroupNodeLevel) => {
    if (nodeIds.length === 0) {
      return;
    }

    setSelectedTreeNodeIds((previous) => {
      const hasDifferentLevel = previous.some((selectedId) => treeNodeById.get(selectedId)?.level !== level);
      const merged = new Set<string>(hasDifferentLevel ? [] : previous);
      nodeIds.forEach((nodeId) => merged.add(nodeId));
      return Array.from(merged);
    });
    setActiveTreeFieldLevel(level);
  }, [treeNodeById]);

  const toggleNodeSelection = useCallback((nodeId: string, level: LinkGroupNodeLevel) => {
    const alreadySelected = selectedTreeNodeIds.includes(nodeId);
    let nextSelectedIds: string[] = [];

    if (alreadySelected) {
      nextSelectedIds = selectedTreeNodeIds.filter((selectedId) => selectedId !== nodeId);
    } else {
      const hasDifferentLevel = selectedTreeNodeIds.some((selectedId) => treeNodeById.get(selectedId)?.level !== level);
      nextSelectedIds = hasDifferentLevel ? [nodeId] : [...selectedTreeNodeIds, nodeId];
    }

    setSelectedTreeNodeIds(nextSelectedIds);
    setActiveTreeFieldLevel(nextSelectedIds.length > 0 ? level : null);
    setSelectionAnchorNodeId(nodeId);
  }, [selectedTreeNodeIds, treeNodeById]);

  const handleNodeChipClick = useCallback((
    nodeId: string,
    level: LinkGroupNodeLevel,
    siblingNodeIds: string[],
    shiftKey: boolean,
  ) => {
    if (shiftKey && selectionAnchorNodeId && siblingNodeIds.includes(selectionAnchorNodeId)) {
      const anchorIndex = siblingNodeIds.indexOf(selectionAnchorNodeId);
      const targetIndex = siblingNodeIds.indexOf(nodeId);
      if (anchorIndex >= 0 && targetIndex >= 0) {
        const [startIndex, endIndex] = anchorIndex <= targetIndex
          ? [anchorIndex, targetIndex]
          : [targetIndex, anchorIndex];
        addNodeRangeSelection(siblingNodeIds.slice(startIndex, endIndex + 1), level);
        setSelectionAnchorNodeId(nodeId);
        return;
      }
    }

    toggleNodeSelection(nodeId, level);
  }, [addNodeRangeSelection, selectionAnchorNodeId, toggleNodeSelection]);

  const nodeListProps = useMemo<Omit<NodeListProps, 'nodes'>>(() => ({
    isNodeExpanded: (nodeId) => {
      if (lassoSelectionStateRef.current.active) {
        return lassoFrozenExpandedNodeSet.has(nodeId);
      }

      return expandedTreeNodeSet.has(nodeId) || lassoFrozenExpandedNodeSet.has(nodeId);
    },
    isNodeSelected: (nodeId) => selectedTreeNodeSet.has(nodeId),
    onChipClick: handleNodeChipClick,
    removeNode,
  }), [
    expandedTreeNodeSet,
    handleNodeChipClick,
    lassoFrozenExpandedNodeSet,
    removeNode,
    selectedTreeNodeSet,
  ]);
  const activeTreeInputTargetLevel = selectedTreeNodeIds.length > 0 ? selectedChildLevel : 'media_source';
  const activeTreeInputDraftKey = selectedTreeNodeLevel ? `selection:${selectedTreeNodeLevel}` : 'root';
  const activeTreeInputDraftValue = inputDrafts[activeTreeInputDraftKey] ?? '';
  const activeTreeInputPresetOptions = activeTreeInputTargetLevel
    ? getPresetOptionsForLevel(activeTreeInputTargetLevel)
    : [];
  const addTreeInputValues = useCallback((rawInputOverride?: string) => {
    if (selectedTreeNodeIds.length > 0) {
      if (!selectedChildLevel) {
        return;
      }

      addChildrenToSelection(rawInputOverride);
      return;
    }

    addRootNodes(rawInputOverride);
  }, [addChildrenToSelection, addRootNodes, selectedChildLevel, selectedTreeNodeIds.length]);

  return (
    <ConsoleLayout
      actions={ (
        <Button component={ Link } href='/links?type=link_group' sx={ { textTransform: 'none' } } variant='outlined'>
          View Groups
        </Button>
      ) }
      title={ isEditMode ? 'Edit Link Group' : 'Create Link Group' }
    >
      <Box sx={ { maxWidth: 1400, mx: 'auto', px: { md: 4, xs: 2 }, py: 3.5, width: '100%' } }>
        <Stack spacing={ 2 }>
          <Stepper activeStep={ activeStep } alternativeLabel>
            {GROUP_CREATE_STEPS.map((label) => (
              <Step key={ label }>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitError && <Alert severity='error'>{submitError}</Alert>}
          {editSeedError && <Alert severity='error'>{editSeedError}</Alert>}
          {warnings.length > 0 && (
            <Alert severity='warning'>
              <Stack spacing={ 0.5 }>
                {warnings.slice(0, 5).map((warning, index) => (
                  <Typography key={ `${warning}-${index}` } sx={ { fontSize: 13 } }>{warning}</Typography>
                ))}
              </Stack>
            </Alert>
          )}
          {createdGroupId && (
            <Alert severity='success'>
              {isEditMode ? 'Link group updated.' : 'Link group created.'}
              {' '}Track progress on{' '}
              <Link href={ `/link-groups/${encodeURIComponent(createdGroupId)}` }>
                group detail page
              </Link>
              .
            </Alert>
          )}

          <Stack spacing={ 2 }>
            <Stack
              direction={ { md: 'row', xs: 'column' } }
              spacing={ 2 }
              sx={ { minWidth: 0, overflowX: 'hidden' } }
            >
              <Paper
                elevation={ 0 }
                sx={ {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: { md: '1 1 60%', xs: '1 1 auto' },
                  maxWidth: { md: '60%', xs: '100%' },
                  minWidth: 0,
                  minHeight: 520,
                  overflow: 'hidden',
                  p: 2,
                } }
              >
                <Box
                  onMouseDown={ handleTreeEditorMouseDown }
                  ref={ treeEditorScrollRef }
                  sx={ { flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', pr: 0.5 } }
                >
                  {isEditHydrating && (
                    <Stack spacing={ 1.5 }>
                      <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
                        Loading existing group configuration...
                      </Typography>
                      <LinearProgress />
                    </Stack>
                  )}

                  {!isEditHydrating && activeStep === 0 && (
                    <BaseSetupStep
                      brandDomain={ resolvedBrandDomain }
                      groupName={ groupName }
                      onBrandDomainChange={ handleBrandDomainChange }
                      onGroupNameChange={ setGroupName }
                      onTemplateIdChange={ handleTemplateIdChange }
                      templateId={ resolvedTemplateId }
                      templateOptions={ templateOptions }
                    />
                  )}

                  {!isEditHydrating && activeStep === 1 && (
                    <TreeBuilderStep
                      addCurrentLevelValues={ addTreeInputValues }
                      inputDraftValue={ activeTreeInputDraftValue }
                      inputPresetOptions={ activeTreeInputPresetOptions }
                      inputTargetLevel={ activeTreeInputTargetLevel }
                      nodeListProps={ nodeListProps }
                      onInputDraftChange={ (value) => setDraft(activeTreeInputDraftKey, value) }
                      onInputFieldFocus={ () => setActiveTreeFieldLevel(activeTreeInputTargetLevel) }
                      roots={ roots }
                      selectedNodeCount={ selectedTreeNodeIds.length }
                      selectedNodeLevel={ selectedTreeNodeLevel }
                    />
                  )}

                  {!isEditHydrating && activeStep === 2 && (
                    <GlobalParametersStep
                      additionalParamKeyOptions={ additionalParamKeyOptions }
                      additionalParamRows={ additionalParamRows }
                      additionalParamValueOptions={ additionalParamValueOptions }
                      deepLinkFields={ deepLinkFields }
                      onAddParamRow={ addParamRow }
                      onRemoveParamRow={ removeParamRow }
                      onSetActiveParamKey={ setActiveParamKey }
                      onSetDeepLinkParamValue={ setDeepLinkParamValue }
                      onUpdateParamRow={ updateParamRow }
                      scopeHint={ activeParamScopeHint }
                    />
                  )}

                  {!isEditHydrating && activeStep === 3 && (
                    <ReviewExecuteStep
                      applyMode={ applyMode }
                      brandDomain={ resolvedBrandDomain }
                      canRetryFailedItems={ canRetryFailedItems }
                      executionDetail={ executionDetail }
                      executionProgressPercent={ executionProgressPercent }
                      globalParamCount={ normalizedGlobalParamRows.filter((row) => row.key && row.value).length }
                      groupName={ groupName }
                      isEditHydrating={ isEditHydrating }
                      isEditMode={ isEditMode }
                      isPollingExecution={ isPollingExecution }
                      isRetrying={ isRetrying }
                      isSubmitting={ isSubmitting }
                      leafCount={ leafCount }
                      leafPathCount={ leafPaths.length }
                      onApplyModeChange={ setApplyMode }
                      onExecute={ () => { void handleExecute(); } }
                      onRetryFailed={ () => { void handleRetryFailedItems(); } }
                      templateId={ resolvedTemplateId }
                    />
                  )}
                  {activeStep === 1 && lassoRect && (
                    <Box
                      sx={ {
                        backgroundColor: 'primary.main',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        height: lassoRect.height,
                        left: lassoRect.left,
                        opacity: 0.14,
                        pointerEvents: 'none',
                        position: 'absolute',
                        top: lassoRect.top,
                        width: lassoRect.width,
                        zIndex: 2,
                      } }
                    />
                  )}
                </Box>

                <Stack direction='row' justifyContent='space-between' sx={ { mt: 2 } }>
                  <Button
                    disabled={ activeStep === 0 || isEditHydrating }
                    onClick={ () => setActiveStep((previous) => Math.max(0, previous - 1)) }
                    sx={ { textTransform: 'none' } }
                    variant='outlined'
                  >
                    Back
                  </Button>
                  <Button
                    disabled={ activeStep >= GROUP_CREATE_STEPS.length - 1 || !canProceedFromStep }
                    onClick={ () => setActiveStep((previous) => Math.min(GROUP_CREATE_STEPS.length - 1, previous + 1)) }
                    sx={ { textTransform: 'none' } }
                    variant='contained'
                  >
                    Next
                  </Button>
                </Stack>
              </Paper>

              {activeStep === 1 ? (
                <Paper
                  elevation={ 0 }
                  sx={ {
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    flex: { md: '1 1 40%', xs: '1 1 auto' },
                    maxWidth: { md: '40%', xs: '100%' },
                    minWidth: 0,
                    minHeight: 520,
                    overflow: 'hidden',
                    p: 2,
                  } }
                >
                  <Box sx={ { height: '100%', overflowY: 'auto', pr: 0.5 } }>
                    <GlobalParametersStep
                      additionalParamKeyOptions={ additionalParamKeyOptions }
                      additionalParamRows={ additionalParamRows }
                      additionalParamValueOptions={ additionalParamValueOptions }
                      deepLinkFields={ deepLinkFields }
                      onAddParamRow={ addParamRow }
                      onRemoveParamRow={ removeParamRow }
                      onSetActiveParamKey={ setActiveParamKey }
                      onSetDeepLinkParamValue={ setDeepLinkParamValue }
                      onUpdateParamRow={ updateParamRow }
                      scopeHint={ activeParamScopeHint }
                    />
                  </Box>
                </Paper>
              ) : (
                <LinkPreviewPanel
                  activeSnippetNodeValue={ activeSnippetContextLabel }
                  activeStep={ activeStep }
                  filteredSnippets={ filteredSnippets }
                  focusedSnippetIndex={ focusedSnippetIndex }
                  isSnippetWheelMode={ isSnippetWheelMode }
                  leafPathCount={ leafPaths.length }
                  onSelectSnippet={ handleSelectSnippet }
                  onSnippetWheelScroll={ handleSnippetWheelScroll }
                  rootsLength={ roots.length }
                  snippetHighlightToken={ snippetHighlightToken }
                  snippetWheelRef={ snippetWheelRef }
                />
              )}
            </Stack>

            <TreePreviewPanel
              leafCount={ leafCount }
              maxDepth={ maxDepth }
              nodes={ roots }
              onToggleExpanded={ () => setIsTreePreviewExpanded((previous) => !previous) }
              previewSnippets={ filteredSnippets }
              totalNodeCount={ allTreeNodes.length }
              treePreviewExpanded={ isTreePreviewExpanded }
            />
          </Stack>

        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkGroupCreatePage;
