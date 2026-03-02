"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, DollarSign, TrendingUp, Clock, RefreshCw, Plus, Search, Filter } from 'lucide-react';

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
  const router = useRouter();
  const [customers, setCustomers] = useState<ActiveCustomer[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalOutstanding: 0,
    averageLoan: 0,
    latePayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/active');
      const data = await res.json();
      
      setCustomers(data.customers || []);
      
      // Calculate stats
      const totalOutstanding = data.customers?.reduce((sum: number, c: any) => sum + (c.remaining || 0), 0) || 0;
      setStats({
        total: data.customers?.length || 0,
        totalOutstanding: totalOutstanding,
        averageLoan: data.customers?.length > 0 ? Math.round(totalOutstanding / data.customers.length) : 0,
        latePayments: data.customers?.filter((c: any) => c.paymentStatus === 'late').length || 0
      });
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
    if (amount >= 1000000000) {
      return `TSh ${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `TSh ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `TSh ${(amount / 1000).toFixed(1)}K`;
    }
    
    return `TSh ${amount.toLocaleString()}`;
  };

  const filteredCustomers = customers.filter(c => 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.loanId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Customers</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.total} customer{stats.total !== 1 ? 's' : ''} with active loans
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/customers/export')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Export
              </button>
              <button
                onClick={() => router.push('/admin/customers/new')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards - WITH K/M/B FORMATTING */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Customers */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                  +2 this month
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
            </div>
          </div>

          {/* Total Outstanding - NOW USING K/M/B */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalOutstanding)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Outstanding</p>
            </div>
          </div>

          {/* Average per Customer - NOW USING K/M/B */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageLoan)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average per Customer</p>
            </div>
          </div>

          {/* Late Payments */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.latePayments}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late Payments</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">All payments on time</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-4">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loan Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {customer.firstName?.[0]}{customer.surname?.[0]}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.firstName} {customer.surname}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.loanId}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(customer.loanAmount)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">{customer.progress}%</span>
                          <span className="text-gray-400 dark:text-gray-600">Left: {formatCurrency(customer.remaining)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${customer.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCustomers.length}</span> of <span className="font-medium">{filteredCustomers.length}</span> results
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
