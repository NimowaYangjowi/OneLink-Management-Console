/**
 * Reconstructed OneLink creation dashboard from design/stitch/code.html using React and MUI components.
 */
'use client';

import {
  Add01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  Image02Icon,
  PreferenceVerticalIcon,
  QrCodeIcon,
  Route02Icon,
  Settings02Icon,
  Share08Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Orbit } from 'lucide-react';
import { useMemo, useState } from 'react';
import HugeIcon from '@/components/shared/HugeIcon';

type NavItem = {
  icon: IconSvgElement;
  label: string;
};

type ParamRow = {
  id: number;
  key: string;
  value: string;
};

const palette = {
  accent: '#eef2ff',
  background: '#f8fafc',
  border: '#e2e8f0',
  card: '#ffffff',
  destructive: '#ef4444',
  foreground: '#0f172a',
  mutedForeground: '#64748b',
  primary: '#4f46e5',
  secondary: '#f1f5f9',
} as const;

const mediaSourceOptions = ['Email', 'Social Media', 'SMS', 'QR Code', 'Custom'] as const;

const navigationItems: NavItem[] = [
  { label: 'Create OneLink', icon: Add01Icon },
  { label: 'Settings', icon: Settings02Icon },
];

const avatarImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCKdSRrn1uiU5ec68cx3ILZ_HLIKb6L8uHO1O5-SN2Y2T1s_gmQCDgmN3H0D0jWQ_ElH5mhDASh9nHBUrka56rnWnkEf1TOxCxhY4QmKuu_Gj_vbP4zdxz1Tp13bmuMZICYdTtuHUK1PVsldNDe7C_CpyExYw5rz_rzYpieoEA_QNoMdNMbsyIONsiE3usZWXi8FKaIIO8CG-80u9ev3W3cSTpg8NoJ5seK0YPE1BhRTRzGm7k0E6TYEdR93ZpWNJy1FkZILL6bqSg';

const inputSx = {
  '& .MuiOutlinedInput-root': {
    '& .MuiOutlinedInput-input': {
      fontSize: 14,
      py: 2,
    },
    '& fieldset': {
      borderColor: palette.border,
    },
    '&:hover fieldset': {
      borderColor: palette.border,
    },
    '&.Mui-focused fieldset': {
      borderColor: palette.primary,
      borderWidth: 1,
    },
    backgroundColor: palette.background,
    borderRadius: 2.25,
  },
  '& .MuiInputLabel-root': {
    fontSize: 14,
  },
};

const plainInputSx = {
  ...inputSx,
  '& .MuiOutlinedInput-root': {
    ...inputSx['& .MuiOutlinedInput-root'],
    backgroundColor: '#ffffff',
  },
};

function OneLinkStitchedPage() {
  const [campaignName, setCampaignName] = useState('utm_campaign');
  const [desktopFallbackUrl, setDesktopFallbackUrl] = useState('https://www.website.com/promo');
  const [deepLinkUri, setDeepLinkUri] = useState('myapp://product/123');
  const [iosFallbackUrl] = useState('https://apps.apple.com/app/id123456');
  const [isCopied, setIsCopied] = useState(false);
  const [linkName, setLinkName] = useState('Summer Campaign 2024');
  const [mediaSource, setMediaSource] = useState<(typeof mediaSourceOptions)[number]>('Email');
  const [ogDescription, setOgDescription] = useState(
    'Download our app today and experience the best shopping experience.',
  );
  const [ogImage, setOgImage] = useState('https://assets.example.com/promo.jpg');
  const [ogTitle, setOgTitle] = useState('Get 50% Off Your First Order');
  const [params, setParams] = useState<ParamRow[]>([
    { id: 1, key: 'af_sub1', value: '' },
    { id: 2, key: 'af_sub2', value: '' },
  ]);
  const [playStoreFallbackUrl] = useState('https://play.google.com/store/apps/details?id=com.myapp');

  const shortLink = 'https://go.onelink.me/xyz/summer24';

  const generatedLongUrl = useMemo(() => {
    const query = new URLSearchParams();
    query.set('pid', mediaSource);

    if (campaignName.trim()) {
      query.set('c', campaignName.trim().replaceAll(' ', '_'));
    }

    if (deepLinkUri.trim()) {
      query.set('af_dp', deepLinkUri.trim());
    }

    if (desktopFallbackUrl.trim()) {
      query.set('af_web_dp', desktopFallbackUrl.trim());
    }

    params.forEach((param) => {
      const key = param.key.trim();
      const value = param.value.trim();
      if (key && value) {
        query.set(key, value);
      }
    });

    return `https://app.onelink.me/5whu?${query.toString()}`;
  }, [campaignName, deepLinkUri, desktopFallbackUrl, mediaSource, params]);

  const handleAddParameter = () => {
    const nextId = params.length ? Math.max(...params.map((param) => param.id)) + 1 : 1;
    setParams((previous) => [...previous, { id: nextId, key: '', value: '' }]);
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

  const handleParameterChange = (
    id: number,
    field: keyof Pick<ParamRow, 'key' | 'value'>,
    value: string,
  ) => {
    setParams((previous) =>
      previous.map((param) => (param.id === id ? { ...param, [field]: value } : param)),
    );
  };

  const handleParameterDelete = (id: number) => {
    setParams((previous) => previous.filter((param) => param.id !== id));
  };

  return (
    <Box sx={ { backgroundColor: palette.background, display: 'flex', minHeight: '100vh' } }>
      <Box
        component='aside'
        sx={ {
          backgroundColor: palette.card,
          borderColor: palette.border,
          borderRight: `1px solid ${palette.border}`,
          display: { lg: 'flex', xs: 'none' },
          flexDirection: 'column',
          height: '100vh',
          left: 0,
          position: 'fixed',
          top: 0,
          width: 256,
          zIndex: 30,
        } }
      >
        <Box sx={ { borderBottom: `1px solid ${palette.border}`, px: 3, py: 3 } }>
          <Stack alignItems='center' direction='row' spacing={ 1.25 }>
            <HugeIcon color={ palette.primary } fallback={ Orbit } size={ 28 } />
            <Typography sx={ { color: '#111827', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' } }>
              OneLink
            </Typography>
          </Stack>
        </Box>

        <Stack spacing={ 0.5 } sx={ { flex: 1, overflowY: 'auto', px: 2, py: 3 } }>
          {navigationItems.map((item, index) => {
            const isActive = index === 0;
            return (
              <Button
                key={ item.label }
                startIcon={ <HugeIcon color='currentColor' icon={ item.icon } size={ 19 } /> }
                sx={ {
                  '& .MuiButton-startIcon': { mr: 1.25 },
                  '&:hover': {
                    backgroundColor: palette.secondary,
                    color: palette.foreground,
                  },
                  backgroundColor: isActive ? palette.secondary : 'transparent',
                  borderRadius: 2,
                  color: isActive ? palette.foreground : palette.mutedForeground,
                  fontSize: 13,
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  minHeight: 42,
                  px: 1.25,
                  textTransform: 'none',
                } }
                variant='text'
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>

        <Box sx={ { borderTop: `1px solid ${palette.border}`, p: 2 } }>
          <Stack alignItems='center' direction='row' spacing={ 1.25 }>
            <Avatar alt='Alex Morgan' src={ avatarImage } sx={ { height: 36, width: 36 } } />
            <Box sx={ { minWidth: 0 } }>
              <Typography noWrap sx={ { color: palette.foreground, fontSize: 13, fontWeight: 500 } }>
                Alex Morgan
              </Typography>
              <Typography noWrap sx={ { color: palette.mutedForeground, fontSize: 11 } }>
                alex.m@company.com
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box
        component='main'
        sx={ {
          flex: 1,
          minHeight: '100vh',
          ml: { lg: '256px' },
          pb: 8,
        } }
      >
        <Box
          component='header'
          sx={ {
            alignItems: 'center',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(248, 250, 252, 0.84)',
            borderBottom: `1px solid ${palette.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            px: { md: 4, xs: 2 },
            py: 2,
            position: 'sticky',
            top: 0,
            zIndex: 20,
          } }
        >
          <Typography sx={ { color: palette.foreground, fontSize: 22, fontWeight: 600 } }>
            Create New OneLink
          </Typography>
          <Stack direction='row' spacing={ 1.5 }>
            <Button
              sx={ {
                '&:hover': { color: palette.foreground },
                color: palette.mutedForeground,
                fontSize: 14,
                fontWeight: 500,
                textTransform: 'none',
              } }
              variant='text'
            >
              Cancel
            </Button>
            <Button
              sx={ {
                '&:hover': {
                  backgroundColor: palette.secondary,
                  borderColor: palette.border,
                },
                backgroundColor: palette.card,
                borderColor: palette.border,
                borderRadius: 2,
                color: palette.foreground,
                fontSize: 14,
                fontWeight: 500,
                px: 2,
                textTransform: 'none',
              } }
              variant='outlined'
            >
              Save &amp; Activate
            </Button>
          </Stack>
        </Box>

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
                '&:hover': {
                  boxShadow: '0 16px 28px rgba(15, 23, 42, 0.08)',
                },
                border: `1px solid ${palette.border}`,
                borderRadius: 3,
                p: 3,
                transition: 'box-shadow 180ms ease',
              } }
            >
              <Stack direction='row' spacing={ 1.5 } sx={ { mb: 3 } }>
                <Box
                  sx={ {
                    alignItems: 'center',
                    backgroundColor: palette.accent,
                    borderRadius: '999px',
                    color: palette.primary,
                    display: 'flex',
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  } }
                >
                  <HugeIcon color='currentColor' icon={ Edit02Icon } size={ 20 } />
                </Box>
                <Box>
                  <Typography sx={ { color: palette.foreground, fontSize: 22, fontWeight: 600 } }>
                    Link Setup
                  </Typography>
                  <Typography sx={ { color: palette.mutedForeground, fontSize: 14 } }>
                    Define the basic properties of your tracking link.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={ 2 }>
                <Box>
                  <Typography sx={ { color: palette.foreground, fontSize: 13, fontWeight: 500, mb: 0.75 } }>
                    Link Name
                  </Typography>
                  <TextField
                    fullWidth
                    onChange={ (event) => setLinkName(event.target.value) }
                    placeholder='e.g. Summer Campaign 2024'
                    sx={ inputSx }
                    value={ linkName }
                  />
                </Box>

                <Box sx={ { columnGap: 2, display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, rowGap: 2 } }>
                  <Box>
                    <Typography sx={ { color: palette.foreground, fontSize: 13, fontWeight: 500, mb: 0.75 } }>
                      Media Source
                    </Typography>
                    <TextField
                      fullWidth
                      onChange={ (event) => setMediaSource(event.target.value as (typeof mediaSourceOptions)[number]) }
                      select
                      sx={ inputSx }
                      value={ mediaSource }
                    >
                      {mediaSourceOptions.map((option) => (
                        <MenuItem key={ option } value={ option }>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                  <Box>
                    <Typography sx={ { color: palette.foreground, fontSize: 13, fontWeight: 500, mb: 0.75 } }>
                      Campaign Name
                    </Typography>
                    <TextField
                      fullWidth
                      onChange={ (event) => setCampaignName(event.target.value) }
                      sx={ inputSx }
                      value={ campaignName }
                    />
                  </Box>
                </Box>
              </Stack>
            </Paper>

            <Paper
              elevation={ 0 }
              sx={ {
                '&:hover': {
                  boxShadow: '0 16px 28px rgba(15, 23, 42, 0.08)',
                },
                border: `1px solid ${palette.border}`,
                borderRadius: 3,
                p: 3,
                transition: 'box-shadow 180ms ease',
              } }
            >
              <Stack direction='row' spacing={ 1.5 } sx={ { mb: 3 } }>
                <Box
                  sx={ {
                    alignItems: 'center',
                    backgroundColor: '#fff7ed',
                    borderRadius: '999px',
                    color: '#ea580c',
                    display: 'flex',
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  } }
                >
                  <HugeIcon color='currentColor' icon={ Route02Icon } size={ 20 } />
                </Box>
                <Box>
                  <Typography sx={ { color: palette.foreground, fontSize: 22, fontWeight: 600 } }>
                    Deep Linking &amp; Redirection
                  </Typography>
                  <Typography sx={ { color: palette.mutedForeground, fontSize: 14 } }>
                    Where should users go if they have the app vs. if they don&apos;t.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={ 2 }>
                <Paper
                  elevation={ 0 }
                  sx={ {
                    backgroundColor: palette.background,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 2.5,
                    p: 2,
                  } }
                >
                  <Stack direction='row' spacing={ 1.25 }>
                    <Box sx={ { color: '#16a34a', pt: 0.3 } }>
                      <HugeIcon color='currentColor' icon={ CheckmarkCircle02Icon } size={ 20 } />
                    </Box>
                    <Box sx={ { width: '100%' } }>
                      <Typography sx={ { color: palette.foreground, fontSize: 14, fontWeight: 500 } }>
                        When App IS Installed
                      </Typography>
                      <Typography sx={ { color: palette.mutedForeground, fontSize: 12, mb: 0.75, mt: 1.25 } }>
                        Deep Link URI Scheme
                      </Typography>
                      <TextField
                        fullWidth
                        onChange={ (event) => setDeepLinkUri(event.target.value) }
                        sx={ plainInputSx }
                        value={ deepLinkUri }
                      />
                      <Typography sx={ { color: palette.mutedForeground, fontSize: 12, mt: 1 } }>
                        This path will open directly inside your app.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper
                  elevation={ 0 }
                  sx={ {
                    backgroundColor: palette.background,
                    border: `1px solid ${palette.border}`,
                    borderRadius: 2.5,
                    p: 2,
                  } }
                >
                  <Stack direction='row' spacing={ 1.25 }>
                    <Box sx={ { color: palette.mutedForeground, pt: 0.3 } }>
                      <HugeIcon color='currentColor' icon={ Download01Icon } size={ 20 } />
                    </Box>
                    <Box sx={ { width: '100%' } }>
                      <Typography sx={ { color: palette.foreground, fontSize: 14, fontWeight: 500 } }>
                        When App IS NOT Installed (Fallback)
                      </Typography>

                      <Box sx={ { columnGap: 2, display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, mt: 1.5, rowGap: 1.5 } }>
                        <Box>
                          <Typography sx={ { color: palette.mutedForeground, fontSize: 12, mb: 0.75 } }>
                            Android Fallback
                          </Typography>
                          <TextField
                            fullWidth
                            InputProps={ { readOnly: true } }
                            sx={ plainInputSx }
                            value={ playStoreFallbackUrl }
                          />
                        </Box>
                        <Box>
                          <Typography sx={ { color: palette.mutedForeground, fontSize: 12, mb: 0.75 } }>
                            iOS Fallback
                          </Typography>
                          <TextField
                            fullWidth
                            InputProps={ { readOnly: true } }
                            sx={ plainInputSx }
                            value={ iosFallbackUrl }
                          />
                        </Box>
                      </Box>

                      <Box sx={ { mt: 1.5 } }>
                        <Typography sx={ { color: palette.mutedForeground, fontSize: 12, mb: 0.75 } }>
                          Desktop Fallback URL
                        </Typography>
                        <TextField
                          fullWidth
                          onChange={ (event) => setDesktopFallbackUrl(event.target.value) }
                          sx={ plainInputSx }
                          value={ desktopFallbackUrl }
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Paper>

            <Paper
              elevation={ 0 }
              sx={ {
                '&:hover': {
                  boxShadow: '0 16px 28px rgba(15, 23, 42, 0.08)',
                },
                border: `1px solid ${palette.border}`,
                borderRadius: 3,
                p: 3,
                transition: 'box-shadow 180ms ease',
              } }
            >
              <Box sx={ { alignItems: 'center', display: 'flex', justifyContent: 'space-between', mb: 2 } }>
                <Stack direction='row' spacing={ 1.5 }>
                  <Box
                    sx={ {
                      alignItems: 'center',
                      backgroundColor: '#eff6ff',
                      borderRadius: '999px',
                      color: '#2563eb',
                      display: 'flex',
                      height: 40,
                      justifyContent: 'center',
                      width: 40,
                    } }
                  >
                    <HugeIcon color='currentColor' icon={ PreferenceVerticalIcon } size={ 20 } />
                  </Box>
                  <Box>
                    <Typography sx={ { color: palette.foreground, fontSize: 22, fontWeight: 600 } }>
                      Attribution Parameters
                    </Typography>
                    <Typography sx={ { color: palette.mutedForeground, fontSize: 14 } }>
                      Add custom parameters for granular tracking.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  onClick={ handleAddParameter }
                  sx={ {
                    '&:hover': { color: palette.foreground, textDecoration: 'underline' },
                    color: palette.mutedForeground,
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
                {params.map((param) => (
                  <Stack direction='row' key={ param.id } spacing={ 1.25 }>
                    <TextField
                      fullWidth
                      onChange={ (event) => handleParameterChange(param.id, 'key', event.target.value) }
                      placeholder='Key (e.g. af_sub1)'
                      sx={ inputSx }
                      value={ param.key }
                    />
                    <TextField
                      fullWidth
                      onChange={ (event) => handleParameterChange(param.id, 'value', event.target.value) }
                      placeholder='Value'
                      sx={ inputSx }
                      value={ param.value }
                    />
                    <IconButton
                      aria-label='Delete parameter'
                      onClick={ () => handleParameterDelete(param.id) }
                      sx={ {
                        '&:hover': { backgroundColor: '#fef2f2' },
                        borderRadius: 2,
                        color: palette.destructive,
                        flexShrink: 0,
                      } }
                    >
                      <HugeIcon color='currentColor' icon={ Delete02Icon } size={ 18 } />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            <Paper
              elevation={ 0 }
              sx={ {
                '&:hover': {
                  boxShadow: '0 16px 28px rgba(15, 23, 42, 0.08)',
                },
                border: `1px solid ${palette.border}`,
                borderRadius: 3,
                p: 3,
                transition: 'box-shadow 180ms ease',
              } }
            >
              <Stack direction='row' spacing={ 1.5 } sx={ { mb: 3 } }>
                <Box
                  sx={ {
                    alignItems: 'center',
                    backgroundColor: '#fdf2f8',
                    borderRadius: '999px',
                    color: '#db2777',
                    display: 'flex',
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  } }
                >
                  <HugeIcon color='currentColor' icon={ Share08Icon } size={ 20 } />
                </Box>
                <Box>
                  <Typography sx={ { color: palette.foreground, fontSize: 22, fontWeight: 600 } }>
                    Social Media Preview
                  </Typography>
                  <Typography sx={ { color: palette.mutedForeground, fontSize: 14 } }>
                    Customize how your link appears when shared.
                  </Typography>
                </Box>
              </Stack>

              <Box sx={ { columnGap: 4, display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, rowGap: 3 } }>
                <Stack spacing={ 2 }>
                  <Box>
                    <Typography sx={ { color: palette.foreground, fontSize: 13, fontWeight: 500, mb: 0.75 } }>
                      Open Graph Title
                    </Typography>
                    <TextField
                      fullWidth
                      onChange={ (event) => setOgTitle(event.target.value) }
                      sx={ inputSx }
                      value={ ogTitle }
                    />
                  </Box>
                  <Box>
                    <Typography sx={ { color: palette.foreground, fontSize: 13, fontWeight: 500, mb: 0.75 } }>
                      Open Graph Description
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      onChange={ (event) => setOgDescription(event.target.value) }
                      rows={ 3 }
                      sx={ inputSx }
                      value={ ogDescription }
                    />
                  </Box>
                  <Box>
                    <Typography sx={ { color: palette.foreground, fontSize: 13, fontWeight: 500, mb: 0.75 } }>
                      Image URL
                    </Typography>
                    <TextField
                      fullWidth
                      onChange={ (event) => setOgImage(event.target.value) }
                      sx={ inputSx }
                      value={ ogImage }
                    />
                  </Box>
                </Stack>

                <Stack justifyContent='center'>
                  <Paper
                    elevation={ 0 }
                    sx={ {
                      backgroundColor: '#ffffff',
                      border: `1px solid ${palette.border}`,
                      borderRadius: 2,
                      maxWidth: 360,
                      mx: 'auto',
                      overflow: 'hidden',
                      width: '100%',
                    } }
                  >
                    <Box
                      sx={ {
                        alignItems: 'center',
                        backgroundColor: '#f3f4f6',
                        color: '#9ca3af',
                        display: 'flex',
                        height: 128,
                        justifyContent: 'center',
                      } }
                    >
                      <HugeIcon color='currentColor' icon={ Image02Icon } size={ 36 } />
                    </Box>
                    <Box sx={ { p: 1.5 } }>
                      <Typography sx={ { color: '#6b7280', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' } }>
                        example.onelink.me
                      </Typography>
                      <Typography sx={ { color: '#111827', fontSize: 14, fontWeight: 700, mt: 0.5 } }>
                        {ogTitle}
                      </Typography>
                      <Typography sx={ { color: '#4b5563', fontSize: 12, mt: 0.5 } }>
                        {ogDescription}
                      </Typography>
                    </Box>
                  </Paper>
                  <Typography sx={ { color: '#9ca3af', fontSize: 11, mt: 1.25, textAlign: 'center' } }>
                    Preview (Facebook/LinkedIn style)
                  </Typography>
                </Stack>
              </Box>
            </Paper>
          </Stack>

          <Box sx={ { flexShrink: 0, width: { xl: 384 } } }>
            <Stack spacing={ 2 } sx={ { position: { xl: 'sticky' }, top: { xl: 96 } } }>
              <Paper
                elevation={ 0 }
                sx={ {
                  border: `1px solid ${palette.border}`,
                  borderRadius: 3,
                  overflow: 'hidden',
                } }
              >
                <Box
                  sx={ {
                    backgroundColor: palette.secondary,
                    borderBottom: `1px solid ${palette.border}`,
                    px: 3,
                    py: 2,
                  } }
                >
                  <Stack alignItems='center' direction='row' spacing={ 1 }>
                    <HugeIcon color={ palette.foreground } icon={ ViewIcon } size={ 18 } />
                    <Typography sx={ { color: palette.foreground, fontSize: 16, fontWeight: 600 } }>
                      Live Link Preview
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={ 3 } sx={ { p: 3 } }>
                  <Box>
                    <Typography
                      sx={ {
                        color: palette.mutedForeground,
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
                        backgroundColor: palette.background,
                        border: `1px solid ${palette.border}`,
                        borderRadius: 2,
                        color: palette.foreground,
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
                        color: palette.mutedForeground,
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
                            <HugeIcon color='#22c55e' icon={ CheckmarkCircle02Icon } size={ 18 } />
                          </InputAdornment>
                        ),
                        readOnly: true,
                      } }
                      sx={ plainInputSx }
                      value={ shortLink }
                    />
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
                      '&:hover': { backgroundColor: palette.secondary },
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                      borderRadius: 2,
                      color: palette.foreground,
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
                    startIcon={ <HugeIcon color='currentColor' icon={ QrCodeIcon } size={ 18 } /> }
                    sx={ {
                      '&:hover': { backgroundColor: '#f8fafc' },
                      borderColor: palette.border,
                      borderRadius: 2,
                      color: palette.foreground,
                      fontSize: 14,
                      fontWeight: 500,
                      py: 1.1,
                      textTransform: 'none',
                    } }
                    variant='outlined'
                  >
                    Download QR Code
                  </Button>
                </Stack>

                <Box
                  sx={ {
                    alignItems: 'center',
                    backgroundColor: '#f9fafb',
                    borderTop: `1px solid ${palette.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    px: 3,
                    py: 1.5,
                  } }
                >
                  <Typography sx={ { color: palette.mutedForeground, fontSize: 12 } }>Est Clicks</Typography>
                  <Typography sx={ { color: palette.foreground, fontSize: 12, fontWeight: 600 } }>--</Typography>
                </Box>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default OneLinkStitchedPage;
