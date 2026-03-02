"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, DollarSign, TrendingUp, Clock, RefreshCw } from 'lucide-react';

interface ActiveCustomer {
  id: string;
  firstName: string;
  surname: string;
  phone: string;
  loanId: string;
  loanAmount: number;
  remaining: number;
  progress: number;
  paymentStatus: string;
  nextPayment: number;
  dueDate: string;
}

interface Stats {
  total: number;
  totalOutstanding: number;
  averageLoan: number;
  latePayments: number;
}

export default function ActiveCustomersPage() {
  const [customers, setCustomers] = useState<ActiveCustomer[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalOutstanding: 0,
    averageLoan: 0,
    latePayments: 0
  });
  const [sidebarCount, setSidebarCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active customers
      const res = await fetch('/api/admin/customers/active');
      const data = await res.json();
      
      // Update active page data
      setCustomers(data.customers || []);
      setStats({
        total: data.customers?.length || 0,
        totalOutstanding: data.customers?.reduce((sum: number, c: any) => sum + (c.remaining || 0), 0) || 0,
        averageLoan: data.customers?.length > 0 
          ? Math.round(data.customers.reduce((sum: number, c: any) => sum + (c.remaining || 0), 0) / data.customers.length)
          : 0,
        latePayments: data.customers?.filter((c: any) => c.paymentStatus === 'late').length || 0
      });

      // Also fetch sidebar counts to update everywhere
      const countsRes = await fetch('/api/admin/counts');
      const countsData = await countsRes.json();
      
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('sidebar-counts-update', { 
        detail: countsData 
      }));

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    
    // Format with K, M, B for large numbers
    if (amount >= 1000000000) return `TSh ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `TSh ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `TSh ${(amount / 1000).toFixed(1)}K`;
    
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Active Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.total} customer{stats.total !== 1 ? 's' : ''} with active loans
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* STATS CARDS - FIXED LAYOUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active customers</p>
          </div>
        </div>

        {/* Card 2: Total Outstanding */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalOutstanding)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total outstanding</p>
          </div>
        </div>

        {/* Card 3: Average */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageLoan)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Average per customer</p>
          </div>
        </div>

        {/* Card 4: Late Payments */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.latePayments}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Late payments</p>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {customers.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Loan Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Payment Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Next Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {customer.firstName?.[0]}{customer.surname?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.firstName} {customer.surname}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.loanId}</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{formatCurrency(customer.loanAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{customer.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${customer.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Left: {formatCurrency(customer.remaining)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {customer.paymentStatus === 'late' ? 'Late' : 'On Time'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(customer.nextPayment)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due: {customer.dueDate || 'N/A'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Customers</h3>
          <p className="text-gray-600 dark:text-gray-400">There are currently no customers with active loans.</p>
        </div>
      )}
    </div>
  );
}

