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
  Award,
  Gift,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface CompletedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  totalLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  lastLoanId: string;
  lastLoanAmount: number;
  completionDate: string;
  memberSince: string;
  creditScore: number;
  rating: string;
  referrals: number;
}

export default function CompletedCustomersPage() {
  const [customers, setCustomers] = useState<CompletedCustomer[]>([]);
  const [stats, setStats] = useState({ total: 0, totalRepaid: 0, avgCreditScore: 0, totalReferrals: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/completed');
      const data = await res.json();
      
      setCustomers(data.customers || []);
      setStats(data.stats || { total: 0, totalRepaid: 0, avgCreditScore: 0, totalReferrals: 0 });
    } catch (error) {
      console.error('Error:', error);
      setCustomers([]);
      setStats({ total: 0, totalRepaid: 0, avgCreditScore: 0, totalReferrals: 0 });
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Completed Loans</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.total} customer{stats.total !== 1 ? 's' : ''} successfully paid off loans
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

      {/* Empty State - No completed loans (matches your database) */}
      {customers.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Completed Loans</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No customers have fully paid off their loans yet.
          </p>
          <Link
            href="/admin/customers/active"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Active Loans
          </Link>
        </div>
      )}
    </div>
  );
}
