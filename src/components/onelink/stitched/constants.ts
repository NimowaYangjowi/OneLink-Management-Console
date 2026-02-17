/**
 * Constants and utility helpers shared across OneLinkStitchedPage sub-components.
 */

export const MAPPED_ONELINK_FIELDS = new Set([
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

export function toBooleanFlag(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase() || '';
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}
