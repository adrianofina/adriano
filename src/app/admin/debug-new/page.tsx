"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function DebugNewCustomerPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    phoneNumber: '',
    email: ''
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebug(null);

    try {
      // Make the API call
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // Get the raw response text
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setDebug({
          status: response.status,
          statusText: response.statusText,
          responseText: responseText.substring(0, 500),
          error: 'Invalid JSON response'
        });
        setLoading(false);
        return;
      }

      // Show debug info
      setDebug({
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      // If successful, try to redirect
      if (response.ok) {
        if (data.data?.id) {
          setTimeout(() => {
            router.push(`/admin/customers/${data.data.id}`);
          }, 2000);
        } else if (data.id) {
          setTimeout(() => {
            router.push(`/admin/customers/${data.id}`);
          }, 2000);
        }
      } else {
        setError(data.error || data.message || 'Failed to create customer');
      }

    } catch (err: any) {
      setError(err.message);
      setDebug({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/customers" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Debug New Customer</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Surname</label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Customer'}
        </button>
      </form>

      {debug && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
