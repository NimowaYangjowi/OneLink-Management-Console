/**
 * OneLink management page with search, filters, and row-level actions for generated links.
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
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import FilterChipSelect from '@/components/onelink/list/FilterChipSelect';
import type { FilterChipOption, OneLinkTabType } from '@/components/onelink/list/types';
import { useOneLinkRowActions } from '@/components/onelink/list/useOneLinkRowActions';
import {
  buildEditHref,
  formatCreatedAt,
  getCreationTypeFromSearchParams,
} from '@/components/onelink/list/utils';
import { filledFieldSx } from '@/components/onelink/stitched/fieldStyles';
import HugeIcon from '@/components/shared/HugeIcon';
import { sanitizeOneLinkRecords, type OneLinkRecord } from '@/lib/onelinkLinksSchema';

const searchFieldSx = filledFieldSx;

/**
 * OneLinkListPage
 *
 * Example usage:
 * <OneLinkListPage />
 */
function OneLinkListPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<OneLinkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeCreationTypeTab, setActiveCreationTypeTab] = useState<OneLinkTabType>(
    getCreationTypeFromSearchParams(searchParams),
  );
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
    setActiveCreationTypeTab(getCreationTypeFromSearchParams(searchParams));
  }, [searchParams]);

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

  const handleCreationTypeTabChange = (_: SyntheticEvent, value: OneLinkTabType) => {
    setActiveCreationTypeTab(value);

    const nextParams = new URLSearchParams(searchParams.toString());
    if (value === 'link_group') {
      nextParams.set('type', 'link_group');
    } else {
      nextParams.delete('type');
    }

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
              <Stack
                alignItems='center'
                direction={ { md: 'row', xs: 'column' } }
                justifyContent='space-between'
                spacing={ 1 }
              >
                <Tabs
                  aria-label='OneLink type tabs'
                  onChange={ handleCreationTypeTabChange }
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
                <Button
                  component={ Link }
                  href='/create'
                  variant='contained'
                >
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

          {filteredRecords.length > 0 ? (
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
