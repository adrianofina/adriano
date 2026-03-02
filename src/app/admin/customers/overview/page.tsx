"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  PieChart,
  BarChart3,
  Eye,
  Edit,
  MoreHorizontal,
  Home
} from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  surname: string;
  phoneNumber: string;
  customerId: string;
  loanStatus?: 'active' | 'overdue' | 'completed' | 'pending';
  loanAmount?: number;
  progress?: number;
  riskLevel?: 'low' | 'medium' | 'high';
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
  newCustomersToday: number;
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
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, customersRes] = await Promise.all([
        fetch('/api/admin/overview-stats'),
        fetch('/api/admin/recent-customers?limit=5')
      ]);

      const statsData = await statsRes.json();
      const customersData = await customersRes.json();

      setStats(statsData.data || statsData);
      setRecentCustomers(customersData.customers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    if (amount >= 1000000) return `TSh ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `TSh ${(amount / 1000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'completed':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }: any) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            change > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    </div>
  );

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
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customer Overview</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Real-time customer statistics and metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/admin/customers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            New Customer
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={Users}
          color="blue"
          change={12}
        />
        <StatCard
          title="Active Loans"
          value={stats?.activeLoans || 0}
          icon={CreditCard}
          color="green"
          change={8}
        />
        <StatCard
          title="Overdue Loans"
          value={stats?.overdueLoans || 0}
          icon={AlertTriangle}
          color="red"
          change={-5}
        />
        <StatCard
          title="Completed Loans"
          value={stats?.completedLoans || 0}
          icon={CheckCircle}
          color="purple"
          change={15}
        />
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/customers/active" className="block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Active Customers</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeLoans || 0}</span>
            <span className="text-sm text-blue-600 flex items-center gap-1">View <ArrowRight className="w-4 h-4" /></span>
          </div>
        </Link>

        <Link href="/admin/customers/overdue" className="block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Overdue Customers</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.overdueLoans || 0}</span>
            <span className="text-sm text-blue-600 flex items-center gap-1">View <ArrowRight className="w-4 h-4" /></span>
          </div>
        </Link>

        <Link href="/admin/customers/completed" className="block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Completed</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.completedLoans || 0}</span>
            <span className="text-sm text-blue-600 flex items-center gap-1">View <ArrowRight className="w-4 h-4" /></span>
          </div>
        </Link>
      </div>

      {/* Recent Customers Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Customers</h2>
          <Link href="/admin/customers" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">{customer.customerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(customer.loanStatus || 'pending')}`}>
                      {customer.loanStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRiskBadge(customer.riskLevel || 'medium')}`}>
                      {customer.riskLevel || 'medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(customer.loanAmount || 0)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{customer.progress || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            customer.loanStatus === 'overdue' ? 'bg-red-500' :
                            customer.loanStatus === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${customer.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Distribution</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Low Risk</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.riskDistribution?.low || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${((stats?.riskDistribution?.low || 0) / (stats?.totalCustomers || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.riskDistribution?.medium || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${((stats?.riskDistribution?.medium || 0) / (stats?.totalCustomers || 1)) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">High Risk</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.riskDistribution?.high || 0}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${((stats?.riskDistribution?.high || 0) / (stats?.totalCustomers || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Performance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Payments</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats?.loanPerformance?.onTime || 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats?.loanPerformance?.onTime || 0}%` }} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Late Payments</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{stats?.loanPerformance?.late || 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${stats?.loanPerformance?.late || 0}%` }} />
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Payments</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next 7 days</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingPayments?.next7Days || 0} loans</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next 30 days</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingPayments?.next30Days || 0} loans</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Next 90 days</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.upcomingPayments?.next90Days || 0} loans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
