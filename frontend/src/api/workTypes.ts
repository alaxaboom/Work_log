import { apiFetch } from '@/api/client';
import type { WorkType } from '@/types';

export interface WorkTypeInput {
  name: string;
  unit: string;
}

export function fetchWorkTypes() {
  return apiFetch<WorkType[]>('/work-types');
}

export function createWorkType(data: WorkTypeInput) {
  return apiFetch<WorkType>('/work-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateWorkType(id: string, data: Partial<WorkTypeInput>) {
  return apiFetch<WorkType>(`/work-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteWorkType(id: string) {
  return apiFetch<void>(`/work-types/${id}`, { method: 'DELETE' });
}
