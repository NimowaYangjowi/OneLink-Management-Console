/**
 * Demo page that compares three alternative hierarchy-builder UX patterns.
 */
'use client';

import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import GlobalParametersStep from '@/components/onelink/group-create/GlobalParametersStep';
import type { ParamRow } from '@/components/onelink/group-create/types';

type DemoTreeNode = {
  children: DemoTreeNode[];
  id: string;
  label: string;
};

type DemoLeafRow = {
  id: string;
  labels: string[];
  pathLabel: string;
};

type SelectedPath = [string | null, string | null, string | null, string | null];

const LEVEL_LABELS = ['Media Source', 'Campaign', 'Ad Set', 'Ad'] as const;
const UX_TAB_LABELS = ['Path Table Builder', 'Outline + Inspector', 'Level Swimlane'] as const;

const ADDITIONAL_PARAM_KEY_OPTIONS = ['af_channel', 'af_sub1', 'af_sub2', 'af_sub3', 'region', 'segment'];
const ADDITIONAL_PARAM_VALUE_OPTIONS = ['always_on', 'brand', 'kr', 'retargeting', 'spring_sale'];
const DEEP_LINK_FIELD_DEFINITIONS: Array<{
  description: string;
  key: string;
  label: string;
  options: string[];
  placeholder: string;
}> = [
  {
    description: 'In-app deep link destination.',
    key: 'af_dp',
    label: 'Deep Link Path',
    options: ['myapp://home', 'myapp://promo', 'myapp://product/1234'],
    placeholder: 'myapp://path',
  },
  {
    description: 'Fallback URL for Android users.',
    key: 'af_android_url',
    label: 'Android Fallback URL',
    options: ['https://play.google.com/store/apps/details?id=com.demo.app'],
    placeholder: 'https://...',
  },
  {
    description: 'Fallback URL for iOS users.',
    key: 'af_ios_url',
    label: 'iOS Fallback URL',
    options: ['https://apps.apple.com/app/id000000000'],
    placeholder: 'https://...',
  },
  {
    description: 'Fallback URL for desktop and unsupported environments.',
    key: 'af_web_dp',
    label: 'Web Fallback URL',
    options: ['https://brand.onelink.me/landing'],
    placeholder: 'https://...',
  },
];

const MOCK_TREE: DemoTreeNode[] = [
  {
    id: 'ms-facebook',
    label: 'facebook_ads',
    children: [
      {
        id: 'cp-spring-sale',
        label: 'Spring Sale 2026',
        children: [
          {
            id: 'as-lookalike-kr',
            label: 'Lookalike KR',
            children: [
              { id: 'ad-video-v1', label: 'Video V1', children: [] },
              { id: 'ad-video-v2', label: 'Video V2', children: [] },
            ],
          },
          {
            id: 'as-retargeting-kr',
            label: 'Retargeting KR',
            children: [
              { id: 'ad-static-a', label: 'Static A', children: [] },
              { id: 'ad-static-b', label: 'Static B', children: [] },
            ],
          },
        ],
      },
      {
        id: 'cp-always-on',
        label: 'Always On',
        children: [
          {
            id: 'as-broad-global',
            label: 'Broad Global',
            children: [
              { id: 'ad-creative-1', label: 'Creative 01', children: [] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ms-google',
    label: 'googleadwords_int',
    children: [
      {
        id: 'cp-brand-search',
        label: 'Brand Search',
        children: [
          {
            id: 'as-exact-core',
            label: 'Exact Core',
            children: [
              { id: 'ad-rsa-core', label: 'RSA Core', children: [] },
              { id: 'ad-rsa-sale', label: 'RSA Sale', children: [] },
            ],
          },
        ],
      },
      {
        id: 'cp-uac-growth',
        label: 'UAC Growth',
        children: [
          {
            id: 'as-android-uac',
            label: 'Android UAC',
            children: [
              { id: 'ad-uac-a', label: 'Asset Group A', children: [] },
              { id: 'ad-uac-b', label: 'Asset Group B', children: [] },
              { id: 'ad-uac-c', label: 'Asset Group C', children: [] },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ms-tiktok',
    label: 'tiktokglobal_int',
    children: [
      {
        id: 'cp-prospecting',
        label: 'Prospecting',
        children: [
          {
            id: 'as-interest-stacked',
            label: 'Interest Stacked',
            children: [
              { id: 'ad-spark-1', label: 'Spark Ad 01', children: [] },
            ],
          },
        ],
      },
    ],
  },
];

function countLeafPaths(nodes: DemoTreeNode[]): number {
  return nodes.reduce((total, node) => {
    if (node.children.length === 0) {
      return total + 1;
    }

    return total + countLeafPaths(node.children);
  }, 0);
}

function countLeafPathsFromNode(node: DemoTreeNode): number {
  if (node.children.length === 0) {
    return 1;
  }

  return countLeafPaths(node.children);
}

function countAllNodes(nodes: DemoTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countAllNodes(node.children), 0);
}

function buildNodeMap(nodes: DemoTreeNode[]): Map<string, DemoTreeNode> {
  const nodeMap = new Map<string, DemoTreeNode>();

  const visit = (items: DemoTreeNode[]) => {
    items.forEach((node) => {
      nodeMap.set(node.id, node);
      visit(node.children);
    });
  };

  visit(nodes);
  return nodeMap;
}

function findPathToNode(nodes: DemoTreeNode[], targetId: string, ancestors: DemoTreeNode[] = []): DemoTreeNode[] | null {
  for (const node of nodes) {
    const nextAncestors = [...ancestors, node];

    if (node.id === targetId) {
      return nextAncestors;
    }

    const nested = findPathToNode(node.children, targetId, nextAncestors);
    if (nested) {
      return nested;
    }
  }

  return null;
}

function buildLeafRows(nodes: DemoTreeNode[]): DemoLeafRow[] {
  const rows: DemoLeafRow[] = [];

  const visit = (node: DemoTreeNode, ancestors: DemoTreeNode[]) => {
    const nextAncestors = [...ancestors, node];

    if (node.children.length === 0) {
      rows.push({
        id: node.id,
        labels: nextAncestors.map((item) => item.label),
        pathLabel: nextAncestors.map((item) => item.label).join(' > '),
      });
      return;
    }

    node.children.forEach((child) => visit(child, nextAncestors));
  };

  nodes.forEach((root) => visit(root, []));
  return rows;
}

function createDemoParamRow(key: string, value: string, scopePathPrefixes: string[]): ParamRow {
  return {
    id: `demo-param-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    isDisabled: false,
    key,
    scopePathPrefixes,
    value,
  };
}

type DemoParameterPanelProps = {
  scopePathPrefixes: string[];
  title: string;
};

function DemoParameterPanel({ scopePathPrefixes, title }: DemoParameterPanelProps) {
  const [forceDeeplink, setForceDeeplink] = useState(true);
  const [isRetargeting, setIsRetargeting] = useState(true);
  const [activeParamKey, setActiveParamKey] = useState('');
  const [deepLinkParamValues, setDeepLinkParamValues] = useState<Record<string, string>>({
    af_android_url: 'https://play.google.com/store/apps/details?id=com.demo.app',
    af_dp: 'myapp://home',
    af_ios_url: 'https://apps.apple.com/app/id000000000',
    af_web_dp: 'https://brand.onelink.me/landing',
  });
  const [additionalParamRows, setAdditionalParamRows] = useState<ParamRow[]>([
    createDemoParamRow('af_sub1', 'spring_sale', []),
    createDemoParamRow('af_channel', 'paid_social', []),
  ]);

  const deepLinkFields = useMemo(() => DEEP_LINK_FIELD_DEFINITIONS.map((field) => ({
    ...field,
    value: deepLinkParamValues[field.key] ?? '',
  })), [deepLinkParamValues]);

  const scopeHint = useMemo(() => {
    const scopeText = scopePathPrefixes.length > 0
      ? scopePathPrefixes.join(', ')
      : 'Global scope (applies to all paths)';

    return activeParamKey ? `${scopeText} · Editing: ${activeParamKey}` : scopeText;
  }, [activeParamKey, scopePathPrefixes]);

  const handleAddParamRow = () => {
    setAdditionalParamRows((previous) => [
      ...previous,
      createDemoParamRow('', '', scopePathPrefixes),
    ]);
  };

  const handleRemoveParamRow = (rowId: string) => {
    setAdditionalParamRows((previous) => previous.filter((row) => row.id !== rowId));
  };

  const handleSetDeepLinkParamValue = (paramKey: string, value: string) => {
    setDeepLinkParamValues((previous) => ({
      ...previous,
      [paramKey]: value,
    }));
  };

  const handleUpdateParamRow = (rowId: string, field: 'key' | 'value', value: string) => {
    setAdditionalParamRows((previous) => previous.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      return {
        ...row,
        [field]: value,
        scopePathPrefixes,
      };
    }));
  };

  return (
    <Paper
      elevation={ 0 }
      sx={ {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        flex: { xl: '1 1 34%', xs: '1 1 auto' },
        maxHeight: { xl: 620, xs: 'none' },
        minWidth: 0,
        p: 2,
      } }
    >
      <Stack spacing={ 1.25 } sx={ { height: '100%', minHeight: 0 } }>
        <Typography sx={ { color: 'text.primary', fontSize: 14, fontWeight: 700 } }>
          {title}
        </Typography>
        <Box sx={ { flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 } }>
          <GlobalParametersStep
            additionalParamKeyOptions={ ADDITIONAL_PARAM_KEY_OPTIONS }
            additionalParamRows={ additionalParamRows }
            additionalParamValueOptions={ ADDITIONAL_PARAM_VALUE_OPTIONS }
            deepLinkFields={ deepLinkFields }
            forceDeeplink={ forceDeeplink }
            isRetargeting={ isRetargeting }
            onAddParamRow={ handleAddParamRow }
            onRemoveParamRow={ handleRemoveParamRow }
            onSetActiveParamKey={ setActiveParamKey }
            onSetDeepLinkParamValue={ handleSetDeepLinkParamValue }
            onSetForceDeeplink={ setForceDeeplink }
            onSetRetargeting={ setIsRetargeting }
            onUpdateParamRow={ handleUpdateParamRow }
            scopeHint={ scopeHint }
          />
        </Box>
      </Stack>
    </Paper>
  );
}

function PathTableVariant() {
  const leafRows = useMemo(() => buildLeafRows(MOCK_TREE), []);
  const [searchText, setSearchText] = useState('');
  const [selectedLeafId, setSelectedLeafId] = useState('');

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    if (!normalizedSearch) {
      return leafRows;
    }

    return leafRows.filter((row) => row.pathLabel.toLowerCase().includes(normalizedSearch));
  }, [leafRows, searchText]);

  const selectedRow = useMemo(
    () => leafRows.find((row) => row.id === selectedLeafId) ?? null,
    [leafRows, selectedLeafId],
  );

  const scopePathPrefixes = selectedRow ? [selectedRow.pathLabel] : [];

  return (
    <Stack direction={ { xl: 'row', xs: 'column' } } spacing={ 1.5 }>
      <Paper
        elevation={ 0 }
        sx={ {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          flex: { xl: '1 1 66%', xs: '1 1 auto' },
          minWidth: 0,
          p: 2,
        } }
      >
        <Stack spacing={ 1.25 }>
          <Typography sx={ { color: 'text.primary', fontSize: 16, fontWeight: 700 } }>
            Path Table Builder
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
            Best for explicit scope editing. Pick one row and apply scoped parameters directly.
          </Typography>
          <Stack direction={ { md: 'row', xs: 'column' } } justifyContent='space-between' spacing={ 1 }>
            <TextField
              onChange={ (event) => setSearchText(event.target.value) }
              placeholder='Search path values'
              size='small'
              sx={ { width: { md: 320, xs: '100%' } } }
              value={ searchText }
            />
            <Stack direction='row' spacing={ 0.75 }>
              <Chip label={ `Rows: ${filteredRows.length}` } size='small' />
              <Chip label={ selectedRow ? 'Scope: Row selected' : 'Scope: Global' } size='small' />
            </Stack>
          </Stack>

          <Box sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: 500, overflow: 'auto' } }>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Media Source</TableCell>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Ad Set</TableCell>
                  <TableCell>Ad</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => {
                  const isSelected = row.id === selectedLeafId;

                  return (
                    <TableRow
                      hover
                      key={ row.id }
                      onClick={ () => setSelectedLeafId(row.id) }
                      selected={ isSelected }
                      sx={ {
                        cursor: 'pointer',
                        '& .MuiTableCell-root': {
                          fontWeight: isSelected ? 600 : 400,
                        },
                      } }
                    >
                      <TableCell>{row.labels[0] ?? '-'}</TableCell>
                      <TableCell>{row.labels[1] ?? '-'}</TableCell>
                      <TableCell>{row.labels[2] ?? '-'}</TableCell>
                      <TableCell>{row.labels[3] ?? '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </Paper>

      <DemoParameterPanel scopePathPrefixes={ scopePathPrefixes } title='Parameter Panel (Row Scope)' />
    </Stack>
  );
}

function OutlineInspectorVariant() {
  const [selectedNodeId, setSelectedNodeId] = useState(MOCK_TREE[0]?.id ?? '');
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([]);

  const selectedPathNodes = useMemo(
    () => (selectedNodeId ? findPathToNode(MOCK_TREE, selectedNodeId) ?? [] : []),
    [selectedNodeId],
  );
  const selectedNode = selectedPathNodes[selectedPathNodes.length - 1] ?? null;
  const selectedLevel = selectedPathNodes.length > 0 ? selectedPathNodes.length - 1 : null;
  const selectedPathLabel = selectedPathNodes.map((node) => node.label).join(' > ');
  const scopePathPrefixes = selectedPathLabel ? [selectedPathLabel] : [];

  const toggleNodeCollapsed = (nodeId: string) => {
    setCollapsedNodeIds((previous) => (
      previous.includes(nodeId)
        ? previous.filter((id) => id !== nodeId)
        : [...previous, nodeId]
    ));
  };

  const renderOutlineNodes = (nodes: DemoTreeNode[], depth: number): React.ReactNode => nodes.map((node) => {
    const isCollapsed = collapsedNodeIds.includes(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <Box key={ node.id }>
        <Stack alignItems='center' direction='row' spacing={ 0.25 } sx={ { pl: depth * 1.25 } }>
          {hasChildren ? (
            <IconButton
              aria-label={ isCollapsed ? 'Expand node' : 'Collapse node' }
              onClick={ () => toggleNodeCollapsed(node.id) }
              size='small'
              sx={ { p: 0.25 } }
            >
              <Typography sx={ { fontSize: 12 } }>{isCollapsed ? '▸' : '▾'}</Typography>
            </IconButton>
          ) : (
            <Box sx={ { width: 20 } } />
          )}
          <Box
            component='button'
            onClick={ () => setSelectedNodeId(node.id) }
            sx={ {
              backgroundColor: isSelected ? 'action.selected' : 'transparent',
              border: 'none',
              borderRadius: 1,
              color: 'text.primary',
              cursor: 'pointer',
              px: 0.75,
              py: 0.5,
              textAlign: 'left',
              width: '100%',
              '&:hover': {
                backgroundColor: isSelected ? 'action.selected' : 'action.hover',
              },
            } }
            type='button'
          >
            <Typography sx={ { fontSize: 12, fontWeight: isSelected ? 600 : 500 } }>
              {node.label}
            </Typography>
          </Box>
        </Stack>
        {!isCollapsed && hasChildren && renderOutlineNodes(node.children, depth + 1)}
      </Box>
    );
  });

  return (
    <Stack direction={ { xl: 'row', xs: 'column' } } spacing={ 1.5 }>
      <Paper
        elevation={ 0 }
        sx={ {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          flex: { xl: '1 1 66%', xs: '1 1 auto' },
          minWidth: 0,
          p: 2,
        } }
      >
        <Stack spacing={ 1.25 }>
          <Typography sx={ { color: 'text.primary', fontSize: 16, fontWeight: 700 } }>
            Outline Tree + Inspector
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
            Best for hierarchy readability. Select any node and edit parameters for that exact scope.
          </Typography>

          <Stack direction={ { md: 'row', xs: 'column' } } spacing={ 1.25 }>
            <Paper
              elevation={ 0 }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                flex: '1 1 62%',
                maxHeight: 500,
                overflowY: 'auto',
                p: 1,
              } }
            >
              <Stack spacing={ 0.2 }>
                {renderOutlineNodes(MOCK_TREE, 0)}
              </Stack>
            </Paper>

            <Paper
              elevation={ 0 }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                flex: '1 1 38%',
                p: 1.25,
              } }
            >
              <Stack spacing={ 1 }>
                <Typography sx={ { color: 'text.secondary', fontSize: 12, fontWeight: 700 } }>
                  Node Inspector
                </Typography>
                <Typography sx={ { color: 'text.primary', fontSize: 14, fontWeight: 600 } }>
                  {selectedNode?.label ?? 'No node selected'}
                </Typography>
                <Chip label={ `Level: ${selectedLevel !== null ? LEVEL_LABELS[selectedLevel] : '-'}` } size='small' />
                <Chip label={ `Children: ${selectedNode?.children.length ?? 0}` } size='small' />
                <Chip
                  label={ `Leaf paths: ${selectedNode ? countLeafPathsFromNode(selectedNode) : countLeafPaths(MOCK_TREE)}` }
                  size='small'
                />
                <Divider />
                <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
                  Path: {selectedPathLabel || 'Global'}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Paper>

      <DemoParameterPanel scopePathPrefixes={ scopePathPrefixes } title='Parameter Panel (Node Scope)' />
    </Stack>
  );
}

function SwimlaneVariant() {
  const nodeMap = useMemo(() => buildNodeMap(MOCK_TREE), []);
  const [selectedPath, setSelectedPath] = useState<SelectedPath>([null, null, null, null]);

  const lanes = useMemo(() => LEVEL_LABELS.map((levelLabel, levelIndex) => {
    if (levelIndex === 0) {
      return {
        levelIndex,
        levelLabel,
        nodes: MOCK_TREE,
        parentSelected: true,
      };
    }

    const parentId = selectedPath[levelIndex - 1];
    const parentNode = parentId ? nodeMap.get(parentId) ?? null : null;

    return {
      levelIndex,
      levelLabel,
      nodes: parentNode?.children ?? [],
      parentSelected: Boolean(parentNode),
    };
  }), [nodeMap, selectedPath]);

  const selectedLabels = useMemo(() => selectedPath
    .map((nodeId) => (nodeId ? nodeMap.get(nodeId)?.label ?? null : null))
    .filter((label): label is string => Boolean(label)), [nodeMap, selectedPath]);
  const scopePathPrefixes = selectedLabels.length > 0 ? [selectedLabels.join(' > ')] : [];

  const handleSelectLaneNode = (levelIndex: number, nodeId: string) => {
    setSelectedPath((previous) => {
      const nextPath = [...previous] as SelectedPath;
      nextPath[levelIndex] = nodeId;

      for (let nextLevel = levelIndex + 1; nextLevel < nextPath.length; nextLevel += 1) {
        nextPath[nextLevel] = null;
      }

      return nextPath;
    });
  };

  return (
    <Stack direction={ { xl: 'row', xs: 'column' } } spacing={ 1.5 }>
      <Paper
        elevation={ 0 }
        sx={ {
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          flex: { xl: '1 1 66%', xs: '1 1 auto' },
          minWidth: 0,
          p: 2,
        } }
      >
        <Stack spacing={ 1.25 }>
          <Typography sx={ { color: 'text.primary', fontSize: 16, fontWeight: 700 } }>
            Level Swimlane
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
            Best for flow visualization. Each lane is one hierarchy level and selection flows left-to-right.
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)', fontSize: 12 } }>
            {selectedLabels.length > 0 ? selectedLabels.join(' > ') : 'No selection (global scope)'}
          </Typography>

          <Stack spacing={ 1 }>
            {lanes.map((lane) => (
              <Paper
                key={ lane.levelLabel }
                elevation={ 0 }
                sx={ {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                } }
              >
                <Stack spacing={ 0.75 }>
                  <Stack alignItems='center' direction='row' justifyContent='space-between'>
                    <Typography sx={ { color: 'text.primary', fontSize: 13, fontWeight: 700 } }>
                      {`${lane.levelIndex + 1}. ${lane.levelLabel}`}
                    </Typography>
                    <Chip label={ `${lane.nodes.length}` } size='small' />
                  </Stack>
                  <Stack direction='row' spacing={ 0.75 } sx={ { flexWrap: 'wrap' } } useFlexGap>
                    {!lane.parentSelected ? (
                      <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                        {`Select ${LEVEL_LABELS[lane.levelIndex - 1]} first.`}
                      </Typography>
                    ) : lane.nodes.length === 0 ? (
                      <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                        No items in this lane.
                      </Typography>
                    ) : (
                      lane.nodes.map((node) => {
                        const isSelected = selectedPath[lane.levelIndex] === node.id;

                        return (
                          <Box
                            component='button'
                            key={ node.id }
                            onClick={ () => handleSelectLaneNode(lane.levelIndex, node.id) }
                            sx={ {
                              backgroundColor: isSelected ? 'primary.main' : 'background.paper',
                              border: '1px solid',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              borderRadius: 1,
                              color: isSelected ? 'primary.contrastText' : 'text.primary',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.35,
                              minWidth: 160,
                              px: 0.9,
                              py: 0.8,
                              textAlign: 'left',
                              '&:hover': {
                                backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                              },
                            } }
                            type='button'
                          >
                            <Typography sx={ { fontSize: 12, fontWeight: isSelected ? 600 : 500 } }>
                              {node.label}
                            </Typography>
                            <Typography sx={ {
                              color: isSelected ? alpha('#fff', 0.92) : 'text.secondary',
                              fontSize: 10,
                            } }
                            >
                              {`leaf paths: ${countLeafPathsFromNode(node)}`}
                            </Typography>
                          </Box>
                        );
                      })
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <DemoParameterPanel scopePathPrefixes={ scopePathPrefixes } title='Parameter Panel (Lane Scope)' />
    </Stack>
  );
}

function HierarchyBuilderDemoPage() {
  const [activeVariantTab, setActiveVariantTab] = useState(0);

  const totalLeafPaths = useMemo(() => countLeafPaths(MOCK_TREE), []);
  const totalNodes = useMemo(() => countAllNodes(MOCK_TREE), []);

  return (
    <ConsoleLayout
      actions={ (
        <Button component={ Link } href='/create/link-group' sx={ { textTransform: 'none' } } variant='outlined'>
          Back to Builder
        </Button>
      ) }
      title='Hierarchy Builder Demo'
    >
      <Box sx={ { maxWidth: 1760, mx: 'auto', px: { md: 4, xs: 2 }, py: 4, width: '100%' } }>
        <Stack spacing={ 2 }>
          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
            } }
          >
            <Stack spacing={ 1.25 }>
              <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
                Alternative Hierarchy UX Mockups
              </Typography>
              <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
                Compare three UI patterns while keeping the right-side parameter workflow available in every pattern.
              </Typography>
              <Stack direction='row' flexWrap='wrap' spacing={ 0.75 } useFlexGap>
                <Chip label={ `Total leaf paths: ${totalLeafPaths}` } size='small' />
                <Chip label={ `Total nodes: ${totalNodes}` } size='small' />
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            } }
          >
            <Tabs
              onChange={ (_, nextTab) => setActiveVariantTab(nextTab) }
              scrollButtons='auto'
              value={ activeVariantTab }
              variant='scrollable'
            >
              {UX_TAB_LABELS.map((label) => (
                <Tab key={ label } label={ label } sx={ { textTransform: 'none' } } />
              ))}
            </Tabs>
          </Paper>

          {activeVariantTab === 0 && <PathTableVariant />}
          {activeVariantTab === 1 && <OutlineInspectorVariant />}
          {activeVariantTab === 2 && <SwimlaneVariant />}
        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default HierarchyBuilderDemoPage;
