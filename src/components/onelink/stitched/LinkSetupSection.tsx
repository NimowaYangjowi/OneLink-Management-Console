/**
 * Link Setup section: link name, short link ID, template ID, brand domain,
 * media source, campaign, ad set, ad name, channel, and retargeting toggle.
 */
'use client';

import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutocompleteField from './AutocompleteField';
import { filledFieldSx } from './fieldStyles';

/**
 * LinkSetupSection component
 *
 * Props:
 * @param {string} linkName - Link name value [Required]
 * @param {function} onLinkNameChange - Link name setter [Required]
 * @param {string[]} linkNameOptions - Autocomplete options for link name [Required]
 * @param {string} shortLinkId - Short link ID value [Required]
 * @param {function} onShortLinkIdChange - Short link ID setter [Required]
 * @param {string[]} shortLinkIdOptions - Autocomplete options for short link ID [Required]
 * @param {string} resolvedTemplateId - Resolved template ID value [Required]
 * @param {function} onTemplateIdChange - Template ID change handler [Required]
 * @param {string[]} templateIdOptions - Template ID options [Required]
 * @param {string} resolvedBrandDomain - Resolved brand domain value [Required]
 * @param {function} onBrandDomainChange - Brand domain onChange handler [Required]
 * @param {function} onBrandDomainInputChange - Brand domain onInputChange handler [Required]
 * @param {string[]} brandDomainOptions - Brand domain options [Required]
 * @param {string} mediaSource - Media source value [Required]
 * @param {function} onMediaSourceChange - Media source setter [Required]
 * @param {string[]} mediaSourceOptions - Media source options [Required]
 * @param {string} campaignName - Campaign name value [Required]
 * @param {function} onCampaignNameChange - Campaign name setter [Required]
 * @param {string[]} campaignOptions - Campaign options [Required]
 * @param {string} adSet - Ad set value [Required]
 * @param {function} onAdSetChange - Ad set setter [Required]
 * @param {string[]} adSetOptions - Ad set options [Required]
 * @param {string} adName - Ad name value [Required]
 * @param {function} onAdNameChange - Ad name setter [Required]
 * @param {string[]} adNameOptions - Ad name options [Required]
 * @param {string} channel - Channel value [Required]
 * @param {function} onChannelChange - Channel setter [Required]
 * @param {string[]} channelOptions - Channel options [Required]
 * @param {boolean} isRetargeting - Retargeting checkbox state [Required]
 * @param {function} onRetargetingChange - Retargeting setter [Required]
 * @param {boolean} isEditMode - Whether in edit mode [Required]
 * @param {boolean} isInitialLoadPending - Whether initial load is pending [Required]
 * @param {boolean} hasLinkNameError - Link name validation error [Required]
 * @param {boolean} hasTemplateIdError - Template ID validation error [Required]
 * @param {boolean} hasMediaSourceError - Media source validation error [Required]
 *
 * Example usage:
 * <LinkSetupSection linkName={linkName} onLinkNameChange={setLinkName} ... />
 */
function LinkSetupSection({
  linkName,
  onLinkNameChange,
  linkNameOptions,
  shortLinkId,
  onShortLinkIdChange,
  shortLinkIdOptions,
  resolvedTemplateId,
  onTemplateIdChange,
  templateIdOptions,
  resolvedBrandDomain,
  onBrandDomainChange,
  onBrandDomainInputChange,
  brandDomainOptions,
  mediaSource,
  onMediaSourceChange,
  mediaSourceOptions,
  campaignName,
  onCampaignNameChange,
  campaignOptions,
  adSet,
  onAdSetChange,
  adSetOptions,
  adName,
  onAdNameChange,
  adNameOptions,
  channel,
  onChannelChange,
  channelOptions,
  isRetargeting,
  onRetargetingChange,
  isEditMode,
  isInitialLoadPending,
  hasLinkNameError,
  hasTemplateIdError,
  hasMediaSourceError,
}: {
  linkName: string;
  onLinkNameChange: (value: string) => void;
  linkNameOptions: string[];
  shortLinkId: string;
  onShortLinkIdChange: (value: string) => void;
  shortLinkIdOptions: string[];
  resolvedTemplateId: string;
  onTemplateIdChange: (value: string) => void;
  templateIdOptions: string[];
  resolvedBrandDomain: string;
  onBrandDomainChange: (event: React.SyntheticEvent, value: string | null, reason: string) => void;
  onBrandDomainInputChange: (event: React.SyntheticEvent, value: string, reason: string) => void;
  brandDomainOptions: string[];
  mediaSource: string;
  onMediaSourceChange: (value: string) => void;
  mediaSourceOptions: string[];
  campaignName: string;
  onCampaignNameChange: (value: string) => void;
  campaignOptions: string[];
  adSet: string;
  onAdSetChange: (value: string) => void;
  adSetOptions: string[];
  adName: string;
  onAdNameChange: (value: string) => void;
  adNameOptions: string[];
  channel: string;
  onChannelChange: (value: string) => void;
  channelOptions: string[];
  isRetargeting: boolean;
  onRetargetingChange: (checked: boolean) => void;
  isEditMode: boolean;
  isInitialLoadPending: boolean;
  hasLinkNameError: boolean;
  hasTemplateIdError: boolean;
  hasMediaSourceError: boolean;
}) {
  return (
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
          <AutocompleteField
            label='Link Name'
            value={ linkName }
            onValueChange={ onLinkNameChange }
            options={ linkNameOptions }
            placeholder='e.g. Summer Campaign 2024'
            isRequired
            hasError={ hasLinkNameError }
            isDisabled={ isInitialLoadPending }
          />
          <AutocompleteField
            label='Short Link ID'
            value={ shortLinkId }
            onValueChange={ onShortLinkIdChange }
            options={ shortLinkIdOptions }
            placeholder='e.g. abc123'
            isDisabled={ isEditMode || isInitialLoadPending }
          />
        </Box>

        <Box
          sx={ {
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
            rowGap: 2,
          } }
        >
          <AutocompleteField
            label='Template ID'
            value={ resolvedTemplateId }
            onValueChange={ onTemplateIdChange }
            options={ templateIdOptions }
            placeholder='Select or type template ID'
            isRequired
            hasError={ hasTemplateIdError }
            isDisabled={ isEditMode || isInitialLoadPending }
          />
          <Box>
            <Typography sx={ { fontSize: 13, fontWeight: 500, mb: 0.75 } }>Brand Domain</Typography>
            <Autocomplete<string, false, false, true>
              disabled={ isInitialLoadPending }
              forcePopupIcon
              freeSolo
              fullWidth
              inputValue={ resolvedBrandDomain }
              onChange={ onBrandDomainChange }
              onInputChange={ onBrandDomainInputChange }
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
          <AutocompleteField
            label='Media Source (pid)'
            value={ mediaSource }
            onValueChange={ onMediaSourceChange }
            options={ mediaSourceOptions }
            placeholder='Select or type media source'
            isRequired
            hasError={ hasMediaSourceError }
          />
          <AutocompleteField
            label='Campaign Name (c)'
            value={ campaignName }
            onValueChange={ onCampaignNameChange }
            options={ campaignOptions }
          />
          <AutocompleteField label='Ad Set (af_adset)' value={ adSet } onValueChange={ onAdSetChange } options={ adSetOptions } />
          <AutocompleteField label='Ad Name (af_ad)' value={ adName } onValueChange={ onAdNameChange } options={ adNameOptions } />
          <AutocompleteField label='Channel (af_channel)' value={ channel } onValueChange={ onChannelChange } options={ channelOptions } />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={ isRetargeting }
              onChange={ (event) => onRetargetingChange(event.target.checked) }
            />
          }
          label='Retargeting measurement (is_retargeting=true)'
        />
      </Stack>
    </Box>
  );
}

export default LinkSetupSection;
