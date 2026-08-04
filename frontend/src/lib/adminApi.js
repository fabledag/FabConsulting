import { API_BASE_URL } from './config.js';

const ADMIN_TOKEN_KEY = 'fabiola_admin_token';

// These run during the static export too, where there is no `window`. Guarding
// here keeps every caller from having to think about it.
export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * Deliberately separate from api.js's apiFetch — admin and customer
 * sessions must never share a token or a localStorage key.
 */
export async function adminApiFetch(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) setAdminToken(null);
    const error = new Error(data.error || (data.errors || []).join(', ') || 'Request failed.');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
