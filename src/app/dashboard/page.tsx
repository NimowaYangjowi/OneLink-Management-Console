/**
 * Link Creation page - default dashboard route.
 * Renders the OneLink creation form with live preview panel.
 */

import Box from '@mui/material/Box';
import LinkCreationForm from '@/components/onelink/LinkCreationForm';

export const metadata = {
  title: 'Create OneLink | OneLink Console',
};

export default function DashboardPage() {
  return (
    <Box sx={ { p: { xs: 2, md: 4 }, maxWidth: 1200 } }>
      <LinkCreationForm />
    </Box>
  );
}
