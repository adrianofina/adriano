"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'super_admin' | 'admin' | 'loan_officer' | 'customer_service' | 'viewer' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isStaff: boolean;
  avatar?: string;
  lastLogin?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (mounted) {
          if (data?.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    isStaff: user?.isStaff || false,
    role: user?.role || null
  };
}
