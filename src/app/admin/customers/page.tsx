"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Eye, Edit, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api-client';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers');
      const response = await res.json();
      
      // Handle both API formats
      let data;
      if (response.success && response.data?.customers) {
        data = response.data.customers;
      } else if (response.customers) {
        data = response.customers;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        data = [];
      }
      
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    c.surname?.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/admin/customers/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      )}

      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {search ? 'No matching customers' : 'No customers yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {search ? 'Try a different search term' : 'Get started by adding your first customer'}
          </p>
          {!search && (
            <Link
              href="/admin/customers/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{customer.firstName} {customer.surname}</div>
                  </td>
                  <td className="px-6 py-4">{customer.phoneNumber}</td>
                  <td className="px-6 py-4">{customer.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.customerId}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/customers/${customer.id}/edit`}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t text-sm text-gray-600">
            Total: {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

