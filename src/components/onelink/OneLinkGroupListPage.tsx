/**
 * Link Group list page showing group-level status and quick management actions.
 */
'use client';

import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';

type LinkGroupSummary = {
  createdAt: string;
  failedCount: number;
  id: string;
  name: string;
  plannedCount: number;
  status: 'draft' | 'running' | 'completed' | 'partial_failed' | 'failed';
  successCount: number;
  templateId: string;
};

type LinkGroupListResponse = {
  error?: string;
  groups?: LinkGroupSummary[];
};

type LinkGroupDeleteResponse = {
  deleted?: boolean;
  error?: string;
  remoteDeleted?: boolean;
};

function formatDate(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Date(timestamp).toLocaleString();
}

function getStatusChipColor(status: LinkGroupSummary['status']): 'default' | 'error' | 'info' | 'success' | 'warning' {
  if (status === 'running') {
    return 'info';
  }
  if (status === 'completed') {
    return 'success';
  }
  if (status === 'partial_failed') {
    return 'warning';
  }
  if (status === 'failed') {
    return 'error';
  }
  return 'default';
}

/**
 * OneLinkGroupListPage
 *
 * Example usage:
 * <OneLinkGroupListPage />
 */
function OneLinkGroupListPage() {
  const [groups, setGroups] = useState<LinkGroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [activeGroupId, setActiveGroupId] = useState('');

  const hasRunningGroup = useMemo(
    () => groups.some((group) => group.status === 'running'),
    [groups],
  );

  const loadGroups = useCallback(async () => {
    setError('');

    try {
      const response = await fetch('/api/onelink-groups', {
        cache: 'no-store',
        method: 'GET',
      });
      const payload = (await response.json().catch(() => null)) as LinkGroupListResponse | null;

      if (!response.ok || !payload?.groups) {
        setGroups([]);
        setError(payload?.error || 'Failed to load link groups.');
        return;
      }

      setGroups(payload.groups);
    } catch {
      setGroups([]);
      setError('Failed to load link groups.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!hasRunningGroup) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadGroups();
    }, 2500);

    return () => {
      window.clearInterval(timer);
    };
  }, [hasRunningGroup, loadGroups]);

  const handleDelete = async (group: LinkGroupSummary, mode: 'local_only' | 'local_and_remote') => {
    if (activeGroupId) {
      return;
    }

    const confirmed = window.confirm(
      mode === 'local_and_remote'
        ? `Delete "${group.name}" locally and in AppsFlyer?`
        : `Delete "${group.name}" locally only?`,
    );

    if (!confirmed) {
      return;
    }

    setActiveGroupId(group.id);
    setActionMessage('');

    try {
      const response = await fetch(`/api/onelink-groups/${encodeURIComponent(group.id)}?mode=${mode}`, {
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as LinkGroupDeleteResponse | null;

      if (!response.ok) {
        setActionMessage(payload?.error || 'Failed to delete link group.');
        return;
      }

      setGroups((previous) => previous.filter((item) => item.id !== group.id));

      if (mode === 'local_and_remote' && payload?.remoteDeleted === false) {
        setActionMessage('Group deleted locally, but one or more remote deletes failed.');
      } else {
        setActionMessage('Link group deleted.');
      }
    } catch {
      setActionMessage('Failed to delete link group.');
    } finally {
      setActiveGroupId('');
    }
  };

  return (
    <ConsoleLayout
      actions={ (
        <Button component={ Link } href='/create/link-group' sx={ { textTransform: 'none' } } variant='contained'>
          New Group
        </Button>
      ) }
      title='Link Groups'
    >
      <Box sx={ { maxWidth: 1600, mx: 'auto', px: { md: 4, xs: 2 }, py: 4, width: '100%' } }>
        <Stack spacing={ 2 }>
          {error && <Alert severity='error'>{error}</Alert>}
          {actionMessage && <Alert severity='info'>{actionMessage}</Alert>}

          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
            } }
          >
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Planned</TableCell>
                  <TableCell>Success</TableCell>
                  <TableCell>Failed</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={ group.id }>
                    <TableCell>
                      <Stack spacing={ 0.25 }>
                        <Typography sx={ { color: 'text.primary', fontSize: 13, fontWeight: 600 } }>
                          {group.name}
                        </Typography>
                        <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                          {group.id}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip color={ getStatusChipColor(group.status) } label={ group.status } size='small' />
                    </TableCell>
                    <TableCell>{group.templateId}</TableCell>
                    <TableCell>{group.plannedCount}</TableCell>
                    <TableCell>{group.successCount}</TableCell>
                    <TableCell>{group.failedCount}</TableCell>
                    <TableCell>{formatDate(group.createdAt)}</TableCell>
                    <TableCell align='right'>
                      <Stack direction='row' justifyContent='flex-end' spacing={ 0.5 }>
                        <Button
                          component={ Link }
                          href={ `/link-groups/${encodeURIComponent(group.id)}` }
                          size='small'
                          sx={ { textTransform: 'none' } }
                          variant='outlined'
                        >
                          View
                        </Button>
                        <Button
                          color='error'
                          disabled={ Boolean(activeGroupId) }
                          onClick={ () => handleDelete(group, 'local_only') }
                          size='small'
                          sx={ { textTransform: 'none' } }
                          variant='text'
                        >
                          Delete Local
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!isLoading && groups.length === 0 && (
              <Alert severity='info' sx={ { mt: 1.5 } }>
                No link groups yet.
              </Alert>
            )}
          </Paper>
        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkGroupListPage;
