/**
 * Encapsulates OneLink stitched-page form state, validation, and create/update side effects.
 */

import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  composeValueFromSlots,
  splitValueToSlots,
  validateSlotValues,
  type NamingConventionValidationError,
} from '@/lib/namingConvention';
import { validateOneLinkRedirectUrl } from '@/lib/onelinkLinksSchema';
import { useSettings } from '@/lib/providers/SettingsContext';
import { MAPPED_ONELINK_FIELDS, toBooleanFlag } from '@/components/onelink/stitched/constants';
import type {
  OneLinkDetailResponse,
  OneLinkStitchedPageProps,
  OneLinkUpdateResponse,
  ParameterRow,
} from '@/components/onelink/stitched/types';

type UseOneLinkStitchedFormArgs = Pick<OneLinkStitchedPageProps, 'creationType' | 'mode' | 'recordId'>;

export function useOneLinkStitchedForm({
  creationType = 'single_link',
  mode = 'create',
  recordId,
}: UseOneLinkStitchedFormArgs) {
  const { settings } = useSettings();
  const isEditMode = mode === 'edit';

  const [templateId, setTemplateId] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [campaignSlotValues, setCampaignSlotValues] = useState<string[]>([]);
  const [campaignRuleWarning, setCampaignRuleWarning] = useState('');
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

  const campaignRule = useMemo(
    () => settings.namingConvention.rules.c ?? null,
    [settings.namingConvention.rules.c],
  );
  const isCampaignRuleEnabled = Boolean(campaignRule?.enabled && campaignRule.slots.length > 0);
  const isCampaignRuleStrict = settings.namingConvention.enforcementMode === 'strict';

  useEffect(() => {
    if (!isCampaignRuleEnabled || !campaignRule) {
      setCampaignSlotValues([]);
      setCampaignRuleWarning('');
      return;
    }

    setCampaignSlotValues((previous) => (
      previous.length === campaignRule.slots.length
        ? previous
        : campaignRule.slots.map(() => '')
    ));
  }, [campaignRule, isCampaignRuleEnabled]);

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
        const loadedCampaignName = remoteData.c || record.campaignName || '';
        setCampaignName(loadedCampaignName);
        if (isCampaignRuleEnabled && campaignRule) {
          const parsedSlots = splitValueToSlots(campaignRule, loadedCampaignName);
          if (parsedSlots.length === campaignRule.slots.length) {
            setCampaignSlotValues(parsedSlots);
            setCampaignRuleWarning('');
          } else if (loadedCampaignName.trim()) {
            setCampaignSlotValues(campaignRule.slots.map(() => ''));
            setCampaignRuleWarning(
              'Existing campaign value does not match current slot rule. Update slot values before saving in strict mode.',
            );
          }
        } else {
          setCampaignRuleWarning('');
        }
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
  }, [campaignRule, isCampaignRuleEnabled, isEditMode, recordId]);

  const handleCampaignSlotChange = (slotIndex: number, value: string) => {
    setCampaignSlotValues((previous) => {
      const nextValues = [...previous];
      nextValues[slotIndex] = value;

      if (campaignRule) {
        setCampaignName(composeValueFromSlots(campaignRule, nextValues));
      }

      return nextValues;
    });
    setCampaignRuleWarning('');
  };

  const campaignSlotValidation = useMemo(() => {
    if (!isCampaignRuleEnabled || !campaignRule) {
      return { errors: [], normalizedSlots: [], valid: true };
    }

    return validateSlotValues(campaignRule, campaignSlotValues);
  }, [campaignRule, campaignSlotValues, isCampaignRuleEnabled]);

  const campaignSlotErrors = useMemo(() => {
    if (!isCampaignRuleEnabled || !campaignRule) {
      return [] as string[];
    }

    const slotErrorByIndex = new Map<number, string>();
    campaignSlotValidation.errors.forEach((error) => {
      if (typeof error.slotIndex !== 'number' || slotErrorByIndex.has(error.slotIndex)) {
        return;
      }
      slotErrorByIndex.set(error.slotIndex, error.message);
    });

    return campaignRule.slots.map((_, index) => slotErrorByIndex.get(index + 1) ?? '');
  }, [campaignRule, campaignSlotValidation.errors, isCampaignRuleEnabled]);

  const campaignComposedValue = useMemo(() => {
    if (!isCampaignRuleEnabled || !campaignRule) {
      return campaignName;
    }
    return composeValueFromSlots(campaignRule, campaignSlotValues);
  }, [campaignName, campaignRule, campaignSlotValues, isCampaignRuleEnabled]);

  const shortLink = useMemo(() => {
    const resolvedShortLinkId = shortLinkId.trim() || 'short-link-id';
    return `https://go.onelink.me/${activeTemplateId.toLowerCase()}/${encodeURIComponent(resolvedShortLinkId)}`;
  }, [activeTemplateId, shortLinkId]);

  const oneLinkData = useMemo(() => {
    const payload: Record<string, string> = {};
    if (mediaSource.trim()) payload.pid = mediaSource.trim();
    if (campaignComposedValue.trim()) {
      payload.c = isCampaignRuleEnabled
        ? campaignComposedValue.trim()
        : campaignComposedValue.trim().replaceAll(' ', '_');
    }
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
    adName, adSet, campaignComposedValue, channel, deepLinkUri, desktopFallbackUrl,
    forceDeeplink, iosFallbackUrl, isRetargeting, mediaSource,
    ogDescription, ogImage, ogTitle, parameters, playStoreFallbackUrl, isCampaignRuleEnabled,
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
  const hasCampaignRuleViolation = isCampaignRuleEnabled && isCampaignRuleStrict && !campaignSlotValidation.valid;
  const hasMissingRequiredField = !requiredLinkName || !requiredTemplateId || !requiredMediaSource || hasCampaignRuleViolation;

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
  const hasCampaignRuleError = showRequiredValidation && hasCampaignRuleViolation;
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
      setCreateFeedback(
        hasCampaignRuleViolation
          ? {
              message: 'Campaign naming rule validation failed. Fill required slots and resolve slot errors.',
              status: 'error',
            }
          : null,
      );
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
          message: payload?.warnings?.length
            ? `OneLink has been updated with ${payload.warnings.length} naming warning(s).`
            : 'OneLink has been updated successfully.',
          status: 'success',
        });
      } else {
        const response = await fetch('/api/onelinks', {
          body: JSON.stringify({
            brandDomain: resolvedBrandDomain,
            campaignName: campaignComposedValue,
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
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          warnings?: NamingConventionValidationError[];
        } | null;

        if (!response.ok) {
          setCreateFeedback({
            message: payload?.error || 'Failed to save OneLink.',
            status: 'error',
          });
          return;
        }

        setCreateFeedback({
          message: payload?.warnings?.length
            ? `OneLink has been saved with ${payload.warnings.length} naming warning(s).`
            : 'OneLink has been saved to OneLink Management.',
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

  const handleBrandDomainChange = (_: SyntheticEvent, newValue: string | null, reason: string) => {
    if (reason === 'clear') {
      setBrandDomain('');
      setDismissedAutoBrandDomainTemplateId(resolvedTemplateId);
      return;
    }
    setDismissedAutoBrandDomainTemplateId('');
    setBrandDomain(newValue ?? '');
  };

  const handleBrandDomainInputChange = (_: SyntheticEvent, newInputValue: string, reason: string) => {
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

  return {
    adName,
    adNameOptions,
    adSet,
    adSetOptions,
    androidFallbackErrorMessage: androidFallbackValidation.error,
    androidFallbackOptions,
    brandDomainOptions,
    campaignName,
    campaignOptions,
    campaignComposedValue,
    campaignRule,
    campaignRuleWarning,
    campaignSlotErrors,
    campaignSlotValues,
    channel,
    channelOptions,
    createFeedback,
    customParameterKeyOptions,
    customParameterValueOptions,
    deepLinkUri,
    deepLinkUriOptions,
    desktopFallbackErrorMessage: desktopFallbackValidation.error,
    desktopFallbackOptions,
    desktopFallbackUrl,
    forceDeeplink,
    generatedLongUrl,
    handleAddParameter,
    handleBrandDomainChange,
    handleBrandDomainInputChange,
    handleCampaignSlotChange,
    handleCopyShortLink,
    handleCreateLink,
    handleParameterChange,
    handleParameterDelete,
    handleTemplateIdChange,
    hasAndroidFallbackUrlError,
    hasDesktopFallbackUrlError,
    hasInvalidRedirectUrl,
    hasIosFallbackUrlError,
    hasLinkNameError,
    hasCampaignRuleError,
    hasMediaSourceError,
    hasMissingRequiredField,
    hasTemplateIdError,
    iosFallbackErrorMessage: iosFallbackValidation.error,
    iosFallbackOptions,
    iosFallbackUrl,
    isCopied,
    isCreating,
    isEditMode,
    isInitialLoadPending,
    isQrModalOpen,
    isRetargeting,
    linkName,
    linkNameOptions,
    mediaSource,
    mediaSourceOptions,
    ogDescription,
    ogDescriptionOptions,
    ogImage,
    ogImageOptions,
    ogTitle,
    ogTitleOptions,
    parameters,
    playStoreFallbackUrl,
    qrCodeImageUrl,
    resolvedBrandDomain,
    resolvedTemplateId,
    setAdName,
    setAdSet,
    setCampaignName,
    setChannel,
    setDeepLinkUri,
    setDesktopFallbackUrl,
    setForceDeeplink,
    setIosFallbackUrl,
    setIsQrModalOpen,
    setIsRetargeting,
    setLinkName,
    setMediaSource,
    setOgDescription,
    setOgImage,
    setOgTitle,
    setPlayStoreFallbackUrl,
    setShortLinkId,
    settings,
    shortLink,
    shortLinkId,
    shortLinkIdOptions,
    showRequiredValidation,
  };
}
