/**
 * Shared type definitions for the OneLinkStitchedPage component tree.
 */
import type { OneLinkCreationType, OneLinkRecord } from '@/lib/onelinkLinksSchema';

export type ParameterRow = {
  id: number;
  key: string;
  value: string;
};

export type OneLinkStitchedPageProps = {
  creationType?: OneLinkCreationType;
  createActionLabel?: string;
  mode?: 'create' | 'edit';
  recordId?: string;
};

export type OneLinkDetailResponse = {
  error?: string;
  record?: OneLinkRecord;
  remote?: {
    oneLinkData?: Record<string, string>;
    shortLinkId?: string;
    ttl?: string;
  };
};

export type OneLinkUpdateResponse = {
  error?: string;
  record?: OneLinkRecord;
};
