/**
 * Scope-path normalization and matching helpers for group-create parameter resolution.
 */

export function normalizeScopePathPrefixes(scopePathPrefixes: string[]): string[] {
  return Array.from(new Set(scopePathPrefixes.map((prefix) => prefix.trim()).filter(Boolean))).sort((first, second) => {
    const firstDepth = first.split(' > ').length;
    const secondDepth = second.split(' > ').length;
    if (firstDepth !== secondDepth) {
      return firstDepth - secondDepth;
    }
    return first.localeCompare(second);
  });
}

export function areScopesEqual(first: string[], second: string[]): boolean {
  if (first.length !== second.length) {
    return false;
  }
  return first.every((prefix, index) => prefix === second[index]);
}

export function getScopeSpecificity(scopePathPrefixes: string[]): number {
  return scopePathPrefixes.reduce((maxDepth, prefix) => {
    const depth = prefix.split(' > ').length;
    return Math.max(maxDepth, depth);
  }, 0);
}

export function doesPathMatchScope(pathLabel: string, scopePathPrefixes: string[]): boolean {
  if (scopePathPrefixes.length === 0) {
    return true;
  }

  return scopePathPrefixes.some((scopePrefix) => pathLabel === scopePrefix || pathLabel.startsWith(`${scopePrefix} > `));
}
