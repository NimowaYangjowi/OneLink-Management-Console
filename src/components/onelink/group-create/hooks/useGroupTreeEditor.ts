/**
 * Handles draft input parsing and tree mutation actions for group-create step 2.
 */

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import type { LinkGroupNodeLevel } from '@/lib/onelinkGroupTypes';
import {
  appendUniqueChildren,
  countDescendants,
  findNodeById,
  insertChildrenUnderNode,
  removeNodeById,
} from '@/components/onelink/group-create/treeUtils';
import type { EditorTreeNode } from '@/components/onelink/group-create/types';
import { parseMultiValueInput } from '@/lib/onelinkGroupTree';

type UseGroupTreeEditorArgs = {
  roots: EditorTreeNode[];
  selectedChildLevel: LinkGroupNodeLevel | null;
  selectedTreeNodeIds: string[];
  selectedTreeNodeLevel: LinkGroupNodeLevel | null;
  setRoots: Dispatch<SetStateAction<EditorTreeNode[]>>;
  setWarnings: Dispatch<SetStateAction<string[]>>;
  presets: {
    af_ad: string[];
    af_adset: string[];
    c: string[];
    pid: string[];
  };
};

export function useGroupTreeEditor({
  roots,
  selectedChildLevel,
  selectedTreeNodeIds,
  selectedTreeNodeLevel,
  setRoots,
  setWarnings,
  presets,
}: UseGroupTreeEditorArgs) {
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({ root: '' });

  const setDraft = useCallback((draftKey: string, value: string) => {
    setInputDrafts((previous) => ({
      ...previous,
      [draftKey]: value,
    }));
  }, []);

  const filterDuplicateWarnings = useCallback((nextWarnings: string[]) => (
    nextWarnings.filter((warning) => !warning.startsWith('Duplicate value '))
  ), []);

  const addRootNodes = useCallback((rawInputOverride?: string) => {
    const rawInput = rawInputOverride ?? inputDrafts.root ?? '';
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
    setWarnings(filterDuplicateWarnings([...parsed.warnings, ...appended.warnings]));
    setDraft('root', '');
  }, [filterDuplicateWarnings, inputDrafts.root, roots, setDraft, setRoots, setWarnings]);

  const addChildrenToSelection = useCallback((rawInputOverride?: string) => {
    if (!selectedChildLevel || !selectedTreeNodeLevel || selectedTreeNodeIds.length === 0) {
      return;
    }

    const draftKey = `selection:${selectedTreeNodeLevel}`;
    const rawInput = rawInputOverride ?? inputDrafts[draftKey] ?? '';

    const parsed = parseMultiValueInput(rawInput, {
      maxCharPerValue: 100,
      maxValues: 500,
    });

    if (parsed.values.length === 0) {
      setWarnings(parsed.warnings.length > 0 ? parsed.warnings : ['No valid child values were detected.']);
      return;
    }

    let nextRoots = roots;
    const insertionWarnings: string[] = [];

    selectedTreeNodeIds.forEach((nodeId) => {
      const result = insertChildrenUnderNode(nextRoots, nodeId, selectedChildLevel, parsed.values);
      nextRoots = result.nodes;
      insertionWarnings.push(...result.warnings);
    });

    setRoots(nextRoots);
    setWarnings(filterDuplicateWarnings([...parsed.warnings, ...insertionWarnings]));
    setDraft(draftKey, '');
  }, [
    filterDuplicateWarnings,
    inputDrafts,
    roots,
    selectedChildLevel,
    selectedTreeNodeIds,
    selectedTreeNodeLevel,
    setDraft,
    setRoots,
    setWarnings,
  ]);

  const removeNode = useCallback((nodeId: string) => {
    const targetNode = findNodeById(roots, nodeId);
    if (targetNode) {
      const descendantCount = countDescendants(targetNode);
      if (descendantCount > 0) {
        const confirmed = window.confirm(
          `Delete ${targetNode.value} and its ${descendantCount} child node${descendantCount > 1 ? 's' : ''}?`,
        );
        if (!confirmed) {
          return;
        }
      }
    }

    setRoots((previous) => removeNodeById(previous, nodeId));
  }, [roots, setRoots]);

  const getPresetOptionsForLevel = useCallback((level: LinkGroupNodeLevel): string[] => {
    if (level === 'media_source') {
      return presets.pid;
    }
    if (level === 'campaign') {
      return presets.c;
    }
    if (level === 'adset') {
      return presets.af_adset;
    }
    return presets.af_ad;
  }, [presets.af_ad, presets.af_adset, presets.c, presets.pid]);

  const activeTreeInputTargetLevel = selectedTreeNodeIds.length > 0 ? selectedChildLevel : 'media_source';
  const activeTreeInputDraftKey = selectedTreeNodeLevel ? `selection:${selectedTreeNodeLevel}` : 'root';
  const activeTreeInputDraftValue = inputDrafts[activeTreeInputDraftKey] ?? '';
  const activeTreeInputPresetOptions = activeTreeInputTargetLevel
    ? getPresetOptionsForLevel(activeTreeInputTargetLevel)
    : [];

  const addTreeInputValues = useCallback((rawInputOverride?: string) => {
    if (selectedTreeNodeIds.length > 0) {
      if (!selectedChildLevel) {
        return;
      }

      addChildrenToSelection(rawInputOverride);
      return;
    }

    addRootNodes(rawInputOverride);
  }, [addChildrenToSelection, addRootNodes, selectedChildLevel, selectedTreeNodeIds.length]);

  const resetTreeEditorState = useCallback(() => {
    setInputDrafts({ root: '' });
  }, []);

  return {
    activeTreeInputDraftKey,
    activeTreeInputDraftValue,
    activeTreeInputPresetOptions,
    activeTreeInputTargetLevel,
    addTreeInputValues,
    removeNode,
    resetTreeEditorState,
    setDraft,
  };
}
