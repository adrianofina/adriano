"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  Download,
  Filter
} from 'lucide-react';
import CustomerBlade from '@/components/admin/CustomerBlade';

interface ActiveCustomer {
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
  dueDate?: string;
  creditScore?: number;
}

export default function ActiveCustomersPage() {
  const [customers, setCustomers] = useState<ActiveCustomer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalOutstanding: 0,
    averageLoan: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/active');
      const data = await res.json();
      setCustomers(data.customers || []);
      setStats(data.stats || { total: 0, totalOutstanding: 0, averageLoan: 0 });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Active Customers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {stats.total} customers with active loans • {formatCurrency(stats.totalOutstanding)} outstanding
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
          <Link
            href="/admin/customers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Active</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-amber-600 uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-black text-amber-600">{formatCurrency(stats.totalOutstanding)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-indigo-600 uppercase tracking-wider">Average Loan</p>
          <p className="text-2xl font-black text-indigo-600">{formatCurrency(stats.averageLoan)}</p>
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
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Customer Blades */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No active customers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <CustomerBlade
              key={customer.id}
              id={customer.id}
              name={`${customer.firstName} ${customer.surname}`}
              phone={customer.phoneNumber}
              email={customer.email}
              loanId={customer.loanId}
              loanAmount={customer.amount}
              amountPaid={customer.amountPaid}
              remaining={customer.remainingBalance}
              progress={customer.progress}
              status="active"
              dueDate={customer.dueDate}
              creditScore={customer.creditScore}
            />
          ))}
        </div>
      )}
    </div>
  );
}
