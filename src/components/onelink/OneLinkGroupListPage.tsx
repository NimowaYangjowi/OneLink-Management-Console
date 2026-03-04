/**
 * Link Group list page showing group-level status and quick management actions.
 */
'use client';

import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type MouseEvent, type SyntheticEvent } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import CreationTypeHeader from '@/components/onelink/list/CreationTypeHeader';
import FilterChipSelect from '@/components/onelink/list/FilterChipSelect';
import type { FilterChipOption, OneLinkTabType } from '@/components/onelink/list/types';
import { formatCreatedAt } from '@/components/onelink/list/utils';
import { filledFieldSx } from '@/components/onelink/stitched/fieldStyles';
import HugeIcon from '@/components/shared/HugeIcon';

const POLL_DELAY_INITIAL_MS = 2500;
const POLL_DELAY_MAX_MS = 10000;
const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 250;
const TTL_REFRESH_INTERVAL_MS = 60_000;
const GROUP_TTL_DAYS = 31;
const GROUP_TTL_TOTAL_MS = GROUP_TTL_DAYS * 24 * 60 * 60 * 1000;

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

type StatusFilterValue =
  | 'all'
  | 'completed'
  | 'draft'
  | 'failed'
  | 'partial_failed'
  | 'running';

const searchFieldSx = filledFieldSx;

function formatRemainingTtl(createdAt: string, nowTimestamp: number): string {
  const createdTimestamp = Date.parse(createdAt);
  if (Number.isNaN(createdTimestamp)) {
    return '-';
  }

  const remainingMs = createdTimestamp + GROUP_TTL_TOTAL_MS - nowTimestamp;
  if (remainingMs <= 0) {
    return 'Expired';
  }

  const totalMinutes = Math.floor(remainingMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

/**
 * OneLinkGroupListPage
 *
 * Example usage:
 * <OneLinkGroupListPage />
 */
function OneLinkGroupListPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<LinkGroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [activeGroupId, setActiveGroupId] = useState('');
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const [activeActionGroupId, setActiveActionGroupId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ttlNowTimestamp, setTtlNowTimestamp] = useState(() => Date.now());
  const [autoUpdateTtlMap, setAutoUpdateTtlMap] = useState<Record<string, boolean>>({});
  const [ttlFrozenTimestampMap, setTtlFrozenTimestampMap] = useState<Record<string, number>>({});
  const isActionsMenuOpen = Boolean(actionsAnchorEl);

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
    const timer = window.setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchKeyword]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchKeyword, statusFilter, templateFilter]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setTtlNowTimestamp(Date.now());
    }, TTL_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (!hasRunningGroup) {
      return;
    }

    let isActive = true;
    let timerId: number | null = null;
    let delayMs = POLL_DELAY_INITIAL_MS;

    const scheduleNext = () => {
      if (!isActive) {
        return;
      }
      timerId = window.setTimeout(tick, delayMs);
    };

    const tick = async () => {
      if (!isActive) {
        return;
      }

      if (document.hidden) {
        delayMs = POLL_DELAY_MAX_MS;
        scheduleNext();
        return;
      }

      await loadGroups();
      delayMs = Math.min(delayMs + 1000, POLL_DELAY_MAX_MS);
      scheduleNext();
    };

    const handleVisibilityChange = () => {
      if (!isActive || document.hidden) {
        return;
      }

      delayMs = POLL_DELAY_INITIAL_MS;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      scheduleNext();
    };

    scheduleNext();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasRunningGroup, loadGroups]);

  const templateOptions = useMemo(
    () =>
      [...new Set(groups.map((group) => group.templateId))]
        .filter(Boolean)
        .sort((first, second) => first.localeCompare(second)),
    [groups],
  );

  const templateFilterOptions = useMemo<ReadonlyArray<FilterChipOption<string>>>(
    () => [
      { label: 'All templates', value: 'all' },
      ...templateOptions.map((templateId) => ({ label: templateId, value: templateId })),
    ],
    [templateOptions],
  );

  const statusFilterOptions = useMemo<ReadonlyArray<FilterChipOption<StatusFilterValue>>>(
    () => [
      { label: 'All status', value: 'all' },
      { label: 'Running', value: 'running' },
      { label: 'Completed', value: 'completed' },
      { label: 'Partially Failed', value: 'partial_failed' },
      { label: 'Failed', value: 'failed' },
      { label: 'Draft', value: 'draft' },
    ],
    [],
  );

  const filteredGroups = useMemo(() => {
    const keyword = debouncedSearchKeyword.toLowerCase();

    return groups.filter((group) => {
      if (templateFilter !== 'all' && group.templateId !== templateFilter) {
        return false;
      }

      if (statusFilter !== 'all' && group.status !== statusFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchSource = [
        group.name,
        group.id,
        group.templateId,
        group.status,
      ]
        .join(' ')
        .toLowerCase();

      return searchSource.includes(keyword);
    });
  }, [debouncedSearchKeyword, groups, statusFilter, templateFilter]);

  const totalFilteredGroups = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredGroups / DEFAULT_PAGE_SIZE));

  useEffect(() => {
    if (currentPage <= totalPages) {
      return;
    }

    setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pagedGroups = useMemo(() => {
    const offset = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    return filteredGroups.slice(offset, offset + DEFAULT_PAGE_SIZE);
  }, [currentPage, filteredGroups]);
  const activeActionGroup = useMemo(
    () => groups.find((group) => group.id === activeActionGroupId) ?? null,
    [activeActionGroupId, groups],
  );

  const handleDelete = async (group: LinkGroupSummary, mode: 'local_only' | 'local_and_remote') => {
    if (activeGroupId) {
      return;
    }

    const confirmed = window.confirm(
      mode === 'local_and_remote'
        ? `Delete "${group.name}" as "Delete group and the links"?`
        : `Delete "${group.name}" as "Delete group only in the panel"?`,
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

  const handleCreationTypeTabChange = (_: SyntheticEvent, value: OneLinkTabType) => {
    if (value === 'single_link') {
      router.push('/links');
      return;
    }

    router.replace('/link-groups', { scroll: false });
  };

  const handleOpenActionsMenu = (event: MouseEvent<HTMLElement>, groupId: string) => {
    setActionsAnchorEl(event.currentTarget);
    setActiveActionGroupId(groupId);
  };

  const handleCloseActionsMenu = () => {
    setActionsAnchorEl(null);
  };

  const handleEditActiveGroup = () => {
    if (!activeActionGroup) {
      return;
    }

    handleCloseActionsMenu();
    router.push(`/link-groups/${encodeURIComponent(activeActionGroup.id)}/edit`);
  };

  const handleToggleAutoUpdateTtl = (groupId: string) => {
    setAutoUpdateTtlMap((previous) => {
      const isAutoUpdateEnabled = previous[groupId] ?? true;
      const nextEnabled = !isAutoUpdateEnabled;

      if (nextEnabled) {
        setTtlFrozenTimestampMap((frozenPrevious) => {
          const next = { ...frozenPrevious };
          delete next[groupId];
          return next;
        });
      } else {
        setTtlFrozenTimestampMap((frozenPrevious) => ({
          ...frozenPrevious,
          [groupId]: Date.now(),
        }));
      }

      return {
        ...previous,
        [groupId]: nextEnabled,
      };
    });
  };

  return (
    <ConsoleLayout title='OneLink Management'>
      <Box sx={ { maxWidth: 1600, mx: 'auto', px: { md: 4, xs: 2 }, py: 4, width: '100%' } }>
        <Stack spacing={ 2.5 }>
          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
            } }
          >
            <Stack spacing={ 1.25 }>
              <CreationTypeHeader activeTab='link_group' onTabChange={ handleCreationTypeTabChange } />
              <TextField
                fullWidth
                onChange={ (event) => setSearchKeyword(event.target.value) }
                placeholder='Search by group name, ID, template, status...'
                slotProps={ {
                  input: {
                    startAdornment: (
                      <InputAdornment position='start'>
                        <HugeIcon fallback={ Search } size={ 16 } />
                      </InputAdornment>
                    ),
                  },
                } }
                sx={ searchFieldSx }
                value={ searchKeyword }
              />
              <Stack direction='row' spacing={ 1 } sx={ { flexWrap: 'wrap', rowGap: 1 } }>
                <FilterChipSelect
                  label='Template'
                  onChange={ setTemplateFilter }
                  options={ templateFilterOptions }
                  value={ templateFilter }
                />
                <FilterChipSelect
                  label='Status'
                  onChange={ setStatusFilter }
                  options={ statusFilterOptions }
                  value={ statusFilter }
                />
              </Stack>
            </Stack>
          </Paper>

          <Box sx={ { display: 'flex', justifyContent: 'space-between', px: 0.5 } }>
            <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
              {`Showing ${pagedGroups.length} / ${totalFilteredGroups} records`}
            </Typography>
            {isLoading && (
              <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>Loading...</Typography>
            )}
          </Box>

          {error && <Alert severity='error'>{error}</Alert>}
          {actionMessage && <Alert severity='info'>{actionMessage}</Alert>}

          {!isLoading && pagedGroups.length === 0 ? (
            <Paper
              elevation={ 0 }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 4,
                textAlign: 'center',
              } }
            >
              <Typography sx={ { color: 'text.primary', fontSize: 16, fontWeight: 600 } }>
                No link groups found
              </Typography>
              <Typography sx={ { color: 'text.secondary', fontSize: 13, mt: 0.75 } }>
                Create a link group first, then search or manage groups here.
              </Typography>
            </Paper>
          ) : null}

          {pagedGroups.length > 0 ? (
            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
              <TableContainer>
                <Table sx={ { minWidth: 1100 } }>
                  <TableHead>
                    <TableRow>
                      <TableCell>Created</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Template</TableCell>
                      <TableCell>Planned</TableCell>
                      <TableCell>Success</TableCell>
                      <TableCell>Failed</TableCell>
                      <TableCell>TTL</TableCell>
                      <TableCell align='center'>Automatically update TTL</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedGroups.map((group) => (
                      <TableRow key={ group.id } hover>
                        <TableCell sx={ { whiteSpace: 'nowrap' } }>
                          <Box
                            component={ Link }
                            href={ `/link-groups/${encodeURIComponent(group.id)}` }
                            sx={ {
                              color: 'primary.main',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' },
                            } }
                          >
                            {formatCreatedAt(group.createdAt)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Stack
                            component={ Link }
                            href={ `/link-groups/${encodeURIComponent(group.id)}` }
                            spacing={ 0.25 }
                            sx={ {
                              color: 'inherit',
                              textDecoration: 'none',
                              '&:hover .group-name-link': { textDecoration: 'underline' },
                            } }
                          >
                            <Typography
                              className='group-name-link'
                              sx={ {
                                color: 'primary.main',
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: 'none',
                              } }
                            >
                              {group.name}
                            </Typography>
                            <Typography sx={ { color: 'text.secondary', fontSize: 12 } }>
                              {group.id}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{group.templateId}</TableCell>
                        <TableCell>{group.plannedCount}</TableCell>
                        <TableCell>{group.successCount}</TableCell>
                        <TableCell>{group.failedCount}</TableCell>
                        <TableCell sx={ { whiteSpace: 'nowrap' } }>
                          {formatRemainingTtl(
                            group.createdAt,
                            (autoUpdateTtlMap[group.id] ?? true) ? ttlNowTimestamp : (ttlFrozenTimestampMap[group.id] ?? ttlNowTimestamp),
                          )}
                        </TableCell>
                        <TableCell align='center'>
                          <Switch
                            checked={ autoUpdateTtlMap[group.id] ?? true }
                            inputProps={ {
                              'aria-label': `Automatically update TTL for ${group.name}`,
                            } }
                            onChange={ () => handleToggleAutoUpdateTtl(group.id) }
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            aria-label='Open row actions'
                            disabled={ activeGroupId === group.id }
                            onClick={ (event) => handleOpenActionsMenu(event, group.id) }
                            size='small'
                          >
                            <HugeIcon fallback={ MoreHorizontal } size={ 16 } />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : null}

          {totalPages > 1 ? (
            <Stack alignItems='center'>
              <Pagination
                color='primary'
                count={ totalPages }
                onChange={ (_, value) => setCurrentPage(value) }
                page={ currentPage }
                shape='rounded'
              />
            </Stack>
          ) : null}
          <Menu
            anchorEl={ actionsAnchorEl }
            onClose={ handleCloseActionsMenu }
            open={ isActionsMenuOpen }
          >
            <MenuItem
              disabled={ !activeActionGroup || Boolean(activeGroupId) }
              onClick={ handleEditActiveGroup }
            >
              Edit group
            </MenuItem>
            <Tooltip
              arrow
              placement='left'
              title='Deletes only the group record from this panel. Created links remain unchanged.'
            >
              <MenuItem
                disabled={ !activeActionGroup || Boolean(activeGroupId) }
                onClick={ () => {
                  if (!activeActionGroup) {
                    return;
                  }
                  handleCloseActionsMenu();
                  void handleDelete(activeActionGroup, 'local_only');
                } }
              >
                Delete group only in the panel
              </MenuItem>
            </Tooltip>
            <Tooltip
              arrow
              placement='left'
              title='Deletes the group locally and also tries deleting generated links in AppsFlyer.'
            >
              <MenuItem
                disabled={ !activeActionGroup || Boolean(activeGroupId) }
                onClick={ () => {
                  if (!activeActionGroup) {
                    return;
                  }
                  handleCloseActionsMenu();
                  void handleDelete(activeActionGroup, 'local_and_remote');
                } }
                sx={ { color: 'error.main' } }
              >
                Delete group and the links
              </MenuItem>
            </Tooltip>
          </Menu>
        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkGroupListPage;
