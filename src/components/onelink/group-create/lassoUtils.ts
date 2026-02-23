/**
 * Lasso-selection constants and pure calculations used by the group-create tree editor.
 */

import type { LinkGroupNodeLevel } from '@/lib/onelinkGroupTypes';

export type LassoMode = 'add' | 'replace' | 'subtract' | 'toggle';

export const LASSO_START_THRESHOLD_PX = 6;

export const TREE_LEVEL_DEPTH: Record<LinkGroupNodeLevel, number> = {
  ad: 3,
  adset: 2,
  campaign: 1,
  media_source: 0,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveLassoMode(event: {
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

export function computeNextSelectionFromLasso(
  hitNodes: Array<{ id: string; level: LinkGroupNodeLevel }>,
  mode: LassoMode,
  baseSelectionIds: string[],
  baseSelectionLevel: LinkGroupNodeLevel | null,
  treeNodeById: Map<string, { level: LinkGroupNodeLevel }>,
): { nextLevel: LinkGroupNodeLevel | null; nextSelectionIds: string[] } {
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
}
