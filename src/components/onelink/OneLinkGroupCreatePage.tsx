/**
 * Link Group creation page orchestrator with modularized step and panel components.
 */
'use client';

import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import {
  computeLeafCount,
  generateLeafPaths,
} from '@/lib/onelinkGroupTree';
import type { LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';
import { useSettings } from '@/lib/providers/SettingsContext';
import BaseSetupStep from './group-create/BaseSetupStep';
import { GROUP_CREATE_STEPS } from './group-create/constants';
import GlobalParametersStep from './group-create/GlobalParametersStep';
import GroupCreateAlerts from './group-create/GroupCreateAlerts';
import { useGroupExecution } from './group-create/hooks/useGroupExecution';
import { useGroupParamEditor } from './group-create/hooks/useGroupParamEditor';
import { useGroupSnippetPreview } from './group-create/hooks/useGroupSnippetPreview';
import { useGroupTreeEditor } from './group-create/hooks/useGroupTreeEditor';
import { useGroupTreeSelection } from './group-create/hooks/useGroupTreeSelection';
import LinkPreviewPanel from './group-create/LinkPreviewPanel';
import type { NodeListProps } from './group-create/NodeList';
import ReviewExecuteStep from './group-create/ReviewExecuteStep';
import { normalizeScopePathPrefixes } from './group-create/scopeUtils';
import {
  computeMaxDepth,
  createClientId,
  hydrateEditorNodes,
  toSerializedNodes,
} from './group-create/treeUtils';
import TreeBuilderStep from './group-create/TreeBuilderStep';
import TreePreviewPanel from './group-create/TreePreviewPanel';
import type {
  ApplyMode,
  EditSeedResponse,
  EditorTreeNode,
  OneLinkGroupCreatePageProps,
} from './group-create/types';

function OneLinkGroupCreatePage({ editGroupId }: OneLinkGroupCreatePageProps) {
  const { settings } = useSettings();
  const isEditMode = Boolean(editGroupId);

  const [activeStep, setActiveStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [dismissedAutoBrandDomainTemplateId, setDismissedAutoBrandDomainTemplateId] = useState('');
  const [roots, setRoots] = useState<EditorTreeNode[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isTreePreviewExpanded, setIsTreePreviewExpanded] = useState(true);
  const [applyMode, setApplyMode] = useState<ApplyMode>('all');
  const [isLoadingEditSeed, setIsLoadingEditSeed] = useState(isEditMode);
  const [editSeedError, setEditSeedError] = useState('');

  const isEditHydrating = isEditMode && isLoadingEditSeed;

  const serializedRoots = useMemo(() => toSerializedNodes(roots), [roots]);
  const leafCount = useMemo(() => computeLeafCount(serializedRoots), [serializedRoots]);
  const maxDepth = useMemo(() => computeMaxDepth(serializedRoots), [serializedRoots]);
  const leafPaths = useMemo(() => generateLeafPaths(serializedRoots), [serializedRoots]);
  const {
    activeTreeFieldLevel,
    allTreeNodes,
    handleNodeChipClick,
    handleTreeEditorMouseDown,
    isNodeExpanded,
    isNodeSelected,
    lassoRect,
    resetSelectionState,
    selectedChildLevel,
    selectedScopePathPrefixes,
    selectedTreeNodeIds,
    selectedTreeNodeLevel,
    selectedTreeNodes,
    selectedTreeNodeSet,
    setActiveTreeFieldLevel,
    treeEditorScrollRef,
  } = useGroupTreeSelection({
    activeStep,
    roots,
  });
  const {
    activeParamKey,
    activeParamScopeHint,
    additionalParamKeyOptions,
    additionalParamRows,
    additionalParamValueOptions,
    addParamRow,
    deepLinkFields,
    globalParams,
    normalizedGlobalParamRows,
    removeParamRow,
    scopedParams,
    setActiveParamKey,
    setDeepLinkParamValue,
    setGlobalParamRows,
    sortedScopedParams,
    updateParamRow,
  } = useGroupParamEditor({
    selectedScopePathPrefixes,
    settings,
  });

  const templateOptions = useMemo(
    () => [...new Set(settings.templateIds)].filter(Boolean),
    [settings.templateIds],
  );
  const resolvedTemplateId = useMemo(() => {
    const normalized = templateId.trim();
    if (normalized) {
      return normalized;
    }
    if (templateOptions.length === 1) {
      return templateOptions[0];
    }
    return '';
  }, [templateId, templateOptions]);
  const brandDomainOptions = useMemo(
    () => (resolvedTemplateId ? settings.templateBrandedDomains[resolvedTemplateId] ?? [] : []),
    [resolvedTemplateId, settings.templateBrandedDomains],
  );
  const resolvedBrandDomain = useMemo(() => {
    const normalized = brandDomain.trim();
    if (normalized) {
      return normalized;
    }
    if (!resolvedTemplateId) {
      return '';
    }
    if (resolvedTemplateId === dismissedAutoBrandDomainTemplateId) {
      return '';
    }
    if (brandDomainOptions.length === 1) {
      return brandDomainOptions[0];
    }
    return '';
  }, [brandDomain, brandDomainOptions, dismissedAutoBrandDomainTemplateId, resolvedTemplateId]);
  const {
    canRetryFailedItems,
    createdGroupId,
    executionDetail,
    executionProgressPercent,
    handleExecute,
    handleRetryFailedItems,
    isPollingExecution,
    isRetrying,
    isSubmitting,
    resetExecutionState,
    submitError,
  } = useGroupExecution({
    applyMode,
    editGroupId,
    globalParams,
    groupName,
    isEditHydrating,
    isEditMode,
    leafPathCount: leafPaths.length,
    onComplete: () => setActiveStep(3),
    onSetWarnings: setWarnings,
    resolvedBrandDomain,
    resolvedTemplateId,
    scopedParams,
    serializedRoots,
  });

  const {
    activeTreeInputDraftKey,
    activeTreeInputDraftValue,
    activeTreeInputPresetOptions,
    activeTreeInputTargetLevel,
    addTreeInputValues,
    removeNode,
    resetTreeEditorState,
    setDraft,
  } = useGroupTreeEditor({
    presets: {
      af_ad: settings.presets.af_ad,
      af_adset: settings.presets.af_adset,
      c: settings.presets.c,
      pid: settings.presets.pid,
    },
    roots,
    selectedChildLevel,
    selectedTreeNodeIds,
    selectedTreeNodeLevel,
    setRoots,
    setWarnings,
  });

  useEffect(() => {
    if (!editGroupId) {
      setIsLoadingEditSeed(false);
      setEditSeedError('');
      return;
    }

    let isDisposed = false;

    const loadEditSeed = async () => {
      setIsLoadingEditSeed(true);
      setEditSeedError('');

      try {
        const response = await fetch(
          `/api/onelink-groups/${encodeURIComponent(editGroupId)}?page=1&pageSize=1`,
          { cache: 'no-store', method: 'GET' },
        );
        const payload = (await response.json().catch(() => null)) as EditSeedResponse | null;

        if (!response.ok || !payload?.id) {
          if (!isDisposed) {
            setEditSeedError(payload?.error || 'Failed to load existing group data.');
          }
          return;
        }

        const parsedTree = JSON.parse(payload.treeConfigJson) as { roots?: LinkGroupTreeNode[] } | null;
        if (!parsedTree || !Array.isArray(parsedTree.roots)) {
          if (!isDisposed) {
            setEditSeedError('Stored tree config is invalid.');
          }
          return;
        }

        if (isDisposed) {
          return;
        }

        setGroupName(payload.name);
        setTemplateId(payload.templateId);
        setBrandDomain(payload.brandDomain);
        setRoots(hydrateEditorNodes(parsedTree.roots));

        const globalRows = Object.entries(payload.globalParams ?? {}).map(([key, value]) => ({
          id: createClientId(),
          key,
          scopePathPrefixes: [],
          value,
        }));
        const scopedRows = (payload.scopedParams ?? []).map((rule) => ({
          id: createClientId(),
          key: rule.key,
          scopePathPrefixes: normalizeScopePathPrefixes(rule.scopePathPrefixes),
          value: rule.value,
        }));
        setGlobalParamRows([...globalRows, ...scopedRows]);

        resetSelectionState();
        resetTreeEditorState();
        resetExecutionState();
        setWarnings([]);
      } catch {
        if (!isDisposed) {
          setEditSeedError('Failed to load existing group data.');
        }
      } finally {
        if (!isDisposed) {
          setIsLoadingEditSeed(false);
        }
      }
    };

    void loadEditSeed();

    return () => {
      isDisposed = true;
    };
  }, [editGroupId, resetExecutionState, resetSelectionState, resetTreeEditorState, setGlobalParamRows]);

  const canProceedFromStep = useMemo(() => {
    if (isEditHydrating) {
      return false;
    }

    if (activeStep === 0) {
      return Boolean(groupName.trim() && resolvedTemplateId.trim());
    }

    if (activeStep === 1) {
      return leafCount > 0 && leafCount <= 2000;
    }

    return true;
  }, [activeStep, groupName, isEditHydrating, leafCount, resolvedTemplateId]);

  const {
    activeSnippetContextLabel,
    filteredSnippets,
    focusedSnippetIndex,
    handleSelectSnippet,
    handleSnippetWheelScroll,
    isSnippetWheelMode,
    snippetHighlightToken,
    snippetWheelRef,
  } = useGroupSnippetPreview({
    activeParamKey,
    activeStep,
    activeTreeFieldLevel,
    globalParams,
    resolvedBrandDomain,
    resolvedTemplateId,
    roots,
    selectedTreeNodeIds,
    selectedTreeNodeLevel,
    selectedTreeNodeSet,
    selectedTreeNodes,
    sortedScopedParams,
  });

  const handleTemplateIdChange = useCallback((nextValue: string) => {
    setTemplateId(nextValue);
    setDismissedAutoBrandDomainTemplateId('');
  }, []);

  const handleBrandDomainChange = useCallback((nextValue: string) => {
    const normalized = nextValue.trim();
    if (!normalized) {
      setBrandDomain('');
      setDismissedAutoBrandDomainTemplateId(resolvedTemplateId);
      return;
    }
    setDismissedAutoBrandDomainTemplateId('');
    setBrandDomain(nextValue);
  }, [resolvedTemplateId]);

  const nodeListProps = useMemo<Omit<NodeListProps, 'nodes'>>(() => ({
    isNodeExpanded,
    isNodeSelected,
    onChipClick: handleNodeChipClick,
    removeNode,
  }), [
    handleNodeChipClick,
    isNodeExpanded,
    isNodeSelected,
    removeNode,
  ]);
  const globalParametersStepProps = useMemo(() => ({
    additionalParamKeyOptions,
    additionalParamRows,
    additionalParamValueOptions,
    deepLinkFields,
    onAddParamRow: addParamRow,
    onRemoveParamRow: removeParamRow,
    onSetActiveParamKey: setActiveParamKey,
    onSetDeepLinkParamValue: setDeepLinkParamValue,
    onUpdateParamRow: updateParamRow,
    scopeHint: activeParamScopeHint,
  }), [
    activeParamScopeHint,
    addParamRow,
    additionalParamKeyOptions,
    additionalParamRows,
    additionalParamValueOptions,
    deepLinkFields,
    removeParamRow,
    setActiveParamKey,
    setDeepLinkParamValue,
    updateParamRow,
  ]);

  return (
    <ConsoleLayout
      actions={ (
        <Button component={ Link } href='/links?type=link_group' sx={ { textTransform: 'none' } } variant='outlined'>
          View Groups
        </Button>
      ) }
      title={ isEditMode ? 'Edit Link Group' : 'Create Link Group' }
    >
      <Box sx={ { maxWidth: 1400, mx: 'auto', px: { md: 4, xs: 2 }, py: 3.5, width: '100%' } }>
        <Stack spacing={ 2 }>
          <Stepper activeStep={ activeStep } alternativeLabel>
            {GROUP_CREATE_STEPS.map((label) => (
              <Step key={ label }>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <GroupCreateAlerts
            createdGroupId={ createdGroupId }
            editSeedError={ editSeedError }
            isEditMode={ isEditMode }
            submitError={ submitError }
            warnings={ warnings }
          />

          <Stack spacing={ 2 }>
            <Stack
              direction={ { md: 'row', xs: 'column' } }
              spacing={ 2 }
              sx={ { minWidth: 0, overflowX: 'hidden' } }
            >
              <Paper
                elevation={ 0 }
                sx={ {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: { md: '1 1 60%', xs: '1 1 auto' },
                  maxWidth: { md: '60%', xs: '100%' },
                  minWidth: 0,
                  minHeight: 520,
                  overflow: 'hidden',
                  p: 2,
                } }
              >
                <Box
                  onMouseDown={ handleTreeEditorMouseDown }
                  ref={ treeEditorScrollRef }
                  sx={ { flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', pr: 0.5 } }
                >
                  {isEditHydrating && (
                    <Stack spacing={ 1.5 }>
                      <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
                        Loading existing group configuration...
                      </Typography>
                      <LinearProgress />
                    </Stack>
                  )}

                  {!isEditHydrating && activeStep === 0 && (
                    <BaseSetupStep
                      brandDomain={ resolvedBrandDomain }
                      groupName={ groupName }
                      onBrandDomainChange={ handleBrandDomainChange }
                      onGroupNameChange={ setGroupName }
                      onTemplateIdChange={ handleTemplateIdChange }
                      templateId={ resolvedTemplateId }
                      templateOptions={ templateOptions }
                    />
                  )}

                  {!isEditHydrating && activeStep === 1 && (
                    <TreeBuilderStep
                      addCurrentLevelValues={ addTreeInputValues }
                      inputDraftValue={ activeTreeInputDraftValue }
                      inputPresetOptions={ activeTreeInputPresetOptions }
                      inputTargetLevel={ activeTreeInputTargetLevel }
                      nodeListProps={ nodeListProps }
                      onInputDraftChange={ (value) => setDraft(activeTreeInputDraftKey, value) }
                      onInputFieldFocus={ () => setActiveTreeFieldLevel(activeTreeInputTargetLevel) }
                      roots={ roots }
                      selectedNodeCount={ selectedTreeNodeIds.length }
                      selectedNodeLevel={ selectedTreeNodeLevel }
                    />
                  )}

                  {!isEditHydrating && activeStep === 2 && (
                    <GlobalParametersStep { ...globalParametersStepProps } />
                  )}

                  {!isEditHydrating && activeStep === 3 && (
                    <ReviewExecuteStep
                      applyMode={ applyMode }
                      brandDomain={ resolvedBrandDomain }
                      canRetryFailedItems={ canRetryFailedItems }
                      executionDetail={ executionDetail }
                      executionProgressPercent={ executionProgressPercent }
                      globalParamCount={ normalizedGlobalParamRows.filter((row) => row.key && row.value).length }
                      groupName={ groupName }
                      isEditHydrating={ isEditHydrating }
                      isEditMode={ isEditMode }
                      isPollingExecution={ isPollingExecution }
                      isRetrying={ isRetrying }
                      isSubmitting={ isSubmitting }
                      leafCount={ leafCount }
                      leafPathCount={ leafPaths.length }
                      onApplyModeChange={ setApplyMode }
                      onExecute={ () => { void handleExecute(); } }
                      onRetryFailed={ () => { void handleRetryFailedItems(); } }
                      templateId={ resolvedTemplateId }
                    />
                  )}
                  {activeStep === 1 && lassoRect && (
                    <Box
                      sx={ {
                        backgroundColor: 'primary.main',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        height: lassoRect.height,
                        left: lassoRect.left,
                        opacity: 0.14,
                        pointerEvents: 'none',
                        position: 'absolute',
                        top: lassoRect.top,
                        width: lassoRect.width,
                        zIndex: 2,
                      } }
                    />
                  )}
                </Box>

                <Stack direction='row' justifyContent='space-between' sx={ { mt: 2 } }>
                  <Button
                    disabled={ activeStep === 0 || isEditHydrating }
                    onClick={ () => setActiveStep((previous) => Math.max(0, previous - 1)) }
                    sx={ { textTransform: 'none' } }
                    variant='outlined'
                  >
                    Back
                  </Button>
                  <Button
                    disabled={ activeStep >= GROUP_CREATE_STEPS.length - 1 || !canProceedFromStep }
                    onClick={ () => setActiveStep((previous) => Math.min(GROUP_CREATE_STEPS.length - 1, previous + 1)) }
                    sx={ { textTransform: 'none' } }
                    variant='contained'
                  >
                    Next
                  </Button>
                </Stack>
              </Paper>

              {activeStep === 1 ? (
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
                  <Box sx={ { height: '100%', overflowY: 'auto', pr: 0.5 } }>
                    <GlobalParametersStep { ...globalParametersStepProps } />
                  </Box>
                </Paper>
              ) : (
                <LinkPreviewPanel
                  activeSnippetNodeValue={ activeSnippetContextLabel }
                  activeStep={ activeStep }
                  filteredSnippets={ filteredSnippets }
                  focusedSnippetIndex={ focusedSnippetIndex }
                  isSnippetWheelMode={ isSnippetWheelMode }
                  leafPathCount={ leafPaths.length }
                  onSelectSnippet={ handleSelectSnippet }
                  onSnippetWheelScroll={ handleSnippetWheelScroll }
                  rootsLength={ roots.length }
                  snippetHighlightToken={ snippetHighlightToken }
                  snippetWheelRef={ snippetWheelRef }
                />
              )}
            </Stack>

            <TreePreviewPanel
              leafCount={ leafCount }
              maxDepth={ maxDepth }
              nodes={ roots }
              onToggleExpanded={ () => setIsTreePreviewExpanded((previous) => !previous) }
              previewSnippets={ filteredSnippets }
              totalNodeCount={ allTreeNodes.length }
              treePreviewExpanded={ isTreePreviewExpanded }
            />
          </Stack>

        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkGroupCreatePage;
