/**
 * Step 4 summary and execution controls for link-group batch generation.
 */
import {
  Alert,
  Button,
  Divider,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import type { ApplyMode, GroupExecutionDetail } from './types';

type ReviewExecuteStepProps = {
  applyMode: ApplyMode;
  brandDomain: string;
  canRetryFailedItems: boolean;
  executionDetail: GroupExecutionDetail | null;
  executionProgressPercent: number;
  globalParamCount: number;
  groupName: string;
  isEditHydrating: boolean;
  isEditMode: boolean;
  isPollingExecution: boolean;
  isRetrying: boolean;
  isSubmitting: boolean;
  leafCount: number;
  leafPathCount: number;
  onApplyModeChange: (nextApplyMode: ApplyMode) => void;
  onExecute: () => void;
  onRetryFailed: () => void;
  templateId: string;
};

function ReviewExecuteStep({
  applyMode,
  brandDomain,
  canRetryFailedItems,
  executionDetail,
  executionProgressPercent,
  globalParamCount,
  groupName,
  isEditHydrating,
  isEditMode,
  isPollingExecution,
  isRetrying,
  isSubmitting,
  leafCount,
  leafPathCount,
  onApplyModeChange,
  onExecute,
  onRetryFailed,
  templateId,
}: ReviewExecuteStepProps) {
  return (
    <Stack spacing={ 1.5 }>
      <Typography sx={ { color: 'text.primary', fontSize: 18, fontWeight: 700 } }>
        Review & Execute
      </Typography>

      <Paper
        elevation={ 0 }
        sx={ {
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5,
        } }
      >
        <Stack direction={ { md: 'row', xs: 'column' } } spacing={ 1.25 }>
          <Typography sx={ { color: 'text.primary', fontSize: 13 } }>
            Group: <strong>{groupName.trim() || '-'}</strong>
          </Typography>
          <Typography sx={ { color: 'text.primary', fontSize: 13 } }>
            Template: <strong>{templateId.trim() || '-'}</strong>
          </Typography>
          <Typography sx={ { color: 'text.primary', fontSize: 13 } }>
            Brand Domain: <strong>{brandDomain.trim() || '-'}</strong>
          </Typography>
        </Stack>
        <Stack direction={ { md: 'row', xs: 'column' } } spacing={ 1.25 } sx={ { mt: 0.75 } }>
          <Typography sx={ { color: 'text.primary', fontSize: 13 } }>
            Leaf paths: <strong>{leafCount}</strong>
          </Typography>
          <Typography sx={ { color: 'text.primary', fontSize: 13 } }>
            Link params: <strong>{globalParamCount}</strong>
          </Typography>
        </Stack>
      </Paper>

      {leafPathCount === 0 && (
        <Alert severity='warning'>Tree has no leaf path to execute.</Alert>
      )}

      {isEditMode && (
        <TextField
          fullWidth
          helperText='Choose how updates should be applied to generated items.'
          label='Apply Mode'
          onChange={ (event) => onApplyModeChange(event.target.value as ApplyMode) }
          select
          size='small'
          value={ applyMode }
        >
          <MenuItem value='all'>all (re-run all paths)</MenuItem>
          <MenuItem value='new_only'>new_only (run only newly added paths)</MenuItem>
          <MenuItem value='failed_only'>failed_only (re-run previously failed paths)</MenuItem>
        </TextField>
      )}

      <Button
        disabled={ isSubmitting || leafPathCount === 0 || isEditHydrating }
        onClick={ onExecute }
        sx={ { textTransform: 'none', width: 190 } }
        variant='contained'
      >
        {isSubmitting
          ? isEditMode ? 'Updating...' : 'Executing...'
          : isEditMode ? 'Update Link Group' : 'Execute Link Group'}
      </Button>

      {executionDetail && (
        <Stack spacing={ 1.25 }>
          <Divider />
          <Typography sx={ { color: 'text.primary', fontSize: 16, fontWeight: 700 } }>
            Execution Progress
          </Typography>
          <LinearProgress value={ executionProgressPercent } variant='determinate' />
          <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
            {`Status: ${executionDetail.status} · Success: ${executionDetail.successCount} · Failed: ${executionDetail.failedCount} · Progress: ${executionProgressPercent}%`}
          </Typography>
          <Stack direction='row' spacing={ 1 }>
            <Button
              component={ Link }
              href={ `/link-groups/${encodeURIComponent(executionDetail.id)}` }
              size='small'
              sx={ { textTransform: 'none' } }
              variant='outlined'
            >
              Open Detail
            </Button>
            <Button
              disabled={ !canRetryFailedItems }
              onClick={ onRetryFailed }
              size='small'
              sx={ { textTransform: 'none' } }
              variant='contained'
            >
              {isRetrying ? 'Retrying...' : 'Retry Failed'}
            </Button>
          </Stack>

          {isPollingExecution && (
            <Typography sx={ { color: 'info.main', fontSize: 12 } }>
              Polling status every 2 seconds...
            </Typography>
          )}

          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Path</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Short Link / Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executionDetail.items.slice(0, 20).map((item) => (
                <TableRow key={ item.id }>
                  <TableCell>{item.pathLabel}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell sx={ { maxWidth: 360 } }>
                    {item.shortLink ? (
                      <Typography
                        component='a'
                        href={ item.shortLink }
                        rel='noreferrer'
                        sx={ { color: 'primary.main', fontSize: 12, wordBreak: 'break-all' } }
                        target='_blank'
                      >
                        {item.shortLink}
                      </Typography>
                    ) : (
                      <Typography sx={ { color: 'error.main', fontSize: 12 } }>
                        {item.errorMessage || '-'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      )}
    </Stack>
  );
}

export default ReviewExecuteStep;
