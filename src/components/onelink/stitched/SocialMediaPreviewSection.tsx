/**
 * Social Media Preview section: Open Graph title, description, image URL inputs
 * with a Facebook/LinkedIn-style preview card.
 */
'use client';

import { Image02Icon } from '@hugeicons/core-free-icons';
import { Box, Paper, Stack, Typography } from '@mui/material';
import HugeIcon from '@/components/shared/HugeIcon';
import AutocompleteField from './AutocompleteField';

/**
 * SocialMediaPreviewSection component
 *
 * Props:
 * @param {string} ogTitle - Open Graph title value [Required]
 * @param {function} onOgTitleChange - OG title setter [Required]
 * @param {string[]} ogTitleOptions - OG title autocomplete options [Required]
 * @param {string} ogDescription - Open Graph description value [Required]
 * @param {function} onOgDescriptionChange - OG description setter [Required]
 * @param {string[]} ogDescriptionOptions - OG description options [Required]
 * @param {string} ogImage - Open Graph image URL [Required]
 * @param {function} onOgImageChange - OG image setter [Required]
 * @param {string[]} ogImageOptions - OG image options [Required]
 *
 * Example usage:
 * <SocialMediaPreviewSection ogTitle={title} onOgTitleChange={setTitle} ... />
 */
function SocialMediaPreviewSection({
  ogTitle,
  onOgTitleChange,
  ogTitleOptions,
  ogDescription,
  onOgDescriptionChange,
  ogDescriptionOptions,
  ogImage,
  onOgImageChange,
  ogImageOptions,
}: {
  ogTitle: string;
  onOgTitleChange: (value: string) => void;
  ogTitleOptions: string[];
  ogDescription: string;
  onOgDescriptionChange: (value: string) => void;
  ogDescriptionOptions: string[];
  ogImage: string;
  onOgImageChange: (value: string) => void;
  ogImageOptions: string[];
}) {
  return (
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
          <AutocompleteField label='Open Graph Title' value={ ogTitle } onValueChange={ onOgTitleChange } options={ ogTitleOptions } />
          <AutocompleteField
            label='Open Graph Description'
            value={ ogDescription }
            onValueChange={ onOgDescriptionChange }
            options={ ogDescriptionOptions }
          />
          <AutocompleteField label='Image URL' value={ ogImage } onValueChange={ onOgImageChange } options={ ogImageOptions } />
        </Stack>

        <Stack justifyContent='center'>
          <Paper
            elevation={ 0 }
            sx={ {
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
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
  );
}

export default SocialMediaPreviewSection;
