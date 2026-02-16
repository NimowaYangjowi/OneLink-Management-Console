import { Box, Typography } from '@mui/material';

export default function DashboardPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary">
        Welcome to OneLink Dashboard
      </Typography>
    </Box>
  );
}
