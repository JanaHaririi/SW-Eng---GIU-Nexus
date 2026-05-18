import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
} from '../utils/token';
import { registerUnauthorizedHandler } from '../services/api';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUserState] = useState(() => getStoredUser());

  const logout = useCallback(async () => {
    if (getToken()) {
      await authService.logout();
    }
    clearAuthStorage();
    setTokenState(null);
    setUserState(null);
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setTokenState(null);
      setUserState(null);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    });
  }, []);

  const login = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setStoredUser(nextUser);
    setTokenState(nextToken);
    setUserState(nextUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
