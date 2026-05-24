import type { ApiErrorBody } from '@/types';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

function buildUrl(path: string): string {
  return `${apiBaseUrl}/api${path}`;
}

function parseErrorMessage(body: ApiErrorBody, status: number): string {
  if (Array.isArray(body.message)) {
    return body.message.join(', ');
  }
  if (typeof body.message === 'string') {
    return body.message;
  }
  return `Ошибка запроса (${status})`;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(parseErrorMessage(body, response.status), response.status);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
