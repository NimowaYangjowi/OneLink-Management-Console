'use client';

/**
 * ParameterSummary - Key-value display of non-empty OneLink parameters.
 * Renders a compact list of configured parameters with monospace keys.
 *
 * Props:
 * @param {Array<{ key: string; label: string; value: string }>} params - Parameters to display [Required]
 *
 * Example usage:
 * <ParameterSummary params={nonEmptyParams} />
 */

import { Box, Stack, Typography } from '@mui/material';

interface ParameterSummaryProps {
  params: Array<{ key: string; label: string; value: string }>;
}

function ParameterSummary({ params }: ParameterSummaryProps) {
  if (params.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No parameters set
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {params.map((param) => (
        <Box
          key={param.key}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            py: 0.5,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'monospace' }}
          >
            {param.key}
          </Typography>
          <Typography variant="body2" color="text.primary">
            {param.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

export default ParameterSummary;
