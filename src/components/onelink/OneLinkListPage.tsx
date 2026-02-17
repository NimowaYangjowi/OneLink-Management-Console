/**
 * OneLink management page with search, filters, and CRUD actions for generated links.
 */
'use client';

import { CheckmarkCircle02Icon, Copy01Icon } from '@hugeicons/core-free-icons';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
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
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import HugeIcon from '@/components/shared/HugeIcon';
import {
  sanitizeOneLinkRecords,
  type OneLinkCreationType,
  type OneLinkRecord,
} from '@/lib/onelinkLinksSchema';

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

type OneLinkDetailResponse = {
  error?: string;
  record?: OneLinkRecord;
  remote?: {
    expiry?: string;
    oneLinkData?: Record<string, string>;
    shortLinkId?: string;
    ttl?: string;
  };
};

type OneLinkUpdateResponse = {
  error?: string;
  record?: OneLinkRecord;
};

type OneLinkDeleteResponse = {
  deleted?: boolean;
  error?: string;
  remoteDeleted?: boolean;
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

function getCreationTypeLabel(type: OneLinkCreationType): string {
  if (type === 'link_group') {
    return 'Link group';
  }
  return 'Single link';
}

function formatCreatedAt(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return new Date(timestamp).toLocaleString();
}

function parseOneLinkDataJson(value: string): { error?: string; value?: Record<string, string> } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { error: 'OneLink data JSON is invalid.' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { error: 'OneLink data must be a JSON object.' };
  }

  const normalized: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(parsed as Record<string, unknown>)) {
    const normalizedKey = key.trim();
    if (!normalizedKey) {
      continue;
    }

    if (typeof rawValue === 'string') {
      normalized[normalizedKey] = rawValue;
      continue;
    }

    if (rawValue == null) {
      normalized[normalizedKey] = '';
      continue;
    }

    normalized[normalizedKey] = String(rawValue);
  }

  if (!normalized.pid?.trim()) {
    return { error: 'OneLink data must include pid (media source).' };
  }

  return { value: normalized };
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
  const [creationTypeFilter, setCreationTypeFilter] = useState<'all' | OneLinkCreationType>('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [copiedRecordId, setCopiedRecordId] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [isEditorSaving, setIsEditorSaving] = useState(false);
  const [editorError, setEditorError] = useState('');
  const [editingRecord, setEditingRecord] = useState<OneLinkRecord | null>(null);
  const [editorLinkName, setEditorLinkName] = useState('');
  const [editorBrandDomain, setEditorBrandDomain] = useState('');
  const [editorTtl, setEditorTtl] = useState('');
  const [editorOneLinkDataJson, setEditorOneLinkDataJson] = useState('{}');

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

  const templateOptions = useMemo(
    () =>
      [...new Set(records.map((record) => record.templateId))]
        .filter(Boolean)
        .sort((first, second) => first.localeCompare(second)),
    [records],
  );
  const creationTypeOptions: ReadonlyArray<FilterChipOption<'all' | OneLinkCreationType>> = [
    { label: 'All types', value: 'all' },
    { label: 'Single link', value: 'single_link' },
    { label: 'Link group', value: 'link_group' },
  ];
  const templateFilterOptions = useMemo<ReadonlyArray<FilterChipOption<string>>>(
    () => [
      { label: 'All templates', value: 'all' },
      ...templateOptions.map((templateId) => ({ label: templateId, value: templateId })),
    ],
    [templateOptions],
  );

  const filteredRecords = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return records.filter((record) => {
      if (creationTypeFilter !== 'all' && record.creationType !== creationTypeFilter) {
        return false;
      }
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
        getCreationTypeLabel(record.creationType),
      ]
        .join(' ')
        .toLowerCase();

      return searchSource.includes(keyword);
    });
  }, [creationTypeFilter, records, searchKeyword, templateFilter]);

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

  const closeEditor = () => {
    setIsEditorOpen(false);
    setIsEditorLoading(false);
    setIsEditorSaving(false);
    setEditorError('');
    setEditorLinkName('');
    setEditorBrandDomain('');
    setEditorTtl('');
    setEditorOneLinkDataJson('{}');
    setEditingRecord(null);
  };

  const handleOpenEditor = async (record: OneLinkRecord) => {
    setIsEditorOpen(true);
    setIsEditorLoading(true);
    setEditorError('');
    setEditingRecord(record);
    setEditorLinkName(record.linkName);
    setEditorBrandDomain(record.brandDomain || '');
    setEditorTtl('');
    setEditorOneLinkDataJson(
      JSON.stringify(
        {
          af_channel: record.channel || '',
          c: record.campaignName || '',
          pid: record.mediaSource || '',
        },
        null,
        2,
      ),
    );

    try {
      const response = await fetch(`/api/onelinks/${encodeURIComponent(record.id)}`, {
        cache: 'no-store',
        method: 'GET',
      });
      const payload = (await response.json().catch(() => null)) as OneLinkDetailResponse | null;

      if (!response.ok) {
        setEditorError(payload?.error || 'Failed to load OneLink detail.');
        return;
      }

      const remoteData = payload?.remote?.oneLinkData || {};
      setEditorOneLinkDataJson(
        JSON.stringify(
          Object.keys(remoteData).length
            ? remoteData
            : {
                af_channel: record.channel || '',
                c: record.campaignName || '',
                pid: record.mediaSource || '',
              },
          null,
          2,
        ),
      );
      setEditorTtl(payload?.remote?.ttl || '');
    } catch {
      setEditorError('Failed to load OneLink detail.');
    } finally {
      setIsEditorLoading(false);
    }
  };

  const handleSaveEditor = async () => {
    if (!editingRecord || isEditorSaving || isEditorLoading) {
      return;
    }

    const parsedData = parseOneLinkDataJson(editorOneLinkDataJson);
    if (!parsedData.value) {
      setEditorError(parsedData.error || 'OneLink data JSON is invalid.');
      return;
    }

    setIsEditorSaving(true);
    setEditorError('');

    try {
      const response = await fetch(`/api/onelinks/${encodeURIComponent(editingRecord.id)}`, {
        body: JSON.stringify({
          brandDomain: editorBrandDomain,
          linkName: editorLinkName,
          oneLinkData: parsedData.value,
          ttl: editorTtl,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
      });
      const payload = (await response.json().catch(() => null)) as OneLinkUpdateResponse | null;

      if (!response.ok) {
        setEditorError(payload?.error || 'Failed to update OneLink.');
        return;
      }

      if (payload?.record) {
        setRecords((previous) =>
          previous.map((item) => (item.id === editingRecord.id ? payload.record || item : item)),
        );
      } else {
        await loadRecords();
      }

      setActionSuccess('OneLink has been updated.');
      setActionError('');
      closeEditor();
    } catch {
      setEditorError('Failed to update OneLink.');
    } finally {
      setIsEditorSaving(false);
    }
  };

  const handleDeleteRecord = async (record: OneLinkRecord) => {
    if (activeRecordId || isEditorSaving) {
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
              <Stack
                alignItems='center'
                direction={ { md: 'row', xs: 'column' } }
                justifyContent='space-between'
                spacing={ 1 }
              >
                <Stack direction='row' spacing={ 1 } sx={ { flexWrap: 'wrap', rowGap: 1 } }>
                  <FilterChipSelect
                    label='Type'
                    onChange={ setCreationTypeFilter }
                    options={ creationTypeOptions }
                    value={ creationTypeFilter }
                  />
                  <FilterChipSelect
                    label='Template'
                    onChange={ setTemplateFilter }
                    options={ templateFilterOptions }
                    value={ templateFilter }
                  />
                </Stack>
                <Button component={ Link } href='/create' size='small' variant='contained'>
                  Create OneLink
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Box sx={ { display: 'flex', justifyContent: 'space-between', px: 0.5 } }>
            <Typography sx={ { color: 'text.secondary', fontSize: 13 } }>
              {`Showing ${filteredRecords.length} / ${records.length} records`}
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
                <Table sx={ { minWidth: 1200 } }>
                  <TableHead>
                    <TableRow>
                      <TableCell>Created</TableCell>
                      <TableCell>Link Name</TableCell>
                      <TableCell>Template</TableCell>
                      <TableCell>Type</TableCell>
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
                        <TableCell>
                          <Chip
                            label={ getCreationTypeLabel(record.creationType) }
                            size='small'
                            sx={ {
                              borderRadius: 0.5,
                              fontSize: 12,
                              fontWeight: 500,
                            } }
                            variant='outlined'
                          />
                        </TableCell>
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
                          <Stack direction='row' justifyContent='flex-end' spacing={ 0.5 }>
                            <Button
                              disabled={ activeRecordId === record.id || isEditorSaving }
                              onClick={ () => {
                                void handleOpenEditor(record);
                              } }
                              size='small'
                            >
                              Manage
                            </Button>
                            <Button
                              color='error'
                              disabled={ activeRecordId === record.id || isEditorSaving }
                              onClick={ () => {
                                void handleDeleteRecord(record);
                              } }
                              size='small'
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : null}
        </Stack>
      </Box>

      <Dialog fullWidth maxWidth='md' onClose={ closeEditor } open={ isEditorOpen }>
        <DialogTitle>Manage OneLink</DialogTitle>
        <DialogContent dividers>
          {isEditorLoading ? (
            <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>Loading details...</Typography>
          ) : (
            <Stack spacing={ 2 }>
              {editorError ? <Alert severity='error'>{editorError}</Alert> : null}
              <TextField
                fullWidth
                label='Link Name'
                onChange={ (event) => setEditorLinkName(event.target.value) }
                value={ editorLinkName }
              />
              <TextField
                fullWidth
                helperText='Leave empty to use the default OneLink domain.'
                label='Brand Domain'
                onChange={ (event) => setEditorBrandDomain(event.target.value) }
                placeholder='example.com'
                value={ editorBrandDomain }
              />
              <TextField
                fullWidth
                helperText='Optional. Example: 10m, 20h, 14d'
                label='TTL'
                onChange={ (event) => setEditorTtl(event.target.value) }
                value={ editorTtl }
              />
              <TextField
                fullWidth
                helperText='JSON object for OneLink payload (pid is required).'
                label='OneLink Data JSON'
                minRows={ 12 }
                multiline
                onChange={ (event) => setEditorOneLinkDataJson(event.target.value) }
                value={ editorOneLinkDataJson }
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={ closeEditor }>Cancel</Button>
          <Button
            disabled={ isEditorLoading || isEditorSaving || !editingRecord }
            onClick={ () => {
              void handleSaveEditor();
            } }
            variant='contained'
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </ConsoleLayout>
  );
}

export default OneLinkListPage;
