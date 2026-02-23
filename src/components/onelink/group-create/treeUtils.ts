/**
 * Tree utilities for node serialization and mutation in the link-group builder.
 */
import type { LinkGroupNodeLevel, LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';
import type { EditorTreeNode, NodeInsertResult } from './types';

export function createClientId(): string {
  if (typeof window !== 'undefined' && window.crypto && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function toSerializedNodes(nodes: EditorTreeNode[]): LinkGroupTreeNode[] {
  return nodes.map((node) => ({
    children: toSerializedNodes(node.children),
    level: node.level,
    value: node.value,
  }));
}

export function hydrateEditorNodes(nodes: LinkGroupTreeNode[]): EditorTreeNode[] {
  return nodes.map((node) => ({
    children: hydrateEditorNodes(node.children),
    id: createClientId(),
    level: node.level,
    value: node.value,
  }));
}

export function appendUniqueChildren(
  existingChildren: EditorTreeNode[],
  level: LinkGroupNodeLevel,
  values: string[],
): { appendedChildren: EditorTreeNode[]; warnings: string[] } {
  const warnings: string[] = [];
  const seen = new Set(existingChildren.map((child) => child.value.toLowerCase()));
  const nextChildren = [...existingChildren];

  values.forEach((value) => {
    const dedupKey = value.toLowerCase();
    if (seen.has(dedupKey)) {
      warnings.push(`Duplicate value "${value}" was ignored.`);
      return;
    }

    seen.add(dedupKey);
    nextChildren.push({
      children: [],
      id: createClientId(),
      level,
      value,
    });
  });

  return {
    appendedChildren: nextChildren,
    warnings,
  };
}

export function insertChildrenUnderNode(
  nodes: EditorTreeNode[],
  targetNodeId: string,
  level: LinkGroupNodeLevel,
  values: string[],
): NodeInsertResult {
  const warnings: string[] = [];

  const nextNodes = nodes.map((node) => {
    if (node.id === targetNodeId) {
      const result = appendUniqueChildren(node.children, level, values);
      warnings.push(...result.warnings);
      return {
        ...node,
        children: result.appendedChildren,
      };
    }

    if (node.children.length === 0) {
      return node;
    }

    const nestedResult = insertChildrenUnderNode(node.children, targetNodeId, level, values);
    warnings.push(...nestedResult.warnings);

    return {
      ...node,
      children: nestedResult.nodes,
    };
  });

  return {
    nodes: nextNodes,
    warnings,
  };
}

export function removeNodeById(nodes: EditorTreeNode[], targetNodeId: string): EditorTreeNode[] {
  return nodes
    .filter((node) => node.id !== targetNodeId)
    .map((node) => ({
      ...node,
      children: removeNodeById(node.children, targetNodeId),
    }));
}

export function renameNodeById(nodes: EditorTreeNode[], targetNodeId: string, nextValue: string): EditorTreeNode[] {
  return nodes.map((node) => {
    if (node.id === targetNodeId) {
      return {
        ...node,
        value: nextValue,
      };
    }

    return {
      ...node,
      children: renameNodeById(node.children, targetNodeId, nextValue),
    };
  });
}

export function findNodeById(nodes: EditorTreeNode[], targetNodeId: string): EditorTreeNode | null {
  for (const node of nodes) {
    if (node.id === targetNodeId) {
      return node;
    }

    const nested = findNodeById(node.children, targetNodeId);
    if (nested) {
      return nested;
    }
  }

  return null;
}

export function countDescendants(node: EditorTreeNode): number {
  return node.children.reduce((total, child) => total + 1 + countDescendants(child), 0);
}

export function reorderNodeByDropTarget(
  nodes: EditorTreeNode[],
  sourceNodeId: string,
  targetNodeId: string,
): { moved: boolean; nodes: EditorTreeNode[] } {
  const sourceIndex = nodes.findIndex((node) => node.id === sourceNodeId);
  const targetIndex = nodes.findIndex((node) => node.id === targetNodeId);

  if (sourceIndex >= 0 || targetIndex >= 0) {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return { moved: false, nodes };
    }

    const reordered = [...nodes];
    const [sourceNode] = reordered.splice(sourceIndex, 1);
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    reordered.splice(adjustedTargetIndex, 0, sourceNode);
    return { moved: true, nodes: reordered };
  }

  let moved = false;
  const nextNodes = nodes.map((node) => {
    if (moved || node.children.length === 0) {
      return node;
    }

    const nested = reorderNodeByDropTarget(node.children, sourceNodeId, targetNodeId);
    if (!nested.moved) {
      return node;
    }

    moved = true;
    return {
      ...node,
      children: nested.nodes,
    };
  });

  return moved ? { moved: true, nodes: nextNodes } : { moved: false, nodes };
}

export function flattenTreeNodes(nodes: EditorTreeNode[]): EditorTreeNode[] {
  const flattened: EditorTreeNode[] = [];

  const visit = (node: EditorTreeNode) => {
    flattened.push(node);
    node.children.forEach((child) => {
      visit(child);
    });
  };

  nodes.forEach((node) => {
    visit(node);
  });

  return flattened;
}

export function formatLevelLabel(level: LinkGroupNodeLevel): string {
  if (level === 'media_source') {
    return 'MediaSource';
  }
  if (level === 'campaign') {
    return 'Campaign';
  }
  if (level === 'adset') {
    return 'AdSet';
  }
  return 'Ad';
}

export function computeMaxDepth(nodes: LinkGroupTreeNode[]): number {
  let maxDepth = 0;

  const visit = (node: LinkGroupTreeNode, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    node.children.forEach((child) => {
      visit(child, depth + 1);
    });
  };

  nodes.forEach((node) => {
    visit(node, 1);
  });

  return maxDepth;
}

export function getParamKeyForLevel(level: LinkGroupNodeLevel): 'af_ad' | 'af_adset' | 'c' | 'pid' {
  if (level === 'media_source') {
    return 'pid';
  }
  if (level === 'campaign') {
    return 'c';
  }
  if (level === 'adset') {
    return 'af_adset';
  }
  return 'af_ad';
}
