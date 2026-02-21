"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  ArrowRight,
  Download,
  Mail,
  Phone,
  CreditCard,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface ActiveCustomer {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  avatar: string;
  loanId: string;
  loanAmount: number;
  paidAmount: number;
  remaining: number;
  progress: number;
  dueDate: string;
  nextPayment: number;
  lastPayment: string;
  paymentStatus: string;
  creditScore: number;
  risk: string;
}

export default function ActiveCustomersPage() {
  const [customers, setCustomers] = useState<ActiveCustomer[]>([]);
  const [stats, setStats] = useState({ total: 0, totalOutstanding: 0, averageLoan: 0, latePayments: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/active');
      const data = await res.json();
      
      // ONLY show real data from database
      setCustomers(data.customers || []);
      setStats(data.stats || { total: 0, totalOutstanding: 0, averageLoan: 0, latePayments: 0 });
    } catch (error) {
      console.error('Error:', error);
      setCustomers([]);
      setStats({ total: 0, totalOutstanding: 0, averageLoan: 0, latePayments: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'late':
        return { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Late' };
      default:
        return { bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'On Time' };
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
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
            onClick={fetchCustomers}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/admin/customers/overview"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Stats Cards - REAL DATA */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active customers</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="text-green-600 dark:text-green-400">TSh</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalOutstanding)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total outstanding</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.averageLoan)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Average per customer</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.latePayments}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Late payments</p>
          </div>
        </div>
      )}

      {/* Customers Table - Showing Seiko and Fina */}
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Risk</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {customers.map((customer) => {
                  const paymentStatus = getPaymentStatusBadge(customer.paymentStatus);
                  const risk = getRiskColor(customer.risk);
                  
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{customer.avatar}</span>
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
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">{customer.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                customer.paymentStatus === 'late' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${customer.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Left: {formatCurrency(customer.remaining)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${paymentStatus.bg}`}>
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(customer.nextPayment)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due: {customer.dueDate || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${risk}`}>
                          {customer.risk.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        >
                          View
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Customers</h3>
          <p className="text-gray-600 dark:text-gray-400">There are currently no customers with active loans.</p>
        </div>
      )}
    </div>
  );
}
