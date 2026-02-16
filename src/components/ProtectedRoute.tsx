'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireStaff?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  requireStaff = false 
}: ProtectedRouteProps) {
  const { user, isLoading, isStaff } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requireStaff && !isStaff) {
        router.push('/customer/dashboard');
        return;
      }

      if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
        if (isStaff) {
          router.push('/admin/dashboard');
        } else {
          router.push('/customer/dashboard');
        }
        return;
      }
    }
  }, [user, isLoading, router, allowedRoles, requireStaff, isStaff]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
