/**
 * Step 2 UI for root insertion and nested tree editing.
 */
import {
  Alert,
  Autocomplete,
  Button,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
  type AutocompleteChangeReason,
} from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import type { ClipboardEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [helpAnchorElement, setHelpAnchorElement] = useState<HTMLElement | null>(null);
  const helpCloseTimeoutRef = useRef<number | null>(null);
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
  ) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    addValues(draftValue);
  };

  const handlePresetChange = (
    nextValue: string | null,
    reason: AutocompleteChangeReason,
  ) => {
    if (reason === 'selectOption' && nextValue) {
      addCurrentLevelValues(nextValue);
      setIsPresetDropdownOpen(false);
      return;
    }

    onInputDraftChange(nextValue ?? '');
  };
  const clearHelpCloseTimeout = () => {
    if (helpCloseTimeoutRef.current !== null) {
      window.clearTimeout(helpCloseTimeoutRef.current);
      helpCloseTimeoutRef.current = null;
    }
  };
  const openHelpPopover = (event: ReactMouseEvent<HTMLElement>) => {
    clearHelpCloseTimeout();
    setHelpAnchorElement(event.currentTarget);
  };
  const closeHelpPopover = () => {
    clearHelpCloseTimeout();
    setHelpAnchorElement(null);
  };
  const scheduleHelpPopoverClose = () => {
    clearHelpCloseTimeout();
    helpCloseTimeoutRef.current = window.setTimeout(() => {
      setHelpAnchorElement(null);
    }, 120);
  };

  useEffect(() => () => {
    if (helpCloseTimeoutRef.current !== null) {
      window.clearTimeout(helpCloseTimeoutRef.current);
      helpCloseTimeoutRef.current = null;
    }
  }, []);

  return (
    <Stack spacing={ 1.5 }>
      <Stack spacing={ 0.5 }>
        <Stack alignItems='center' direction='row' spacing={ 0.35 }>
          <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
            Build Tree
          </Typography>
          <IconButton
            aria-label='Build tree usage help'
            onMouseEnter={ openHelpPopover }
            onMouseLeave={ scheduleHelpPopoverClose }
            size='small'
            sx={ { color: 'text.secondary', p: 0.5 } }
          >
            <HelpOutlineRoundedIcon fontSize='small' />
          </IconButton>
        </Stack>
        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
          Add media sources and expand campaign levels to define link generation paths.
        </Typography>
      </Stack>
      <Popover
        PaperProps={ {
          onMouseEnter: clearHelpCloseTimeout,
          onMouseLeave: scheduleHelpPopoverClose,
          sx: {
            maxWidth: 320,
            p: 1.25,
            pointerEvents: 'auto',
          },
        } }
        anchorEl={ helpAnchorElement }
        anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
        disableRestoreFocus
        onClose={ closeHelpPopover }
        open={ Boolean(helpAnchorElement) }
        sx={ { pointerEvents: 'none' } }
        transformOrigin={ { horizontal: 'right', vertical: 'top' } }
      >
        <Stack spacing={ 0.5 }>
          <Typography sx={ { color: 'text.primary', fontSize: 12, fontWeight: 700 } }>
            Build Tree Tips
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
            1. Place cursor in the field and paste; values are auto-split and added.
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
            2. Add Media Source values first.
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
            3. Select chips, then add the next level.
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
            4. Shift+Click: range select in one level.
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
            5. Drag blank area: lasso select.
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
            6. Shift/Alt/Cmd(Ctrl)+Drag: add/remove/toggle.
          </Typography>
          <Typography sx={ { color: 'text.secondary', fontSize: 11 } }>
            7. Delete with X twice to confirm.
          </Typography>
        </Stack>
      </Popover>
      <Stack
        alignItems={ { md: 'flex-start', xs: 'stretch' } }
        direction={ { md: 'row', xs: 'column' } }
        spacing={ 1 }
      >
        <Autocomplete<string, false, false, true>
          disablePortal
          freeSolo
          disabled={ isLeafSelection }
          fullWidth
          inputValue={ inputDraftValue }
          onChange={ (_, nextValue, reason) => handlePresetChange(nextValue, reason) }
          onClose={ () => setIsPresetDropdownOpen(false) }
          onInputChange={ (_, inputValue, reason) => {
            if (reason === 'reset') {
              return;
            }
            onInputDraftChange(inputValue);
          } }
          onKeyDown={ (event) => handleAddOnEnter(event, addCurrentLevelValues, inputDraftValue) }
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
            addCurrentLevelValues(nextValue);
            setIsPresetDropdownOpen(false);
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
