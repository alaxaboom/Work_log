import { apiFetch } from '@/api/client';
import type { WorkLog, WorkLogsQuery } from '@/types';

export interface WorkLogInput {
  date: string;
  workTypeId: string;
  volume: number;
  executorName: string;
  notes?: string;
}

function buildQuery(params: WorkLogsQuery): string {
  const search = new URLSearchParams();
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params.dateTo) search.set('dateTo', params.dateTo);
  if (params.sortOrder) search.set('sortOrder', params.sortOrder);
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function fetchWorkLogs(query: WorkLogsQuery = {}) {
  return apiFetch<WorkLog[]>(`/work-logs${buildQuery(query)}`);
}

export function createWorkLog(data: WorkLogInput) {
  return apiFetch<WorkLog>('/work-logs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateWorkLog(id: string, data: Partial<WorkLogInput>) {
  return apiFetch<WorkLog>(`/work-logs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteWorkLog(id: string) {
  return apiFetch<void>(`/work-logs/${id}`, { method: 'DELETE' });
}
