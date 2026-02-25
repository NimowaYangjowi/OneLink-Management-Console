/**
 * Step 3 right panel showing tree paths and short-link style previews.
 */
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import {
  buildShortLinkBaseUrl,
  buildShortLinkPreviewUrl,
  createShortLinkIdAllocator,
  resolveShortLinkIdBaseFromPayload,
} from '@/lib/onelinkShortLinkId';
import type { LinkGroupShortLinkIdConfig } from '@/lib/onelinkGroupTypes';
import type { SnippetPreview } from './types';

type ShortLinkTreePreviewPanelProps = {
  previewSnippets: SnippetPreview[];
  resolvedBrandDomain: string;
  resolvedTemplateId: string;
  shortLinkIdConfig: LinkGroupShortLinkIdConfig;
};

function ShortLinkTreePreviewPanel({
  previewSnippets,
  resolvedBrandDomain,
  resolvedTemplateId,
  shortLinkIdConfig,
}: ShortLinkTreePreviewPanelProps) {
  const rows = useMemo(() => {
    const allocator = createShortLinkIdAllocator();
    const baseShortLinkUrl = buildShortLinkBaseUrl(resolvedTemplateId, resolvedBrandDomain);

    return previewSnippets.map((snippet) => {
      const shortLinkIdBase = resolveShortLinkIdBaseFromPayload(snippet.payload, shortLinkIdConfig);
      const shortLinkId = shortLinkIdBase ? allocator.allocate(shortLinkIdBase) : null;
      return {
        pathLabel: snippet.pathLabel || 'No tree path selected',
        shortLinkUrl: buildShortLinkPreviewUrl(baseShortLinkUrl, shortLinkId),
        usesRandom: !shortLinkId,
      };
    });
  }, [previewSnippets, resolvedBrandDomain, resolvedTemplateId, shortLinkIdConfig]);

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
          Tree &amp; Short Link Preview
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          {`Previewing ${rows.length} short link${rows.length === 1 ? '' : 's'} generated from current tree paths.`}
        </Typography>
        <Divider />

        <Box
          sx={ {
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          } }
        >
          {rows.length === 0 ? (
            <Typography sx={ { color: 'text.secondary', fontSize: 12, p: 1.5 } }>
              Build tree paths first to preview short links.
            </Typography>
          ) : (
            <Stack divider={ <Divider flexItem /> } spacing={ 0 }>
              {rows.map((row, index) => (
                <Stack key={ `${row.pathLabel}-${index}` } spacing={ 0.6 } sx={ { p: 1.25 } }>
                  <Stack alignItems='center' direction='row' justifyContent='space-between' spacing={ 1 }>
                    <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
                      {row.pathLabel}
                    </Typography>
                    <Chip
                      color={ row.usesRandom ? 'default' : 'primary' }
                      label={ row.usesRandom ? 'Random' : 'Field-based' }
                      size='small'
                      sx={ { height: 20 } }
                      variant={ row.usesRandom ? 'outlined' : 'filled' }
                    />
                  </Stack>
                  <Typography
                    sx={ {
                      color: 'text.primary',
                      fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                      fontSize: 11,
                      lineHeight: 1.45,
                      overflowWrap: 'anywhere',
                    } }
                  >
                    {row.shortLinkUrl}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export default ShortLinkTreePreviewPanel;
