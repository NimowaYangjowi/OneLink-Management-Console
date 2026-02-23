/**
 * OneLink creation/edit page that composes stitched sections and delegates form logic to a custom hook.
 */
'use client';

import { Alert, Box, Paper, Stack } from '@mui/material';
import ConsoleLayout from '@/components/onelink/ConsoleLayout';
import AdditionalParametersSection from './stitched/AdditionalParametersSection';
import DeepLinkingSection from './stitched/DeepLinkingSection';
import LinkPreviewSidebar from './stitched/LinkPreviewSidebar';
import LinkSetupSection from './stitched/LinkSetupSection';
import QrCodeDialog from './stitched/QrCodeDialog';
import SocialMediaPreviewSection from './stitched/SocialMediaPreviewSection';
import { useOneLinkStitchedForm } from './stitched/hooks/useOneLinkStitchedForm';
import type { OneLinkStitchedPageProps } from './stitched/types';

function OneLinkStitchedPage({
  creationType = 'single_link',
  createActionLabel = 'Create Link',
  mode = 'create',
  recordId,
}: OneLinkStitchedPageProps) {
  const {
    adName,
    adNameOptions,
    adSet,
    adSetOptions,
    androidFallbackErrorMessage,
    androidFallbackOptions,
    brandDomainOptions,
    campaignName,
    campaignOptions,
    channel,
    channelOptions,
    createFeedback,
    customParameterKeyOptions,
    customParameterValueOptions,
    deepLinkUri,
    deepLinkUriOptions,
    desktopFallbackErrorMessage,
    desktopFallbackOptions,
    desktopFallbackUrl,
    forceDeeplink,
    generatedLongUrl,
    handleAddParameter,
    handleBrandDomainChange,
    handleBrandDomainInputChange,
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
    hasMediaSourceError,
    hasMissingRequiredField,
    hasTemplateIdError,
    iosFallbackErrorMessage,
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
  } = useOneLinkStitchedForm({ creationType, mode, recordId });

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
                androidFallbackErrorMessage={ androidFallbackErrorMessage }
                iosFallbackUrl={ iosFallbackUrl }
                onIosFallbackUrlChange={ setIosFallbackUrl }
                iosFallbackOptions={ iosFallbackOptions }
                hasIosFallbackUrlError={ hasIosFallbackUrlError }
                iosFallbackErrorMessage={ iosFallbackErrorMessage }
                desktopFallbackUrl={ desktopFallbackUrl }
                onDesktopFallbackUrlChange={ setDesktopFallbackUrl }
                desktopFallbackOptions={ desktopFallbackOptions }
                hasDesktopFallbackUrlError={ hasDesktopFallbackUrlError }
                desktopFallbackErrorMessage={ desktopFallbackErrorMessage }
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
