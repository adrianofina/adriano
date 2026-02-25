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
  Filter,
  Download,
  Search,
  PieChart,
  BarChart3,
  Activity,
  Eye,
  Edit,
  MoreHorizontal,
  Upload,
  FileText,
  FileSignature,
  X,
  Plus,
  Home
} from 'lucide-react';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import LoanModal from '@/components/modals/LoanModal';
import PaymentModal from '@/components/modals/PaymentModal';
import ContractModal from '@/components/modals/ContractModal';

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
  email?: string;
  customerId: string;
  loanStatus?: 'active' | 'overdue' | 'completed' | 'pending';
  loanAmount?: number;
  paidAmount?: number;
  dueDate?: string;
  progress?: number;
  creditScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
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

// Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color, subValue }: any) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
      {change && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          change > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
    {subValue && <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{subValue}</p>}
  </div>
);

// Segment Card Component
const SegmentCard = ({ title, count, amount, icon: Icon, color, href, badge }: any) => (
  <Link href={href} className="block p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
        <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
      </div>
      {badge && (
        <span className={`px-2 py-1 text-xs font-medium rounded-full animate-pulse ${
          badge === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
          badge === 'new' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }`}>
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">View all →</p>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-gray-900 dark:text-white">{count}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{amount}</span>
    </div>
  </Link>
);

// Quick Actions Grid
const QuickActions = ({ onAction }: any) => {
  const actions = [
    { icon: UserPlus, label: 'New Customer', color: 'blue', action: 'new-customer' },
    { icon: CreditCard, label: 'Create Loan', color: 'green', action: 'new-loan' },
    { icon: Upload, label: 'Upload Document', color: 'purple', action: 'upload-doc' },
    { icon: FileSignature, label: 'Add Contract', color: 'orange', action: 'add-contract' },
    { icon: DollarSign, label: 'Record Payment', color: 'emerald', action: 'record-payment' },
    { icon: FileText, label: 'Add Note', color: 'pink', action: 'add-note' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.action}
            onClick={() => onAction(action.action)}
            className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
          >
            <div className={`p-3 bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-xl mb-2 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default function CustomerOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('week');

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      const [userRes, statsRes, customersRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/overview-stats'),
        fetch('/api/admin/recent-customers?limit=5')
      ]);

      const userData = await userRes.json();
      const statsData = await statsRes.json();
      const customersData = await customersRes.json();

      setUser(userData.user);
      setStats(statsData.data || statsData);
      setRecentCustomers(customersData.customers || []);

    } catch (error) {
      console.error('Error fetching data:', error);
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
      maximumFractionDigits: 0,
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

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const handleQuickAction = (action: string) => {
    switch(action) {
      case 'new-customer':
        router.push('/admin/customers/new');
        break;
      default:
        setActiveModal(action);
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
      {/* Header with Quick Access */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Back to Dashboard"
          >
            <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Customer Overview</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user?.name || 'Admin'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
            {['day', 'week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeframe === period
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/customers/import"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Import Customers"
          >
            <Download className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Quick Actions - Now as buttons that open modals */}
      

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          change={12.3}
          icon={Users}
          color="blue"
          subValue={`${stats?.newCustomersToday || 0} new this month`}
        />
        <StatCard
          title="Active Loans"
          value={stats?.activeLoans || 0}
          change={8.1}
          icon={CreditCard}
          color="green"
          subValue={`${formatCurrency(stats?.totalDisbursed || 0)} outstanding`}
        />
        <StatCard
          title="Overdue Loans"
          value={stats?.overdueLoans || 0}
          change={-5.2}
          icon={AlertTriangle}
          color="red"
          subValue={`${formatCurrency((stats?.totalDisbursed || 0) * 0.15)} at risk`}
        />
        <StatCard
          title="Completed Loans"
          value={stats?.completedLoans || 0}
          change={15.3}
          icon={CheckCircle}
          color="purple"
          subValue={`${Math.round(((stats?.totalRepaid || 0) / (stats?.totalDisbursed || 1)) * 100)}% repayment rate`}
        />
      </div>

      {/* Customer Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SegmentCard
          title="Active Customers"
          count={stats?.activeLoans || 0}
          amount={formatCurrency(stats?.totalDisbursed || 0)}
          icon={CreditCard}
          color="green"
          href="/admin/customers/active"
        />
        <SegmentCard
          title="Overdue Customers"
          count={stats?.overdueLoans || 0}
          amount={formatCurrency((stats?.totalDisbursed || 0) * 0.15)}
          icon={AlertTriangle}
          color="red"
          href="/admin/customers/overdue"
          badge="urgent"
        />
        <SegmentCard
          title="Completed"
          count={stats?.completedLoans || 0}
          amount={formatCurrency(stats?.totalRepaid || 0)}
          icon={CheckCircle}
          color="purple"
          href="/admin/customers/completed"
        />
        <SegmentCard
          title="Pending Approval"
          count={stats?.pendingApprovals || 0}
          amount={formatCurrency((stats?.totalDisbursed || 0) * 0.1)}
          icon={Clock}
          color="yellow"
          href="/admin/approvals"
        />
        <SegmentCard
          title="High Risk"
          count={stats?.highRiskCustomers || 0}
          amount={formatCurrency((stats?.totalDisbursed || 0) * 0.08)}
          icon={Shield}
          color="red"
          href="/admin/customers/risk-analysis"
          badge="urgent"
        />
        <SegmentCard
          title="New Applications"
          count={stats?.newApplications || 0}
          amount={formatCurrency((stats?.totalDisbursed || 0) * 0.05)}
          icon={UserPlus}
          color="blue"
          href="/admin/customers/new-applications"
          badge="new"
        />
      </div>

      {/* Recent Customers Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Customers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Latest customer activity</p>
          </div>
          <Link
            href="/admin/customers"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All Customers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentCustomers.map((customer) => {
                const status = getStatusBadge(customer.loanStatus || 'pending');
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
                          <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.firstName} {customer.surname}
                            </p>
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.customerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        {status.label}
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <Link
                          href={`/admin/customers/${customer.id}/edit`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </Link>
                        <button
                          onClick={() => handleQuickAction('more')}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
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
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Distribution</h3>
          </div>
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
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Performance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">On-Time Payments</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">{stats?.loanPerformance?.onTime || 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats?.loanPerformance?.onTime || 0}%` }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Late Payments</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{stats?.loanPerformance?.late || 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${stats?.loanPerformance?.late || 0}%` }} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Defaulted</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{stats?.loanPerformance?.defaulted || 0}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: `${stats?.loanPerformance?.defaulted || 0}%` }} />
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
            <Link
              href="/admin/payments/upcoming"
              className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Schedule
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={activeModal === 'upload-doc'}
        onClose={() => setActiveModal(null)}
        customerId={recentCustomers[0]?.id}
      />

      <LoanModal
        isOpen={activeModal === 'new-loan'}
        onClose={() => setActiveModal(null)}
        customerId={recentCustomers[0]?.id}
      />

      <PaymentModal
        isOpen={activeModal === 'record-payment'}
        onClose={() => setActiveModal(null)}
        customerId={recentCustomers[0]?.id}
      />

      <ContractModal
        isOpen={activeModal === 'add-contract'}
        onClose={() => setActiveModal(null)}
        customerId={recentCustomers[0]?.id}
      />
    </div>
  );
}



