/**
 * Link Group creation page with Phase A stepper, tree editor, and batch execution trigger.
 */
'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import { useSettings } from '@/lib/providers/SettingsContext';
import {
  computeLeafCount,
  generateLeafPaths,
  getAllowedChildLevel,
  getHierarchicalPayload,
  parseMultiValueInput,
} from '@/lib/onelinkGroupTree';
import type { LinkGroupNodeLevel, LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';

type EditorTreeNode = {
  children: EditorTreeNode[];
  id: string;
  level: LinkGroupNodeLevel;
  value: string;
};

type ParamRow = {
  id: string;
  key: string;
  value: string;
};

type NodeInsertResult = {
  nodes: EditorTreeNode[];
  warnings: string[];
};

type NodeListProps = {
  addChildren: (nodeId: string, level: LinkGroupNodeLevel) => void;
  drafts: Record<string, string>;
  nodes: EditorTreeNode[];
  removeNode: (nodeId: string) => void;
  setDraft: (draftKey: string, value: string) => void;
};

const steps = ['Base Setup', 'Build Tree', 'Parameters', 'Review & Execute'];

function createClientId(): string {
  if (typeof window !== 'undefined' && window.crypto && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function createEditorNodes(level: LinkGroupNodeLevel, values: string[]): EditorTreeNode[] {
  return values.map((value) => ({
    children: [],
    id: createClientId(),
    level,
    value,
  }));
}

function toSerializedNodes(nodes: EditorTreeNode[]): LinkGroupTreeNode[] {
  return nodes.map((node) => ({
    children: toSerializedNodes(node.children),
    level: node.level,
    value: node.value,
  }));
}

function appendUniqueChildren(
  existingChildren: EditorTreeNode[],
  level: LinkGroupNodeLevel,
  values: string[],
): { appendedChildren: EditorTreeNode[]; warnings: string[] } {
  const warnings: string[] = [];
  const seen = new Set(existingChildren.map((child) => child.value.toLowerCase()));
  const nextChildren = [...existingChildren];

  values.forEach((value) => {
    const dedupKey = value.toLowerCase();
    if (seen.has(dedupKey)) {
      warnings.push(`Duplicate value "${value}" was ignored.`);
      return;
    }

    seen.add(dedupKey);
    nextChildren.push({
      children: [],
      id: createClientId(),
      level,
      value,
    });
  });

  return {
    appendedChildren: nextChildren,
    warnings,
  };
}

function insertChildrenUnderNode(
  nodes: EditorTreeNode[],
  targetNodeId: string,
  level: LinkGroupNodeLevel,
  values: string[],
): NodeInsertResult {
  const warnings: string[] = [];

  const nextNodes = nodes.map((node) => {
    if (node.id === targetNodeId) {
      const result = appendUniqueChildren(node.children, level, values);
      warnings.push(...result.warnings);
      return {
        ...node,
        children: result.appendedChildren,
      };
    }

    if (node.children.length === 0) {
      return node;
    }

    const nestedResult = insertChildrenUnderNode(node.children, targetNodeId, level, values);
    warnings.push(...nestedResult.warnings);

    return {
      ...node,
      children: nestedResult.nodes,
    };
  });

  return {
    nodes: nextNodes,
    warnings,
  };
}

function removeNodeById(nodes: EditorTreeNode[], targetNodeId: string): EditorTreeNode[] {
  return nodes
    .filter((node) => node.id !== targetNodeId)
    .map((node) => ({
      ...node,
      children: removeNodeById(node.children, targetNodeId),
    }));
}

function flattenTreeNodes(nodes: EditorTreeNode[]): EditorTreeNode[] {
  const flattened: EditorTreeNode[] = [];

  const visit = (node: EditorTreeNode) => {
    flattened.push(node);
    node.children.forEach((child) => {
      visit(child);
    });
  };

  nodes.forEach((node) => {
    visit(node);
  });

  return flattened;
}

function renderTreePreview(nodes: EditorTreeNode[], depth = 0): React.ReactNode {
  if (nodes.length === 0) {
    return null;
  }

  return nodes.map((node) => (
    <Box key={ node.id } sx={ { ml: depth * 1.5, py: 0.25 } }>
      <Typography sx={ { color: 'text.primary', fontSize: 13, fontWeight: node.level === 'media_source' ? 600 : 500 } }>
        {node.value}
      </Typography>
      {renderTreePreview(node.children, depth + 1)}
    </Box>
  ));
}

function formatLevelLabel(level: LinkGroupNodeLevel): string {
  if (level === 'media_source') {
    return 'MediaSource';
  }
  if (level === 'campaign') {
    return 'Campaign';
  }
  if (level === 'adset') {
    return 'AdSet';
  }
  return 'Ad';
}

function NodeList({
  addChildren,
  drafts,
  nodes,
  removeNode,
  setDraft,
}: NodeListProps) {
  return (
    <Stack spacing={ 1.25 }>
      {nodes.map((node) => {
        const childLevel = getAllowedChildLevel(node.level);
        const draftKey = `node:${node.id}`;

        return (
          <Paper
            elevation={ 0 }
            key={ node.id }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1.5,
            } }
          >
            <Stack spacing={ 1 }>
              <Stack alignItems='center' direction='row' justifyContent='space-between' spacing={ 1 }>
                <Stack alignItems='center' direction='row' spacing={ 1 }>
                  <Chip label={ formatLevelLabel(node.level) } size='small' />
                  <Typography sx={ { color: 'text.primary', fontSize: 14, fontWeight: 600 } }>
                    {node.value}
                  </Typography>
                </Stack>
                <Button
                  color='error'
                  onClick={ () => removeNode(node.id) }
                  size='small'
                  sx={ { textTransform: 'none' } }
                >
                  Remove
                </Button>
              </Stack>

              {childLevel && (
                <Stack direction={ { md: 'row', xs: 'column' } } spacing={ 1 }>
                  <TextField
                    fullWidth
                    helperText={ `Add ${formatLevelLabel(childLevel)} values (comma / semicolon / newline / range).` }
                    label={ `Add ${formatLevelLabel(childLevel)}` }
                    minRows={ 2 }
                    multiline
                    onChange={ (event) => setDraft(draftKey, event.target.value) }
                    size='small'
                    value={ drafts[draftKey] ?? '' }
                  />
                  <Button
                    onClick={ () => addChildren(node.id, childLevel) }
                    sx={ { minWidth: 132, textTransform: 'none' } }
                    variant='outlined'
                  >
                    Add
                  </Button>
                </Stack>
              )}

              {node.children.length > 0 && (
                <Box sx={ { borderLeft: '1px dashed', borderColor: 'divider', ml: 1.5, pl: 1.5 } }>
                  <NodeList
                    addChildren={ addChildren }
                    drafts={ drafts }
                    nodes={ node.children }
                    removeNode={ removeNode }
                    setDraft={ setDraft }
                  />
                </Box>
              )}
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}

/**
 * OneLinkGroupCreatePage
 *
 * Example usage:
 * <OneLinkGroupCreatePage />
 */
function OneLinkGroupCreatePage() {
  const { settings } = useSettings();

  const [activeStep, setActiveStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [roots, setRoots] = useState<EditorTreeNode[]>([]);
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({ root: '' });
  const [warnings, setWarnings] = useState<string[]>([]);
  const [globalParamRows, setGlobalParamRows] = useState<ParamRow[]>([
    { id: createClientId(), key: '', value: '' },
    { id: createClientId(), key: '', value: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdGroupId, setCreatedGroupId] = useState('');

  const serializedRoots = useMemo(() => toSerializedNodes(roots), [roots]);
  const leafCount = useMemo(() => computeLeafCount(serializedRoots), [serializedRoots]);
  const allTreeNodes = useMemo(() => flattenTreeNodes(roots), [roots]);

  const previewPayloads = useMemo(() => {
    const leafPaths = generateLeafPaths(serializedRoots);
    const globalParams = globalParamRows.reduce<Record<string, string>>((accumulator, row) => {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key && value) {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});

    return leafPaths.slice(0, 5).map((leafPath) => ({
      pathLabel: leafPath.pathLabel,
      payload: {
        ...globalParams,
        ...getHierarchicalPayload(leafPath),
      },
    }));
  }, [globalParamRows, serializedRoots]);

  const templateOptions = useMemo(
    () => [...new Set(settings.templateIds)].filter(Boolean),
    [settings.templateIds],
  );

  const canProceedFromStep = useMemo(() => {
    if (activeStep === 0) {
      return Boolean(groupName.trim() && templateId.trim());
    }

    if (activeStep === 1) {
      return leafCount > 0 && leafCount <= 2000;
    }

    return true;
  }, [activeStep, groupName, leafCount, templateId]);

  const globalParams = useMemo(() => {
    return globalParamRows.reduce<Record<string, string>>((accumulator, row) => {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key && value) {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});
  }, [globalParamRows]);

  const setDraft = (draftKey: string, value: string) => {
    setInputDrafts((previous) => ({
      ...previous,
      [draftKey]: value,
    }));
  };

  const addRootNodes = () => {
    const rawInput = inputDrafts.root ?? '';
    const parsed = parseMultiValueInput(rawInput, {
      maxCharPerValue: 100,
      maxValues: 500,
    });

    if (parsed.values.length === 0) {
      setWarnings(parsed.warnings.length > 0 ? parsed.warnings : ['No valid MediaSource values were detected.']);
      return;
    }

    const appended = appendUniqueChildren(roots, 'media_source', parsed.values);
    setRoots(appended.appendedChildren);
    setWarnings([...parsed.warnings, ...appended.warnings]);
    setDraft('root', '');
  };

  const addChildren = (nodeId: string, level: LinkGroupNodeLevel) => {
    const draftKey = `node:${nodeId}`;
    const rawInput = inputDrafts[draftKey] ?? '';

    const parsed = parseMultiValueInput(rawInput, {
      maxCharPerValue: 100,
      maxValues: 500,
    });

    if (parsed.values.length === 0) {
      setWarnings(parsed.warnings.length > 0 ? parsed.warnings : ['No valid child values were detected.']);
      return;
    }

    const result = insertChildrenUnderNode(roots, nodeId, level, parsed.values);
    setRoots(result.nodes);
    setWarnings([...parsed.warnings, ...result.warnings]);
    setDraft(draftKey, '');
  };

  const removeNode = (nodeId: string) => {
    setRoots((previous) => removeNodeById(previous, nodeId));
  };

  const addParamRow = () => {
    setGlobalParamRows((previous) => [
      ...previous,
      { id: createClientId(), key: '', value: '' },
    ]);
  };

  const updateParamRow = (rowId: string, field: 'key' | 'value', value: string) => {
    setGlobalParamRows((previous) => previous.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      return {
        ...row,
        [field]: value,
      };
    }));
  };

  const removeParamRow = (rowId: string) => {
    setGlobalParamRows((previous) => previous.filter((row) => row.id !== rowId));
  };

  const handleExecute = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    setCreatedGroupId('');

    try {
      const response = await fetch('/api/onelink-groups', {
        body: JSON.stringify({
          brandDomain: brandDomain.trim(),
          globalParams,
          name: groupName.trim(),
          templateId: templateId.trim(),
          treeConfig: {
            roots: serializedRoots,
            version: 1,
          },
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        group?: { id: string };
        warnings?: string[];
      } | null;

      if (!response.ok || !payload?.group?.id) {
        setSubmitError(payload?.error || 'Failed to create link group.');
        return;
      }

      setWarnings(payload.warnings ?? []);
      setCreatedGroupId(payload.group.id);
      setActiveStep(3);
    } catch {
      setSubmitError('Failed to create link group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConsoleLayout
      actions={ (
        <Button component={ Link } href='/link-groups' sx={ { textTransform: 'none' } } variant='outlined'>
          View Groups
        </Button>
      ) }
      title='Create Link Group'
    >
      <Box sx={ { maxWidth: 1400, mx: 'auto', px: { md: 4, xs: 2 }, py: 3.5, width: '100%' } }>
        <Stack spacing={ 2 }>
          <Stepper activeStep={ activeStep } alternativeLabel>
            {steps.map((label) => (
              <Step key={ label }>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitError && <Alert severity='error'>{submitError}</Alert>}
          {warnings.length > 0 && (
            <Alert severity='warning'>
              <Stack spacing={ 0.5 }>
                {warnings.slice(0, 5).map((warning) => (
                  <Typography key={ warning } sx={ { fontSize: 13 } }>{warning}</Typography>
                ))}
              </Stack>
            </Alert>
          )}
          {createdGroupId && (
            <Alert severity='success'>
              Link group created. Track progress on{' '}
              <Link href={ `/link-groups/${encodeURIComponent(createdGroupId)}` }>
                group detail page
              </Link>
              .
            </Alert>
          )}

          <Stack direction={ { md: 'row', xs: 'column' } } spacing={ 2 }>
            <Paper
              elevation={ 0 }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                flex: 1,
                minHeight: 580,
                p: 2,
              } }
            >
              {activeStep === 0 && (
                <Stack spacing={ 1.5 }>
                  <TextField
                    fullWidth
                    label='Link Group Name'
                    onChange={ (event) => setGroupName(event.target.value) }
                    size='small'
                    value={ groupName }
                  />
                  <TextField
                    fullWidth
                    label='Template ID'
                    onChange={ (event) => setTemplateId(event.target.value.toUpperCase()) }
                    select={ templateOptions.length > 0 }
                    size='small'
                    value={ templateId }
                  >
                    {templateOptions.map((option) => (
                      <MenuItem key={ option } value={ option }>{option}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    helperText='Optional'
                    label='Brand Domain'
                    onChange={ (event) => setBrandDomain(event.target.value) }
                    size='small'
                    value={ brandDomain }
                  />
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={ 1.5 }>
                  <TextField
                    fullWidth
                    helperText='Supports comma, semicolon, newline, and numeric range (e.g. 1-20).'
                    label='Add MediaSource values'
                    minRows={ 2 }
                    multiline
                    onChange={ (event) => setDraft('root', event.target.value) }
                    size='small'
                    value={ inputDrafts.root ?? '' }
                  />
                  <Button onClick={ addRootNodes } sx={ { textTransform: 'none', width: 180 } } variant='contained'>
                    Add MediaSources
                  </Button>
                  {roots.length > 0 ? (
                    <NodeList
                      addChildren={ addChildren }
                      drafts={ inputDrafts }
                      nodes={ roots }
                      removeNode={ removeNode }
                      setDraft={ setDraft }
                    />
                  ) : (
                    <Alert severity='info'>Add at least one MediaSource to begin the tree.</Alert>
                  )}
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={ 1.25 }>
                  {globalParamRows.map((row) => (
                    <Stack direction={ { md: 'row', xs: 'column' } } key={ row.id } spacing={ 1 }>
                      <TextField
                        fullWidth
                        label='Key'
                        onChange={ (event) => updateParamRow(row.id, 'key', event.target.value) }
                        size='small'
                        value={ row.key }
                      />
                      <TextField
                        fullWidth
                        label='Value'
                        onChange={ (event) => updateParamRow(row.id, 'value', event.target.value) }
                        size='small'
                        value={ row.value }
                      />
                      <Button
                        color='error'
                        onClick={ () => removeParamRow(row.id) }
                        sx={ { textTransform: 'none' } }
                        variant='text'
                      >
                        Remove
                      </Button>
                    </Stack>
                  ))}
                  <Button onClick={ addParamRow } sx={ { textTransform: 'none', width: 150 } } variant='outlined'>
                    Add Parameter
                  </Button>
                </Stack>
              )}

              {activeStep === 3 && (
                <Stack spacing={ 1.5 }>
                  <Typography sx={ { color: 'text.primary', fontSize: 14, fontWeight: 700 } }>
                    Sample payload preview (first 5)
                  </Typography>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Path</TableCell>
                        <TableCell>Payload</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewPayloads.map((item) => (
                        <TableRow key={ item.pathLabel }>
                          <TableCell sx={ { verticalAlign: 'top' } }>{item.pathLabel}</TableCell>
                          <TableCell sx={ { fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' } }>
                            {JSON.stringify(item.payload, null, 2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {previewPayloads.length === 0 && (
                    <Alert severity='warning'>Tree has no leaf path to execute.</Alert>
                  )}
                  <Button
                    disabled={ isSubmitting || previewPayloads.length === 0 }
                    onClick={ handleExecute }
                    sx={ { textTransform: 'none', width: 190 } }
                    variant='contained'
                  >
                    {isSubmitting ? 'Executing...' : 'Execute Link Group'}
                  </Button>
                </Stack>
              )}
            </Paper>

            <Paper
              elevation={ 0 }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                width: { md: 420, xs: '100%' },
              } }
            >
              <Stack spacing={ 1.5 }>
                <Typography sx={ { color: 'text.primary', fontSize: 15, fontWeight: 700 } }>
                  Tree Preview
                </Typography>
                <Divider />
                {roots.length > 0 ? renderTreePreview(roots) : <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>No tree data</Typography>}
                <Divider />
                <Typography sx={ { color: leafCount > 2000 ? 'error.main' : 'text.primary', fontSize: 13, fontWeight: 600 } }>
                  Leaf count: {leafCount}
                </Typography>
                <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                  Total nodes: {allTreeNodes.length}
                </Typography>
              </Stack>
            </Paper>
          </Stack>

          <Stack direction='row' justifyContent='space-between'>
            <Button
              disabled={ activeStep === 0 }
              onClick={ () => setActiveStep((previous) => Math.max(0, previous - 1)) }
              sx={ { textTransform: 'none' } }
              variant='outlined'
            >
              Back
            </Button>
            <Button
              disabled={ activeStep >= steps.length - 1 || !canProceedFromStep }
              onClick={ () => setActiveStep((previous) => Math.min(steps.length - 1, previous + 1)) }
              sx={ { textTransform: 'none' } }
              variant='contained'
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkGroupCreatePage;
