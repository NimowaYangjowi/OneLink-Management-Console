/**
 * Tree and parser utilities for Link Group creation, validation, and review previews.
 */

import type { LinkGroupLeafPath, LinkGroupNodeLevel, LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';

const TOKEN_SPLIT_REGEX = /[,;\n\r]+/;
const RANGE_REGEX = /^(\d+)-(\d+)$/;

const TREE_CHILD_LEVEL: Record<LinkGroupNodeLevel, LinkGroupNodeLevel | null> = {
  ad: null,
  adset: 'ad',
  campaign: 'adset',
  media_source: 'campaign',
};

export function getAllowedChildLevel(level: LinkGroupNodeLevel): LinkGroupNodeLevel | null {
  return TREE_CHILD_LEVEL[level] ?? null;
}

export function computeLeafCount(roots: LinkGroupTreeNode[]): number {
  let count = 0;

  const visit = (node: LinkGroupTreeNode) => {
    if (node.children.length === 0) {
      count += 1;
      return;
    }

    node.children.forEach((child) => {
      visit(child);
    });
  };

  roots.forEach((root) => {
    visit(root);
  });

  return count;
}

export function generateLeafPaths(roots: LinkGroupTreeNode[]): LinkGroupLeafPath[] {
  const paths: LinkGroupLeafPath[] = [];

  const visit = (node: LinkGroupTreeNode, current: Partial<LinkGroupLeafPath>, labels: string[]) => {
    const next = { ...current };
    const nextLabels = [...labels, node.value];

    if (node.level === 'media_source') {
      next.pid = node.value;
    }
    if (node.level === 'campaign') {
      next.c = node.value;
    }
    if (node.level === 'adset') {
      next.af_adset = node.value;
    }
    if (node.level === 'ad') {
      next.af_ad = node.value;
    }

    if (node.children.length === 0) {
      paths.push({
        ...next,
        pathLabel: nextLabels.join(' > '),
      } as LinkGroupLeafPath);
      return;
    }

    node.children.forEach((child) => {
      visit(child, next, nextLabels);
    });
  };

  roots.forEach((root) => {
    visit(root, {}, []);
  });

  return paths;
}

/**
 * parseMultiValueInput - Parses mixed delimiters and numeric ranges into unique values.
 */
export function parseMultiValueInput(
  input: string,
  options?: {
    maxCharPerValue?: number;
    maxValues?: number;
  },
): { values: string[]; warnings: string[] } {
  const maxCharPerValue = Math.max(1, options?.maxCharPerValue ?? 100);
  const maxValues = Math.max(1, options?.maxValues ?? 500);
  const warnings: string[] = [];

  if (!input.trim()) {
    return { values: [], warnings };
  }

  const rawTokens = input
    .split(TOKEN_SPLIT_REGEX)
    .map((token) => token.trim())
    .filter(Boolean);

  const expandedValues: string[] = [];

  rawTokens.forEach((token) => {
    const rangeMatch = token.match(RANGE_REGEX);
    if (!rangeMatch) {
      expandedValues.push(token);
      return;
    }

    const rangeStart = Number.parseInt(rangeMatch[1], 10);
    const rangeEnd = Number.parseInt(rangeMatch[2], 10);

    if (Number.isNaN(rangeStart) || Number.isNaN(rangeEnd) || rangeStart > rangeEnd) {
      expandedValues.push(token);
      return;
    }

    const rangeLength = rangeEnd - rangeStart + 1;
    if (rangeLength > maxValues) {
      expandedValues.push(token);
      warnings.push(`Range "${token}" exceeded ${maxValues} values and was kept as a literal.`);
      return;
    }

    for (let value = rangeStart; value <= rangeEnd; value += 1) {
      expandedValues.push(String(value));
    }
  });

  const deduplicated: string[] = [];
  const seen = new Set<string>();
  let truncatedByLengthCount = 0;

  expandedValues.forEach((value) => {
    const normalizedValue = value.length > maxCharPerValue ? value.slice(0, maxCharPerValue) : value;

    if (value.length > maxCharPerValue) {
      truncatedByLengthCount += 1;
    }

    if (seen.has(normalizedValue)) {
      return;
    }

    seen.add(normalizedValue);
    deduplicated.push(normalizedValue);
  });

  if (truncatedByLengthCount > 0) {
    warnings.push(`${truncatedByLengthCount} values were truncated to ${maxCharPerValue} characters.`);
  }

  if (deduplicated.length > maxValues) {
    warnings.push(`Maximum ${maxValues} values are allowed. Extra values were removed.`);
    return {
      values: deduplicated.slice(0, maxValues),
      warnings,
    };
  }

  return {
    values: deduplicated,
    warnings,
  };
}

export function getHierarchicalPayload(path: LinkGroupLeafPath): Record<string, string> {
  const payload: Record<string, string> = {
    pid: path.pid,
  };

  if (path.c) {
    payload.c = path.c;
  }

  if (path.af_adset) {
    payload.af_adset = path.af_adset;
  }

  if (path.af_ad) {
    payload.af_ad = path.af_ad;
  }

  return payload;
}
