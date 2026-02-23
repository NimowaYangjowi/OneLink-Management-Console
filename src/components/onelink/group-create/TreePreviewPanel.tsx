/**
 * Collapsible tree summary panel for hierarchy verification.
 */
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { EditorTreeNode, SnippetPreview } from './types';

type TreePreviewPanelProps = {
  leafCount: number;
  maxDepth: number;
  nodes: EditorTreeNode[];
  onToggleExpanded: () => void;
  previewSnippets: SnippetPreview[];
  totalNodeCount: number;
  treePreviewExpanded: boolean;
};

const LEVEL_SECTION_LABEL: Record<EditorTreeNode['level'], string> = {
  ad: 'Ad',
  adset: 'Ad Set',
  campaign: 'Campaign',
  media_source: 'Media Source',
};
const PREVIEW_TABLE_COLUMNS = {
  md: 'minmax(280px, 1fr) minmax(420px, 1.9fr)',
  xs: 'minmax(220px, 1fr) minmax(260px, 1.4fr)',
};

const MAX_COMBINED_ROWS = 420;
const PREVIEW_ROW_HEIGHT = 34;

type CombinedPreviewRow = {
  depth: number;
  isLeaf: boolean;
  key: string;
  parentKey: string | null;
  levelLabel: string;
  pathLabel: string;
  urlText: string;
  value: string;
};

function buildCombinedPreviewRows(nodes: EditorTreeNode[], previewSnippets: SnippetPreview[]): CombinedPreviewRow[] {
  const snippetByPathKey = new Map<string, SnippetPreview>(
    previewSnippets.map((snippet) => [snippet.nodeIds.join('/'), snippet]),
  );
  const visibleLeafPathKeySet = new Set(previewSnippets.map((snippet) => snippet.nodeIds.join('/')));

  const visitNode = (
    node: EditorTreeNode,
    ancestorNodeIds: string[],
    ancestorLabels: string[],
    depth: number,
    parentKey: string | null,
  ): { leafCount: number; rows: CombinedPreviewRow[] } => {
    const nodeIds = [...ancestorNodeIds, node.id];
    const labels = [...ancestorLabels, node.value];
    const pathKey = nodeIds.join('/');
    const pathLabel = labels.join(' > ');
    const levelLabel = LEVEL_SECTION_LABEL[node.level];

    if (node.children.length === 0) {
      if (!visibleLeafPathKeySet.has(pathKey)) {
        return {
          leafCount: 0,
          rows: [],
        };
      }

      const snippet = snippetByPathKey.get(pathKey);
      return {
        leafCount: 1,
        rows: [{
          depth,
          isLeaf: true,
          key: pathKey,
          parentKey,
          levelLabel,
          pathLabel,
          urlText: snippet?.fullUrl ?? 'No URL yet',
          value: node.value,
        }],
      };
    }

    let descendantLeafCount = 0;
    const childRows: CombinedPreviewRow[] = [];

    node.children.forEach((childNode) => {
      const childResult = visitNode(childNode, nodeIds, labels, depth + 1, pathKey);
      descendantLeafCount += childResult.leafCount;
      childRows.push(...childResult.rows);
    });

    if (descendantLeafCount === 0) {
      return {
        leafCount: 0,
        rows: [],
      };
    }

    return {
      leafCount: descendantLeafCount,
      rows: [{
        depth,
        isLeaf: false,
        key: pathKey,
        parentKey,
        levelLabel,
        pathLabel,
        urlText: `${descendantLeafCount} link${descendantLeafCount === 1 ? '' : 's'}`,
        value: node.value,
      }, ...childRows],
    };
  };

  const rows: CombinedPreviewRow[] = [];
  nodes.forEach((rootNode) => {
    rows.push(...visitNode(rootNode, [], [], 0, null).rows);
  });

  return rows;
}

function TreePreviewPanel({
  leafCount,
  maxDepth,
  nodes,
  onToggleExpanded,
  previewSnippets,
  totalNodeCount,
  treePreviewExpanded,
}: TreePreviewPanelProps) {
  const [collapsedRowKeys, setCollapsedRowKeys] = useState<string[]>([]);
  const previewScopeKey = useMemo(
    () => previewSnippets.map((snippet) => snippet.nodeIds.join('/')).join('|'),
    [previewSnippets],
  );
  const combinedRows = useMemo(
    () => buildCombinedPreviewRows(nodes, previewSnippets),
    [nodes, previewSnippets],
  );
  const rowByKey = useMemo(
    () => new Map(combinedRows.map((row) => [row.key, row])),
    [combinedRows],
  );
  const branchRowKeySet = useMemo(
    () => new Set(combinedRows.filter((row) => !row.isLeaf).map((row) => row.key)),
    [combinedRows],
  );
  const collapsedRowKeySet = useMemo(
    () => new Set(collapsedRowKeys),
    [collapsedRowKeys],
  );

  useEffect(() => {
    setCollapsedRowKeys((previous) => {
      const next = previous.filter((rowKey) => branchRowKeySet.has(rowKey));
      return next.length === previous.length ? previous : next;
    });
  }, [branchRowKeySet]);

  useEffect(() => {
    // Keep manual collapse/expand during the same scope, but reset when external
    // selection scope changes so newly filtered trees are immediately visible.
    setCollapsedRowKeys([]);
  }, [previewScopeKey]);

  const visibleRows = useMemo(() => {
    return combinedRows.filter((row) => {
      let currentParentKey = row.parentKey;
      while (currentParentKey) {
        if (collapsedRowKeySet.has(currentParentKey)) {
          return false;
        }
        currentParentKey = rowByKey.get(currentParentKey)?.parentKey ?? null;
      }
      return true;
    });
  }, [collapsedRowKeySet, combinedRows, rowByKey]);
  const cappedRows = visibleRows.slice(0, MAX_COMBINED_ROWS);
  const hiddenRowCount = Math.max(0, visibleRows.length - cappedRows.length);

  return (
    <Paper
      elevation={ 0 }
      sx={ {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
      } }
    >
      <Stack spacing={ 1 }>
        <Stack alignItems='center' direction='row' justifyContent='space-between'>
          <Typography sx={ { color: 'text.primary', fontSize: 15, fontWeight: 700 } }>
            Tree Preview
          </Typography>
          <Button
            onClick={ onToggleExpanded }
            size='small'
            sx={ { textTransform: 'none' } }
            variant='text'
          >
            {treePreviewExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </Stack>
        <Typography sx={ { color: leafCount > 2000 ? 'error.main' : 'text.secondary', fontSize: 12 } }>
          {`Leaf paths: ${leafCount} · Max depth: ${maxDepth} · Total nodes: ${totalNodeCount}`}
        </Typography>
        {treePreviewExpanded && (
          <Stack spacing={ 0.75 }>
            <Box
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                maxHeight: { md: 700, xs: 480 },
                overflowY: 'auto',
                p: 1,
              } }
            >
              {cappedRows.length > 0 ? (
                <Box
                  sx={ {
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: PREVIEW_TABLE_COLUMNS,
                    minWidth: 0,
                  } }
                >
                  <Stack spacing={ 0 }>
                    <Box
                      sx={ {
                        backgroundColor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        px: 1,
                        py: 0.75,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      } }
                    >
                      <Typography sx={ { color: 'text.secondary', fontSize: 11, fontWeight: 700 } }>
                        Path
                      </Typography>
                    </Box>
                    <Box sx={ { overflowX: 'auto', overflowY: 'hidden' } }>
                      <Stack spacing={ 0 } sx={ { minWidth: '100%', width: 'max-content' } }>
                        {cappedRows.map((row) => {
                          const isBranchCollapsed = !row.isLeaf && collapsedRowKeySet.has(row.key);
                          return (
                            <Box
                              key={ `path-${row.key}` }
                              sx={ {
                                '&:last-of-type': {
                                  borderBottom: 'none',
                                },
                                alignItems: 'center',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                minHeight: PREVIEW_ROW_HEIGHT,
                                px: 1,
                                py: 0.5,
                                width: 'max-content',
                              } }
                            >
                              <Stack
                                alignItems='center'
                                direction='row'
                                spacing={ 0.5 }
                                sx={ { pl: row.depth * 1.5 } }
                              >
                                {row.isLeaf ? (
                                  <Typography sx={ { color: 'text.disabled', fontSize: 11, pt: 0.1 } }>
                                    •
                                  </Typography>
                                ) : (
                                  <Box
                                    aria-label={ isBranchCollapsed ? 'Expand row' : 'Collapse row' }
                                    component='button'
                                    onClick={ () => {
                                      setCollapsedRowKeys((previous) => (
                                        previous.includes(row.key)
                                          ? previous.filter((rowKey) => rowKey !== row.key)
                                          : [...previous, row.key]
                                      ));
                                    } }
                                    sx={ {
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      color: 'text.secondary',
                                      cursor: 'pointer',
                                      fontSize: 11,
                                      lineHeight: 1,
                                      p: 0,
                                    } }
                                    type='button'
                                  >
                                    {isBranchCollapsed ? '▸' : '▾'}
                                  </Box>
                                )}
                                <Typography
                                  sx={ {
                                    color: 'text.primary',
                                    fontSize: 12,
                                    fontWeight: row.isLeaf ? 500 : 600,
                                    whiteSpace: 'nowrap',
                                  } }
                                  title={ row.pathLabel }
                                >
                                  {`${row.levelLabel}: ${row.value}`}
                                </Typography>
                              </Stack>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack spacing={ 0 }>
                    <Box
                      sx={ {
                        backgroundColor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        px: 1,
                        py: 0.75,
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      } }
                    >
                      <Typography sx={ { color: 'text.secondary', fontSize: 11, fontWeight: 700 } }>
                        URL
                      </Typography>
                    </Box>
                    <Box sx={ { overflowX: 'auto', overflowY: 'hidden' } }>
                      <Stack spacing={ 0 } sx={ { minWidth: '100%', width: 'max-content' } }>
                        {cappedRows.map((row) => (
                          <Box
                            key={ `url-${row.key}` }
                            sx={ {
                              '&:last-of-type': {
                                borderBottom: 'none',
                              },
                              alignItems: 'center',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              minHeight: PREVIEW_ROW_HEIGHT,
                              px: 1,
                              py: 0.5,
                              width: 'max-content',
                            } }
                          >
                            <Typography
                              sx={ {
                                color: row.isLeaf ? 'text.primary' : 'text.secondary',
                                fontFamily: row.isLeaf ? 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)' : 'inherit',
                                fontSize: 11,
                                whiteSpace: 'nowrap',
                              } }
                              title={ row.urlText }
                            >
                              {row.urlText}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ) : (
                <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                  No tree or links available yet.
                </Typography>
              )}
            </Box>
            {hiddenRowCount > 0 && (
              <Typography sx={ { color: 'text.secondary', fontSize: 11, textAlign: 'right' } }>
                {`+${hiddenRowCount} more rows`}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export default TreePreviewPanel;
