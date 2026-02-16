'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'super_admin' | 'admin' | 'loan_officer' | 'customer_service' | 'viewer' | 'customer' | null;

export interface User {
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
  isStaff: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const COMPANY_DOMAIN = '@adrianmicrofinance.co.tz';

  const getRoleFromEmail = (email: string): UserRole => {
    if (!email.includes(COMPANY_DOMAIN)) return 'customer';
    
    if (email.startsWith('superadmin')) return 'super_admin';
    if (email.startsWith('admin')) return 'admin';
    if (email.startsWith('loan.officer')) return 'loan_officer';
    if (email.startsWith('customer.service')) return 'customer_service';
    if (email.startsWith('viewer')) return 'viewer';
    
    return 'admin';
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const role = getRoleFromEmail(email);
    const isStaff = email.includes(COMPANY_DOMAIN);
    
    const userData: User = {
      email,
      role,
      isStaff,
      name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    return true;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const redirectToDashboard = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.isStaff) {
      router.push('/admin/dashboard');
    } else {
      router.push('/customer/dashboard');
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    redirectToDashboard,
    isStaff: user?.isStaff || false,
    role: user?.role
  };
}
