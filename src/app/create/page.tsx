/**
 * Create route hub page that lets users choose a creation flow.
 */
import Link from 'next/link';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';

export default function CreatePage() {
  return (
    <ConsoleLayout title='Create OneLink'>
      <Box sx={ { maxWidth: 820, mx: 'auto', px: { md: 4, xs: 2 }, py: { md: 8, xs: 5 }, width: '100%' } }>
        <Typography sx={ { color: 'text.primary', fontSize: 26, fontWeight: 700, mb: 1 } }>
          Choose a creation type
        </Typography>
        <Typography sx={ { color: 'text.secondary', fontSize: 14, mb: 3.5 } }>
          Select how you want to create your OneLink.
        </Typography>

        <Stack direction={ { md: 'row', xs: 'column' } } spacing={ 2 }>
          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              flex: 1,
              p: 2.5,
            } }
          >
            <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 600, mb: 1 } }>
              Single link
            </Typography>
            <Typography sx={ { color: 'text.secondary', fontSize: 14, mb: 2.5 } }>
              Create one OneLink for a single campaign flow.
            </Typography>
            <Link href='/create/single-link' style={ { textDecoration: 'none' } }>
              <Button sx={ { textTransform: 'none' } } variant='contained'>
                Start single link
              </Button>
            </Link>
          </Paper>

          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              flex: 1,
              p: 2.5,
            } }
          >
            <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 600, mb: 1 } }>
              Link group
            </Typography>
            <Typography sx={ { color: 'text.secondary', fontSize: 14, mb: 2.5 } }>
              Create a grouped OneLink flow for multiple variations.
            </Typography>
            <Link href='/create/link-group' style={ { textDecoration: 'none' } }>
              <Button sx={ { textTransform: 'none' } } variant='outlined'>
                Start link group
              </Button>
            </Link>
          </Paper>
        </Stack>
      </Box>
    </ConsoleLayout>
  );
}
