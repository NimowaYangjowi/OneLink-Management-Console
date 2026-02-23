/**
 * Right sidebar: generated long URL display, short link field, copy/QR buttons,
 * create/update action button, and validation/feedback messages.
 */
'use client';

import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  QrCodeIcon,
} from '@hugeicons/core-free-icons';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import HugeIcon from '@/components/shared/HugeIcon';
import { plainFieldSx } from './fieldStyles';

/**
 * LinkPreviewSidebar component
 *
 * Props:
 * @param {string} generatedLongUrl - Generated long URL [Required]
 * @param {string} shortLink - Short link URL [Required]
 * @param {boolean} isCopied - Whether link was just copied [Required]
 * @param {function} onCopyShortLink - Copy handler [Required]
 * @param {function} onShowQrModal - QR modal open handler [Required]
 * @param {function} onCreateLink - Create/update link handler [Required]
 * @param {string} createActionLabel - Label for the action button [Required]
 * @param {boolean} isEditMode - Whether in edit mode [Required]
 * @param {boolean} isInitialLoadPending - Whether initial load is pending [Required]
 * @param {boolean} isCreating - Whether creation is in progress [Required]
 * @param {boolean} hasMissingRequiredField - Whether required fields are missing [Required]
 * @param {boolean} hasInvalidRedirectUrl - Whether redirect URLs are invalid [Required]
 * @param {boolean} showRequiredValidation - Whether to show validation errors [Required]
 * @param {object} createFeedback - Feedback message object [Optional]
 *
 * Example usage:
 * <LinkPreviewSidebar generatedLongUrl={url} shortLink={link} ... />
 */
function LinkPreviewSidebar({
  generatedLongUrl,
  shortLink,
  isCopied,
  onCopyShortLink,
  onShowQrModal,
  onCreateLink,
  createActionLabel,
  isEditMode,
  isInitialLoadPending,
  isCreating,
  hasMissingRequiredField,
  hasInvalidRedirectUrl,
  showRequiredValidation,
  createFeedback,
}: {
  generatedLongUrl: string;
  shortLink: string;
  isCopied: boolean;
  onCopyShortLink: () => void;
  onShowQrModal: () => void;
  onCreateLink: () => void;
  createActionLabel: string;
  isEditMode: boolean;
  isInitialLoadPending: boolean;
  isCreating: boolean;
  hasMissingRequiredField: boolean;
  hasInvalidRedirectUrl: boolean;
  showRequiredValidation: boolean;
  createFeedback: { message: string; status: 'error' | 'success' } | null;
}) {
  return (
    <Box sx={ { flexShrink: 0, width: { xl: 384 } } }>
      <Stack spacing={ 2 } sx={ { position: { xl: 'sticky' }, top: { xl: 96 } } }>
        <Paper
          elevation={ 0 }
          sx={ {
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          } }
        >
          <Box
            sx={ {
              backgroundColor: 'background.paper',
              px: 3,
              py: 2,
            } }
          >
            <Typography sx={ { fontSize: 16, fontWeight: 600 } }>Link Preview</Typography>
          </Box>

          <Stack spacing={ 3 } sx={ { p: 3 } }>
            <Box>
              <Typography
                sx={ {
                  color: 'text.secondary',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  mb: 1,
                  textTransform: 'uppercase',
                } }
              >
                Generated Long URL
              </Typography>
              <Box
                sx={ {
                  backgroundColor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 0.75,
                  color: 'text.primary',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  lineHeight: 1.5,
                  overflowWrap: 'anywhere',
                  p: 1.5,
                } }
              >
                {generatedLongUrl}
              </Box>
            </Box>

            <Box>
              <Typography
                sx={ {
                  color: 'text.secondary',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  mb: 1,
                  textTransform: 'uppercase',
                } }
              >
                Short Link
              </Typography>
              <TextField
                fullWidth
                InputProps={ {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <HugeIcon color='currentColor' icon={ CheckmarkCircle02Icon } size={ 18 } />
                    </InputAdornment>
                  ),
                  readOnly: true,
                } }
                sx={ plainFieldSx }
                value={ shortLink }
              />
              <Typography
                sx={ {
                  color: 'text.disabled',
                  fontSize: 10,
                  mt: 0.75,
                } }
              >
                {isEditMode
                  ? 'Short link is fixed for this existing OneLink.'
                  : 'Short links are available only after link creation.'}
              </Typography>
            </Box>

            <Button
              onClick={ onCopyShortLink }
              startIcon={
                <HugeIcon
                  color='currentColor'
                  icon={ isCopied ? CheckmarkCircle02Icon : Copy01Icon }
                  size={ 18 }
                />
              }
              sx={ {
                '&:hover': { backgroundColor: 'background.default' },
                backgroundColor: 'background.paper',
                borderColor: 'divider',
                borderRadius: 0.75,
                color: 'text.primary',
                py: 1,
                textTransform: 'none',
              } }
              variant='outlined'
            >
              {isCopied ? 'Copied' : 'Copy Short Link'}
            </Button>

            <Button
              onClick={ onShowQrModal }
              startIcon={ <HugeIcon color='currentColor' icon={ QrCodeIcon } size={ 18 } /> }
              sx={ {
                '&:hover': { backgroundColor: 'background.default' },
                borderColor: 'divider',
                borderRadius: 0.75,
                color: 'text.primary',
                py: 1,
                textTransform: 'none',
              } }
              variant='outlined'
            >
              Show QR Code
            </Button>
          </Stack>
        </Paper>

        <Button
          disabled={ isInitialLoadPending || isCreating }
          onClick={ onCreateLink }
          sx={ {
            borderRadius: 0.75,
            fontWeight: 600,
            py: 1,
            textTransform: 'none',
            width: '100%',
          } }
          variant='contained'
        >
          {isInitialLoadPending ? 'Loading...' : isCreating ? 'Saving...' : createActionLabel}
        </Button>
        {showRequiredValidation && hasMissingRequiredField ? (
          <Typography
            sx={ {
              color: 'error.main',
              fontSize: 12,
              textAlign: 'center',
            } }
          >
            Please fill in all required fields.
          </Typography>
        ) : null}
        {showRequiredValidation && hasInvalidRedirectUrl ? (
          <Typography
            sx={ {
              color: 'error.main',
              fontSize: 12,
              textAlign: 'center',
            } }
          >
            Redirection URLs must be public http(s) URLs. Localhost/IP values are not allowed.
          </Typography>
        ) : null}
        {createFeedback && (
          <Typography
            sx={ {
              color: createFeedback.status === 'success' ? 'success.main' : 'error.main',
              fontSize: 12,
              textAlign: 'center',
            } }
          >
            {createFeedback.message}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default LinkPreviewSidebar;
