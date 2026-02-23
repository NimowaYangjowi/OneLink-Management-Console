/**
 * Renders submit/edit/warning/success alerts for the group-create page.
 */

import { Alert, Stack, Typography } from '@mui/material';
import Link from 'next/link';

type GroupCreateAlertsProps = {
  createdGroupId: string;
  editSeedError: string;
  isEditMode: boolean;
  submitError: string;
  warnings: string[];
};

function GroupCreateAlerts({
  createdGroupId,
  editSeedError,
  isEditMode,
  submitError,
  warnings,
}: GroupCreateAlertsProps) {
  return (
    <>
      {submitError && <Alert severity='error'>{submitError}</Alert>}
      {editSeedError && <Alert severity='error'>{editSeedError}</Alert>}
      {warnings.length > 0 && (
        <Alert severity='warning'>
          <Stack spacing={ 0.5 }>
            {warnings.slice(0, 5).map((warning, index) => (
              <Typography key={ `${warning}-${index}` } sx={ { fontSize: 13 } }>{warning}</Typography>
            ))}
          </Stack>
        </Alert>
      )}
      {createdGroupId && (
        <Alert severity='success'>
          {isEditMode ? 'Link group updated.' : 'Link group created.'}
          {' '}Track progress on{' '}
          <Link href={ `/link-groups/${encodeURIComponent(createdGroupId)}` }>
            group detail page
          </Link>
          .
        </Alert>
      )}
    </>
  );
}

export default GroupCreateAlerts;
