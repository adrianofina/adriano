"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DebugNewCustomerPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [debug, setDebug] = useState<any>({});

  useEffect(() => {
    setDebug({
      isLoading,
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      timestamp: new Date().toISOString()
    });
  }, [isLoading, user]);

  if (isLoading) {
    return <div className="p-8">Loading auth...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Not Authenticated</h1>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(debug, null, 2)}
        </pre>
        <button 
          onClick={() => router.push('/login')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Authenticated!</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(debug, null, 2)}
      </pre>
      <Link 
        href="/admin/customers"
        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Back to Customers
      </Link>
    </div>
  );
}
