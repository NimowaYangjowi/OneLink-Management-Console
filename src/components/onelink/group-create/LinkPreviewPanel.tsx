/**
 * Right-side panel for link preview and Step 1 guidance content.
 */
import { Alert, Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { useEffect, type RefObject } from 'react';
import {
  SNIPPET_WHEEL_ITEM_HEIGHT,
  SNIPPET_WHEEL_SPACER,
  SNIPPET_WHEEL_VIEWPORT_HEIGHT,
} from './constants';
import { buildSnippetDisplay } from './snippetUtils';
import type { SnippetPreview } from './types';

type LinkPreviewPanelProps = {
  activeSnippetNodeValue: string;
  activeStep: number;
  filteredSnippets: SnippetPreview[];
  focusedSnippetIndex: number;
  isSnippetWheelMode: boolean;
  leafPathCount: number;
  onSelectSnippet: (index: number) => void;
  onSnippetWheelScroll: () => void;
  rootsLength: number;
  snippetHighlightToken: string;
  snippetWheelRef: RefObject<HTMLDivElement | null>;
};

function LinkPreviewPanel({
  activeSnippetNodeValue,
  activeStep,
  filteredSnippets,
  focusedSnippetIndex,
  isSnippetWheelMode,
  leafPathCount,
  onSelectSnippet,
  onSnippetWheelScroll,
  rootsLength,
  snippetHighlightToken,
  snippetWheelRef,
}: LinkPreviewPanelProps) {
  useEffect(() => {
    if (activeStep === 0 || activeStep === 3 || !snippetHighlightToken) {
      return;
    }

    const container = snippetWheelRef.current;
    if (!container) {
      return;
    }

    const reposition = () => {
      const focusedRow = container.querySelector<HTMLElement>('[data-snippet-focused="true"]');
      const highlightedToken = focusedRow?.querySelector<HTMLElement>('[data-snippet-highlight="true"]')
        ?? container.querySelector<HTMLElement>('[data-snippet-highlight="true"]');

      if (!highlightedToken) {
        container.scrollLeft = 0;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const tokenRect = highlightedToken.getBoundingClientRect();
      const tokenLeftInScroll = (tokenRect.left - containerRect.left) + container.scrollLeft;
      const leftPadding = 16;
      const nextScrollLeft = Math.max(0, tokenLeftInScroll - leftPadding);

      container.scrollTo({
        behavior: 'auto',
        left: nextScrollLeft,
      });
    };

    const rafId = window.requestAnimationFrame(reposition);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeSnippetNodeValue, activeStep, snippetHighlightToken, snippetWheelRef]);

  if (activeStep === 0) {
    return (
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
        <Stack spacing={ 1.5 } sx={ { height: '100%' } }>
          <Typography sx={ { color: 'text.primary', fontSize: 15, fontWeight: 700 } }>
            Link Group Overview
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 12, lineHeight: 1.55 } }>
            Link Group is a unit that groups OneLinks created for the same purpose. Once you create a group, you can
            manage link creation and operations with consistent standards.
          </Typography>
          <Divider />
          <Box
            component='ol'
            sx={ {
              color: 'text.secondary',
              display: 'grid',
              fontSize: 12,
              gap: 1,
              lineHeight: 1.5,
              m: 0,
              pl: 2.25,
            } }
          >
            <Box component='li'>
              Create and manage links faster using a shared group context.
            </Box>
            <Box component='li'>
              Reuse common parameters and policies to reduce configuration mistakes.
            </Box>
            <Box component='li'>
              Standardize ownership, expiration, and naming rules across link operations.
            </Box>
          </Box>
          <Divider />
          <Typography sx={ { color: 'text.secondary', fontSize: 12, lineHeight: 1.5 } }>
            The group information entered in this step becomes the baseline for link defaults in the next steps.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
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
      <Stack spacing={ 1.5 } sx={ { height: '100%' } }>
        <Typography sx={ { color: 'text.primary', fontSize: 15, fontWeight: 700 } }>
          Link Preview
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          {activeStep === 0
            ? 'Base URL skeleton preview from template and brand domain.'
            : activeStep === 3
              ? 'Full URL preview for final review.'
              : 'URL snippets update as tree and parameters change.'}
        </Typography>
        <Divider />
        <Box
          onScroll={ onSnippetWheelScroll }
          ref={ snippetWheelRef }
          sx={ {
            height: isSnippetWheelMode ? SNIPPET_WHEEL_VIEWPORT_HEIGHT : 460,
            maxWidth: '100%',
            mx: isSnippetWheelMode ? -0.5 : 0,
            overflowX: 'auto',
            overflowY: 'auto',
            pr: 0.4,
            px: 0.5,
            scrollSnapType: 'y mandatory',
          } }
        >
          {isSnippetWheelMode && <Box sx={ { height: SNIPPET_WHEEL_SPACER } } />}
          {filteredSnippets.map((snippet, index) => {
            const display = buildSnippetDisplay(snippet.fullUrl, snippetHighlightToken, activeStep === 3);
            const distanceFromFocus = Math.abs(index - focusedSnippetIndex);
            const isFocused = index === focusedSnippetIndex;

            let opacity = 1;
            let snippetFontSize = 12;
            if (isSnippetWheelMode) {
              opacity = distanceFromFocus === 0 ? 1 : distanceFromFocus === 1 ? 0.5 : 0.34;
              snippetFontSize = distanceFromFocus === 0 ? 13 : distanceFromFocus === 1 ? 12 : 11;
            }

            return (
              <Box
                data-snippet-focused={ isFocused ? 'true' : 'false' }
                key={ `${snippet.pathLabel}-${index}` }
                onClick={ () => onSelectSnippet(index) }
                sx={ {
                  backgroundColor: isFocused ? 'action.hover' : 'transparent',
                  borderBottom: activeStep === 3 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  borderRadius: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: isSnippetWheelMode ? SNIPPET_WHEEL_ITEM_HEIGHT : 'auto',
                  justifyContent: 'center',
                  mb: 0,
                  minWidth: 0,
                  opacity,
                  px: isSnippetWheelMode ? 0.6 : 0.5,
                  py: isSnippetWheelMode ? 0 : 0.7,
                  scrollSnapAlign: 'center',
                  transition: 'opacity 140ms ease, background-color 140ms ease',
                } }
              >
                <Typography
                  sx={ {
                    color: 'text.primary',
                    display: 'inline-block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: snippetFontSize,
                    lineHeight: 1.2,
                    pr: 0.5,
                    whiteSpace: 'nowrap',
                    wordBreak: 'normal',
                  } }
                >
                  {display.hasHighlight ? (
                    <>
                      {display.prefixEllipsis ? '...' : ''}
                      {display.prefix}
                      <Box
                        component='span'
                        data-snippet-highlight='true'
                        sx={ {
                          backgroundColor: 'primary.main',
                          borderRadius: 0.75,
                          color: 'primary.contrastText',
                          px: 0.35,
                        } }
                      >
                        {display.token}
                      </Box>
                      {display.suffix}
                      {display.suffixEllipsis ? '...' : ''}
                    </>
                  ) : (
                    display.text
                  )}
                </Typography>
              </Box>
            );
          })}
          {isSnippetWheelMode && <Box sx={ { height: SNIPPET_WHEEL_SPACER } } />}
          {filteredSnippets.length === 0 && (
            <Alert severity='info' sx={ { mt: 1 } }>
              {activeStep === 1 && rootsLength === 0
                ? 'Add media sources to preview links.'
                : activeSnippetNodeValue
                  ? `No snippets match node context: ${activeSnippetNodeValue}`
                  : 'No snippets available for current context.'}
            </Alert>
          )}
        </Box>
        <Divider />
        <Typography sx={ { color: 'text.secondary', fontSize: 12, textAlign: 'right' } }>
          {leafPathCount === 0
            ? '0 of 0 links'
            : activeStep === 1 && activeSnippetNodeValue
              ? `${filteredSnippets.length === 0 ? 0 : Math.min(focusedSnippetIndex + 1, filteredSnippets.length)} of ${leafPathCount} links (filtered by ${activeSnippetNodeValue})`
              : `${Math.min(focusedSnippetIndex + 1, filteredSnippets.length)} of ${leafPathCount} links`}
        </Typography>
      </Stack>
    </Paper>
  );
}

export default LinkPreviewPanel;
