/**
 * Step 3 right panel showing short link ID validation and preview rows.
 */
import { Alert, Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  buildShortLinkBaseUrl,
  buildShortLinkPreviewUrl,
  createShortLinkIdAllocator,
  resolveShortLinkIdBaseFromPayload,
} from '@/lib/onelinkShortLinkId';
import type { LinkGroupShortLinkIdConfig } from '@/lib/onelinkGroupTypes';
import type { SnippetPreview } from './types';

type ShortLinkTreePreviewPanelProps = {
  editGroupId?: string;
  previewSnippets: SnippetPreview[];
  resolvedPreviewDomain: string;
  resolvedTemplateId: string;
  shortLinkIdConfig: LinkGroupShortLinkIdConfig;
};

type PreviewRow = {
  pathLabel: string;
  shortLinkId: string | null;
  shortLinkIdBase: string | null;
  shortLinkUrl: string;
};

type ExistingIdValidationResponse = {
  error?: string;
  existingIds?: string[];
};

type DuplicateIssueGroup = {
  pathLabels: string[];
  shortLinkId: string;
};

const MAX_PATH_LABELS_PER_ISSUE = 4;

function ShortLinkTreePreviewPanel({
  editGroupId,
  previewSnippets,
  resolvedPreviewDomain,
  resolvedTemplateId,
  shortLinkIdConfig,
}: ShortLinkTreePreviewPanelProps) {
  const [isCheckingExistingIds, setIsCheckingExistingIds] = useState(false);
  const [existingIdCheckError, setExistingIdCheckError] = useState('');
  const [existingShortLinkIds, setExistingShortLinkIds] = useState<string[]>([]);

  const rows = useMemo<PreviewRow[]>(() => {
    const allocator = createShortLinkIdAllocator();
    const baseShortLinkUrl = buildShortLinkBaseUrl(resolvedTemplateId, resolvedPreviewDomain);

    return previewSnippets.map((snippet) => {
      const shortLinkIdBase = resolveShortLinkIdBaseFromPayload(snippet.payload, shortLinkIdConfig);
      const shortLinkId = shortLinkIdBase ? allocator.allocate(shortLinkIdBase) : null;

      return {
        pathLabel: snippet.pathLabel || 'No tree path selected',
        shortLinkId,
        shortLinkIdBase,
        shortLinkUrl: buildShortLinkPreviewUrl(baseShortLinkUrl, shortLinkId),
      };
    });
  }, [previewSnippets, resolvedPreviewDomain, resolvedTemplateId, shortLinkIdConfig]);

  const deterministicShortLinkIds = useMemo(
    () => Array.from(new Set(rows.map((row) => row.shortLinkId).filter((value): value is string => Boolean(value)))),
    [rows],
  );
  const deterministicShortLinkIdsKey = useMemo(
    () => deterministicShortLinkIds.join('|'),
    [deterministicShortLinkIds],
  );

  const pathDuplicateIssues = useMemo<DuplicateIssueGroup[]>(() => {
    const pathsByShortLinkId = new Map<string, string[]>();

    rows.forEach((row) => {
      if (!row.shortLinkIdBase) {
        return;
      }

      const existingPathLabels = pathsByShortLinkId.get(row.shortLinkIdBase) ?? [];
      pathsByShortLinkId.set(row.shortLinkIdBase, [...existingPathLabels, row.pathLabel]);
    });

    return [...pathsByShortLinkId.entries()]
      .filter(([, pathLabels]) => pathLabels.length > 1)
      .map(([shortLinkId, pathLabels]) => ({
        pathLabels,
        shortLinkId,
      }));
  }, [rows]);

  useEffect(() => {
    const normalizedTemplateId = resolvedTemplateId.trim();
    if (!normalizedTemplateId || deterministicShortLinkIds.length === 0) {
      setIsCheckingExistingIds(false);
      setExistingIdCheckError('');
      setExistingShortLinkIds([]);
      return;
    }

    let isDisposed = false;
    const abortController = new AbortController();

    setIsCheckingExistingIds(true);
    setExistingIdCheckError('');

    const timer = window.setTimeout(() => {
      const validateExistingShortLinkIds = async () => {
        try {
          const response = await fetch('/api/onelink-groups/shortlink-id-validation', {
            body: JSON.stringify({
              excludeGroupId: editGroupId || undefined,
              shortLinkIds: deterministicShortLinkIds,
              templateId: normalizedTemplateId,
            }),
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
            signal: abortController.signal,
          });
          const payload = (await response.json().catch(() => null)) as ExistingIdValidationResponse | null;
          if (!response.ok) {
            throw new Error(payload?.error || 'Failed to validate short link IDs.');
          }

          if (!isDisposed) {
            setExistingShortLinkIds(payload?.existingIds ?? []);
          }
        } catch {
          if (!isDisposed && !abortController.signal.aborted) {
            setExistingShortLinkIds([]);
            setExistingIdCheckError('Could not validate against existing short links right now.');
          }
        } finally {
          if (!isDisposed && !abortController.signal.aborted) {
            setIsCheckingExistingIds(false);
          }
        }
      };

      void validateExistingShortLinkIds();
    }, 240);

    return () => {
      isDisposed = true;
      window.clearTimeout(timer);
      abortController.abort();
    };
  }, [deterministicShortLinkIds, deterministicShortLinkIdsKey, editGroupId, resolvedTemplateId]);

  const existingShortLinkIdSet = useMemo(
    () => new Set(existingShortLinkIds),
    [existingShortLinkIds],
  );
  const databaseDuplicateIssues = useMemo<DuplicateIssueGroup[]>(() => {
    if (existingShortLinkIdSet.size === 0) {
      return [];
    }

    const pathsByShortLinkId = new Map<string, string[]>();
    rows.forEach((row) => {
      if (!row.shortLinkId || !existingShortLinkIdSet.has(row.shortLinkId)) {
        return;
      }

      const existingPathLabels = pathsByShortLinkId.get(row.shortLinkId) ?? [];
      pathsByShortLinkId.set(row.shortLinkId, [...existingPathLabels, row.pathLabel]);
    });

    return [...pathsByShortLinkId.entries()].map(([shortLinkId, pathLabels]) => ({
      pathLabels,
      shortLinkId,
    }));
  }, [existingShortLinkIdSet, rows]);

  const pathDuplicatePathCount = useMemo(
    () => pathDuplicateIssues.reduce((count, issue) => count + issue.pathLabels.length, 0),
    [pathDuplicateIssues],
  );
  const databaseDuplicatePathCount = useMemo(
    () => databaseDuplicateIssues.reduce((count, issue) => count + issue.pathLabels.length, 0),
    [databaseDuplicateIssues],
  );
  const hasDuplicateIssues = pathDuplicateIssues.length > 0 || databaseDuplicateIssues.length > 0;

  return (
    <Paper
      elevation={ 0 }
      sx={ {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        flex: { md: '1 1 40%', xs: '1 1 auto' },
        height: { md: 520, xs: 'auto' },
        maxHeight: { md: 520, xs: 'none' },
        maxWidth: { md: '40%', xs: '100%' },
        minWidth: 0,
        minHeight: 520,
        overflow: 'hidden',
        p: 2,
      } }
    >
      <Stack spacing={ 1.5 } sx={ { height: '100%', minHeight: 0, overflowY: 'auto', pr: 0.25 } }>
        <Typography sx={ { color: 'text.primary', fontSize: 15, fontWeight: 700 } }>
          Short Link ID Validation
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          {`Checking ${deterministicShortLinkIds.length} deterministic short link ID candidate${deterministicShortLinkIds.length === 1 ? '' : 's'} from ${rows.length} path${rows.length === 1 ? '' : 's'}.`}
        </Typography>

        {isCheckingExistingIds && (
          <Alert severity='info'>
            Checking duplicates against existing short links...
          </Alert>
        )}
        {!isCheckingExistingIds && existingIdCheckError && (
          <Alert severity='warning'>
            {existingIdCheckError}
          </Alert>
        )}
        {!isCheckingExistingIds && !existingIdCheckError && hasDuplicateIssues && (
          <Alert severity='error'>
            {`Duplicate issues detected: path conflicts ${pathDuplicatePathCount}, existing DB conflicts ${databaseDuplicatePathCount}.`}
          </Alert>
        )}
        {!isCheckingExistingIds && !existingIdCheckError && !hasDuplicateIssues && (
          <Alert severity='success'>
            No duplicate short link IDs were detected.
          </Alert>
        )}

        {pathDuplicateIssues.length > 0 && (
          <Stack spacing={ 0.75 }>
            <Typography sx={ { color: 'text.primary', fontSize: 12, fontWeight: 700 } }>
              Path Duplicates
            </Typography>
            <Stack spacing={ 0.75 }>
              {pathDuplicateIssues.map((issue) => (
                <Box
                  key={ `path-duplicate-${issue.shortLinkId}` }
                  sx={ {
                    backgroundColor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                  } }
                >
                  <Typography
                    sx={ {
                      color: 'text.primary',
                      fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                      fontSize: 11.5,
                      fontWeight: 700,
                    } }
                  >
                    {issue.shortLinkId}
                  </Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
                    {issue.pathLabels.slice(0, MAX_PATH_LABELS_PER_ISSUE).join(' · ')}
                  </Typography>
                  {issue.pathLabels.length > MAX_PATH_LABELS_PER_ISSUE && (
                    <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
                      {`+${issue.pathLabels.length - MAX_PATH_LABELS_PER_ISSUE} more path(s)`}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Stack>
        )}

        {databaseDuplicateIssues.length > 0 && (
          <Stack spacing={ 0.75 }>
            <Typography sx={ { color: 'text.primary', fontSize: 12, fontWeight: 700 } }>
              Existing Short Link Conflicts
            </Typography>
            <Stack spacing={ 0.75 }>
              {databaseDuplicateIssues.map((issue) => (
                <Box
                  key={ `db-duplicate-${issue.shortLinkId}` }
                  sx={ {
                    backgroundColor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                  } }
                >
                  <Typography
                    sx={ {
                      color: 'text.primary',
                      fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                      fontSize: 11.5,
                      fontWeight: 700,
                    } }
                  >
                    {issue.shortLinkId}
                  </Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
                    {issue.pathLabels.slice(0, MAX_PATH_LABELS_PER_ISSUE).join(' · ')}
                  </Typography>
                  {issue.pathLabels.length > MAX_PATH_LABELS_PER_ISSUE && (
                    <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
                      {`+${issue.pathLabels.length - MAX_PATH_LABELS_PER_ISSUE} more path(s)`}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </Stack>
        )}

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
              Build tree paths first to validate short link IDs.
            </Typography>
          ) : (
            <Stack divider={ <Divider flexItem /> } spacing={ 0 }>
              {rows.map((row, index) => (
                <Stack key={ `${row.pathLabel}-${index}` } spacing={ 0.6 } sx={ { p: 1.25 } }>
                  <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
                    {row.pathLabel}
                  </Typography>
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
