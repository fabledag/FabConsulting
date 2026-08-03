import { useCallback, useState } from 'react';
import { adminApiFetch, getAdminToken, setAdminToken } from '../adminApi.js';

/**
 * No Context here on purpose: the admin JWT only carries {role, iat} — no
 * identity to hydrate or share across a component tree. Only Admin/index.jsx
 * needs this.
 */
export function useAdminAuth() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getAdminToken()));

  const login = useCallback(async (password) => {
    const data = await adminApiFetch('/admin/login', { method: 'POST', body: { password } });
    setAdminToken(data.token);
    setLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setAdminToken(null);
    setLoggedIn(false);
  }, []);

  const requestPasswordReset = useCallback(async () => {
    await adminApiFetch('/admin/request-password-reset', { method: 'POST' });
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    await adminApiFetch('/admin/reset-password', { method: 'POST', body: { token, newPassword } });
  }, []);

  return { loggedIn, login, logout, requestPasswordReset, resetPassword };
}
