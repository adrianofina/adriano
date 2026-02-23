'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  Filter,
  Calendar,
  Shield,
  UserCheck,
  FileText,
  BarChart3,
  RefreshCw,
  Moon,
  Sun,
  Wallet,
  Landmark,
  Percent,
  CalendarDays,
  Activity,
  PieChart,
  TrendingDown,
  TrendingUp as TrendUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalCustomers: number;
  activeLoans: number;
  overdueLoans: number;
  completedLoans: number;
  pendingApprovals: number;
  totalDisbursed: number;
  totalRepaid: number;
  outstandingBalance: number;
  portfolioAtRisk: number;
  newCustomersToday: number;
  paymentsToday: number;
  loansDisbursedToday: number;
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    entityType: string;
    timestamp: string;
  }>;
}

interface PendingLoan {
  id: string;
  loanId: string;
  customer: {
    firstName: string;
    surname: string;
    riskLevel: string;
  };
  amount: number;
  purpose: string;
  createdAt: string;
  stage: number;
}

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('week');

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/pending-approvals', { headers })
      ]);

      const [statsData, pendingData] = await Promise.all([
        statsRes.json(),
        pendingRes.json()
      ]);

      if (statsRes.ok) setStats(statsData);
      if (pendingRes.ok) setPendingApprovals(pendingData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return date.toLocaleDateString();
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      change: stats?.newCustomersToday || 0,
      changeLabel: 'new today',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800/30'
    },
    {
      title: 'Active Loans',
      value: stats?.activeLoans || 0,
      subValue: formatCurrency(stats?.outstandingBalance || 0),
      subLabel: 'outstanding',
      icon: CreditCard,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800/30'
    },
    {
      title: 'Total Portfolio',
      value: formatCurrency(stats?.totalDisbursed || 0),
      subValue: `${(stats?.portfolioAtRisk || 0).toFixed(1)}%`,
      subLabel: 'at risk',
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800/30'
    },
    {
      title: 'Overdue Loans',
      value: stats?.overdueLoans || 0,
      change: stats?.overdueLoans || 0,
      changeLabel: 'need attention',
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.name?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here's what's happening with your microfinance today.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              {['day', 'week', 'month'].map((period) => (
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
            
            {/* Refresh button */}
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-900 rounded-xl border ${stat.borderColor} shadow-sm hover:shadow-md transition-all p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {stat.change !== undefined && stat.change > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
                    <TrendUp className="w-3 h-3" />
                    +{stat.change}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</p>
              {stat.subValue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-500">{stat.subLabel}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stat.subValue}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Approvals</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pendingApprovals.length} loans waiting for review
                  </p>
                </div>
              </div>
              <Link
                href="/admin/approvals"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {pendingApprovals.slice(0, 3).map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getRiskColor(loan.customer.riskLevel)}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {loan.customer.firstName} {loan.customer.surname}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{loan.loanId}</span>
                        {loan.stage === 2 && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                            Final Approval
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(loan.amount)} • {loan.purpose}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Applied {formatDate(loan.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              ))}

              {pendingApprovals.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No pending approvals</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">All caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              </div>
            </div>

            <div className="space-y-4">
              {stats?.recentActivities?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      by {activity.user} • {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Customer', icon: Users, href: '/admin/customers/new', color: 'blue' },
                { label: 'Create Loan', icon: CreditCard, href: '/admin/loans/new', color: 'green' },
                { label: 'Review Approvals', icon: Clock, href: '/admin/approvals', color: 'yellow', badge: pendingApprovals.length },
                { label: 'Manual Upload', icon: FileText, href: '/admin/uploads', color: 'purple' }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative"
                  >
                    <div className={`p-2 bg-${action.color}-100 dark:bg-${action.color}-900/20 rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {action.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Portfolio Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Loan Performance</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats?.activeLoans || 0} active
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                    style={{ width: `${((stats?.activeLoans || 0) / ((stats?.activeLoans || 0) + (stats?.completedLoans || 0) + (stats?.overdueLoans || 0)) * 100) || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mt-2">
                  <span>✅ Completed: {stats?.completedLoans || 0}</span>
                  <span>⚠️ Overdue: {stats?.overdueLoans || 0}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Disbursed vs Repaid</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {((stats?.totalRepaid || 0) / (stats?.totalDisbursed || 1) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Disbursed</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">Repaid</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                        style={{ width: `${((stats?.totalRepaid || 0) / (stats?.totalDisbursed || 1) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio at Risk</span>
                  <span className={`text-sm font-medium ${
                    (stats?.portfolioAtRisk || 0) > 10 ? 'text-red-600 dark:text-red-400' : 
                    (stats?.portfolioAtRisk || 0) > 5 ? 'text-yellow-600 dark:text-yellow-400' : 
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {(stats?.portfolioAtRisk || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">New Customers</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats?.newCustomersToday || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-600 dark:text-gray-400">Payments Received</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats?.paymentsToday || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Loans Disbursed</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats?.loansDisbursedToday || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
