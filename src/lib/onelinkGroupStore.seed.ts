/**
 * Builds normalized node/item seed records from tree configuration and parameter rules.
 */

import { randomUUID } from 'node:crypto';
import { generateLeafPaths, getHierarchicalPayload } from '@/lib/onelinkGroupTree';
import type { ScopedParamRule } from '@/lib/onelinkGroupSchema';
import type { LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';
import type { GroupItemSeed, GroupNodeSeed } from '@/lib/onelinkGroupStore.types';
import {
  buildVariantKey,
  getScopeSpecificity,
  pathMatchesScope,
} from '@/lib/onelinkGroupStore.utils';

export function buildSeeds(
  roots: LinkGroupTreeNode[],
  globalParams: Record<string, string>,
  scopedParams: ScopedParamRule[],
): {
  items: GroupItemSeed[];
  nodes: GroupNodeSeed[];
} {
  const nodes: GroupNodeSeed[] = [];
  const items: GroupItemSeed[] = [];

  const leafPaths = generateLeafPaths(roots);
  const sortedScopedParams = scopedParams
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
    });
  const leafPayloadByLabel = new Map<string, Record<string, string>>();
  leafPaths.forEach((leafPath) => {
    const hierarchical = getHierarchicalPayload(leafPath);
    const payload = {
      ...globalParams,
      ...hierarchical,
    };

    sortedScopedParams.forEach((rule) => {
      if (!pathMatchesScope(leafPath.pathLabel, rule.scopePathPrefixes)) {
        return;
      }
      if (rule.isDisabled) {
        delete payload[rule.key];
        return;
      }
      payload[rule.key] = rule.value;
    });

    leafPayloadByLabel.set(leafPath.pathLabel, payload);
  });

  const visit = (
    node: LinkGroupTreeNode,
    parentNodeId: string | null,
    pathIndexes: number[],
    pathLabels: string[],
    sortOrder: number,
  ) => {
    const nodeId = randomUUID();
    const nextPathLabels = [...pathLabels, node.value];
    const isLeaf = node.children.length === 0;

    nodes.push({
      id: nodeId,
      isLeaf,
      level: node.level,
      parentNodeId,
      pathKey: pathIndexes.join('.'),
      sortOrder,
      value: node.value,
    });

    if (isLeaf) {
      const pathLabel = nextPathLabels.join(' > ');
      const payload = leafPayloadByLabel.get(pathLabel) ?? {};
      const variantKey = buildVariantKey(payload);

      items.push({
        id: randomUUID(),
        leafNodeId: nodeId,
        pathLabel,
        payloadJson: JSON.stringify(payload),
        variantKey,
      });
      return;
    }

    node.children.forEach((childNode, childIndex) => {
      visit(childNode, nodeId, [...pathIndexes, childIndex], nextPathLabels, childIndex);
    });
  };

  roots.forEach((root, rootIndex) => {
    visit(root, null, [rootIndex], [], rootIndex);
  });

  return {
    items,
    nodes,
  };
}
