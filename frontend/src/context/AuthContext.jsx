import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken, setUnauthorizedHandler } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(!!getStoredToken());

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Wire 401 -> logout once. The api helper triggers this on any 401 response.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Keep localStorage in sync. Single source of truth for the token.
  useEffect(() => {
    setStoredToken(token);
  }, [token]);

  // Rehydrate user from token on mount
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    api.get('/users/me', { token, skipAuth: false })
      .then((data) => setUser(data))
      .catch(() => {
        // Token invalid — clear and stay on login screen
        setStoredToken(null);
        setToken(null);
      })
      .finally(() => setInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(async (email, password, name) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { email, password, name }, { skipAuth: true });
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password }, { skipAuth: true });
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  // Prevent flash of login screen while token is being validated
  if (initializing) return null;

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
