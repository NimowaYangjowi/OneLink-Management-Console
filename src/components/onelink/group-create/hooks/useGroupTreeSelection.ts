/**
 * Manages tree node selection, range selection, and lasso interactions for group-create step 2.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { getAllowedChildLevel } from '@/lib/onelinkGroupTree';
import type { LinkGroupNodeLevel } from '@/lib/onelinkGroupTypes';
import {
  clamp,
  computeNextSelectionFromLasso,
  LASSO_START_THRESHOLD_PX,
  resolveLassoMode,
  type LassoMode,
} from '@/components/onelink/group-create/lassoUtils';
import { normalizeScopePathPrefixes } from '@/components/onelink/group-create/scopeUtils';
import type { EditorTreeNode } from '@/components/onelink/group-create/types';

type LassoRectState = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type UseGroupTreeSelectionArgs = {
  activeStep: number;
  roots: EditorTreeNode[];
};

const areStringArraysEqual = (left: string[], right: string[]) => (
  left.length === right.length
  && left.every((value, index) => value === right[index])
);

export function useGroupTreeSelection({ activeStep, roots }: UseGroupTreeSelectionArgs) {
  const [lassoRect, setLassoRect] = useState<LassoRectState | null>(null);
  const [lassoFrozenExpandedNodeIds, setLassoFrozenExpandedNodeIds] = useState<string[]>([]);
  const [fallbackExpandedNodeIds, setFallbackExpandedNodeIds] = useState<string[]>([]);
  const [selectedTreeNodeIds, setSelectedTreeNodeIds] = useState<string[]>([]);
  const [selectionAnchorNodeId, setSelectionAnchorNodeId] = useState('');
  const [activeTreeFieldLevel, setActiveTreeFieldLevel] = useState<LinkGroupNodeLevel | null>(null);

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

  const allTreeNodes = useMemo(() => {
    const flatNodes: EditorTreeNode[] = [];
    const visit = (nodes: EditorTreeNode[]) => {
      nodes.forEach((node) => {
        flatNodes.push(node);
        visit(node.children);
      });
    };
    visit(roots);
    return flatNodes;
  }, [roots]);

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

  const sanitizeNodeIds = useCallback(
    (nodeIds: string[]) => nodeIds.filter((nodeId) => treeNodeById.has(nodeId)),
    [treeNodeById],
  );
  const normalizedSelectedTreeNodeIds = useMemo(
    () => sanitizeNodeIds(selectedTreeNodeIds),
    [sanitizeNodeIds, selectedTreeNodeIds],
  );
  const normalizedFallbackExpandedNodeIds = useMemo(
    () => sanitizeNodeIds(fallbackExpandedNodeIds),
    [fallbackExpandedNodeIds, sanitizeNodeIds],
  );
  const normalizedSelectionAnchorNodeId = selectionAnchorNodeId && treeNodeById.has(selectionAnchorNodeId)
    ? selectionAnchorNodeId
    : '';

  const selectedTreeNodeIdsRef = useRef<string[]>(normalizedSelectedTreeNodeIds);
  selectedTreeNodeIdsRef.current = normalizedSelectedTreeNodeIds;
  const selectionAnchorNodeIdRef = useRef(normalizedSelectionAnchorNodeId);
  selectionAnchorNodeIdRef.current = normalizedSelectionAnchorNodeId;

  const selectedTreeNodes = useMemo(
    () => normalizedSelectedTreeNodeIds
      .map((nodeId) => treeNodeById.get(nodeId))
      .filter((node): node is EditorTreeNode => Boolean(node)),
    [normalizedSelectedTreeNodeIds, treeNodeById],
  );

  const selectedTreeNodeLevel = selectedTreeNodes[0]?.level ?? null;
  const selectedChildLevel = selectedTreeNodeLevel ? getAllowedChildLevel(selectedTreeNodeLevel) : null;
  const selectedTreeNodeSet = useMemo(
    () => new Set(normalizedSelectedTreeNodeIds),
    [normalizedSelectedTreeNodeIds],
  );
  const selectedPathNodeSet = useMemo(() => {
    const ancestorNodeIds = new Set<string>();

    normalizedSelectedTreeNodeIds.forEach((nodeId) => {
      let currentParentId = parentNodeById.get(nodeId) ?? null;

      while (currentParentId) {
        ancestorNodeIds.add(currentParentId);
        currentParentId = parentNodeById.get(currentParentId) ?? null;
      }
    });

    return ancestorNodeIds;
  }, [normalizedSelectedTreeNodeIds, parentNodeById]);

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
      normalizedFallbackExpandedNodeIds.forEach((nodeId) => expanded.add(nodeId));
    }

    return expanded;
  }, [normalizedFallbackExpandedNodeIds, parentNodeById, selectedTreeNodes]);

  const commitSelection = useCallback((
    nextSelectionIds: string[],
    nextLevel: LinkGroupNodeLevel | null,
    nextAnchorNodeId = selectionAnchorNodeIdRef.current,
  ) => {
    const sanitizedNextSelectionIds = sanitizeNodeIds(nextSelectionIds);
    const sanitizedNextAnchorNodeId = nextAnchorNodeId && treeNodeById.has(nextAnchorNodeId)
      ? nextAnchorNodeId
      : '';
    const previousSelectionIds = selectedTreeNodeIdsRef.current;

    setSelectedTreeNodeIds((previous) => (
      areStringArraysEqual(previous, sanitizedNextSelectionIds) ? previous : sanitizedNextSelectionIds
    ));
    setActiveTreeFieldLevel((previous) => (previous === nextLevel ? previous : nextLevel));
    setSelectionAnchorNodeId((previous) => (
      previous === sanitizedNextAnchorNodeId ? previous : sanitizedNextAnchorNodeId
    ));
    setFallbackExpandedNodeIds((previous) => {
      if (sanitizedNextSelectionIds.length > 0) {
        return previous.length > 0 ? [] : previous;
      }

      if (previousSelectionIds.length === 0) {
        return previous;
      }

      const referenceNodeId = sanitizedNextAnchorNodeId
        || previousSelectionIds.find((nodeId) => treeNodeById.has(nodeId))
        || '';
      const nextFallbackExpanded = getFallbackExpandedNodeIdsForDeselection(referenceNodeId);

      return areStringArraysEqual(previous, nextFallbackExpanded)
        ? previous
        : nextFallbackExpanded;
    });

    selectedTreeNodeIdsRef.current = sanitizedNextSelectionIds;
    selectionAnchorNodeIdRef.current = sanitizedNextAnchorNodeId;
  }, [getFallbackExpandedNodeIdsForDeselection, sanitizeNodeIds, treeNodeById]);

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
      commitSelection(lassoState.baseSelectionIds, lassoState.baseSelectionLevel);
      return;
    }

    const nextSelection = computeNextSelectionFromLasso(
      hitNodes,
      lassoState.mode,
      lassoState.baseSelectionIds,
      lassoState.baseSelectionLevel,
      treeNodeById,
    );
    commitSelection(nextSelection.nextSelectionIds, nextSelection.nextLevel);
  }, [commitSelection, treeNodeById]);

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
    lassoSelectionStateRef.current.baseSelectionIds = selectedTreeNodeIdsRef.current;
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
    selectedTreeNodeLevel,
    startLassoAutoScroll,
  ]);

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
    if (activeStep === 1) {
      return;
    }

    lassoSelectionStateRef.current.active = false;
    lassoSelectionStateRef.current.engaged = false;
    stopLassoAutoScroll();
  }, [activeStep, stopLassoAutoScroll]);

  const addNodeRangeSelection = useCallback((
    nodeIds: string[],
    level: LinkGroupNodeLevel,
    nextAnchorNodeId = selectionAnchorNodeIdRef.current,
  ) => {
    if (nodeIds.length === 0) {
      return;
    }

    const currentSelectionIds = selectedTreeNodeIdsRef.current;
    const hasDifferentLevel = currentSelectionIds.some((selectedId) => treeNodeById.get(selectedId)?.level !== level);
    const merged = new Set<string>(hasDifferentLevel ? [] : currentSelectionIds);
    nodeIds.forEach((nodeId) => merged.add(nodeId));
    commitSelection(Array.from(merged), level, nextAnchorNodeId);
  }, [commitSelection, treeNodeById]);

  const toggleNodeSelection = useCallback((nodeId: string, level: LinkGroupNodeLevel) => {
    const currentSelectionIds = selectedTreeNodeIdsRef.current;
    const alreadySelected = currentSelectionIds.includes(nodeId);
    let nextSelectedIds: string[] = [];

    if (alreadySelected) {
      nextSelectedIds = currentSelectionIds.filter((selectedId) => selectedId !== nodeId);
    } else {
      const hasDifferentLevel = currentSelectionIds.some((selectedId) => treeNodeById.get(selectedId)?.level !== level);
      nextSelectedIds = hasDifferentLevel ? [nodeId] : [...currentSelectionIds, nodeId];
    }

    commitSelection(nextSelectedIds, nextSelectedIds.length > 0 ? level : null, nodeId);
  }, [commitSelection, treeNodeById]);

  const handleNodeChipClick = useCallback((
    nodeId: string,
    level: LinkGroupNodeLevel,
    siblingNodeIds: string[],
    shiftKey: boolean,
  ) => {
    const anchorNodeId = selectionAnchorNodeIdRef.current;

    if (shiftKey && anchorNodeId && siblingNodeIds.includes(anchorNodeId)) {
      const anchorIndex = siblingNodeIds.indexOf(anchorNodeId);
      const targetIndex = siblingNodeIds.indexOf(nodeId);
      if (anchorIndex >= 0 && targetIndex >= 0) {
        const [startIndex, endIndex] = anchorIndex <= targetIndex
          ? [anchorIndex, targetIndex]
          : [targetIndex, anchorIndex];
        addNodeRangeSelection(siblingNodeIds.slice(startIndex, endIndex + 1), level, nodeId);
        return;
      }
    }

    toggleNodeSelection(nodeId, level);
  }, [addNodeRangeSelection, toggleNodeSelection]);

  const isNodeExpanded = useCallback((nodeId: string) => {
    if (lassoSelectionStateRef.current.active) {
      return lassoFrozenExpandedNodeSet.has(nodeId);
    }

    return expandedTreeNodeSet.has(nodeId) || lassoFrozenExpandedNodeSet.has(nodeId);
  }, [expandedTreeNodeSet, lassoFrozenExpandedNodeSet]);

  const isNodeSelected = useCallback((nodeId: string) => selectedTreeNodeSet.has(nodeId), [selectedTreeNodeSet]);
  const isNodeOnSelectedPath = useCallback((nodeId: string) => selectedPathNodeSet.has(nodeId), [selectedPathNodeSet]);

  const pinExpandedState = useCallback(() => {
    const pinnedExpandedNodeIds = Array.from(expandedTreeNodeSet);
    setFallbackExpandedNodeIds((previous) => (
      areStringArraysEqual(previous, pinnedExpandedNodeIds) ? previous : pinnedExpandedNodeIds
    ));
  }, [expandedTreeNodeSet]);

  const resetSelectionState = useCallback(() => {
    setSelectedTreeNodeIds([]);
    selectedTreeNodeIdsRef.current = [];
    setActiveTreeFieldLevel(null);
    setSelectionAnchorNodeId('');
    selectionAnchorNodeIdRef.current = '';
    setFallbackExpandedNodeIds([]);
    setLassoFrozenExpandedNodeIds([]);
    setLassoRect(null);
    lassoSelectionStateRef.current.active = false;
    lassoSelectionStateRef.current.engaged = false;
    stopLassoAutoScroll();
  }, [stopLassoAutoScroll]);

  return {
    activeTreeFieldLevel,
    allTreeNodes,
    handleNodeChipClick,
    handleTreeEditorMouseDown,
    isNodeExpanded,
    isNodeOnSelectedPath,
    isNodeSelected,
    lassoRect: activeStep === 1 ? lassoRect : null,
    pinExpandedState,
    resetSelectionState,
    selectedChildLevel,
    selectedScopePathPrefixes,
    selectedTreeNodeIds: normalizedSelectedTreeNodeIds,
    selectedTreeNodeLevel,
    selectedTreeNodes,
    selectedTreeNodeSet,
    setActiveTreeFieldLevel,
    treeEditorScrollRef,
  };
}
