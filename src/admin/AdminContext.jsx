import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname + window.location.search);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePop = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = useCallback((path) => {
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  }, []);

  // Check authentication status on mount via HttpOnly cookie
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await fetch(getApiUrl('/api/admin/me'), {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAdmin(data.admin);
          }
        } else {
          if (isMounted) {
            setAdmin(null);
          }
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
        if (isMounted) setAdmin(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Login: sends email and password, server sets HttpOnly JWT cookie
  const login = useCallback(async (email, password) => {
    const res = await fetch(getApiUrl('/api/admin/login'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setAdmin(data.admin);
    return data;
  }, []);

  // Logout: server clears HttpOnly JWT cookie
  const logout = useCallback(async () => {
    try {
      await fetch(getApiUrl('/api/admin/logout'), {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      setAdmin(null);
      navigate('/admin/login');
    }
  }, [navigate]);

  // Authenticated fetch helper: automatically includes HttpOnly credentials
  const authFetch = useCallback(
    async (url, options = {}) => {
      const targetUrl = getApiUrl(url);
      const res = await fetch(targetUrl, {
        ...options,
        credentials: 'include',
        headers: {
          ...(options.headers || {}),
        },
      });

      if (res.status === 401) {
        setAdmin(null);
        navigate('/admin/login');
        throw new Error('Session expired. Please log in again.');
      }
      return res;
    },
    [navigate]
  );

  const value = {
    admin,
    isAuthenticated: Boolean(admin),
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
