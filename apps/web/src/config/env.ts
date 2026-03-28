const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL =
  typeof rawApiBaseUrl === 'string' && rawApiBaseUrl.trim().length > 0
    ? rawApiBaseUrl.replace(/\/+$/, '')
    : 'http://localhost:3001';

