/**
 * Handles OneLink list row actions such as copy, duplicate, delete, and action-menu state.
 */

import { useMemo, useState, type Dispatch, type MouseEvent, type SetStateAction } from 'react';
import { type OneLinkRecord, sanitizeOneLinkRecords } from '@/lib/onelinkLinksSchema';
import type {
  OneLinkCreateResponse,
  OneLinkDeleteResponse,
  OneLinkDetailResponse,
} from './types';
import { buildLongUrlPreview } from './utils';

type UseOneLinkRowActionsArgs = {
  records: OneLinkRecord[];
  setActionError: Dispatch<SetStateAction<string>>;
  setActionSuccess: Dispatch<SetStateAction<string>>;
  setRecords: Dispatch<SetStateAction<OneLinkRecord[]>>;
};

export function useOneLinkRowActions({
  records,
  setActionError,
  setActionSuccess,
  setRecords,
}: UseOneLinkRowActionsArgs) {
  const [copiedRecordId, setCopiedRecordId] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const [actionsRecordId, setActionsRecordId] = useState('');

  const activeActionRecord = useMemo(
    () => records.find((record) => record.id === actionsRecordId) || null,
    [actionsRecordId, records],
  );

  const isActionsMenuOpen = Boolean(actionsAnchorEl);

  const handleCopyShortLink = async (record: OneLinkRecord) => {
    try {
      await navigator.clipboard.writeText(record.shortLink);
      setCopiedRecordId(record.id);
      setTimeout(() => {
        setCopiedRecordId('');
      }, 1500);
    } catch {
      setCopiedRecordId('');
    }
  };

  const handleDeleteRecord = async (record: OneLinkRecord) => {
    if (activeRecordId) {
      return;
    }

    const confirmed = window.confirm(`Delete "${record.linkName}" from AppsFlyer and this console?`);
    if (!confirmed) {
      return;
    }

    setActiveRecordId(record.id);
    setActionError('');
    setActionSuccess('');

    try {
      const response = await fetch(`/api/onelinks/${encodeURIComponent(record.id)}`, {
        method: 'DELETE',
      });
      const payload = (await response.json().catch(() => null)) as OneLinkDeleteResponse | null;

      if (!response.ok) {
        setActionError(payload?.error || 'Failed to delete OneLink.');
        return;
      }

      setRecords((previous) => previous.filter((item) => item.id !== record.id));
      if (payload?.remoteDeleted === false) {
        setActionSuccess('Local record removed. AppsFlyer link was already deleted.');
      } else {
        setActionSuccess('OneLink has been deleted.');
      }
    } catch {
      setActionError('Failed to delete OneLink.');
    } finally {
      setActiveRecordId('');
    }
  };

  const handleDuplicateRecord = async (record: OneLinkRecord) => {
    if (activeRecordId) {
      return;
    }

    setActiveRecordId(record.id);
    setActionError('');
    setActionSuccess('');

    try {
      const detailResponse = await fetch(`/api/onelinks/${encodeURIComponent(record.id)}`, {
        cache: 'no-store',
        method: 'GET',
      });
      const detailPayload = (await detailResponse.json().catch(() => null)) as OneLinkDetailResponse | null;

      if (!detailResponse.ok || !detailPayload?.record) {
        setActionError(detailPayload?.error || 'Failed to load OneLink for duplication.');
        return;
      }

      const oneLinkData = detailPayload.remote?.oneLinkData || {};
      const createResponse = await fetch('/api/onelinks', {
        body: JSON.stringify({
          brandDomain: detailPayload.record.brandDomain,
          campaignName: oneLinkData.c || detailPayload.record.campaignName,
          channel: oneLinkData.af_channel || detailPayload.record.channel,
          creationType: detailPayload.record.creationType,
          linkName: `${detailPayload.record.linkName} (Copy)`.slice(0, 160),
          longUrlPreview: buildLongUrlPreview(detailPayload.record.templateId, oneLinkData),
          mediaSource: oneLinkData.pid || detailPayload.record.mediaSource,
          oneLinkData,
          shortLinkId: '',
          templateId: detailPayload.record.templateId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const createPayload = (await createResponse.json().catch(() => null)) as
        | OneLinkCreateResponse
        | OneLinkRecord
        | null;
      const createErrorMessage =
        createPayload
        && typeof createPayload === 'object'
        && 'error' in createPayload
        && typeof createPayload.error === 'string'
          ? createPayload.error
          : '';

      if (!createResponse.ok) {
        setActionError(createErrorMessage || 'Failed to duplicate OneLink.');
        return;
      }

      const [duplicatedRecord] = sanitizeOneLinkRecords([createPayload]);
      if (!duplicatedRecord) {
        setActionError('Duplicated OneLink response was invalid.');
        return;
      }

      setRecords((previous) => [duplicatedRecord, ...previous]);
      setActionSuccess(`"${record.linkName}" has been duplicated.`);
    } catch {
      setActionError('Failed to duplicate OneLink.');
    } finally {
      setActiveRecordId('');
    }
  };

  const handleOpenActionsMenu = (event: MouseEvent<HTMLButtonElement>, recordId: string) => {
    setActionsAnchorEl(event.currentTarget);
    setActionsRecordId(recordId);
  };

  const handleCloseActionsMenu = () => {
    setActionsAnchorEl(null);
    setActionsRecordId('');
  };

  return {
    activeActionRecord,
    activeRecordId,
    actionsAnchorEl,
    copiedRecordId,
    handleCloseActionsMenu,
    handleCopyShortLink,
    handleDeleteRecord,
    handleDuplicateRecord,
    handleOpenActionsMenu,
    isActionsMenuOpen,
  };
}
