/**
 * Snippet rendering helpers for URL preview cards.
 */
import type { SnippetDisplayResult } from './types';

export function buildSnippetDisplay(
  fullUrl: string,
  highlightToken: string,
  shouldShowFullUrl: boolean,
): SnippetDisplayResult {
  if (shouldShowFullUrl) {
    return {
      hasHighlight: false,
      prefix: '',
      prefixEllipsis: false,
      suffix: '',
      suffixEllipsis: false,
      text: fullUrl,
      token: '',
    };
  }

  if (highlightToken) {
    const tokenIndex = fullUrl.indexOf(highlightToken);
    if (tokenIndex >= 0) {
      const tokenEnd = tokenIndex + highlightToken.length;

      return {
        hasHighlight: true,
        prefix: fullUrl.slice(0, tokenIndex),
        prefixEllipsis: false,
        suffix: fullUrl.slice(tokenEnd),
        suffixEllipsis: false,
        text: '',
        token: fullUrl.slice(tokenIndex, tokenEnd),
      };
    }
  }

  return {
    hasHighlight: false,
    prefix: '',
    prefixEllipsis: false,
    suffix: '',
    suffixEllipsis: false,
    text: fullUrl,
    token: '',
  };
}
