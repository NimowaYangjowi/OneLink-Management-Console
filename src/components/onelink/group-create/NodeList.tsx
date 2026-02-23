/**
 * Recursive tree editor for link-group hierarchy management.
 */
import {
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { LinkGroupNodeLevel } from '@/lib/onelinkGroupTypes';
import { countDescendants } from './treeUtils';
import type { EditorTreeNode } from './types';

const TREE_BRANCH_INDENT = 2.5;
const LEVEL_HEADER_LABEL: Record<LinkGroupNodeLevel, string> = {
  ad: 'Ad',
  adset: 'Ad Set',
  campaign: 'Campaign',
  media_source: 'Media Source',
};
const LEVEL_SELECTED_STYLE: Record<LinkGroupNodeLevel, {
  bgAlpha: number;
  borderAlpha: number;
  hoverBgAlpha: number;
  textTone: 'contrast' | 'dark' | 'main';
}> = {
  ad: {
    bgAlpha: 0.08,
    borderAlpha: 0.28,
    hoverBgAlpha: 0.12,
    textTone: 'main',
  },
  adset: {
    bgAlpha: 0.22,
    borderAlpha: 0.54,
    hoverBgAlpha: 0.28,
    textTone: 'dark',
  },
  campaign: {
    bgAlpha: 0.46,
    borderAlpha: 0.8,
    hoverBgAlpha: 0.54,
    textTone: 'contrast',
  },
  media_source: {
    bgAlpha: 0.68,
    borderAlpha: 1,
    hoverBgAlpha: 0.76,
    textTone: 'contrast',
  },
};

function getChipMetricLabel(node: EditorTreeNode): string {
  const directChildCount = node.children.length;

  if (node.level === 'ad') {
    return '';
  }

  if (node.level === 'adset') {
    return `↳${directChildCount}`;
  }

  return `↳${directChildCount} ⇣${countDescendants(node)}`;
}

export type NodeListProps = {
  isNodeExpanded: (nodeId: string) => boolean;
  isNodeSelected: (nodeId: string) => boolean;
  nodes: EditorTreeNode[];
  onChipClick: (nodeId: string, level: LinkGroupNodeLevel, siblingNodeIds: string[], shiftKey: boolean) => void;
  removeNode: (nodeId: string) => void;
};

function NodeList({
  isNodeExpanded,
  isNodeSelected,
  nodes,
  onChipClick,
  removeNode,
}: NodeListProps) {
  if (nodes.length === 0) {
    return null;
  }

  const siblingNodeIds = nodes.map((node) => node.id);
  const expandedNodes = nodes.filter((node) => node.children.length > 0 && isNodeExpanded(node.id));
  const collapsedNodes = nodes.filter((node) => !(node.children.length > 0 && isNodeExpanded(node.id)));

  const renderNodeChip = (node: EditorTreeNode) => {
    const isSelected = isNodeSelected(node.id);
    const metricLabel = getChipMetricLabel(node);
    const chipLabel = metricLabel ? `${node.value} ${metricLabel}` : node.value;

    return (
      <Chip
        data-tree-chip-level={ node.level }
        data-tree-chip-node-id={ node.id }
        label={ chipLabel }
        onClick={ (event) => {
          event.stopPropagation();
          onChipClick(node.id, node.level, siblingNodeIds, event.shiftKey);
        } }
        onDelete={ (event) => {
          event.stopPropagation();
          removeNode(node.id);
        } }
        size='small'
        sx={ isSelected ? (theme) => {
          const style = LEVEL_SELECTED_STYLE[node.level];
          const textColor = style.textTone === 'contrast'
            ? theme.palette.primary.contrastText
            : style.textTone === 'dark'
              ? theme.palette.primary.dark
              : theme.palette.primary.main;
          return {
            '& .MuiChip-deleteIcon': {
              color: style.textTone === 'contrast'
                ? alpha(theme.palette.primary.contrastText, 0.8)
                : alpha(theme.palette.primary.main, 0.7),
              '&:hover': {
                color: textColor,
              },
            },
            backgroundColor: alpha(theme.palette.primary.main, style.bgAlpha),
            borderColor: alpha(theme.palette.primary.main, style.borderAlpha),
            color: textColor,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, style.hoverBgAlpha),
            },
          };
        } : undefined }
        variant={ isSelected ? 'filled' : 'outlined' }
      />
    );
  };

  return (
    <Stack spacing={ 1.25 }>
      <Typography sx={ { color: 'text.secondary', fontSize: 12, fontWeight: 700 } }>
        {LEVEL_HEADER_LABEL[nodes[0].level]}
      </Typography>
      {collapsedNodes.length > 0 && (
        <Stack alignItems='center' direction='row' flexWrap='wrap' spacing={ 0.75 } useFlexGap>
          {collapsedNodes.map((node) => (
            <Box key={ node.id }>
              {renderNodeChip(node)}
            </Box>
          ))}
        </Stack>
      )}
      {expandedNodes.map((node) => (
        <Stack key={ node.id } spacing={ 0.75 }>
          <Stack alignItems='center' direction='row' flexWrap='wrap' spacing={ 0.75 } useFlexGap>
            {renderNodeChip(node)}
          </Stack>
          <Box
            sx={ {
              borderColor: 'divider',
              borderLeft: '1px dashed',
              ml: TREE_BRANCH_INDENT,
              pl: TREE_BRANCH_INDENT,
            } }
          >
            <NodeList
              isNodeExpanded={ isNodeExpanded }
              isNodeSelected={ isNodeSelected }
              nodes={ node.children }
              onChipClick={ onChipClick }
              removeNode={ removeNode }
            />
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export default NodeList;
