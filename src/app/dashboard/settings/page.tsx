/**
 * Settings page stub.
 * Temporary placeholder - will be replaced in Phase 7 with full settings interface.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function SettingsPage() {
  return (
    <Box sx={ { p: 4 } }>
      <Typography variant="h4" sx={ { fontWeight: 600 } }>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={ { mt: 1 } }>
        Configure your OneLink Console preferences.
      </Typography>
    </Box>
  );
}
