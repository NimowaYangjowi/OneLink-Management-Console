'use client';

/**
 * Settings page - console preferences and environment info.
 * Provides read-only environment info, default settings, and about section.
 * Settings persistence is deferred to a future version.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SectionAccordion from '@/components/shared/SectionAccordion';
import FormTextField from '@/components/shared/FormTextField';

export default function SettingsPage() {
  const [defaultDomain, setDefaultDomain] = useState('');
  const [defaultPid, setDefaultPid] = useState('');

  return (
    <Box sx={ { p: { xs: 2, md: 4 }, maxWidth: 800 } }>
      <Typography variant="h5" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={ { mb: 4 } }>
        Configure your OneLink console preferences.
      </Typography>

      <Stack spacing={ 3 }>
        {/* Environment */}
        <SectionAccordion
          title="Environment"
          subtitle="Environment variable setup for secure API usage."
          defaultExpanded={ true }
        >
          <Stack spacing={ 1 }>
            <Typography variant="body2">
              API credentials are configured via environment variables.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Required: <code>ONELINK_API_KEY</code> (server-only, never exposed in client UI)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Optional default: <code>NEXT_PUBLIC_DEFAULT_ONELINK_ID</code>
            </Typography>
          </Stack>
        </SectionAccordion>

        {/* Default Settings */}
        <SectionAccordion
          title="Default Settings"
          subtitle="Default values applied to new links."
          defaultExpanded={ false }
        >
          <Stack spacing={ 2 }>
            <FormTextField
              label="Default Domain"
              value={ defaultDomain }
              onChange={ setDefaultDomain }
              placeholder="click.example.com"
            />
            <FormTextField
              label="Default Media Source"
              value={ defaultPid }
              onChange={ setDefaultPid }
              placeholder="e.g., email"
            />
          </Stack>
        </SectionAccordion>

        {/* About */}
        <SectionAccordion
          title="About"
          subtitle="Application information."
          defaultExpanded={ false }
        >
          <Stack spacing={ 1 }>
            <Typography variant="body2">
              OneLink Management Console v0.2.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built with Next.js, React, and MUI.
            </Typography>
          </Stack>
        </SectionAccordion>
      </Stack>
    </Box>
  );
}
