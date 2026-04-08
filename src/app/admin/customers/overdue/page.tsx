"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  User,
  DollarSign,
  Calendar
} from 'lucide-react';
import CustomerBlade from '@/components/admin/CustomerBlade';

interface OverdueCustomer {
  id: string;
  firstName: string;
  surname: string;
  phoneNumber: string;
  email?: string;
  loanId: string;
  amount: number;
  amountPaid: number;
  remainingBalance: number;
  progress: number;
  status: string;
  dueDate: string;
  daysOverdue: number;
  penalty: number;
  creditScore?: number;
}

export default function OverdueCustomersPage() {
  const [customers, setCustomers] = useState<OverdueCustomer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalOverdue: 0,
    avgDays: 0,
    totalPenalty: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/overdue');
      const data = await res.json();
      console.log('Overdue API response:', data);
      setCustomers(data.customers || []);
      setStats(data.stats || { total: 0, totalOverdue: 0, avgDays: 0, totalPenalty: 0 });
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
    if (!amount) return 'TSh 0';
    if (amount >= 1_000_000) return `TSh ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `TSh ${(amount / 1_000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  const filteredCustomers = customers.filter(c =>
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Urgency */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Overdue Customers</h1>
          </div>
          <p className="text-sm text-red-600 dark:text-red-400">
            {stats.total} customers overdue • {formatCurrency(stats.totalOverdue)} outstanding
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Urgent Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-[10px] text-red-600 uppercase tracking-wider">Overdue Loans</p>
          <p className="text-2xl font-black text-red-600">{stats.total}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-[10px] text-amber-600 uppercase tracking-wider">Total Overdue</p>
          <p className="text-2xl font-black text-amber-600">{formatCurrency(stats.totalOverdue)}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <p className="text-[10px] text-orange-600 uppercase tracking-wider">Avg Days Overdue</p>
          <p className="text-2xl font-black text-orange-600">{Math.round(stats.avgDays)} days</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-[10px] text-red-600 uppercase tracking-wider">Total Penalties</p>
          <p className="text-2xl font-black text-red-600">{formatCurrency(stats.totalPenalty)}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, loan ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Overdue Customer Blades */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-300 dark:text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No overdue customers! All caught up! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800 p-4 hover:shadow-md transition">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{customer.loanId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                      {customer.daysOverdue} DAYS OVERDUE
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{customer.firstName} {customer.surname}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                    <span className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" />{customer.phoneNumber}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 font-mono">{formatCurrency(customer.amount)}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-red-600 font-mono">Penalty: {formatCurrency(customer.penalty)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/customers/${customer.id}`} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs">View</Link>
                  <Link href={`/admin/loans/${customer.loanId}/payment`} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs">Record Payment</Link>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-red-100 dark:border-red-800">
                <div className="h-1.5 w-full bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${customer.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
