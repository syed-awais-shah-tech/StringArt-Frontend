import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api.js';

const AdminContext = createContext(null);

const STORAGE_KEY = 'sa_admin_token';
const USER_KEY = 'sa_admin_user';

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePop = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  }, []);

  // Verify token on mount
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(getApiUrl('/api/admin/me'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAdmin(data.admin);
            localStorage.setItem(USER_KEY, JSON.stringify(data.admin));
          }
        } else {
          // Token expired or invalid
          if (isMounted) {
            setToken('');
            setAdmin(null);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(getApiUrl('/api/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setAdmin(data.admin);
    localStorage.setItem(STORAGE_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.admin));
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(getApiUrl('/api/admin/logout'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      setToken('');
      setAdmin(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
      navigate('/admin/login');
    }
  }, [token, navigate]);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };

      const targetUrl = getApiUrl(url);
      const res = await fetch(targetUrl, { ...options, headers });
      if (res.status === 401) {
        // Force logout on 401 Unauthorized
        setToken('');
        setAdmin(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
        navigate('/admin/login');
        throw new Error('Session expired. Please log in again.');
      }
      return res;
    },
    [token, navigate]
  );

  const value = {
    token,
    admin,
    isAuthenticated: Boolean(token),
    isLoading,
    currentPath,
    navigate,
    login,
    logout,
    authFetch,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return ctx;
}
