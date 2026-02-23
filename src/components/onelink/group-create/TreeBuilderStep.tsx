/**
 * Step 2 UI for root insertion and nested tree editing.
 */
import { Alert, Autocomplete, Button, ClickAwayListener, Stack, TextField, Typography } from '@mui/material';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { useRef, useState } from 'react';
import type { LinkGroupNodeLevel } from '@/lib/onelinkGroupTypes';
import { formatLevelLabel } from './treeUtils';
import NodeList, { type NodeListProps } from './NodeList';
import type { EditorTreeNode } from './types';

type TreeBuilderStepProps = {
  addCurrentLevelValues: (rawInputOverride?: string) => void;
  inputDraftValue: string;
  inputPresetOptions: string[];
  inputTargetLevel: LinkGroupNodeLevel | null;
  nodeListProps: Omit<NodeListProps, 'nodes'>;
  onInputDraftChange: (value: string) => void;
  onInputFieldFocus: () => void;
  roots: EditorTreeNode[];
  selectedNodeCount: number;
  selectedNodeLevel: LinkGroupNodeLevel | null;
};

function TreeBuilderStep({
  addCurrentLevelValues,
  inputDraftValue,
  inputPresetOptions,
  inputTargetLevel,
  nodeListProps,
  onInputDraftChange,
  onInputFieldFocus,
  roots,
  selectedNodeCount,
  selectedNodeLevel,
}: TreeBuilderStepProps) {
  const SPREADSHEET_DELIMITER_REGEX = /[\n\r\t]/;
  const skipRootSyncCountRef = useRef(0);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const selectedLevelLabel = selectedNodeLevel ? formatLevelLabel(selectedNodeLevel) : '';
  const inputTargetLabel = inputTargetLevel ? formatLevelLabel(inputTargetLevel) : '';
  const isLeafSelection = selectedNodeCount > 0 && !inputTargetLevel;
  const helperText = isLeafSelection
    ? `Selected ${selectedLevelLabel} chips are leaf nodes. Select higher level chips to add child values.`
    : selectedNodeCount > 0 && selectedNodeLevel
      ? `Selected ${selectedLevelLabel} chips will receive this ${inputTargetLabel} value (comma / semicolon / newline / range).`
      : 'Preset suggestions + direct input (comma / semicolon / newline / range).';
  const buildValueWithPastedText = (event: ClipboardEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return null;
    }

    const pastedText = event.clipboardData.getData('text');
    if (!pastedText || !SPREADSHEET_DELIMITER_REGEX.test(pastedText)) {
      return null;
    }

    const selectionStart = target.selectionStart ?? target.value.length;
    const selectionEnd = target.selectionEnd ?? target.value.length;
    return `${target.value.slice(0, selectionStart)}${pastedText}${target.value.slice(selectionEnd)}`;
  };

  const handleAddOnEnter = (
    event: KeyboardEvent<HTMLElement>,
    addValues: (rawInputOverride?: string) => void,
    draftValue: string,
    skipSyncCountRef: { current: number },
  ) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    skipSyncCountRef.current = 2;
    addValues(draftValue);
  };

  const shouldSkipSync = (skipSyncCountRef: { current: number }) => {
    if (skipSyncCountRef.current < 1) {
      return false;
    }

    skipSyncCountRef.current -= 1;
    return true;
  };

  return (
    <Stack spacing={ 1.5 }>
      <Stack spacing={ 0.5 }>
        <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
          Build Tree
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          Add media sources and expand campaign levels to define link generation paths.
        </Typography>
      </Stack>
      <Stack
        alignItems={ { md: 'flex-start', xs: 'stretch' } }
        direction={ { md: 'row', xs: 'column' } }
        spacing={ 1 }
      >
        <ClickAwayListener
          mouseEvent='onMouseDown'
          onClickAway={ () => {
            setIsPresetDropdownOpen(false);
          } }
        >
          <Autocomplete<string, false, false, true>
            freeSolo
            disabled={ isLeafSelection }
            fullWidth
            inputValue={ inputDraftValue }
            onChange={ (_, nextValue) => {
              if (shouldSkipSync(skipRootSyncCountRef)) {
                return;
              }
              onInputDraftChange(nextValue ?? '');
            } }
            onClose={ () => setIsPresetDropdownOpen(false) }
            onInputChange={ (_, inputValue, reason) => {
              if (shouldSkipSync(skipRootSyncCountRef)) {
                return;
              }
              if (reason === 'reset') {
                return;
              }
              onInputDraftChange(inputValue);
            } }
            onKeyDown={ (event) => handleAddOnEnter(event, addCurrentLevelValues, inputDraftValue, skipRootSyncCountRef) }
            onOpen={ () => {
              if (isLeafSelection) {
                return;
              }
              setIsPresetDropdownOpen(true);
            } }
            onPaste={ (event) => {
              const nextValue = buildValueWithPastedText(event);
              if (!nextValue) {
                return;
              }

              event.preventDefault();
              skipRootSyncCountRef.current = 2;
              addCurrentLevelValues(nextValue);
            } }
            open={ !isLeafSelection && isPresetDropdownOpen }
            options={ inputPresetOptions }
            renderInput={ (params) => (
              <TextField
                { ...params }
                helperText={ helperText }
                label={ isLeafSelection ? `Add ${selectedLevelLabel}` : `Add ${inputTargetLabel}` }
                onFocus={ onInputFieldFocus }
                size='small'
              />
            ) }
            value={ null }
          />
        </ClickAwayListener>
        <Button
          disabled={ isLeafSelection }
          onClick={ () => addCurrentLevelValues() }
          sx={ {
            alignSelf: { md: 'auto', xs: 'flex-start' },
            minHeight: 36,
            minWidth: 0,
            px: 2,
            py: 1,
            textTransform: 'none',
            whiteSpace: 'nowrap',
          } }
          variant='contained'
        >
          Add
        </Button>
      </Stack>
      {roots.length > 0 ? (
        <NodeList { ...nodeListProps } nodes={ roots } />
      ) : (
        <Alert severity='info'>Add at least one MediaSource to begin the tree.</Alert>
      )}
      {selectedNodeCount > 0 && (
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          {`${selectedNodeCount} ${selectedLevelLabel} ${selectedNodeCount > 1 ? 'chips' : 'chip'} selected`}
        </Typography>
      )}
    </Stack>
  );
}

export default TreeBuilderStep;
