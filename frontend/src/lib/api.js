import { API_BASE_URL } from './config.js';

const TOKEN_KEY = 'fabiola_customer_token';
const LAST_EMAIL_KEY = 'fabiola_last_email';

// These run during the static export too, where there is no `window`. Guarding
// here keeps every caller from having to think about it.
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getLastEmail() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LAST_EMAIL_KEY) || '';
}

export function setLastEmail(email) {
  if (typeof window === 'undefined') return;
  if (email) localStorage.setItem(LAST_EMAIL_KEY, email);
}

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && auth) setToken(null);
    const error = new Error(data.error || (data.errors || []).join(', ') || 'Request failed.');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
