"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Search,
  RefreshCw,
  Download,
  CheckCircle2,
  TrendingUp,
  Users,
  Phone,
  Mail,
  Calendar,
  Star
} from 'lucide-react';

interface CompletedCustomer {
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
  completionDate: string;
  creditScore?: number;
}

export default function CompletedCustomersPage() {
  const [customers, setCustomers] = useState<CompletedCustomer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalRepaid: 0,
    avgCreditScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/completed');
      const data = await res.json();
      console.log('Completed API response:', data);
      setCustomers(data.customers || []);
      setStats(data.stats || { total: 0, totalRepaid: 0, avgCreditScore: 0 });
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

  const getStars = (score: number) => {
    const stars = Math.floor(score / 200);
    return "★".repeat(Math.min(5, stars)) + "☆".repeat(Math.max(0, 5 - Math.min(5, stars)));
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-emerald-500" />
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Completed Customers</h1>
          </div>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {stats.total} customers completed • {formatCurrency(stats.totalRepaid)} fully repaid
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Completed Loans</p>
          <p className="text-2xl font-black text-emerald-600">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Total Repaid</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalRepaid)}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Avg Credit Score</p>
          <p className="text-2xl font-black text-emerald-600">{Math.round(stats.avgCreditScore)}</p>
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Completed Customer Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No completed customers yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 hover:shadow-md transition">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{customer.loanId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      COMPLETED
                    </span>
                    {customer.creditScore && (
                      <span className="text-amber-500 text-xs">{getStars(customer.creditScore)}</span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{customer.firstName} {customer.surname}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                    <span className="flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" />{customer.phoneNumber}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 font-mono">{formatCurrency(customer.amount)}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-emerald-600">Fully paid</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/customers/${customer.id}`} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs">View Details</Link>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-100 dark:border-emerald-800">
                <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `100%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
