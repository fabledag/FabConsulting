'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApiFetch, getAdminToken, setAdminToken } from '@/lib/adminApi.js';

/**
 * No Context here on purpose: the admin JWT only carries {role, iat} — no
 * identity to hydrate or share across a component tree. Only Admin/index.jsx
 * needs this.
 */
export function useAdminAuth() {
  // Read the stored token after mount, not in the state initializer: the page
  // is pre-rendered without `localStorage`, so reading it during render made
  // the client's first paint differ from the HTML (React hydration error
  // #418). `checked` lets the page wait instead of flashing the login form.
  const [loggedIn, setLoggedIn] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setLoggedIn(Boolean(getAdminToken()));
    setChecked(true);
  }, []);

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

  return { loggedIn, checked, login, logout, requestPasswordReset, resetPassword };
}
