import type { QueryClient } from '@tanstack/react-query';
import type { WorkLog, WorkLogsQuery, WorkType } from '@/types';

export const queryKeys = {
  workLogs: {
    all: ['work-logs'] as const,
    list: (filters: WorkLogsQuery) => ['work-logs', filters] as const,
  },
  workTypes: {
    all: ['work-types'] as const,
  },
} as const;

export function upsertWorkLogInCache(queryClient: QueryClient, workLog: WorkLog): void {
  queryClient.setQueriesData<WorkLog[]>({ queryKey: queryKeys.workLogs.all }, (logs) => {
    if (!logs) {
      return logs;
    }
    const index = logs.findIndex((item) => item.id === workLog.id);
    if (index === -1) {
      return [...logs, workLog];
    }
    const next = [...logs];
    next[index] = workLog;
    return next;
  });
}

export function removeWorkLogFromCache(queryClient: QueryClient, id: string): void {
  queryClient.setQueriesData<WorkLog[]>({ queryKey: queryKeys.workLogs.all }, (logs) =>
    logs ? logs.filter((item) => item.id !== id) : logs,
  );
}

export async function refreshWorkLogs(queryClient: QueryClient): Promise<void> {
  await queryClient.refetchQueries({ queryKey: queryKeys.workLogs.all });
}

export function upsertWorkTypeInCache(queryClient: QueryClient, workType: WorkType): void {
  queryClient.setQueryData<WorkType[]>(queryKeys.workTypes.all, (types) => {
    const list = types ?? [];
    const index = list.findIndex((item) => item.id === workType.id);
    if (index === -1) {
      return [...list, workType];
    }
    const next = [...list];
    next[index] = workType;
    return next;
  });
}

export function removeWorkTypeFromCache(queryClient: QueryClient, id: string): void {
  queryClient.setQueryData<WorkType[]>(queryKeys.workTypes.all, (types) =>
    types ? types.filter((item) => item.id !== id) : types,
  );
}

export function syncWorkTypeInLogsCache(
  queryClient: QueryClient,
  workType: Pick<WorkType, 'id' | 'name' | 'unit'>,
): void {
  queryClient.setQueriesData<WorkLog[]>({ queryKey: queryKeys.workLogs.all }, (logs) => {
    if (!logs) {
      return logs;
    }
    return logs.map((log) =>
      log.workTypeId === workType.id
        ? {
            ...log,
            workType: {
              id: workType.id,
              name: workType.name,
              unit: workType.unit,
            },
          }
        : log,
    );
  });
}
