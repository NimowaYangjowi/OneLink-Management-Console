/**
 * Link Creation page stub.
 * Temporary placeholder - will be replaced in Phase 7 with full link creation form.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DashboardPage() {
  return (
    <Box sx={ { p: 4 } }>
      <Typography variant="h4" sx={ { fontWeight: 600 } }>
        Link Creation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={ { mt: 1 } }>
        Create and manage your OneLink deep links.
      </Typography>
    </Box>
  );
}
