"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  Shield,
  UserPlus,
  RefreshCw,
  Filter,
  Download,
  Search
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Customer {
  id: string;
  firstName: string;
  surname: string;
  phoneNumber: string;
  loanStatus?: string;
  loanAmount?: number;
  paidAmount?: number;
  dueDate?: string;
  progress?: number;
}

interface Stats {
  totalCustomers: number;
  activeLoans: number;
  overdueLoans: number;
  completedLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  pendingApprovals: number;
  highRiskCustomers: number;
  newApplications: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  loanPerformance: {
    onTime: number;
    late: number;
    defaulted: number;
  };
  upcomingPayments: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
}

export default function CustomerOverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Get current user
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setUser(userData.user);

      // Fetch dashboard stats
      const statsRes = await fetch('/api/admin/overview-stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent customers
      const customersRes = await fetch('/api/admin/recent-customers?limit=5');
      const customersData = await customersRes.json();
      setRecentCustomers(customersData.customers || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount).replace('TZS', 'TSh');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Active' };
      case 'overdue':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Overdue' };
      case 'completed':
        return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', label: 'Completed' };
      case 'pending':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Pending' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with User Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customer Overview</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</span> • {user?.email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            href="/admin/customers/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Import
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            This Week
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              +12.3%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCustomers || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">32 new this month</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              +8.1%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeLoans || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {formatCurrency(stats?.totalDisbursed || 0)} outstanding
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
              -5.2%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.overdueLoans || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Payments</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {formatCurrency(stats?.totalDisbursed ? stats.totalDisbursed * 0.15 : 0)} at risk
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              +15.3%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completedLoans || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed Loans</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {stats?.totalRepaid && stats?.totalDisbursed 
              ? Math.round((stats.totalRepaid / stats.totalDisbursed) * 100) 
              : 0}% repayment rate
          </p>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/customers/active" className="block p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-900/30 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Active Customers</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Currently have active loans</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeLoans || 0}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(stats?.totalDisbursed || 0)}
            </span>
          </div>
        </Link>

        <Link href="/admin/customers/overdue" className="block p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/30 hover:shadow-md transition-all group relative">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full animate-pulse">
              Urgent
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Overdue Customers</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Past due payment date</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.overdueLoans || 0}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(stats?.totalDisbursed ? stats.totalDisbursed * 0.15 : 0)}
            </span>
          </div>
        </Link>

        <Link href="/admin/customers/completed" className="block p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-900/30 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Completed</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Fully paid all loans</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completedLoans || 0}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(stats?.totalRepaid || 0)}
            </span>
          </div>
        </Link>

        <Link href="/admin/customers/pending" className="block p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Pending Approval</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Awaiting loan approval</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingApprovals || 0}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(stats?.totalDisbursed ? stats.totalDisbursed * 0.1 : 0)}
            </span>
          </div>
        </Link>

        <Link href="/admin/customers/risk-analysis" className="block p-5 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/30 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full animate-pulse">
              Urgent
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">High Risk</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Critical credit score</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.highRiskCustomers || 0}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(stats?.totalDisbursed ? stats.totalDisbursed * 0.08 : 0)}
            </span>
          </div>
        </Link>

        <Link href="/admin/customers/new-applications" className="block p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-900/30 hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">New Applications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Last 7 days</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.newApplications || 0}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(stats?.totalDisbursed ? stats.totalDisbursed * 0.05 : 0)}
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Customers */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Latest customer updates</p>
          </div>
          <Link
            href="/admin/customers/active"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentCustomers.map((customer) => {
                const status = getStatusBadge(customer.loanStatus || 'active');
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {customer.firstName[0]}{customer.surname[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.firstName} {customer.surname}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(customer.loanAmount || 0)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {customer.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              customer.loanStatus === 'overdue' ? 'bg-red-500' :
                              customer.loanStatus === 'completed' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${customer.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {customer.dueDate || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
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
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Low Risk</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.riskDistribution?.low || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${((stats?.riskDistribution?.low || 0) / (stats?.totalCustomers || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.riskDistribution?.medium || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ width: `${((stats?.riskDistribution?.medium || 0) / (stats?.totalCustomers || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">High Risk</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.riskDistribution?.high || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${((stats?.riskDistribution?.high || 0) / (stats?.totalCustomers || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loan Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">On-Time</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats?.loanPerformance?.onTime || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Late</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{stats?.loanPerformance?.late || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Defaulted</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{stats?.loanPerformance?.defaulted || 0}%</span>
            </div>
          </div>
        </div>

        {/* Upcoming Due Dates */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Due Dates</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next 7 days</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingPayments?.next7Days || 0} loans</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next 30 days</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingPayments?.next30Days || 0} loans</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next 90 days</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingPayments?.next90Days || 0} loans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
