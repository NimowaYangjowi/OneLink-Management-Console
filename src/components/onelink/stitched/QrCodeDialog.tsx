/**
 * QR code modal dialog displaying a scannable QR code for the generated short link.
 */
'use client';

import { Box, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

/**
 * QrCodeDialog component
 *
 * Props:
 * @param {boolean} isOpen - Whether the dialog is open [Required]
 * @param {function} onClose - Close handler [Required]
 * @param {string} qrCodeImageUrl - URL for the QR code image [Required]
 *
 * Example usage:
 * <QrCodeDialog isOpen={open} onClose={() => setOpen(false)} qrCodeImageUrl={url} />
 */
function QrCodeDialog({
  isOpen,
  onClose,
  qrCodeImageUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  qrCodeImageUrl: string;
}) {
  return (
    <Dialog fullWidth maxWidth='sm' onClose={ onClose } open={ isOpen }>
      <DialogTitle sx={ { fontSize: 18, fontWeight: 600 } }>QR Code Preview</DialogTitle>
      <DialogContent>
        <Stack spacing={ 2 } sx={ { alignItems: 'center', pb: 1 } }>
          <Box
            alt='OneLink QR code'
            component='img'
            src={ qrCodeImageUrl }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.5,
              height: { sm: 360, xs: 280 },
              objectFit: 'contain',
              width: { sm: 360, xs: 280 },
            } }
          />
          <Typography sx={ { color: 'text.secondary', fontSize: 12, textAlign: 'center' } }>
            Scan to open the generated short link.
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default QrCodeDialog;
