/**
 * Handles draft input parsing and tree mutation actions for group-create step 2.
 */

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { composeValueFromSlots, validateValueAgainstRule } from '@/lib/namingConvention';
import type { LinkGroupNodeLevel } from '@/lib/onelinkGroupTypes';
import type { NamingConventionRule } from '@/lib/providers/SettingsContext';
import { buildNamingRuleExample } from '@/lib/namingRulePlaceholder';
import {
  appendUniqueChildren,
  insertChildrenUnderNode,
  removeNodeById,
  removeNodesByIds,
} from '@/components/onelink/group-create/treeUtils';
import type { EditorTreeNode } from '@/components/onelink/group-create/types';
import { parseMultiValueInput } from '@/lib/onelinkGroupTree';

type UseGroupTreeEditorArgs = {
  namingRules: {
    ad: NamingConventionRule[];
    adset: NamingConventionRule[];
    campaign: NamingConventionRule[];
  };
  selectedNamingRuleIds: {
    ad: string;
    adset: string;
    campaign: string;
  };
  setSelectedNamingRuleId: (level: 'campaign' | 'adset' | 'ad', ruleId: string) => void;
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
  namingRules,
  selectedNamingRuleIds,
  setSelectedNamingRuleId,
  roots,
  selectedChildLevel,
  selectedTreeNodeIds,
  selectedTreeNodeLevel,
  setRoots,
  setWarnings,
  presets,
}: UseGroupTreeEditorArgs) {
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({ root: '' });
  const getNamingRuleByLevel = useCallback((level: LinkGroupNodeLevel | null): NamingConventionRule | null => {
    if (level === 'campaign') {
      return namingRules.campaign.find((rule) => rule.id === selectedNamingRuleIds.campaign) ?? null;
    }
    if (level === 'adset') {
      return namingRules.adset.find((rule) => rule.id === selectedNamingRuleIds.adset) ?? null;
    }
    if (level === 'ad') {
      return namingRules.ad.find((rule) => rule.id === selectedNamingRuleIds.ad) ?? null;
    }
    return null;
  }, [namingRules.ad, namingRules.adset, namingRules.campaign, selectedNamingRuleIds.ad, selectedNamingRuleIds.adset, selectedNamingRuleIds.campaign]);

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

    const selectedNamingRule = getNamingRuleByLevel(selectedChildLevel);
    const normalizedInputValues = selectedNamingRule
      ? parsed.values
        .map((value) => {
          const validation = validateValueAgainstRule(selectedNamingRule, value);
          if (!validation.valid) {
            const firstError = validation.errors[0]?.message ?? 'Failed naming rule validation.';
            return {
              error: `[${selectedNamingRule.name}] ${value}: ${firstError}`,
              normalized: '',
              valid: false,
            };
          }

          return {
            error: '',
            normalized: composeValueFromSlots(selectedNamingRule, validation.normalizedSlots),
            valid: true,
          };
        })
      : parsed.values.map((value) => ({ error: '', normalized: value, valid: true }));
    const validValues = normalizedInputValues
      .filter((entry) => entry.valid)
      .map((entry) => entry.normalized);
    const namingWarnings = normalizedInputValues
      .filter((entry) => !entry.valid)
      .map((entry) => entry.error);

    if (validValues.length === 0) {
      setWarnings([...parsed.warnings, ...namingWarnings]);
      return;
    }

    let nextRoots = roots;
    const insertionWarnings: string[] = [];

    selectedTreeNodeIds.forEach((nodeId) => {
      const result = insertChildrenUnderNode(nextRoots, nodeId, selectedChildLevel, validValues);
      nextRoots = result.nodes;
      insertionWarnings.push(...result.warnings);
    });

    setRoots(nextRoots);
    setWarnings(filterDuplicateWarnings([...parsed.warnings, ...namingWarnings, ...insertionWarnings]));
    setDraft(draftKey, '');
  }, [
    filterDuplicateWarnings,
    getNamingRuleByLevel,
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
    setRoots((previous) => removeNodeById(previous, nodeId));
  }, [setRoots]);

  const removeNodes = useCallback((nodeIds: string[]) => {
    setRoots((previous) => removeNodesByIds(previous, nodeIds));
  }, [setRoots]);

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
  const activeTreeInputNamingRuleOptions = activeTreeInputTargetLevel === 'campaign'
    ? namingRules.campaign
    : activeTreeInputTargetLevel === 'adset'
      ? namingRules.adset
      : activeTreeInputTargetLevel === 'ad'
        ? namingRules.ad
        : [];
  const activeTreeInputSelectedNamingRuleId = activeTreeInputTargetLevel === 'campaign'
    ? selectedNamingRuleIds.campaign
    : activeTreeInputTargetLevel === 'adset'
      ? selectedNamingRuleIds.adset
      : activeTreeInputTargetLevel === 'ad'
        ? selectedNamingRuleIds.ad
        : '';
  const activeTreeInputSelectedNamingRule = getNamingRuleByLevel(activeTreeInputTargetLevel);
  const activeTreeInputNamingPlaceholder = activeTreeInputSelectedNamingRule
    ? buildNamingRuleExample(activeTreeInputSelectedNamingRule)
    : '';

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

  const setActiveTreeInputSelectedNamingRuleId = useCallback((ruleId: string) => {
    if (activeTreeInputTargetLevel === 'campaign') {
      setSelectedNamingRuleId('campaign', ruleId);
      return;
    }
    if (activeTreeInputTargetLevel === 'adset') {
      setSelectedNamingRuleId('adset', ruleId);
      return;
    }
    if (activeTreeInputTargetLevel === 'ad') {
      setSelectedNamingRuleId('ad', ruleId);
    }
  }, [activeTreeInputTargetLevel, setSelectedNamingRuleId]);

  return {
    activeTreeInputDraftKey,
    activeTreeInputDraftValue,
    activeTreeInputNamingPlaceholder,
    activeTreeInputNamingRuleOptions,
    activeTreeInputPresetOptions,
    activeTreeInputSelectedNamingRuleId,
    activeTreeInputTargetLevel,
    addTreeInputValues,
    removeNode,
    removeNodes,
    resetTreeEditorState,
    setActiveTreeInputSelectedNamingRuleId,
    setDraft,
  };
}
