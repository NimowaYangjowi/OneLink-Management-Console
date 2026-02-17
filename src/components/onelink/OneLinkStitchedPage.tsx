/**
 * OneLink creation page with live preview and settings-driven autocomplete fields.
 */
'use client';

import {
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  Image02Icon,
  QrCodeIcon,
} from '@hugeicons/core-free-icons';
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import HugeIcon from '@/components/shared/HugeIcon';
import {
  type OneLinkCreationType,
  type OneLinkRecord,
  validateOneLinkRedirectUrl,
} from '@/lib/onelinkLinksSchema';
import { useSettings } from '@/lib/providers/SettingsContext';

type ParameterRow = {
  id: number;
  key: string;
  value: string;
};

type OneLinkStitchedPageProps = {
  creationType?: OneLinkCreationType;
  createActionLabel?: string;
  mode?: 'create' | 'edit';
  recordId?: string;
};

type OneLinkDetailResponse = {
  error?: string;
  record?: OneLinkRecord;
  remote?: {
    oneLinkData?: Record<string, string>;
    shortLinkId?: string;
    ttl?: string;
  };
};

type OneLinkUpdateResponse = {
  error?: string;
  record?: OneLinkRecord;
};

const MAPPED_ONELINK_FIELDS = new Set([
  'pid',
  'c',
  'af_adset',
  'af_ad',
  'af_channel',
  'af_dp',
  'af_web_dp',
  'af_android_url',
  'af_ios_url',
  'af_force_deeplink',
  'is_retargeting',
  'af_og_title',
  'af_og_description',
  'af_og_image',
]);

function toBooleanFlag(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() || '';
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

const filledFieldSx = {
  '& .MuiOutlinedInput-root': {
    '& .MuiOutlinedInput-input': {
      fontSize: 14,
      py: 2,
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
    '&.Mui-error fieldset': {
      borderColor: 'error.main',
    },
    '&.Mui-error:hover fieldset': {
      borderColor: 'error.main',
    },
    '&.Mui-error.Mui-focused fieldset': {
      borderColor: 'error.main',
      borderWidth: 1,
    },
    backgroundColor: 'background.default',
    borderRadius: 0.5,
  },
};

const plainFieldSx = {
  ...filledFieldSx,
  '& .MuiOutlinedInput-root': {
    ...filledFieldSx['& .MuiOutlinedInput-root'],
    backgroundColor: 'background.paper',
  },
};

function OneLinkStitchedPage({
  creationType = 'single_link',
  createActionLabel = 'Create Link',
  mode = 'create',
  recordId,
}: OneLinkStitchedPageProps) {
  const { settings } = useSettings();
  const isEditMode = mode === 'edit';

  const [templateId, setTemplateId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [deepLinkUri, setDeepLinkUri] = useState('');
  const [desktopFallbackUrl, setDesktopFallbackUrl] = useState('');
  const [iosFallbackUrl, setIosFallbackUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [shortLinkId, setShortLinkId] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [dismissedAutoBrandDomainTemplateId, setDismissedAutoBrandDomainTemplateId] = useState('');
  const [mediaSource, setMediaSource] = useState<string>('');
  const [adSet, setAdSet] = useState('');
  const [adName, setAdName] = useState('');
  const [channel, setChannel] = useState('');
  const [forceDeeplink, setForceDeeplink] = useState(false);
  const [isRetargeting, setIsRetargeting] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [parameters, setParameters] = useState<ParameterRow[]>([
    { id: 1, key: '', value: '' },
    { id: 2, key: '', value: '' },
  ]);
  const [playStoreFallbackUrl, setPlayStoreFallbackUrl] = useState('');
  const [ttl, setTtl] = useState('');
  const [createFeedback, setCreateFeedback] = useState<{ message: string; status: 'error' | 'success' } | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [showRequiredValidation, setShowRequiredValidation] = useState(false);
  const [isInitialLoadPending, setIsInitialLoadPending] = useState(isEditMode);

  const resolvedTemplateId = useMemo(() => {
    const normalized = templateId.trim();
    if (normalized) {
      return normalized;
    }
    if (settings.templateIds.length === 1) {
      return settings.templateIds[0];
    }
    return '';
  }, [settings.templateIds, templateId]);
  const activeTemplateId = useMemo(() => resolvedTemplateId || '5whu', [resolvedTemplateId]);
  const brandDomainOptions = useMemo(
    () => (resolvedTemplateId ? settings.templateBrandedDomains[resolvedTemplateId] ?? [] : []),
    [resolvedTemplateId, settings.templateBrandedDomains],
  );
  const resolvedBrandDomain = useMemo(() => {
    if (!resolvedTemplateId) {
      return '';
    }
    if (resolvedTemplateId === dismissedAutoBrandDomainTemplateId) {
      if (brandDomain && brandDomainOptions.includes(brandDomain)) {
        return brandDomain;
      }
      return '';
    }
    if (brandDomainOptions.length === 1) {
      return brandDomainOptions[0];
    }
    if (brandDomain && brandDomainOptions.includes(brandDomain)) {
      return brandDomain;
    }
    return '';
  }, [brandDomain, brandDomainOptions, dismissedAutoBrandDomainTemplateId, resolvedTemplateId]);
  const linkNameOptions = useMemo(() => settings.presets.link_name, [settings.presets.link_name]);
  const shortLinkIdOptions = useMemo(() => settings.presets.shortlink_id, [settings.presets.shortlink_id]);
  const mediaSourceOptions = useMemo(() => settings.presets.pid, [settings.presets.pid]);
  const campaignOptions = useMemo(() => settings.presets.c, [settings.presets.c]);
  const adSetOptions = useMemo(() => settings.presets.af_adset, [settings.presets.af_adset]);
  const adNameOptions = useMemo(() => settings.presets.af_ad, [settings.presets.af_ad]);
  const channelOptions = useMemo(() => settings.presets.af_channel, [settings.presets.af_channel]);
  const deepLinkUriOptions = useMemo(() => settings.presets.af_dp, [settings.presets.af_dp]);
  const androidFallbackOptions = useMemo(
    () => settings.presets.af_android_url,
    [settings.presets.af_android_url],
  );
  const iosFallbackOptions = useMemo(() => settings.presets.af_ios_url, [settings.presets.af_ios_url]);
  const desktopFallbackOptions = useMemo(() => settings.presets.af_web_dp, [settings.presets.af_web_dp]);
  const customParameterKeyOptions = useMemo(
    () => settings.presets.custom_param_key,
    [settings.presets.custom_param_key],
  );
  const customParameterValueOptions = useMemo(
    () => settings.presets.custom_param_value,
    [settings.presets.custom_param_value],
  );
  const ogTitleOptions = useMemo(() => settings.presets.af_og_title, [settings.presets.af_og_title]);
  const ogDescriptionOptions = useMemo(
    () => settings.presets.af_og_description,
    [settings.presets.af_og_description],
  );
  const ogImageOptions = useMemo(() => settings.presets.af_og_image, [settings.presets.af_og_image]);

  useEffect(() => {
    if (!isEditMode) {
      setIsInitialLoadPending(false);
      return;
    }

    if (!recordId) {
      setCreateFeedback({
        message: 'Missing record ID for edit mode.',
        status: 'error',
      });
      setIsInitialLoadPending(false);
      return;
    }

    let isMounted = true;

    const loadOneLinkForEdit = async () => {
      setIsInitialLoadPending(true);
      setCreateFeedback(null);

      try {
        const response = await fetch(`/api/onelinks/${encodeURIComponent(recordId)}`, {
          cache: 'no-store',
          method: 'GET',
        });
        const payload = (await response.json().catch(() => null)) as OneLinkDetailResponse | null;
        if (!isMounted) {
          return;
        }

        if (!response.ok || !payload?.record) {
          setCreateFeedback({
            message: payload?.error || 'Failed to load OneLink for editing.',
            status: 'error',
          });
          return;
        }

        const record = payload.record;
        const remoteData = payload.remote?.oneLinkData || {};
        const customRows = Object.entries(remoteData)
          .filter(([key]) => !MAPPED_ONELINK_FIELDS.has(key))
          .map(([key, value], index) => ({
            id: index + 1,
            key,
            value,
          }));

        setTemplateId(record.templateId);
        setLinkName(record.linkName);
        setBrandDomain(record.brandDomain || '');
        setDismissedAutoBrandDomainTemplateId('');
        setShortLinkId(payload.remote?.shortLinkId || '');
        setMediaSource(remoteData.pid || record.mediaSource || '');
        setCampaignName(remoteData.c || record.campaignName || '');
        setAdSet(remoteData.af_adset || '');
        setAdName(remoteData.af_ad || '');
        setChannel(remoteData.af_channel || record.channel || '');
        setDeepLinkUri(remoteData.af_dp || '');
        setDesktopFallbackUrl(remoteData.af_web_dp || '');
        setPlayStoreFallbackUrl(remoteData.af_android_url || '');
        setIosFallbackUrl(remoteData.af_ios_url || '');
        setForceDeeplink(toBooleanFlag(remoteData.af_force_deeplink));
        setIsRetargeting(toBooleanFlag(remoteData.is_retargeting));
        setOgTitle(remoteData.af_og_title || '');
        setOgDescription(remoteData.af_og_description || '');
        setOgImage(remoteData.af_og_image || '');
        setTtl(payload.remote?.ttl || '');
        setParameters(
          customRows.length > 0
            ? customRows
            : [
                { id: 1, key: '', value: '' },
                { id: 2, key: '', value: '' },
              ],
        );
      } catch {
        if (!isMounted) {
          return;
        }
        setCreateFeedback({
          message: 'Failed to load OneLink for editing.',
          status: 'error',
        });
      } finally {
        if (isMounted) {
          setIsInitialLoadPending(false);
        }
      }
    };

    void loadOneLinkForEdit();

    return () => {
      isMounted = false;
    };
  }, [isEditMode, recordId]);

  const shortLink = useMemo(() => {
    const resolvedShortLinkId = shortLinkId.trim() || 'short-link-id';
    return `https://go.onelink.me/${activeTemplateId.toLowerCase()}/${encodeURIComponent(resolvedShortLinkId)}`;
  }, [activeTemplateId, shortLinkId]);

  const oneLinkData = useMemo(() => {
    const payload: Record<string, string> = {};

    if (mediaSource.trim()) {
      payload.pid = mediaSource.trim();
    }

    if (campaignName.trim()) {
      payload.c = campaignName.trim().replaceAll(' ', '_');
    }

    if (adSet.trim()) {
      payload.af_adset = adSet.trim();
    }

    if (adName.trim()) {
      payload.af_ad = adName.trim();
    }

    if (channel.trim()) {
      payload.af_channel = channel.trim();
    }

    if (deepLinkUri.trim()) {
      payload.af_dp = deepLinkUri.trim();
    }

    if (desktopFallbackUrl.trim()) {
      payload.af_web_dp = desktopFallbackUrl.trim();
    }

    if (playStoreFallbackUrl.trim()) {
      payload.af_android_url = playStoreFallbackUrl.trim();
    }

    if (iosFallbackUrl.trim()) {
      payload.af_ios_url = iosFallbackUrl.trim();
    }

    if (forceDeeplink) {
      payload.af_force_deeplink = 'true';
    }

    if (isRetargeting) {
      payload.is_retargeting = 'true';
    }

    if (ogTitle.trim()) {
      payload.af_og_title = ogTitle.trim();
    }

    if (ogDescription.trim()) {
      payload.af_og_description = ogDescription.trim();
    }

    if (ogImage.trim()) {
      payload.af_og_image = ogImage.trim();
    }

    parameters.forEach((param) => {
      const key = param.key.trim();
      const value = param.value.trim();
      if (key && value) {
        payload[key] = value;
      }
    });

    return payload;
  }, [
    adName,
    adSet,
    campaignName,
    channel,
    deepLinkUri,
    desktopFallbackUrl,
    forceDeeplink,
    iosFallbackUrl,
    isRetargeting,
    mediaSource,
    ogDescription,
    ogImage,
    ogTitle,
    parameters,
    playStoreFallbackUrl,
  ]);

  const generatedLongUrl = useMemo(() => {
    const queryString = new URLSearchParams(oneLinkData).toString();
    return queryString
      ? `https://app.onelink.me/${activeTemplateId}?${queryString}`
      : `https://app.onelink.me/${activeTemplateId}`;
  }, [activeTemplateId, oneLinkData]);
  const requiredLinkName = linkName.trim();
  const requiredTemplateId = resolvedTemplateId.trim();
  const requiredMediaSource = mediaSource.trim();
  const hasMissingRequiredField =
    !requiredLinkName || !requiredTemplateId || !requiredMediaSource;
  const androidFallbackValidation = useMemo(
    () => validateOneLinkRedirectUrl(playStoreFallbackUrl, 'Android Mobile Redirection URL'),
    [playStoreFallbackUrl],
  );
  const iosFallbackValidation = useMemo(
    () => validateOneLinkRedirectUrl(iosFallbackUrl, 'iOS Mobile Redirection URL'),
    [iosFallbackUrl],
  );
  const desktopFallbackValidation = useMemo(
    () => validateOneLinkRedirectUrl(desktopFallbackUrl, 'Desktop Fallback URL'),
    [desktopFallbackUrl],
  );
  const hasInvalidRedirectUrl =
    !androidFallbackValidation.valid
    || !iosFallbackValidation.valid
    || !desktopFallbackValidation.valid;
  const hasLinkNameError = showRequiredValidation && !requiredLinkName;
  const hasTemplateIdError = showRequiredValidation && !requiredTemplateId;
  const hasMediaSourceError = showRequiredValidation && !requiredMediaSource;
  const hasAndroidFallbackUrlError = showRequiredValidation && !androidFallbackValidation.valid;
  const hasIosFallbackUrlError = showRequiredValidation && !iosFallbackValidation.valid;
  const hasDesktopFallbackUrlError = showRequiredValidation && !desktopFallbackValidation.valid;

  const qrCodeImageUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=640x640&data=${encodeURIComponent(shortLink)}`,
    [shortLink],
  );

  const handleAddParameter = () => {
    const nextId = parameters.length ? Math.max(...parameters.map((param) => param.id)) + 1 : 1;
    setParameters((previous) => [...previous, { id: nextId, key: '', value: '' }]);
  };

  const handleCopyShortLink = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1800);
    } catch {
      setIsCopied(false);
    }
  };

  const handleCreateLink = async () => {
    if (isCreating || isInitialLoadPending) {
      return;
    }

    if (hasMissingRequiredField || hasInvalidRedirectUrl) {
      setShowRequiredValidation(true);
      setCreateFeedback(null);
      return;
    }

    setShowRequiredValidation(false);
    setIsCreating(true);
    setCreateFeedback(null);

    try {
      if (isEditMode) {
        if (!recordId) {
          setCreateFeedback({
            message: 'Missing record ID for update.',
            status: 'error',
          });
          return;
        }

        const response = await fetch(`/api/onelinks/${encodeURIComponent(recordId)}`, {
          body: JSON.stringify({
            brandDomain: resolvedBrandDomain,
            linkName: requiredLinkName,
            oneLinkData,
            ttl,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        });
        const payload = (await response.json().catch(() => null)) as OneLinkUpdateResponse | null;

        if (!response.ok) {
          setCreateFeedback({
            message: payload?.error || 'Failed to update OneLink.',
            status: 'error',
          });
          return;
        }

        if (payload?.record) {
          setBrandDomain(payload.record.brandDomain);
          setLinkName(payload.record.linkName);
        }

        setCreateFeedback({
          message: 'OneLink has been updated successfully.',
          status: 'success',
        });
      } else {
        const response = await fetch('/api/onelinks', {
          body: JSON.stringify({
            brandDomain: resolvedBrandDomain,
            campaignName,
            channel,
            creationType,
            linkName: requiredLinkName,
            longUrlPreview: generatedLongUrl,
            mediaSource: requiredMediaSource,
            oneLinkData,
            shortLinkId,
            templateId: requiredTemplateId,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          setCreateFeedback({
            message: payload?.error || 'Failed to save OneLink.',
            status: 'error',
          });
          return;
        }

        setCreateFeedback({
          message: 'OneLink has been saved to OneLink Management.',
          status: 'success',
        });
      }
    } catch {
      setCreateFeedback({
        message: isEditMode ? 'Failed to update OneLink.' : 'Failed to save OneLink.',
        status: 'error',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleParameterChange = (
    id: number,
    field: keyof Pick<ParameterRow, 'key' | 'value'>,
    value: string,
  ) => {
    setParameters((previous) =>
      previous.map((param) => (param.id === id ? { ...param, [field]: value } : param)),
    );
  };

  const handleParameterDelete = (id: number) => {
    setParameters((previous) => previous.filter((param) => param.id !== id));
  };

  const renderAutocompleteField = (
    label: string,
    value: string,
    onValueChange: (value: string) => void,
    options: string[],
    placeholder?: string,
    required = false,
    hasError = false,
    errorMessage?: string,
    disabled = false,
  ) => (
    <Box>
      <Typography sx={ { fontSize: 13, fontWeight: 500, mb: 0.75 } }>
        {label}
        {required ? (
          <Box component='span' sx={ { color: 'error.main', ml: 0.5 } }>
            *
          </Box>
        ) : null}
      </Typography>
      <Autocomplete<string, false, false, true>
        disabled={ disabled }
        forcePopupIcon
        freeSolo
        fullWidth
        inputValue={ value }
        onChange={ (_, newValue) => onValueChange(newValue ?? '') }
        onInputChange={ (_, newInputValue) => onValueChange(newInputValue) }
        options={ options }
        renderInput={ (params) => (
          <TextField
            { ...params }
            error={ hasError }
            helperText={ hasError ? errorMessage : undefined }
            placeholder={ placeholder }
            sx={ filledFieldSx }
            disabled={ disabled }
          />
        ) }
        value={ value }
      />
    </Box>
  );

  return (
    <ConsoleLayout title={ isEditMode ? 'Edit OneLink' : 'Create New OneLink' }>
      <Box
        sx={ {
          display: 'flex',
          flexDirection: { xl: 'row', xs: 'column' },
          gap: 4,
          maxWidth: 1600,
          mx: 'auto',
          px: { md: 4, xs: 2 },
          py: 4,
        } }
      >
        <Stack spacing={ 3 } sx={ { flex: 1 } }>
          <Paper
            elevation={ 0 }
            sx={ {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 0.75,
              p: 3,
            } }
          >
            <Stack spacing={ 4 }>
              {isEditMode && isInitialLoadPending ? (
                <Alert severity='info'>Loading OneLink data for edit...</Alert>
              ) : null}
              <Box>
                <Box sx={ { mb: 3 } }>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Link Setup</Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Define the basic properties of your tracking link.
                  </Typography>
                </Box>

                <Stack spacing={ 2 }>
                  <Box
                    sx={ {
                      columnGap: 2,
                      display: 'grid',
                      gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
                      rowGap: 2,
                    } }
                  >
                    {renderAutocompleteField(
                      'Link Name',
                      linkName,
                      setLinkName,
                      linkNameOptions,
                      'e.g. Summer Campaign 2024',
                      true,
                      hasLinkNameError,
                      undefined,
                      isInitialLoadPending,
                    )}
                    {renderAutocompleteField(
                      'Short Link ID',
                      shortLinkId,
                      setShortLinkId,
                      shortLinkIdOptions,
                      'e.g. abc123',
                      false,
                      false,
                      undefined,
                      isEditMode || isInitialLoadPending,
                    )}
                  </Box>

                  <Box
                    sx={ {
                      columnGap: 2,
                      display: 'grid',
                      gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
                      rowGap: 2,
                    } }
                  >
                    {renderAutocompleteField(
                      'Template ID',
                      resolvedTemplateId,
                      (nextValue) => {
                        setTemplateId(nextValue);
                        setDismissedAutoBrandDomainTemplateId('');
                      },
                      settings.templateIds,
                      'Select or type template ID',
                      true,
                      hasTemplateIdError,
                      undefined,
                      isEditMode || isInitialLoadPending,
                    )}
                    <Box>
                      <Typography sx={ { fontSize: 13, fontWeight: 500, mb: 0.75 } }>Brand Domain</Typography>
                      <Autocomplete<string, false, false, true>
                        disabled={ isInitialLoadPending }
                        forcePopupIcon
                        freeSolo
                        fullWidth
                        inputValue={ resolvedBrandDomain }
                        onChange={ (_, newValue, reason) => {
                          if (reason === 'clear') {
                            setBrandDomain('');
                            setDismissedAutoBrandDomainTemplateId(resolvedTemplateId);
                            return;
                          }
                          setDismissedAutoBrandDomainTemplateId('');
                          setBrandDomain(newValue ?? '');
                        } }
                        onInputChange={ (_, newInputValue, reason) => {
                          if (reason === 'clear') {
                            setBrandDomain('');
                            setDismissedAutoBrandDomainTemplateId(resolvedTemplateId);
                            return;
                          }
                          setDismissedAutoBrandDomainTemplateId('');
                          setBrandDomain(newInputValue);
                        } }
                        options={ brandDomainOptions }
                        renderInput={ (params) => (
                          <TextField { ...params } placeholder='Select or type brand domain' sx={ filledFieldSx } />
                        ) }
                        value={ resolvedBrandDomain }
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={ {
                      columnGap: 2,
                      display: 'grid',
                      gridTemplateColumns: { lg: '1fr 1fr 1fr', md: '1fr 1fr', xs: '1fr' },
                      rowGap: 2,
                    } }
                  >
                    {renderAutocompleteField(
                      'Media Source (pid)',
                      mediaSource,
                      setMediaSource,
                      mediaSourceOptions,
                      'Select or type media source',
                      true,
                      hasMediaSourceError,
                    )}
                    {renderAutocompleteField(
                      'Campaign Name (c)',
                      campaignName,
                      setCampaignName,
                      campaignOptions,
                    )}
                    {renderAutocompleteField('Ad Set (af_adset)', adSet, setAdSet, adSetOptions)}
                    {renderAutocompleteField('Ad Name (af_ad)', adName, setAdName, adNameOptions)}
                    {renderAutocompleteField('Channel (af_channel)', channel, setChannel, channelOptions)}
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ isRetargeting }
                        onChange={ (event) => setIsRetargeting(event.target.checked) }
                      />
                    }
                    label='Retargeting measurement (is_retargeting=true)'
                  />
                </Stack>
              </Box>

              <Box>
                <Box sx={ { mb: 3 } }>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>
                    Deep Linking &amp; Redirection
                  </Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Where should users go if they have the app vs. if they don&apos;t.
                  </Typography>
                </Box>

                <Stack spacing={ 2 }>
                  <Paper
                    elevation={ 0 }
                    sx={ {
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0.5,
                      p: 2,
                    } }
                  >
                    <Box sx={ { width: '100%' } }>
                      <Typography sx={ { fontSize: 14, fontWeight: 500 } }>When App IS Installed</Typography>
                      <Box sx={ { mt: 1.25 } }>
                        {renderAutocompleteField(
                          'Deep Link URI Scheme',
                          deepLinkUri,
                          setDeepLinkUri,
                          deepLinkUriOptions,
                          'e.g. myapp://product/123',
                        )}
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={ forceDeeplink }
                            onChange={ (event) => setForceDeeplink(event.target.checked) }
                          />
                        }
                        label='Force deeplink (af_force_deeplink=true)'
                        sx={ { mt: 1 } }
                      />
                    </Box>
                  </Paper>

                  <Paper
                    elevation={ 0 }
                    sx={ {
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0.5,
                      p: 2,
                    } }
                  >
                    <Box sx={ { width: '100%' } }>
                      <Typography sx={ { fontSize: 14, fontWeight: 500 } }>
                        When App IS NOT Installed (Mobile Redirection)
                      </Typography>

                      <Box
                        sx={ {
                          columnGap: 2,
                          display: 'grid',
                          gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
                          mt: 1.5,
                          rowGap: 1.5,
                        } }
                      >
                        {renderAutocompleteField(
                          'Android Mobile Redirection URL',
                          playStoreFallbackUrl,
                          setPlayStoreFallbackUrl,
                          androidFallbackOptions,
                          'https://www.website.com/promo',
                          false,
                          hasAndroidFallbackUrlError,
                          androidFallbackValidation.error,
                        )}
                        {renderAutocompleteField(
                          'iOS Mobile Redirection URL',
                          iosFallbackUrl,
                          setIosFallbackUrl,
                          iosFallbackOptions,
                          'https://www.website.com/promo',
                          false,
                          hasIosFallbackUrlError,
                          iosFallbackValidation.error,
                        )}
                      </Box>

                      <Box sx={ { mt: 1.5 } }>
                        {renderAutocompleteField(
                          'Desktop Fallback URL',
                          desktopFallbackUrl,
                          setDesktopFallbackUrl,
                          desktopFallbackOptions,
                          'https://www.website.com/promo',
                          false,
                          hasDesktopFallbackUrlError,
                          desktopFallbackValidation.error,
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Stack>
              </Box>

              <Box sx={ { borderTop: '1px solid', borderTopColor: 'divider', pt: 4 } }>
                <Box sx={ { alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 } }>
                  <Box>
                    <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Additional Parameters</Typography>
                    <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                      Add custom parameters for granular tracking.
                    </Typography>
                  </Box>
                  <Button
                    onClick={ handleAddParameter }
                    sx={ {
                      '&:hover': { color: 'text.primary', textDecoration: 'underline' },
                      color: 'text.secondary',
                      fontSize: 13,
                      fontWeight: 600,
                      minWidth: 0,
                      px: 0,
                      textTransform: 'none',
                    } }
                    variant='text'
                  >
                    + Add Parameter
                  </Button>
                </Box>

                <Stack spacing={ 1.5 }>
                  {parameters.map((param) => (
                    <Stack direction='row' key={ param.id } spacing={ 1.25 }>
                      <Autocomplete<string, false, false, true>
                        freeSolo
                        fullWidth
                        inputValue={ param.key }
                        onChange={ (_, newValue) => handleParameterChange(param.id, 'key', newValue ?? '') }
                        onInputChange={ (_, newInputValue) =>
                          handleParameterChange(param.id, 'key', newInputValue)
                        }
                        options={ customParameterKeyOptions }
                        renderInput={ (params) => (
                          <TextField { ...params } placeholder='Key (e.g. af_sub1)' sx={ filledFieldSx } />
                        ) }
                        value={ param.key }
                      />
                      <Autocomplete<string, false, false, true>
                        freeSolo
                        fullWidth
                        inputValue={ param.value }
                        onChange={ (_, newValue) => handleParameterChange(param.id, 'value', newValue ?? '') }
                        onInputChange={ (_, newInputValue) =>
                          handleParameterChange(param.id, 'value', newInputValue)
                        }
                        options={ customParameterValueOptions }
                        renderInput={ (params) => <TextField { ...params } placeholder='Value' sx={ filledFieldSx } /> }
                        value={ param.value }
                      />
                      <IconButton
                        aria-label='Delete parameter'
                        onClick={ () => handleParameterDelete(param.id) }
                        sx={ {
                          '&:hover': { backgroundColor: 'action.hover' },
                          borderRadius: 0.5,
                          color: 'error.main',
                          flexShrink: 0,
                        } }
                      >
                        <HugeIcon color='currentColor' icon={ Delete02Icon } size={ 18 } />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box sx={ { borderTop: '1px solid', borderTopColor: 'divider', pt: 4 } }>
                <Box sx={ { mb: 3 } }>
                  <Typography sx={ { fontSize: 22, fontWeight: 600 } }>Social Media Preview</Typography>
                  <Typography sx={ { color: 'text.secondary', fontSize: 14 } }>
                    Customize how your link appears when shared.
                  </Typography>
                </Box>

                <Box
                  sx={ {
                    columnGap: 4,
                    display: 'grid',
                    gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
                    rowGap: 3,
                  } }
                >
                  <Stack spacing={ 2 }>
                    {renderAutocompleteField('Open Graph Title', ogTitle, setOgTitle, ogTitleOptions)}
                    {renderAutocompleteField(
                      'Open Graph Description',
                      ogDescription,
                      setOgDescription,
                      ogDescriptionOptions,
                    )}
                    {renderAutocompleteField('Image URL', ogImage, setOgImage, ogImageOptions)}
                  </Stack>

                  <Stack justifyContent='center'>
                    <Paper
                      elevation={ 0 }
                      sx={ {
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 0.5,
                        maxWidth: 360,
                        mx: 'auto',
                        overflow: 'hidden',
                        width: '100%',
                      } }
                    >
                      <Box
                        sx={ {
                          alignItems: 'center',
                          backgroundColor: 'action.hover',
                          color: 'text.disabled',
                          display: 'flex',
                          height: 128,
                          justifyContent: 'center',
                        } }
                      >
                        <HugeIcon color='currentColor' icon={ Image02Icon } size={ 36 } />
                      </Box>
                      <Box sx={ { p: 1.5 } }>
                        <Typography
                          sx={ {
                            color: 'text.secondary',
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          } }
                        >
                          example.onelink.me
                        </Typography>
                        <Typography sx={ { fontSize: 14, fontWeight: 700, mt: 0.5 } }>{ogTitle}</Typography>
                        <Typography sx={ { color: 'text.secondary', fontSize: 12, mt: 0.5 } }>
                          {ogDescription}
                        </Typography>
                      </Box>
                    </Paper>
                    <Typography sx={ { color: 'text.secondary', fontSize: 11, mt: 1.25, textAlign: 'center' } }>
                      Preview (Facebook/LinkedIn style)
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Stack>

        <Box sx={ { flexShrink: 0, width: { xl: 384 } } }>
          <Stack spacing={ 2 } sx={ { position: { xl: 'sticky' }, top: { xl: 96 } } }>
            <Paper
              elevation={ 0 }
              sx={ {
                backgroundColor: 'background.paper',
                borderRadius: 0.75,
                overflow: 'hidden',
              } }
            >
              <Box
                sx={ {
                  backgroundColor: 'background.paper',
                  px: 3,
                  py: 2,
                } }
              >
                <Typography sx={ { fontSize: 16, fontWeight: 600 } }>Link Preview</Typography>
              </Box>

              <Stack spacing={ 3 } sx={ { p: 3 } }>
                <Box>
                  <Typography
                    sx={ {
                      color: 'text.secondary',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      mb: 1,
                      textTransform: 'uppercase',
                    } }
                  >
                    Generated Long URL
                  </Typography>
                  <Box
                    sx={ {
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0.5,
                      color: 'text.primary',
                      fontFamily: 'Roboto Mono, monospace',
                      fontSize: 12,
                      lineHeight: 1.5,
                      overflowWrap: 'anywhere',
                      p: 1.5,
                    } }
                  >
                    {generatedLongUrl}
                  </Box>
                </Box>

                <Box>
                  <Typography
                    sx={ {
                      color: 'text.secondary',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      mb: 1,
                      textTransform: 'uppercase',
                    } }
                  >
                    Short Link
                  </Typography>
                  <TextField
                    fullWidth
                    InputProps={ {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <HugeIcon color='currentColor' icon={ CheckmarkCircle02Icon } size={ 18 } />
                        </InputAdornment>
                      ),
                      readOnly: true,
                    } }
                    sx={ plainFieldSx }
                    value={ shortLink }
                  />
                  <Typography
                    sx={ {
                      color: 'text.disabled',
                      fontSize: 10,
                      mt: 0.75,
                    } }
                  >
                    {isEditMode
                      ? 'Short link is fixed for this existing OneLink.'
                      : 'Short links are available only after link creation.'}
                  </Typography>
                </Box>

                <Button
                  onClick={ handleCopyShortLink }
                  startIcon={
                    <HugeIcon
                      color='currentColor'
                      icon={ isCopied ? CheckmarkCircle02Icon : Copy01Icon }
                      size={ 18 }
                    />
                  }
                  sx={ {
                    '&:hover': { backgroundColor: 'background.default' },
                    backgroundColor: 'background.paper',
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    color: 'text.primary',
                    fontSize: 15,
                    fontWeight: 500,
                    py: 1.25,
                    textTransform: 'none',
                  } }
                  variant='outlined'
                >
                  {isCopied ? 'Copied' : 'Copy Short Link'}
                </Button>

                <Button
                  onClick={ () => setIsQrModalOpen(true) }
                  startIcon={ <HugeIcon color='currentColor' icon={ QrCodeIcon } size={ 18 } /> }
                  sx={ {
                    '&:hover': { backgroundColor: 'background.default' },
                    borderColor: 'divider',
                    borderRadius: 0.5,
                    color: 'text.primary',
                    fontSize: 14,
                    fontWeight: 500,
                    py: 1.1,
                    textTransform: 'none',
                  } }
                  variant='outlined'
                >
                  Show QR Code
                </Button>
              </Stack>
            </Paper>

            <Button
              disabled={ isInitialLoadPending || isCreating }
              onClick={ () => {
                void handleCreateLink();
              } }
              sx={ {
                borderRadius: 0.5,
                fontSize: 14,
                fontWeight: 600,
                py: 1.2,
                textTransform: 'none',
                width: '100%',
              } }
              variant='contained'
            >
              {isInitialLoadPending ? 'Loading...' : isCreating ? 'Saving...' : createActionLabel}
            </Button>
            {showRequiredValidation && hasMissingRequiredField ? (
              <Typography
                sx={ {
                  color: 'error.main',
                  fontSize: 12,
                  textAlign: 'center',
                } }
              >
                Please fill in all required fields.
              </Typography>
            ) : null}
            {showRequiredValidation && hasInvalidRedirectUrl ? (
              <Typography
                sx={ {
                  color: 'error.main',
                  fontSize: 12,
                  textAlign: 'center',
                } }
              >
                Redirection URLs must be public http(s) URLs. Localhost/IP values are not allowed.
              </Typography>
            ) : null}
            {createFeedback && (
              <Typography
                sx={ {
                  color: createFeedback.status === 'success' ? 'success.main' : 'error.main',
                  fontSize: 12,
                  textAlign: 'center',
                } }
              >
                {createFeedback.message}
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>

      <Dialog fullWidth maxWidth='sm' onClose={ () => setIsQrModalOpen(false) } open={ isQrModalOpen }>
        <DialogTitle sx={ { fontSize: 18, fontWeight: 600 } }>QR Code Preview</DialogTitle>
        <DialogContent>
          <Stack spacing={ 2 } sx={ { alignItems: 'center', pb: 1 } }>
            <Box
              alt='OneLink QR code'
              component='img'
              src={ qrCodeImageUrl }
              sx={ {
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0.5,
                height: { sm: 360, xs: 280 },
                objectFit: 'contain',
                width: { sm: 360, xs: 280 },
              } }
            />
            <Typography sx={ { color: 'text.secondary', fontSize: 12, textAlign: 'center' } }>
              Scan to open the generated short link.
            </Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    </ConsoleLayout>
  );
}

export default OneLinkStitchedPage;
