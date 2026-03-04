/**
 * OneLink management page with search, filters, and row-level actions for generated links.
 */
'use client';

import { CheckmarkCircle02Icon, Copy01Icon } from '@hugeicons/core-free-icons';
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
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import CreationTypeHeader from '@/components/onelink/list/CreationTypeHeader';
import FilterChipSelect from '@/components/onelink/list/FilterChipSelect';
import type { FilterChipOption, OneLinkTabType } from '@/components/onelink/list/types';
import { useOneLinkRowActions } from '@/components/onelink/list/useOneLinkRowActions';
import {
  buildEditHref,
  formatCreatedAt,
} from '@/components/onelink/list/utils';
import { filledFieldSx } from '@/components/onelink/stitched/fieldStyles';
import HugeIcon from '@/components/shared/HugeIcon';
import { sanitizeOneLinkRecords, type OneLinkRecord } from '@/lib/onelinkLinksSchema';

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 250;
const searchFieldSx = filledFieldSx;

type OneLinkListPageProps = {
  initialCreationType: OneLinkTabType;
};

type OneLinkListResponse = {
  error?: string;
  page?: number;
  pageSize?: number;
  records?: unknown;
  templateOptions?: unknown;
  total?: number;
  totalPages?: number;
};

/**
 * OneLinkListPage
 *
 * Example usage:
 * <OneLinkListPage initialCreationType='single_link' />
 */
function OneLinkListPage({ initialCreationType }: OneLinkListPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [records, setRecords] = useState<OneLinkRecord[]>([]);
  const [templateOptions, setTemplateOptions] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('');
  const [activeCreationTypeTab, setActiveCreationTypeTab] = useState<OneLinkTabType>(initialCreationType);
  const [templateFilter, setTemplateFilter] = useState('all');

  const {
    activeActionRecord,
    activeRecordId,
    actionsAnchorEl,
    copiedRecordId,
    handleCloseActionsMenu,
    handleCopyShortLink,
    handleDeleteRecord,
    handleDuplicateRecord,
    handleOpenActionsMenu,
    isActionsMenuOpen,
  } = useOneLinkRowActions({
    records,
    setActionError,
    setActionSuccess,
    setRecords,
  });

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
  }, [activeCreationTypeTab, debouncedSearchKeyword, templateFilter]);

  useEffect(() => {
    setTemplateFilter('all');
  }, [activeCreationTypeTab]);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const query = new URLSearchParams();
      query.set('page', String(currentPage));
      query.set('pageSize', String(DEFAULT_PAGE_SIZE));
      query.set('creationType', activeCreationTypeTab);

      if (debouncedSearchKeyword) {
        query.set('q', debouncedSearchKeyword);
      }
      if (templateFilter !== 'all') {
        query.set('templateId', templateFilter);
      }

      const response = await fetch(`/api/onelinks?${query.toString()}`, {
        method: 'GET',
      });
      const payload = (await response.json().catch(() => null)) as OneLinkListResponse | null;

      if (!response.ok || !payload) {
        setRecords([]);
        setTemplateOptions([]);
        setTotalRecords(0);
        setTotalPages(1);
        setLoadError(payload?.error || 'Failed to load OneLink records.');
        return;
      }

      const nextRecords = sanitizeOneLinkRecords(payload.records);
      const nextTemplateOptions = Array.isArray(payload.templateOptions)
        ? payload.templateOptions
            .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
            .map((value) => value.trim())
        : [];

      setRecords(nextRecords);
      setTemplateOptions(nextTemplateOptions);
      setTotalRecords(typeof payload.total === 'number' && Number.isFinite(payload.total) ? Math.max(0, payload.total) : 0);
      setTotalPages(
        typeof payload.totalPages === 'number' && Number.isFinite(payload.totalPages)
          ? Math.max(1, Math.trunc(payload.totalPages))
          : 1,
      );

      if (typeof payload.page === 'number' && Number.isFinite(payload.page)) {
        const normalizedPage = Math.max(1, Math.trunc(payload.page));
        if (normalizedPage !== currentPage) {
          setCurrentPage(normalizedPage);
        }
      }
    } catch {
      setRecords([]);
      setTemplateOptions([]);
      setTotalRecords(0);
      setTotalPages(1);
      setLoadError('Failed to load OneLink records.');
    } finally {
      setIsLoading(false);
    }
  }, [activeCreationTypeTab, currentPage, debouncedSearchKeyword, templateFilter]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (!actionSuccess && !actionError) {
      return;
    }

    void loadRecords();
  }, [actionError, actionSuccess, loadRecords]);

  useEffect(() => {
    if (templateFilter === 'all') {
      return;
    }

    if (!templateOptions.includes(templateFilter)) {
      setTemplateFilter('all');
    }
  }, [templateFilter, templateOptions]);

  const templateFilterOptions = useMemo<ReadonlyArray<FilterChipOption<string>>>(
    () => [
      { label: 'All templates', value: 'all' },
      ...templateOptions.map((templateId) => ({ label: templateId, value: templateId })),
    ],
    [templateOptions],
  );

  const handleCreationTypeTabChange = (_: SyntheticEvent, value: OneLinkTabType) => {
    if (value === 'link_group') {
      router.push('/link-groups');
      return;
    }

    setActiveCreationTypeTab(value);

    const nextParams = new URLSearchParams(window.location.search);
    nextParams.delete('type');

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
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
              <CreationTypeHeader activeTab={ activeCreationTypeTab } onTabChange={ handleCreationTypeTabChange } />
              <TextField
                fullWidth
                onChange={ (event) => setSearchKeyword(event.target.value) }
                placeholder='Search by link name, URL, campaign, template...'
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
              </Stack>
            </Stack>
          </Paper>

          <Box sx={ { display: 'flex', justifyContent: 'space-between', px: 0.5 } }>
            <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
              {`Showing ${records.length} / ${totalRecords} records`}
            </Typography>
            {isLoading && (
              <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>Loading...</Typography>
            )}
          </Box>

          {loadError ? <Alert severity='error'>{loadError}</Alert> : null}
          {actionError ? <Alert severity='error'>{actionError}</Alert> : null}
          {actionSuccess ? <Alert severity='success'>{actionSuccess}</Alert> : null}

          {!isLoading && records.length === 0 ? (
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
                No links found
              </Typography>
              <Typography sx={ { color: 'text.secondary', fontSize: 13, mt: 0.75 } }>
                Create OneLink first, then search or manage records here.
              </Typography>
            </Paper>
          ) : null}

          {records.length > 0 ? (
            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 1 } }>
              <TableContainer>
                <Table sx={ { minWidth: 1100 } }>
                  <TableHead>
                    <TableRow>
                      <TableCell>Created</TableCell>
                      <TableCell>Link Name</TableCell>
                      <TableCell>Template</TableCell>
                      <TableCell>Media Source</TableCell>
                      <TableCell>Campaign</TableCell>
                      <TableCell>Short Link</TableCell>
                      <TableCell align='center'>Copy</TableCell>
                      <TableCell align='right'>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={ record.id } hover>
                        <TableCell sx={ { whiteSpace: 'nowrap' } }>{formatCreatedAt(record.createdAt)}</TableCell>
                        <TableCell>{record.linkName}</TableCell>
                        <TableCell>{record.templateId}</TableCell>
                        <TableCell>{record.mediaSource || '-'}</TableCell>
                        <TableCell>{record.campaignName || '-'}</TableCell>
                        <TableCell sx={ { maxWidth: 300 } }>
                          <Box
                            component='a'
                            href={ record.shortLink }
                            rel='noreferrer'
                            sx={ {
                              color: 'primary.main',
                              display: 'inline-block',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textDecoration: 'none',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              '&:hover': { textDecoration: 'underline' },
                            } }
                            target='_blank'
                          >
                            {record.shortLink}
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          <IconButton
                            aria-label='Copy short link'
                            onClick={ () => {
                              void handleCopyShortLink(record);
                            } }
                            size='small'
                          >
                            <HugeIcon
                              color='currentColor'
                              icon={ copiedRecordId === record.id ? CheckmarkCircle02Icon : Copy01Icon }
                              size={ 16 }
                            />
                          </IconButton>
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            aria-label='Open row actions'
                            disabled={ activeRecordId === record.id }
                            onClick={ (event) => {
                              handleOpenActionsMenu(event, record.id);
                            } }
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
            {activeActionRecord ? (
              <MenuItem
                component={ Link }
                href={ buildEditHref(activeActionRecord) }
                onClick={ handleCloseActionsMenu }
              >
                Manage
              </MenuItem>
            ) : null}
            <MenuItem
              disabled={
                !activeActionRecord
                || activeRecordId === activeActionRecord?.id
                || activeActionRecord.creationType === 'link_group'
              }
              onClick={ () => {
                if (!activeActionRecord) {
                  return;
                }
                handleCloseActionsMenu();
                void handleDuplicateRecord(activeActionRecord);
              } }
            >
              Duplicate (Single Only)
            </MenuItem>
            <MenuItem
              disabled={ !activeActionRecord || activeRecordId === activeActionRecord?.id }
              onClick={ () => {
                if (!activeActionRecord) {
                  return;
                }
                handleCloseActionsMenu();
                void handleDeleteRecord(activeActionRecord);
              } }
              sx={ { color: 'error.main' } }
            >
              Delete
            </MenuItem>
          </Menu>
        </Stack>
      </Box>
    </ConsoleLayout>
  );
}

export default OneLinkListPage;
