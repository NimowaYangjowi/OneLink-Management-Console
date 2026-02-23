/**
 * Deep Linking & Redirection section: deep link URI, force deeplink toggle,
 * Android/iOS mobile redirection URLs, and desktop fallback URL.
 */
'use client';

import { Box, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material';
import AutocompleteField from './AutocompleteField';

/**
 * DeepLinkingSection component
 *
 * Props:
 * @param {string} deepLinkUri - Deep link URI value [Required]
 * @param {function} onDeepLinkUriChange - Deep link URI setter [Required]
 * @param {string[]} deepLinkUriOptions - Autocomplete options [Required]
 * @param {boolean} forceDeeplink - Force deeplink checkbox state [Required]
 * @param {function} onForceDeeplinkChange - Force deeplink setter [Required]
 * @param {string} playStoreFallbackUrl - Android fallback URL [Required]
 * @param {function} onPlayStoreFallbackUrlChange - Android fallback setter [Required]
 * @param {string[]} androidFallbackOptions - Android fallback options [Required]
 * @param {boolean} hasAndroidFallbackUrlError - Android validation error [Required]
 * @param {string} androidFallbackErrorMessage - Android error text [Optional]
 * @param {string} iosFallbackUrl - iOS fallback URL [Required]
 * @param {function} onIosFallbackUrlChange - iOS fallback setter [Required]
 * @param {string[]} iosFallbackOptions - iOS fallback options [Required]
 * @param {boolean} hasIosFallbackUrlError - iOS validation error [Required]
 * @param {string} iosFallbackErrorMessage - iOS error text [Optional]
 * @param {string} desktopFallbackUrl - Desktop fallback URL [Required]
 * @param {function} onDesktopFallbackUrlChange - Desktop fallback setter [Required]
 * @param {string[]} desktopFallbackOptions - Desktop fallback options [Required]
 * @param {boolean} hasDesktopFallbackUrlError - Desktop validation error [Required]
 * @param {string} desktopFallbackErrorMessage - Desktop error text [Optional]
 *
 * Example usage:
 * <DeepLinkingSection deepLinkUri={uri} onDeepLinkUriChange={setUri} ... />
 */
function DeepLinkingSection({
  deepLinkUri,
  onDeepLinkUriChange,
  deepLinkUriOptions,
  forceDeeplink,
  onForceDeeplinkChange,
  playStoreFallbackUrl,
  onPlayStoreFallbackUrlChange,
  androidFallbackOptions,
  hasAndroidFallbackUrlError,
  androidFallbackErrorMessage,
  iosFallbackUrl,
  onIosFallbackUrlChange,
  iosFallbackOptions,
  hasIosFallbackUrlError,
  iosFallbackErrorMessage,
  desktopFallbackUrl,
  onDesktopFallbackUrlChange,
  desktopFallbackOptions,
  hasDesktopFallbackUrlError,
  desktopFallbackErrorMessage,
}: {
  deepLinkUri: string;
  onDeepLinkUriChange: (value: string) => void;
  deepLinkUriOptions: string[];
  forceDeeplink: boolean;
  onForceDeeplinkChange: (checked: boolean) => void;
  playStoreFallbackUrl: string;
  onPlayStoreFallbackUrlChange: (value: string) => void;
  androidFallbackOptions: string[];
  hasAndroidFallbackUrlError: boolean;
  androidFallbackErrorMessage?: string;
  iosFallbackUrl: string;
  onIosFallbackUrlChange: (value: string) => void;
  iosFallbackOptions: string[];
  hasIosFallbackUrlError: boolean;
  iosFallbackErrorMessage?: string;
  desktopFallbackUrl: string;
  onDesktopFallbackUrlChange: (value: string) => void;
  desktopFallbackOptions: string[];
  hasDesktopFallbackUrlError: boolean;
  desktopFallbackErrorMessage?: string;
}) {
  return (
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
            borderRadius: 1,
            p: 2,
          } }
        >
          <Box sx={ { width: '100%' } }>
            <Typography sx={ { fontSize: 14, fontWeight: 500 } }>When App IS Installed</Typography>
            <Box sx={ { mt: 1.25 } }>
              <AutocompleteField
                label='Deep Link URI Scheme'
                value={ deepLinkUri }
                onValueChange={ onDeepLinkUriChange }
                options={ deepLinkUriOptions }
                placeholder='e.g. myapp://product/123'
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={ forceDeeplink }
                  onChange={ (event) => onForceDeeplinkChange(event.target.checked) }
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
            borderRadius: 1,
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
              <AutocompleteField
                label='Android Mobile Redirection URL'
                value={ playStoreFallbackUrl }
                onValueChange={ onPlayStoreFallbackUrlChange }
                options={ androidFallbackOptions }
                placeholder='https://www.website.com/promo'
                hasError={ hasAndroidFallbackUrlError }
                errorMessage={ androidFallbackErrorMessage }
              />
              <AutocompleteField
                label='iOS Mobile Redirection URL'
                value={ iosFallbackUrl }
                onValueChange={ onIosFallbackUrlChange }
                options={ iosFallbackOptions }
                placeholder='https://www.website.com/promo'
                hasError={ hasIosFallbackUrlError }
                errorMessage={ iosFallbackErrorMessage }
              />
            </Box>

            <Box sx={ { mt: 1.5 } }>
              <AutocompleteField
                label='Desktop Fallback URL'
                value={ desktopFallbackUrl }
                onValueChange={ onDesktopFallbackUrlChange }
                options={ desktopFallbackOptions }
                placeholder='https://www.website.com/promo'
                hasError={ hasDesktopFallbackUrlError }
                errorMessage={ desktopFallbackErrorMessage }
              />
            </Box>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}

export default DeepLinkingSection;
