/**
 * OneLink creation page with live preview and settings-driven autocomplete fields.
 * State orchestrator that delegates rendering to sub-components in ./stitched/.
 */
'use client';

import { Alert, Box, Paper, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import { validateOneLinkRedirectUrl } from '@/lib/onelinkLinksSchema';
import { useSettings } from '@/lib/providers/SettingsContext';
import AdditionalParametersSection from './stitched/AdditionalParametersSection';
import { MAPPED_ONELINK_FIELDS, toBooleanFlag } from './stitched/constants';
import DeepLinkingSection from './stitched/DeepLinkingSection';
import LinkPreviewSidebar from './stitched/LinkPreviewSidebar';
import LinkSetupSection from './stitched/LinkSetupSection';
import QrCodeDialog from './stitched/QrCodeDialog';
import SocialMediaPreviewSection from './stitched/SocialMediaPreviewSection';
import type {
  OneLinkDetailResponse,
  OneLinkStitchedPageProps,
  OneLinkUpdateResponse,
  ParameterRow,
} from './stitched/types';

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

  /* ── Derived / memoized values ── */

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

  /* ── Edit-mode data loader ── */

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

  /* ── Computed link values ── */

  const shortLink = useMemo(() => {
    const resolvedShortLinkId = shortLinkId.trim() || 'short-link-id';
    return `https://go.onelink.me/${activeTemplateId.toLowerCase()}/${encodeURIComponent(resolvedShortLinkId)}`;
  }, [activeTemplateId, shortLinkId]);

  const oneLinkData = useMemo(() => {
    const payload: Record<string, string> = {};
    if (mediaSource.trim()) payload.pid = mediaSource.trim();
    if (campaignName.trim()) payload.c = campaignName.trim().replaceAll(' ', '_');
    if (adSet.trim()) payload.af_adset = adSet.trim();
    if (adName.trim()) payload.af_ad = adName.trim();
    if (channel.trim()) payload.af_channel = channel.trim();
    if (deepLinkUri.trim()) payload.af_dp = deepLinkUri.trim();
    if (desktopFallbackUrl.trim()) payload.af_web_dp = desktopFallbackUrl.trim();
    if (playStoreFallbackUrl.trim()) payload.af_android_url = playStoreFallbackUrl.trim();
    if (iosFallbackUrl.trim()) payload.af_ios_url = iosFallbackUrl.trim();
    if (forceDeeplink) payload.af_force_deeplink = 'true';
    if (isRetargeting) payload.is_retargeting = 'true';
    if (ogTitle.trim()) payload.af_og_title = ogTitle.trim();
    if (ogDescription.trim()) payload.af_og_description = ogDescription.trim();
    if (ogImage.trim()) payload.af_og_image = ogImage.trim();
    parameters.forEach((param) => {
      const key = param.key.trim();
      const value = param.value.trim();
      if (key && value) payload[key] = value;
    });
    return payload;
  }, [
    adName, adSet, campaignName, channel, deepLinkUri, desktopFallbackUrl,
    forceDeeplink, iosFallbackUrl, isRetargeting, mediaSource,
    ogDescription, ogImage, ogTitle, parameters, playStoreFallbackUrl,
  ]);

  const generatedLongUrl = useMemo(() => {
    const queryString = new URLSearchParams(oneLinkData).toString();
    return queryString
      ? `https://app.onelink.me/${activeTemplateId}?${queryString}`
      : `https://app.onelink.me/${activeTemplateId}`;
  }, [activeTemplateId, oneLinkData]);

  /* ── Validation ── */

  const requiredLinkName = linkName.trim();
  const requiredTemplateId = resolvedTemplateId.trim();
  const requiredMediaSource = mediaSource.trim();
  const hasMissingRequiredField = !requiredLinkName || !requiredTemplateId || !requiredMediaSource;

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

  /* ── Event handlers ── */

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
          headers: { 'Content-Type': 'application/json' },
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
          headers: { 'Content-Type': 'application/json' },
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
    field: 'key' | 'value',
    value: string,
  ) => {
    setParameters((previous) =>
      previous.map((param) => (param.id === id ? { ...param, [field]: value } : param)),
    );
  };

  const handleParameterDelete = (id: number) => {
    setParameters((previous) => previous.filter((param) => param.id !== id));
  };

  const handleBrandDomainChange = (_: React.SyntheticEvent, newValue: string | null, reason: string) => {
    if (reason === 'clear') {
      setBrandDomain('');
      setDismissedAutoBrandDomainTemplateId(resolvedTemplateId);
      return;
    }
    setDismissedAutoBrandDomainTemplateId('');
    setBrandDomain(newValue ?? '');
  };

  const handleBrandDomainInputChange = (_: React.SyntheticEvent, newInputValue: string, reason: string) => {
    if (reason === 'clear') {
      setBrandDomain('');
      setDismissedAutoBrandDomainTemplateId(resolvedTemplateId);
      return;
    }
    setDismissedAutoBrandDomainTemplateId('');
    setBrandDomain(newInputValue);
  };

  const handleTemplateIdChange = (nextValue: string) => {
    setTemplateId(nextValue);
    setDismissedAutoBrandDomainTemplateId('');
  };

  /* ── Render ── */

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
              borderRadius: 1,
              p: 3,
            } }
          >
            <Stack spacing={ 4 }>
              {isEditMode && isInitialLoadPending ? (
                <Alert severity='info'>Loading OneLink data for edit...</Alert>
              ) : null}

              <LinkSetupSection
                linkName={ linkName }
                onLinkNameChange={ setLinkName }
                linkNameOptions={ linkNameOptions }
                shortLinkId={ shortLinkId }
                onShortLinkIdChange={ setShortLinkId }
                shortLinkIdOptions={ shortLinkIdOptions }
                resolvedTemplateId={ resolvedTemplateId }
                onTemplateIdChange={ handleTemplateIdChange }
                templateIdOptions={ settings.templateIds }
                resolvedBrandDomain={ resolvedBrandDomain }
                onBrandDomainChange={ handleBrandDomainChange }
                onBrandDomainInputChange={ handleBrandDomainInputChange }
                brandDomainOptions={ brandDomainOptions }
                mediaSource={ mediaSource }
                onMediaSourceChange={ setMediaSource }
                mediaSourceOptions={ mediaSourceOptions }
                campaignName={ campaignName }
                onCampaignNameChange={ setCampaignName }
                campaignOptions={ campaignOptions }
                adSet={ adSet }
                onAdSetChange={ setAdSet }
                adSetOptions={ adSetOptions }
                adName={ adName }
                onAdNameChange={ setAdName }
                adNameOptions={ adNameOptions }
                channel={ channel }
                onChannelChange={ setChannel }
                channelOptions={ channelOptions }
                isRetargeting={ isRetargeting }
                onRetargetingChange={ setIsRetargeting }
                isEditMode={ isEditMode }
                isInitialLoadPending={ isInitialLoadPending }
                hasLinkNameError={ hasLinkNameError }
                hasTemplateIdError={ hasTemplateIdError }
                hasMediaSourceError={ hasMediaSourceError }
              />

              <DeepLinkingSection
                deepLinkUri={ deepLinkUri }
                onDeepLinkUriChange={ setDeepLinkUri }
                deepLinkUriOptions={ deepLinkUriOptions }
                forceDeeplink={ forceDeeplink }
                onForceDeeplinkChange={ setForceDeeplink }
                playStoreFallbackUrl={ playStoreFallbackUrl }
                onPlayStoreFallbackUrlChange={ setPlayStoreFallbackUrl }
                androidFallbackOptions={ androidFallbackOptions }
                hasAndroidFallbackUrlError={ hasAndroidFallbackUrlError }
                androidFallbackErrorMessage={ androidFallbackValidation.error }
                iosFallbackUrl={ iosFallbackUrl }
                onIosFallbackUrlChange={ setIosFallbackUrl }
                iosFallbackOptions={ iosFallbackOptions }
                hasIosFallbackUrlError={ hasIosFallbackUrlError }
                iosFallbackErrorMessage={ iosFallbackValidation.error }
                desktopFallbackUrl={ desktopFallbackUrl }
                onDesktopFallbackUrlChange={ setDesktopFallbackUrl }
                desktopFallbackOptions={ desktopFallbackOptions }
                hasDesktopFallbackUrlError={ hasDesktopFallbackUrlError }
                desktopFallbackErrorMessage={ desktopFallbackValidation.error }
              />

              <AdditionalParametersSection
                parameters={ parameters }
                onParameterChange={ handleParameterChange }
                onParameterDelete={ handleParameterDelete }
                onAddParameter={ handleAddParameter }
                customParameterKeyOptions={ customParameterKeyOptions }
                customParameterValueOptions={ customParameterValueOptions }
              />

              <SocialMediaPreviewSection
                ogTitle={ ogTitle }
                onOgTitleChange={ setOgTitle }
                ogTitleOptions={ ogTitleOptions }
                ogDescription={ ogDescription }
                onOgDescriptionChange={ setOgDescription }
                ogDescriptionOptions={ ogDescriptionOptions }
                ogImage={ ogImage }
                onOgImageChange={ setOgImage }
                ogImageOptions={ ogImageOptions }
              />
            </Stack>
          </Paper>
        </Stack>

        <LinkPreviewSidebar
          generatedLongUrl={ generatedLongUrl }
          shortLink={ shortLink }
          isCopied={ isCopied }
          onCopyShortLink={ () => { void handleCopyShortLink(); } }
          onShowQrModal={ () => setIsQrModalOpen(true) }
          onCreateLink={ () => { void handleCreateLink(); } }
          createActionLabel={ createActionLabel }
          isEditMode={ isEditMode }
          isInitialLoadPending={ isInitialLoadPending }
          isCreating={ isCreating }
          hasMissingRequiredField={ hasMissingRequiredField }
          hasInvalidRedirectUrl={ hasInvalidRedirectUrl }
          showRequiredValidation={ showRequiredValidation }
          createFeedback={ createFeedback }
        />
      </Box>

      <QrCodeDialog
        isOpen={ isQrModalOpen }
        onClose={ () => setIsQrModalOpen(false) }
        qrCodeImageUrl={ qrCodeImageUrl }
      />
    </ConsoleLayout>
  );
}

export default OneLinkStitchedPage;
