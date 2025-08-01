'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  role?: 'admin' | 'user';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage
      const tokenData = localStorage.getItem('supabase.auth.token');
      const token = tokenData ? JSON.parse(tokenData).currentSession?.access_token : null;
      
      if (!token) {
        setUser(null);
        return;
      }
      
      // Call the auth/me endpoint with the token
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // If the token is invalid, clear it
        if (response.status === 401) {
          localStorage.removeItem('supabase.auth.token');
          setUser(null);
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError(error instanceof Error ? error : new Error('Authentication failed'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabase.auth.token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [checkAuth]);

  return { 
    user, 
    loading, 
    error,
    refresh: checkAuth
  };
} 