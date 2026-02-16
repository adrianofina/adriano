'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Plus,
  Download,
  ArrowRight,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoans([
        {
          id: 'L-342',
          customer: 'Laurent Adriano',
          amount: 3420000,
          purpose: 'Business Expansion',
          status: 'overdue',
          progress: 98.8,
          appliedDate: '2024-02-10',
          dueDate: '2024-04-15',
          creditScore: 750,
          risk: 'low',
          documents: 3
        },
        {
          id: 'L-343',
          customer: 'John Doe',
          amount: 5000000,
          purpose: 'Business Expansion',
          status: 'pending',
          progress: 0,
          appliedDate: '2024-03-15',
          dueDate: '2024-06-15',
          creditScore: 680,
          risk: 'medium',
          documents: 2
        },
        {
          id: 'L-344',
          customer: 'Jane Smith',
          amount: 3500000,
          purpose: 'Education',
          status: 'approved',
          progress: 0,
          appliedDate: '2024-03-14',
          dueDate: '2024-06-14',
          creditScore: 720,
          risk: 'low',
          documents: 3
        },
        {
          id: 'L-345',
          customer: 'Robert Johnson',
          amount: 7200000,
          purpose: 'Agriculture',
          status: 'active',
          progress: 25,
          appliedDate: '2024-03-13',
          dueDate: '2024-09-13',
          creditScore: 590,
          risk: 'high',
          documents: 4
        },
        {
          id: 'L-346',
          customer: 'Sarah Williams',
          amount: 2100000,
          purpose: 'Medical',
          status: 'paid',
          progress: 100,
          appliedDate: '2024-02-20',
          dueDate: '2024-05-20',
          creditScore: 710,
          risk: 'low',
          documents: 2
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'low':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'LOW' };
      case 'medium':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'MEDIUM' };
      case 'high':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'HIGH' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', label: 'UNKNOWN' };
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && loan.status === statusFilter;
  });

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    pending: loans.filter(l => l.status === 'pending' || l.status === 'approved').length,
    overdue: loans.filter(l => l.status === 'overdue').length,
    paid: loans.filter(l => l.status === 'paid').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Loan Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Manage all loan applications and track their status
          </p>
        </div>
        <Link
          href="/admin/loans/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Loan
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Loans</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.paid}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by loan ID, customer, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Loans</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No loans found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Loan ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Applied</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLoans.map((loan) => {
                  const risk = getRiskBadge(loan.risk);
                  const progress = loan.amount > 0 ? (loan.amountPaid / loan.amount) * 100 : 0;
                  
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.id}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.customer}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                          {loan.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${risk.bg} ${risk.text}`}>
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                loan.status === 'overdue' ? 'bg-red-500' :
                                loan.status === 'paid' ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white">{loan.appliedDate}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/loans/${loan.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
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
        )}
      </div>
    </div>
  );
}
