import { API_BASE_URL } from '../../../../config/env';

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
  });
}

