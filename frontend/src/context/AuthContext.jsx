'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { apiFetch, getToken, setToken, setLastEmail } from '@/lib/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await apiFetch('/me', { auth: true });
      setUser(data.user);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const requestLink = useCallback(async (email, redirectPath) => {
    const data = await apiFetch('/auth/request-link', { method: 'POST', body: { email, redirectPath } });
    setLastEmail(email);
    return data;
  }, []);

  const verify = useCallback(async (token) => {
    const data = await apiFetch('/auth/verify', { method: 'POST', body: { token } });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, requestLink, verify, logout, refreshProfile: loadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
