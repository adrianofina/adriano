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
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  CheckCircle
} from 'lucide-react';

interface OverdueCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  loanId: string;
  daysOverdue: number;
  dueDate: string;
  totalDue: number;
  penalty: number;
  lastContact: string;
  risk: string;
  notes: string;
}

export default function OverdueCustomersPage() {
  const [customers, setCustomers] = useState<OverdueCustomer[]>([]);
  const [stats, setStats] = useState({ total: 0, totalOverdue: 0, avgDays: 0, highRisk: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/overdue');
      const data = await res.json();
      
      // ONLY show real data from database
      setCustomers(data.customers || []);
      setStats(data.stats || { total: 0, totalOverdue: 0, avgDays: 0, highRisk: 0 });
    } catch (error) {
      console.error('Error:', error);
      setCustomers([]);
      setStats({ total: 0, totalOverdue: 0, avgDays: 0, highRisk: 0 });
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

  // Show REAL overdue customers from database
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Overdue Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.total} customer{stats.total !== 1 ? 's' : ''} with overdue payments
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

      {/* Stats Cards - REAL DATA from database */}
      {stats.total > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Urgent Action Required</h2>
              <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                {stats.total} customers with overdue payments totaling {formatCurrency(stats.totalOverdue)}.
                Average overdue period: {stats.avgDays} days.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Overdue</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(stats.totalOverdue)}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Days</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.avgDays}d</p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">High Risk</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.highRisk}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REAL Customers Table - Showing Seiko and Fina */}
      {customers.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Overdue</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount Due</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Last Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Risk</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{customer.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm font-medium">{customer.daysOverdue}d</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due {customer.dueDate}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(customer.totalDue)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">+{formatCurrency(customer.penalty)} penalty</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">{customer.lastContact || 'N/A'}</p>
                      {customer.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">"{customer.notes}"</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(customer.risk)}`}>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State - No overdue loans */
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Overdue Loans</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            All customers are up to date with their payments.
          </p>
          <Link
            href="/admin/customers/active"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Active Customers
          </Link>
        </div>
      )}
    </div>
  );
}
