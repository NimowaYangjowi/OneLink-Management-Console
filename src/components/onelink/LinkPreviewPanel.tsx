'use client';

/**
 * LinkPreviewPanel - Sticky right-side panel showing generated URL and parameter summary.
 * Displays the constructed OneLink URL, lists active parameters, and provides
 * copy-to-clipboard and reset actions.
 *
 * Props:
 * @param {string} generatedUrl - The generated OneLink URL [Required]
 * @param {Array<{ key: string; label: string; value: string }>} nonEmptyParams - Non-empty parameters [Required]
 * @param {function} onCopyUrl - Copy URL handler [Required]
 * @param {function} onReset - Reset form handler [Required]
 *
 * Example usage:
 * <LinkPreviewPanel
 *   generatedUrl={generatedUrl}
 *   nonEmptyParams={nonEmptyParams}
 *   onCopyUrl={handleCopyUrl}
 *   onReset={handleReset}
 * />
 */

import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { Copy } from 'lucide-react';
import ParameterSummary from './ParameterSummary';

interface LinkPreviewPanelProps {
  generatedUrl: string;
  nonEmptyParams: Array<{ key: string; label: string; value: string }>;
  onCopyUrl: () => void;
  onReset: () => void;
}

function LinkPreviewPanel({
  generatedUrl,
  nonEmptyParams,
  onCopyUrl,
  onReset,
}: LinkPreviewPanelProps) {
  const hasUrl = generatedUrl.trim() !== '';

  return (
    <Stack
      spacing={3}
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        p: 3,
        position: 'sticky',
        top: 24,
        maxHeight: 'calc(100vh - 48px)',
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <Typography variant="h6" color="text.primary">
        Link Preview
      </Typography>

      {/* Short URL */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Short URL
        </Typography>
        {hasUrl ? (
          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
          >
            {generatedUrl}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Configure domain to preview URL
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />

      {/* Parameters */}
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Parameters
        </Typography>
        <ParameterSummary params={nonEmptyParams} />
      </Box>

      <Divider sx={{ borderColor: 'divider' }} />

      {/* Actions */}
      <Stack spacing={1}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCopyUrl}
          disabled={!hasUrl}
          startIcon={<Copy size={16} />}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            borderRadius: 0,
          }}
        >
          Copy URL
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={onReset}
          sx={{
            color: 'text.secondary',
            borderRadius: 0,
          }}
        >
          Reset Form
        </Button>
      </Stack>
    </Stack>
  );
}

export default LinkPreviewPanel;
