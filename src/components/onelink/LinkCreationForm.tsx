'use client';

/**
 * LinkCreationForm - Main form orchestrator with 2-column layout.
 * Combines all 7 OneLink form sections with the preview panel.
 * Manages form submission, URL generation, and clipboard interactions.
 *
 * Example usage:
 * <LinkCreationForm />
 */

import { useState } from 'react';
import { Box, Typography, Stack, Button, Snackbar, Alert } from '@mui/material';
import useOneLinkForm from '@/hooks/useOneLinkForm';
import AttributionSection from './sections/AttributionSection';
import CustomParamsSection from './sections/CustomParamsSection';
import DeepLinkingSection from './sections/DeepLinkingSection';
import RetargetingSection from './sections/RetargetingSection';
import RedirectionSection from './sections/RedirectionSection';
import SocialPreviewSection from './sections/SocialPreviewSection';
import LinkBrandingSection from './sections/LinkBrandingSection';
import LinkPreviewPanel from './LinkPreviewPanel';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

function LinkCreationForm() {
  const {
    state,
    errors,
    setField,
    validate,
    reset,
    generatedUrl,
    nonEmptyParams,
  } = useOneLinkForm();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  /** Validate and show result via snackbar. */
  const handleGenerate = () => {
    if (validate()) {
      setSnackbar({
        open: true,
        message: 'Link generated successfully!',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Please fix validation errors.',
        severity: 'error',
      });
    }
  };

  /** Reset form state. */
  const handleReset = () => {
    reset();
  };

  /** Copy generated URL to clipboard. */
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setSnackbar({
      open: true,
      message: 'URL copied to clipboard!',
      severity: 'success',
    });
  };

  /** Close snackbar. */
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* Left column - Form */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" gutterBottom>
            Create OneLink
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure attribution, deep linking, and branding parameters.
          </Typography>

          <Stack spacing={0}>
            <AttributionSection
              state={state}
              errors={errors}
              onFieldChange={setField}
            />
            <CustomParamsSection
              state={state}
              errors={errors}
              onFieldChange={setField}
            />
            <DeepLinkingSection
              state={state}
              errors={errors}
              onFieldChange={setField}
            />
            <RetargetingSection
              state={state}
              errors={errors}
              onFieldChange={setField}
            />
            <RedirectionSection
              state={state}
              errors={errors}
              onFieldChange={setField}
            />
            <SocialPreviewSection
              state={state}
              errors={errors}
              onFieldChange={setField}
            />
            <LinkBrandingSection
              state={state}
              errors={errors}
              onFieldChange={setField}
            />
          </Stack>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerate}
              sx={{ borderRadius: 0 }}
            >
              Generate Link
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                borderRadius: 0,
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>

        {/* Right column - Preview */}
        <Box
          sx={{
            width: { md: '100%', lg: 360 },
            flexShrink: 0,
            display: { xs: 'none', md: 'block' },
            position: { lg: 'sticky' },
            top: { lg: 24 },
          }}
        >
          <LinkPreviewPanel
            generatedUrl={generatedUrl}
            nonEmptyParams={nonEmptyParams}
            onCopyUrl={handleCopyUrl}
            onReset={handleReset}
          />
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          sx={{ borderRadius: 0 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LinkCreationForm;
