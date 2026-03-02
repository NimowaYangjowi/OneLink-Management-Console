/**
 * Link Group detail page with item-level execution status and retry controls.
 */
'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import TreePreviewPanel from '@/components/onelink/group-create/TreePreviewPanel';
import type { EditorTreeNode, SnippetPreview } from '@/components/onelink/group-create/types';
import { computeMaxDepth, hydrateEditorNodes } from '@/components/onelink/group-create/treeUtils';
import { computeLeafCount } from '@/lib/onelinkGroupTree';
import type { LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';

const POLL_DELAY_INITIAL_MS = 2000;
const POLL_DELAY_MAX_MS = 10000;

type LinkGroupItemRecord = {
  errorMessage: string;
  id: string;
  pathLabel: string;
  retryCount: number;
  shortLink: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
};

type LinkGroupDetail = {
  brandDomain: string;
  failedCount: number;
  id: string;
  items: LinkGroupItemRecord[];
  name: string;
  page: number;
  pageSize: number;
  plannedCount: number;
  status: 'draft' | 'running' | 'completed' | 'partial_failed' | 'failed';
  successCount: number;
  templateId: string;
  totalItems: number;
  totalPages: number;
  treeConfigJson: string;
};

type RetryResponse = {
  error?: string;
  requeuedCount?: number;
};

type DeleteResponse = {
  deleted?: boolean;
  error?: string;
  remoteDeleted?: boolean;
};

type LinkGroupDetailPageProps = {
  groupId: string;
};

function getStatusChipColor(status: LinkGroupDetail['status']): 'default' | 'error' | 'info' | 'success' | 'warning' {
  if (status === 'running') {
    return 'info';
  }
  if (status === 'completed') {
    return 'success';
  }
  if (status === 'partial_failed') {
    return 'warning';
  }
  if (status === 'failed') {
    return 'error';
  }
  return 'default';
}

function getItemStatusChipColor(status: LinkGroupItemRecord['status']): 'default' | 'error' | 'info' | 'success' | 'warning' {
  if (status === 'processing') {
    return 'info';
  }
  if (status === 'success') {
    return 'success';
  }
  if (status === 'failed') {
    return 'error';
  }
  if (status === 'pending') {
    return 'warning';
  }
  return 'default';
}

function countTotalNodes(nodes: EditorTreeNode[]): number {
  let totalCount = 0;

  const visit = (node: EditorTreeNode) => {
    totalCount += 1;
    node.children.forEach((child) => {
      visit(child);
    });
  };

  nodes.forEach((node) => {
    visit(node);
  });

  return totalCount;
}

function buildTreePreviewSnippets(
  nodes: EditorTreeNode[],
  shortLinkByPathLabel: Map<string, string>,
): SnippetPreview[] {
  const snippets: SnippetPreview[] = [];

  const visit = (node: EditorTreeNode, ancestorNodeIds: string[], ancestorLabels: string[]) => {
    const nodeIds = [...ancestorNodeIds, node.id];
    const labels = [...ancestorLabels, node.value];
    const pathLabel = labels.join(' > ');

    if (node.children.length === 0) {
      snippets.push({
        fullUrl: shortLinkByPathLabel.get(pathLabel) || 'No URL yet',
        nodeIds,
        pathLabel,
        payload: {},
      });
      return;
    }

    node.children.forEach((childNode) => {
      visit(childNode, nodeIds, labels);
    });
  };

  nodes.forEach((rootNode) => {
    visit(rootNode, [], []);
  });

  return snippets;
}

/**
 * OneLinkGroupDetailPage
 *
 * Props:
 * @param {string} groupId - Target link group ID [Required]
 */
function OneLinkGroupDetailPage({ groupId }: LinkGroupDetailPageProps) {
  const [detail, setDetail] = useState<LinkGroupDetail | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isActing, setIsActing] = useState(false);
  const [isTreePreviewExpanded, setIsTreePreviewExpanded] = useState(true);

  const isRunning = detail?.status === 'running';

  const loadDetail = useCallback(async (targetPage: number) => {
    setError('');

    try {
      const response = await fetch(
        `/api/onelink-groups/${encodeURIComponent(groupId)}?page=${targetPage}&pageSize=50`,
        {
          cache: 'no-store',
          method: 'GET',
        },
      );
      const payload = (await response.json().catch(() => null)) as (LinkGroupDetail & { error?: string }) | null;

      if (!response.ok || !payload || !payload.id) {
        setDetail(null);
        setError(payload?.error || 'Failed to load group detail.');
        return;
      }

      setDetail(payload);
      setPage(payload.page);
    } catch {
      setDetail(null);
      setError('Failed to load group detail.');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadDetail(page);
  }, [loadDetail, page]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    let isActive = true;
    let timerId: number | null = null;
    let delayMs = POLL_DELAY_INITIAL_MS;

    const scheduleNext = () => {
      if (!isActive) {
        return;
      }
      timerId = window.setTimeout(tick, delayMs);
    };

    const tick = async () => {
      if (!isActive) {
        return;
      }

      if (document.hidden) {
        delayMs = POLL_DELAY_MAX_MS;
        scheduleNext();
        return;
      }

      await loadDetail(page);
      delayMs = Math.min(delayMs + 1000, POLL_DELAY_MAX_MS);
      scheduleNext();
    };

    const handleVisibilityChange = () => {
      if (!isActive || document.hidden) {
        return;
      }

      delayMs = POLL_DELAY_INITIAL_MS;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      scheduleNext();
    };

    scheduleNext();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, loadDetail, page]);

  const canRetry = useMemo(
    () => Boolean(detail && detail.failedCount > 0 && detail.status !== 'running' && !isActing),
    [detail, isActing],
  );

  const parsedTree = useMemo(() => {
    if (!detail?.treeConfigJson) {
      return { parseError: false, roots: [] as LinkGroupTreeNode[] };
    }

    try {
      const parsed = JSON.parse(detail.treeConfigJson) as { roots?: LinkGroupTreeNode[] } | null;
      if (!parsed || !Array.isArray(parsed.roots)) {
        return { parseError: true, roots: [] as LinkGroupTreeNode[] };
      }

      return { parseError: false, roots: parsed.roots };
    } catch {
      return { parseError: true, roots: [] as LinkGroupTreeNode[] };
    }
  }, [detail?.treeConfigJson]);

  const editorTreeRoots = useMemo(
    () => hydrateEditorNodes(parsedTree.roots),
    [parsedTree.roots],
  );
  const shortLinkByPathLabel = useMemo(() => {
    const linkByPathLabel = new Map<string, string>();

    detail?.items.forEach((item) => {
      if (item.shortLink) {
        linkByPathLabel.set(item.pathLabel, item.shortLink);
      }
    });

    return linkByPathLabel;
  }, [detail?.items]);
  const treePreviewSnippets = useMemo(
    () => buildTreePreviewSnippets(editorTreeRoots, shortLinkByPathLabel),
    [editorTreeRoots, shortLinkByPathLabel],
  );
  const treeLeafCount = useMemo(() => computeLeafCount(parsedTree.roots), [parsedTree.roots]);
  const treeMaxDepth = useMemo(() => computeMaxDepth(parsedTree.roots), [parsedTree.roots]);
  const treeTotalNodeCount = useMemo(() => countTotalNodes(editorTreeRoots), [editorTreeRoots]);

  const handleRetryFailed = async () => {
    if (!detail || !canRetry) {
      return;
    }

    setIsActing(true);
    setActionMessage('');

    try {
      const response = await fetch(`/api/onelink-groups/${encodeURIComponent(detail.id)}/retry`, {
        method: 'POST',
      });
      const payload = (await response.json().catch(() => null)) as RetryResponse | null;

      if (!response.ok) {
        setActionMessage(payload?.error || 'Failed to retry failed items.');
        return;
      }

      setActionMessage(`Requeued ${payload?.requeuedCount ?? 0} failed items.`);
      await loadDetail(page);
    } catch {
      setActionMessage('Failed to retry failed items.');
    } finally {
      setIsActing(false);
    }
  };

  const handleDelete = async (mode: 'local_only' | 'local_and_remote') => {
    if (!detail || isActing) {
      return;
    }

    const confirmed = window.confirm(
      mode === 'local_and_remote'
        ? `Delete "${detail.name}" locally and in AppsFlyer?`
        : `Delete "${detail.name}" locally only?`,
    );

    if (!confirmed) {
      return;
    }

    setIsActing(true);
    setActionMessage('');

    try {
      const response = await fetch(`/api/onelink-groups/${encodeURIComponent(detail.id)}?mode=${mode}`, {
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as DeleteResponse | null;

      if (!response.ok) {
        setActionMessage(payload?.error || 'Failed to delete link group.');
        return;
      }

      if (mode === 'local_and_remote' && payload?.remoteDeleted === false) {
        setActionMessage('Group deleted locally, but one or more remote deletes failed.');
      } else {
        setActionMessage('Group deleted.');
      }

      setTimeout(() => {
        window.location.href = '/link-groups';
      }, 450);
    } catch {
      setActionMessage('Failed to delete link group.');
    } finally {
      setIsActing(false);
    }
  };

  return (
    <ConsoleLayout
      actions={ (
        <Button component={ Link } href='/link-groups' sx={ { textTransform: 'none' } } variant='outlined'>
          Back to Groups
        </Button>
      ) }
      title='Link Group Detail'
    >
      <Box sx={ { maxWidth: 1600, mx: 'auto', px: { md: 4, xs: 2 }, py: 4, width: '100%' } }>
        <Stack spacing={ 2 }>
          {error && <Alert severity='error'>{error}</Alert>}
          {actionMessage && <Alert severity='info'>{actionMessage}</Alert>}

          {detail && (
            <Paper
              elevation={ 0 }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
              } }
            >
              <Stack direction={ { md: 'row', xs: 'column' } } justifyContent='space-between' spacing={ 1.5 }>
                <Stack spacing={ 0.5 }>
                  <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
                    {detail.name}
                  </Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                    {detail.id}
                  </Typography>
                  <Stack direction='row' spacing={ 1 }>
                    <Chip color={ getStatusChipColor(detail.status) } label={ detail.status } size='small' />
                    <Chip label={ `Template: ${detail.templateId}` } size='small' />
                  </Stack>
                </Stack>

                <Stack alignItems={ { md: 'flex-end', xs: 'flex-start' } } spacing={ 0.5 }>
                  <Typography sx={ { color: 'text.primary', fontSize: 13 } }>
                    Planned: {detail.plannedCount}
                  </Typography>
                  <Typography sx={ { color: 'success.main', fontSize: 13 } }>
                    Success: {detail.successCount}
                  </Typography>
                  <Typography sx={ { color: 'error.main', fontSize: 13 } }>
                    Failed: {detail.failedCount}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction={ { md: 'row', xs: 'column' } } spacing={ 1 } sx={ { mt: 1.75 } }>
                <Button
                  component={ Link }
                  href={ `/link-groups/${encodeURIComponent(detail.id)}/edit` }
                  disabled={ isActing }
                  sx={ { textTransform: 'none' } }
                  variant='outlined'
                >
                  Edit Group
                </Button>
                <Button
                  disabled={ !canRetry }
                  onClick={ handleRetryFailed }
                  sx={ { textTransform: 'none' } }
                  variant='contained'
                >
                  Retry Failed
                </Button>
                <Button
                  color='error'
                  disabled={ isActing }
                  onClick={ () => handleDelete('local_only') }
                  sx={ { textTransform: 'none' } }
                  variant='outlined'
                >
                  Delete Local
                </Button>
                <Button
                  color='error'
                  disabled={ isActing }
                  onClick={ () => handleDelete('local_and_remote') }
                  sx={ { textTransform: 'none' } }
                  variant='text'
                >
                  Delete Local + Remote
                </Button>
              </Stack>
            </Paper>
          )}

          {detail && (
            <Stack spacing={ 1 }>
              {parsedTree.parseError && (
                <Alert severity='warning'>Failed to parse stored tree configuration.</Alert>
              )}
              <TreePreviewPanel
                leafCount={ treeLeafCount }
                maxDepth={ treeMaxDepth }
                nodes={ editorTreeRoots }
                onToggleExpanded={ () => setIsTreePreviewExpanded((previous) => !previous) }
                previewSnippets={ treePreviewSnippets }
                totalNodeCount={ treeTotalNodeCount }
                treePreviewExpanded={ isTreePreviewExpanded }
              />
            </Stack>
          )}

          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
            } }
          >
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Path</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Retry</TableCell>
                  <TableCell>Short Link</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detail?.items.map((item) => (
                  <TableRow key={ item.id }>
                    <TableCell sx={ { maxWidth: 360 } }>{item.pathLabel}</TableCell>
                    <TableCell>
                      <Chip color={ getItemStatusChipColor(item.status) } label={ item.status } size='small' />
                    </TableCell>
                    <TableCell>{item.retryCount}</TableCell>
                    <TableCell sx={ { maxWidth: 360 } }>
                      {item.shortLink ? (
                        <Typography
                          component='a'
                          href={ item.shortLink }
                          rel='noreferrer'
                          sx={ { color: 'primary.main', fontSize: 12, wordBreak: 'break-all' } }
                          target='_blank'
                        >
                          {item.shortLink}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell sx={ { color: 'error.main', maxWidth: 360 } }>
                      {item.errorMessage || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {detail && detail.items.length === 0 && !isLoading && (
              <Alert severity='info' sx={ { mt: 1.5 } }>
                No items found.
              </Alert>
            )}

            {detail && detail.totalPages > 1 && (
              <Stack alignItems='center' sx={ { mt: 2 } }>
                <Pagination
                  count={ detail.totalPages }
                  onChange={ (_, nextPage) => setPage(nextPage) }
                  page={ page }
                />
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkGroupDetailPage;
