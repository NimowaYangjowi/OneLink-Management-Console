/**
 * Builds and manages snippet previews plus wheel focus/scroll interactions.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SNIPPET_WHEEL_ITEM_HEIGHT } from '@/components/onelink/group-create/constants';
import { doesPathMatchScope } from '@/components/onelink/group-create/scopeUtils';
import { formatLevelLabel, getParamKeyForLevel } from '@/components/onelink/group-create/treeUtils';
import type { EditorTreeNode, SnippetPreview } from '@/components/onelink/group-create/types';
import type { LinkGroupNodeLevel } from '@/lib/onelinkGroupTypes';

type UseGroupSnippetPreviewArgs = {
  activeParamKey: string;
  activeStep: number;
  activeTreeFieldLevel: LinkGroupNodeLevel | null;
  globalParams: Record<string, string>;
  resolvedBrandDomain: string;
  resolvedTemplateDomainHost: string;
  resolvedTemplateId: string;
  roots: EditorTreeNode[];
  selectedTreeNodeIds: string[];
  selectedTreeNodeLevel: LinkGroupNodeLevel | null;
  selectedTreeNodeSet: Set<string>;
  selectedTreeNodes: EditorTreeNode[];
  sortedScopedParams: Array<{
    isDisabled?: boolean;
    key: string;
    scopePathPrefixes: string[];
    value: string;
  }>;
};

export function useGroupSnippetPreview({
  activeParamKey,
  activeStep,
  activeTreeFieldLevel,
  globalParams,
  resolvedBrandDomain,
  resolvedTemplateDomainHost,
  resolvedTemplateId,
  roots,
  selectedTreeNodeIds,
  selectedTreeNodeLevel,
  selectedTreeNodeSet,
  selectedTreeNodes,
  sortedScopedParams,
}: UseGroupSnippetPreviewArgs) {
  const [focusedSnippetIndex, setFocusedSnippetIndex] = useState(0);
  const snippetWheelRef = useRef<HTMLDivElement | null>(null);

  const previewSnippets = useMemo<SnippetPreview[]>(() => {
    const normalizedTemplateId = resolvedTemplateId.trim() || 'template';
    const normalizedPreviewDomain = (resolvedBrandDomain.trim() || resolvedTemplateDomainHost.trim()).toLowerCase();
    const baseUrl = normalizedPreviewDomain
      ? `https://${normalizedPreviewDomain}/${normalizedTemplateId}`
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
          if (rule.isDisabled) {
            delete payload[rule.key];
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
  }, [
    activeStep,
    globalParams,
    resolvedBrandDomain,
    resolvedTemplateDomainHost,
    resolvedTemplateId,
    roots,
    sortedScopedParams,
  ]);

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

    const selectionLevel = selectedTreeNodeLevel ?? selectedTreeNodes[0]?.level;
    if (!selectionLevel) {
      return `${selectedTreeNodes.length} nodes`;
    }

    return `${selectedTreeNodes.length} ${formatLevelLabel(selectionLevel)} nodes`;
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
    const clampedIndex = Math.max(0, Math.min(filteredSnippets.length - 1, index));
    setFocusedSnippetIndex(clampedIndex);
    if (isSnippetWheelMode) {
      scrollSnippetWheelToIndex(clampedIndex);
    }
  }, [filteredSnippets.length, isSnippetWheelMode, scrollSnippetWheelToIndex]);

  const clampedFocusedSnippetIndex = filteredSnippets.length === 0
    ? 0
    : Math.max(0, Math.min(filteredSnippets.length - 1, focusedSnippetIndex));

  useEffect(() => {
    if (!isSnippetWheelMode || filteredSnippets.length === 0) {
      return;
    }

    const wheelNode = snippetWheelRef.current;
    if (!wheelNode) {
      return;
    }

    wheelNode.scrollTo({
      behavior: 'auto',
      top: clampedFocusedSnippetIndex * SNIPPET_WHEEL_ITEM_HEIGHT,
    });
  }, [clampedFocusedSnippetIndex, filteredSnippets.length, isSnippetWheelMode]);

  return {
    activeSnippetContextLabel,
    previewSnippets,
    filteredSnippets,
    focusedSnippetIndex: clampedFocusedSnippetIndex,
    handleSelectSnippet,
    handleSnippetWheelScroll,
    isSnippetWheelMode,
    snippetHighlightToken,
    snippetWheelRef,
  };
}
