"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Calendar, CreditCard } from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomer();
  }, [params?.id]);

  const fetchCustomer = async () => {
    try {
      const id = params?.id;
      console.log('Fetching customer with ID:', id);
      
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch customer');
      }
      
      setCustomer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Customer not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/customers"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {customer.firstName} {customer.surname}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{customer.firstName} {customer.middleName} {customer.surname}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{customer.phoneNumber}</p>
                </div>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <p className="font-medium">{customer.customerId}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Loan Statistics</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Total Loans</p>
                  <p className="font-medium">{customer.stats?.loanCount || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-green-500">✓</div>
                <div>
                  <p className="text-sm text-gray-500">Active Loans</p>
                  <p className="font-medium">{customer.stats?.activeLoans || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-yellow-500">!</div>
                <div>
                  <p className="text-sm text-gray-500">Overdue Loans</p>
                  <p className="font-medium">{customer.stats?.overdueLoans || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-blue-500">✓</div>
                <div>
                  <p className="text-sm text-gray-500">Completed Loans</p>
                  <p className="font-medium">{customer.stats?.completedLoans || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {customer.loans && customer.loans.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Loans</h2>
          <div className="space-y-3">
            {customer.loans.slice(0, 3).map((loan: any) => (
              <div key={loan.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{loan.loanId}</p>
                    <p className="text-sm text-gray-500">{loan.purpose}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    loan.status === 'active' ? 'bg-green-100 text-green-700' :
                    loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {loan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
