/**
 * Type definitions shared across OneLink list-page modules.
 */

import type { OneLinkCreationType, OneLinkRecord } from '@/lib/onelinkLinksSchema';

export type FilterChipOption<T extends string> = {
  label: string;
  value: T;
};

export type FilterChipSelectProps<T extends string> = {
  label: string;
  onChange: (value: T) => void;
  options: ReadonlyArray<FilterChipOption<T>>;
  value: T;
};

export type OneLinkDeleteResponse = {
  deleted?: boolean;
  error?: string;
  remoteDeleted?: boolean;
};

export type OneLinkCreateResponse = {
  error?: string;
};

export type OneLinkDetailResponse = {
  error?: string;
  record?: OneLinkRecord;
  remote?: {
    oneLinkData?: Record<string, string>;
  };
};

export type SearchParamsReader = {
  get: (key: string) => string | null;
};

export type OneLinkTabType = OneLinkCreationType;
