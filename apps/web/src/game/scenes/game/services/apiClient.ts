import { API_BASE_URL } from '../../../../config/env';

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
  });
}

export async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await apiFetch(path, {
    ...init,
    headers,
  });

  const rawBody = await response.text();
  const payload = rawBody.length > 0 ? safeParseJson(rawBody) : null;

  if (!response.ok) {
    const message = extractPayloadMessage(payload) ?? `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload as T;
}

export function extractPayloadMessage(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload.trim();
  }

  if (!isRecord(payload)) {
    return null;
  }

  const message = payload.message;
  if (typeof message === 'string' && message.trim().length > 0) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const parts = message
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
      .map((entry) => entry.trim());
    if (parts.length > 0) {
      return parts.join(', ');
    }
  }

  const error = payload.error;
  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }

  return null;
}

export function formatRequestError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }

  return fallback;
}

function safeParseJson(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

