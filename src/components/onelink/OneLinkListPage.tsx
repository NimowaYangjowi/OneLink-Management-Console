/**
 * OneLink management page with search, filters, and CRUD actions for generated links.
 */
'use client';

import { CheckmarkCircle02Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import HugeIcon from '@/components/shared/HugeIcon';
import { type OneLinkCreationType, sanitizeOneLinkRecords, type OneLinkRecord } from '@/lib/onelinkLinksSchema';

const searchFieldSx = {
  '& .MuiOutlinedInput-root': {
    minHeight: 50,
    '& .MuiOutlinedInput-input': {
      fontSize: 14,
      px: 1.75,
      py: 1.75,
    },
    '& fieldset': {
      borderColor: 'divider',
    },
    '&:hover fieldset': {
      borderColor: 'divider',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: 1,
    },
    backgroundColor: 'background.paper',
    borderRadius: 0.5,
  },
};

type FilterChipOption<T extends string> = {
  label: string;
  value: T;
};

type FilterChipSelectProps<T extends string> = {
  label: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<FilterChipOption<T>>;
  value: T;
};

type OneLinkDeleteResponse = {
  deleted?: boolean;
  error?: string;
  remoteDeleted?: boolean;
};

type OneLinkCreateResponse = {
  error?: string;
};

type OneLinkDetailResponse = {
  error?: string;
  record?: OneLinkRecord;
  remote?: {
    oneLinkData?: Record<string, string>;
  };
};

function FilterChipSelect<T extends string>({
  label,
  onChange,
  options,
  value,
}: FilterChipSelectProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const selectedOption = options.find((option) => option.value === value);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        endIcon={
          <Typography component='span' sx={ { color: 'text.secondary', fontSize: 12, lineHeight: 1 } }>
            ▾
          </Typography>
        }
        onClick={ handleOpen }
        size='small'
        sx={ {
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 999,
          color: 'text.primary',
          fontSize: 13,
          fontWeight: 500,
          minHeight: 34,
          px: 1.25,
          py: 0.375,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            backgroundColor: 'action.hover',
            borderColor: 'text.disabled',
          },
        } }
      >
        {`${label}: ${selectedOption?.label ?? value}`}
      </Button>
      <Menu anchorEl={ anchorEl } onClose={ handleClose } open={ open }>
        {options.map((option) => (
          <MenuItem
            key={ option.value }
            onClick={ () => {
              onChange(option.value);
              handleClose();
            } }
            selected={ option.value === value }
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function formatCreatedAt(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return new Date(timestamp).toLocaleString();
}

function buildEditHref(record: OneLinkRecord): string {
  const routeSegment = record.creationType === 'link_group' ? 'link-group' : 'single-link';
  return `/create/${routeSegment}/${encodeURIComponent(record.id)}`;
}

function buildLongUrlPreview(templateId: string, oneLinkData: Record<string, string>): string {
  const query = new URLSearchParams(oneLinkData).toString();
  if (!query) {
    return `https://app.onelink.me/${templateId}`;
  }

  return `https://app.onelink.me/${templateId}?${query}`;
}

/**
 * OneLinkListPage
 *
 * Example usage:
 * <OneLinkListPage />
 */
function OneLinkListPage() {
  const [records, setRecords] = useState<OneLinkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeCreationTypeTab, setActiveCreationTypeTab] = useState<OneLinkCreationType>('single_link');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [copiedRecordId, setCopiedRecordId] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const [actionsRecordId, setActionsRecordId] = useState('');

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await fetch('/api/onelinks', {
        cache: 'no-store',
        method: 'GET',
      });
      const payload = (await response.json().catch(() => [])) as unknown;

      if (!response.ok) {
        setRecords([]);
        setLoadError('Failed to load OneLink records.');
        return;
      }

      setRecords(sanitizeOneLinkRecords(payload));
    } catch {
      setRecords([]);
      setLoadError('Failed to load OneLink records.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    setTemplateFilter('all');
  }, [activeCreationTypeTab]);

  const tabRecords = useMemo(
    () => records.filter((record) => record.creationType === activeCreationTypeTab),
    [activeCreationTypeTab, records],
  );

  const templateOptions = useMemo(
    () =>
      [...new Set(tabRecords.map((record) => record.templateId))]
        .filter(Boolean)
        .sort((first, second) => first.localeCompare(second)),
    [tabRecords],
  );

  const templateFilterOptions = useMemo<ReadonlyArray<FilterChipOption<string>>>(
    () => [
      { label: 'All templates', value: 'all' },
      ...templateOptions.map((templateId) => ({ label: templateId, value: templateId })),
    ],
    [templateOptions],
  );

  const filteredRecords = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return tabRecords.filter((record) => {
      if (templateFilter !== 'all' && record.templateId !== templateFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchSource = [
        record.linkName,
        record.shortLink,
        record.longUrl,
        record.templateId,
        record.mediaSource,
        record.campaignName,
        record.channel,
      ]
        .join(' ')
        .toLowerCase();

      return searchSource.includes(keyword);
    });
  }, [searchKeyword, tabRecords, templateFilter]);

  const activeActionRecord = useMemo(
    () => records.find((record) => record.id === actionsRecordId) || null,
    [actionsRecordId, records],
  );

  const isActionsMenuOpen = Boolean(actionsAnchorEl);

  const handleCopyShortLink = async (record: OneLinkRecord) => {
    try {
      await navigator.clipboard.writeText(record.shortLink);
      setCopiedRecordId(record.id);
      setTimeout(() => {
        setCopiedRecordId('');
      }, 1500);
    } catch {
      setCopiedRecordId('');
    }
  };

  const handleDeleteRecord = async (record: OneLinkRecord) => {
    if (activeRecordId) {
      return;
    }

    const confirmed = window.confirm(`Delete "${record.linkName}" from AppsFlyer and this console?`);
    if (!confirmed) {
      return;
    }

    setActiveRecordId(record.id);
    setActionError('');
    setActionSuccess('');

    try {
      const response = await fetch(`/api/onelinks/${encodeURIComponent(record.id)}`, {
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as OneLinkDeleteResponse | null;

      if (!response.ok) {
        setActionError(payload?.error || 'Failed to delete OneLink.');
        return;
      }

      setRecords((previous) => previous.filter((item) => item.id !== record.id));
      if (payload?.remoteDeleted === false) {
        setActionSuccess('Local record removed. AppsFlyer link was already deleted.');
      } else {
        setActionSuccess('OneLink has been deleted.');
      }
    } catch {
      setActionError('Failed to delete OneLink.');
    } finally {
      setActiveRecordId('');
    }
  };

  const handleDuplicateRecord = async (record: OneLinkRecord) => {
    if (activeRecordId) {
      return;
    }

    setActiveRecordId(record.id);
    setActionError('');
    setActionSuccess('');

    try {
      const detailResponse = await fetch(`/api/onelinks/${encodeURIComponent(record.id)}`, {
        cache: 'no-store',
        method: 'GET',
      });
      const detailPayload = (await detailResponse.json().catch(() => null)) as OneLinkDetailResponse | null;

      if (!detailResponse.ok || !detailPayload?.record) {
        setActionError(detailPayload?.error || 'Failed to load OneLink for duplication.');
        return;
      }

      const oneLinkData = detailPayload.remote?.oneLinkData || {};
      const createResponse = await fetch('/api/onelinks', {
        body: JSON.stringify({
          brandDomain: detailPayload.record.brandDomain,
          campaignName: oneLinkData.c || detailPayload.record.campaignName,
          channel: oneLinkData.af_channel || detailPayload.record.channel,
          creationType: detailPayload.record.creationType,
          linkName: `${detailPayload.record.linkName} (Copy)`.slice(0, 160),
          longUrlPreview: buildLongUrlPreview(detailPayload.record.templateId, oneLinkData),
          mediaSource: oneLinkData.pid || detailPayload.record.mediaSource,
          oneLinkData,
          shortLinkId: '',
          templateId: detailPayload.record.templateId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const createPayload = (await createResponse.json().catch(() => null)) as
        | OneLinkCreateResponse
        | OneLinkRecord
        | null;
      const createErrorMessage =
        createPayload &&
        typeof createPayload === 'object' &&
        'error' in createPayload &&
        typeof createPayload.error === 'string'
          ? createPayload.error
          : '';

      if (!createResponse.ok) {
        setActionError(createErrorMessage || 'Failed to duplicate OneLink.');
        return;
      }

      const [duplicatedRecord] = sanitizeOneLinkRecords([createPayload]);
      if (!duplicatedRecord) {
        setActionError('Duplicated OneLink response was invalid.');
        return;
      }

      setRecords((previous) => [duplicatedRecord, ...previous]);
      setActionSuccess(`"${record.linkName}" has been duplicated.`);
    } catch {
      setActionError('Failed to duplicate OneLink.');
    } finally {
      setActiveRecordId('');
    }
  };

  const handleOpenActionsMenu = (event: MouseEvent<HTMLButtonElement>, recordId: string) => {
    setActionsAnchorEl(event.currentTarget);
    setActionsRecordId(recordId);
  };

  const handleCloseActionsMenu = () => {
    setActionsAnchorEl(null);
    setActionsRecordId('');
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
              borderRadius: 0.75,
              p: 2,
            } }
          >
            <Stack spacing={ 1.25 }>
              <Stack
                alignItems='center'
                direction={ { md: 'row', xs: 'column' } }
                justifyContent='space-between'
                spacing={ 1 }
              >
                <Tabs
                  aria-label='OneLink type tabs'
                  onChange={ (_, value) => {
                    setActiveCreationTypeTab(value as OneLinkCreationType);
                  } }
                  sx={ {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    minHeight: 44,
                    width: { md: 'auto', xs: '100%' },
                    '& .MuiTab-root': {
                      fontSize: 13,
                      fontWeight: 600,
                      minHeight: 44,
                      px: 1.5,
                      textTransform: 'none',
                    },
                  } }
                  value={ activeCreationTypeTab }
                >
                  <Tab label='Single Link' value='single_link' />
                  <Tab label='Link Group' value='link_group' />
                </Tabs>
                <Button component={ Link } href='/create' size='small' variant='contained'>
                  Create OneLink
                </Button>
              </Stack>
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
              {`Showing ${filteredRecords.length} / ${tabRecords.length} records`}
            </Typography>
            {isLoading && (
              <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>Loading...</Typography>
            )}
          </Box>

          {loadError ? <Alert severity='error'>{loadError}</Alert> : null}
          {actionError ? <Alert severity='error'>{actionError}</Alert> : null}
          {actionSuccess ? <Alert severity='success'>{actionSuccess}</Alert> : null}

          {!isLoading && filteredRecords.length === 0 ? (
            <Paper
              elevation={ 0 }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0.75,
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

          {filteredRecords.length > 0 ? (
            <Paper elevation={ 0 } sx={ { border: '1px solid', borderColor: 'divider', borderRadius: 0.75 } }>
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
                    {filteredRecords.map((record) => (
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
              disabled={ !activeActionRecord || activeRecordId === activeActionRecord?.id }
              onClick={ () => {
                if (!activeActionRecord) {
                  return;
                }
                handleCloseActionsMenu();
                void handleDuplicateRecord(activeActionRecord);
              } }
            >
              Duplicate
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
