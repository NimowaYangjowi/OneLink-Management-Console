/**
 * Handles group create/update execution lifecycle, async polling, and retry actions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LinkGroupTreeNode } from '@/lib/onelinkGroupTypes';
import type { LinkGroupShortLinkIdConfig } from '@/lib/onelinkGroupTypes';
import type { ApplyMode, GroupExecutionDetail, ScopedParamRule } from '@/components/onelink/group-create/types';

type UseGroupExecutionArgs = {
  applyMode: ApplyMode;
  editGroupId?: string;
  globalParams: Record<string, string>;
  groupName: string;
  isEditHydrating: boolean;
  isEditMode: boolean;
  leafPathCount: number;
  onComplete: () => void;
  onSetWarnings: (warnings: string[]) => void;
  resolvedBrandDomain: string;
  shortLinkIdConfig: LinkGroupShortLinkIdConfig;
  resolvedTemplateId: string;
  scopedParams: ScopedParamRule[];
  serializedRoots: LinkGroupTreeNode[];
};

type GroupExecutionPayload = GroupExecutionDetail & { error?: string };

export function useGroupExecution({
  applyMode,
  editGroupId,
  globalParams,
  groupName,
  isEditHydrating,
  isEditMode,
  leafPathCount,
  onComplete,
  onSetWarnings,
  resolvedBrandDomain,
  shortLinkIdConfig,
  resolvedTemplateId,
  scopedParams,
  serializedRoots,
}: UseGroupExecutionArgs) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isPollingExecution, setIsPollingExecution] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdGroupId, setCreatedGroupId] = useState('');
  const [executionDetail, setExecutionDetail] = useState<GroupExecutionDetail | null>(null);

  const loadExecutionDetail = useCallback(async (groupId: string) => {
    const response = await fetch(`/api/onelink-groups/${encodeURIComponent(groupId)}?page=1&pageSize=50`, {
      cache: 'no-store',
      method: 'GET',
    });

    const payload = (await response.json().catch(() => null)) as GroupExecutionPayload | null;
    if (!response.ok || !payload || !payload.id) {
      throw new Error(payload?.error || 'Failed to load execution status.');
    }

    setExecutionDetail({
      failedCount: payload.failedCount,
      id: payload.id,
      items: payload.items,
      plannedCount: payload.plannedCount,
      status: payload.status,
      successCount: payload.successCount,
    });

    return payload;
  }, []);

  useEffect(() => {
    if (!createdGroupId) {
      return;
    }

    let isDisposed = false;
    let timer: number | null = null;

    const stopTimer = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const startTimer = () => {
      if (timer !== null) {
        return;
      }

      timer = window.setInterval(() => {
        void poll();
      }, 2000);
    };

    const poll = async () => {
      try {
        const detail = await loadExecutionDetail(createdGroupId);
        if (isDisposed) {
          return;
        }

        if (detail.status === 'running') {
          setIsPollingExecution(true);
          startTimer();
        } else {
          setIsPollingExecution(false);
          stopTimer();
        }
      } catch {
        if (!isDisposed) {
          setIsPollingExecution(false);
          stopTimer();
        }
      }
    };

    void poll();

    return () => {
      isDisposed = true;
      stopTimer();
    };
  }, [createdGroupId, loadExecutionDetail]);

  const executionProgressPercent = useMemo(() => {
    if (!executionDetail || executionDetail.plannedCount < 1) {
      return 0;
    }

    const processed = executionDetail.successCount + executionDetail.failedCount;
    return Math.min(100, Math.round((processed / executionDetail.plannedCount) * 100));
  }, [executionDetail]);

  const canRetryFailedItems = useMemo(() => {
    if (!executionDetail) {
      return false;
    }

    return executionDetail.failedCount > 0 && executionDetail.status !== 'running' && !isRetrying;
  }, [executionDetail, isRetrying]);

  const handleExecute = useCallback(async () => {
    if (isEditHydrating) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setCreatedGroupId('');
    setExecutionDetail(null);
    setIsPollingExecution(false);

    try {
      const basePayload = {
        brandDomain: resolvedBrandDomain.trim(),
        globalParams,
        name: groupName.trim(),
        scopedParams,
        shortLinkIdConfig,
        templateId: resolvedTemplateId.trim(),
        treeConfig: {
          roots: serializedRoots,
          version: 1,
        },
      };

      const isEditRequest = Boolean(editGroupId);
      const response = await fetch(isEditRequest ? `/api/onelink-groups/${encodeURIComponent(editGroupId as string)}` : '/api/onelink-groups', {
        body: JSON.stringify(
          isEditRequest
            ? {
                ...basePayload,
                applyMode,
              }
            : basePayload,
        ),
        headers: {
          'content-type': 'application/json',
        },
        method: isEditRequest ? 'PUT' : 'POST',
      });

      const payload = (await response.json().catch(() => null)) as (
        {
          diff?: {
            addedPaths: string[];
            failedPaths: string[];
            removedPaths: string[];
            unchangedPaths: string[];
          };
          error?: string;
          execution?: {
            status?: string;
            targetedItemCount?: number;
          };
          group?: { id: string };
          warnings?: string[];
        }
      ) | null;

      if (!response.ok || !payload?.group?.id) {
        setSubmitError(payload?.error || (isEditRequest ? 'Failed to update link group.' : 'Failed to create link group.'));
        return;
      }

      if (isEditRequest) {
        const diffSummary: string[] = [];
        if (payload.diff) {
          if (payload.diff.addedPaths.length > 0) {
            diffSummary.push(`Added paths: ${payload.diff.addedPaths.length}`);
          }
          if (payload.diff.removedPaths.length > 0) {
            diffSummary.push(`Removed paths: ${payload.diff.removedPaths.length}`);
          }
          if (payload.diff.failedPaths.length > 0) {
            diffSummary.push(`Previously failed paths retained: ${payload.diff.failedPaths.length}`);
          }
          diffSummary.push(`Unchanged paths: ${payload.diff.unchangedPaths.length}`);
        }

        onSetWarnings(diffSummary);
      } else {
        onSetWarnings(payload.warnings ?? []);
      }

      setCreatedGroupId(payload.group.id);

      const shouldPoll = payload.execution?.status === 'running'
        && (payload.execution.targetedItemCount ?? leafPathCount) > 0;
      setIsPollingExecution(shouldPoll);

      if (shouldPoll) {
        await loadExecutionDetail(payload.group.id);
      }

      onComplete();
    } catch {
      setSubmitError(isEditMode ? 'Failed to update link group.' : 'Failed to create link group.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    applyMode,
    editGroupId,
    globalParams,
    groupName,
    isEditHydrating,
    isEditMode,
    leafPathCount,
    loadExecutionDetail,
    onComplete,
    onSetWarnings,
    resolvedBrandDomain,
    shortLinkIdConfig,
    resolvedTemplateId,
    scopedParams,
    serializedRoots,
  ]);

  const handleRetryFailedItems = useCallback(async () => {
    if (!executionDetail || !canRetryFailedItems) {
      return;
    }

    setIsRetrying(true);
    setSubmitError('');

    try {
      const response = await fetch(`/api/onelink-groups/${encodeURIComponent(executionDetail.id)}/retry`, {
        method: 'POST',
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setSubmitError(payload?.error || 'Failed to retry failed items.');
        return;
      }

      setIsPollingExecution(true);
      await loadExecutionDetail(executionDetail.id);
    } catch {
      setSubmitError('Failed to retry failed items.');
    } finally {
      setIsRetrying(false);
    }
  }, [canRetryFailedItems, executionDetail, loadExecutionDetail]);

  const resetExecutionState = useCallback(() => {
    setCreatedGroupId('');
    setExecutionDetail(null);
    setIsPollingExecution(false);
    setSubmitError('');
  }, []);

  return {
    canRetryFailedItems,
    createdGroupId,
    executionDetail,
    executionProgressPercent,
    handleExecute,
    handleRetryFailedItems,
    isPollingExecution,
    isRetrying,
    isSubmitting,
    resetExecutionState,
    submitError,
  };
}
