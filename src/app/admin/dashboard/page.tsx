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
  RefreshCw
} from 'lucide-react';

import { usePermissions } from '@/hooks/usePermissions';

interface DashboardStats {
  totalCustomers: number;
  activeLoans: number;
  overdueLoans: number;
  completedLoans: number;
  pendingApprovals: number;
  totalDisbursed: number;
  totalRepaid: number;
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
  };
  amount: number;
  purpose: string;
  createdAt: string;
  stage: number;
  riskLevel: string;
}

interface DisbursementReady {
  id: string;
  loanId: string;
  customer: {
    firstName: string;
    surname: string;
  };
  amount: number;
  approvedBy: {
    name: string;
  };
  approvedAt: string;
  method: string;
}

interface RecentPayment {
  id: string;
  loanId: string;
  customer: {
    firstName: string;
    surname: string;
  };
  amount: number;
  receivedBy: {
    name: string;
  };
  receivedAt: string;
  confirmedById: string | null;
}

export default function AdminDashboard() {
  const { userRole, canDisburse, canApproveStage2 } = usePermissions();
  const [timeframe, setTimeframe] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingLoan[]>([]);
  const [readyForDisbursement, setReadyForDisbursement] = useState<DisbursementReady[]>([]);
  const [recentlyPaid, setRecentlyPaid] = useState<RecentPayment[]>([]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      // Fetch all dashboard data in parallel
      const [statsRes, pendingRes, disbursementRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/pending-approvals', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/ready-for-disbursement', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/admin/recent-payments', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [statsData, pendingData, disbursementData, paymentsData] = await Promise.all([
        statsRes.json(),
        pendingRes.json(),
        disbursementRes.json(),
        paymentsRes.json()
      ]);

      if (statsRes.ok) setStats(statsData);
      if (pendingRes.ok) {
        // Ensure pendingApprovals is always an array
        const data = pendingData.data || pendingData;
        setPendingApprovals(Array.isArray(data) ? data : (data.items || []));
      }
      if (disbursementRes.ok) setReadyForDisbursement(disbursementData);
      if (paymentsRes.ok) setRecentlyPaid(paymentsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  // Format stats for display
  const getDisplayStats = () => {
    if (!stats) return [];

    return [
      {
        id: 1,
        title: 'Total Customers',
        value: stats.totalCustomers?.toLocaleString() || '0',
        change: stats.newCustomersToday > 0 ? `+${stats.newCustomersToday} today` : 'No new today',
        trend: stats.newCustomersToday > 0 ? 'up' : 'neutral',
        icon: Users,
        color: 'blue',
        details: `${stats.totalCustomers} total customers`
      },
      {
        id: 2,
        title: 'Active Loans',
        value: stats.activeLoans?.toLocaleString() || '0',
        change: stats.loansDisbursedToday > 0 ? `+${stats.loansDisbursedToday} today` : 'No new today',
        trend: stats.loansDisbursedToday > 0 ? 'up' : 'neutral',
        icon: CreditCard,
        color: 'green',
        details: `${formatCurrency(stats.totalDisbursed)} outstanding`
      },
      {
        id: 3,
        title: 'Total Disbursed',
        value: formatCurrency(stats.totalDisbursed),
        change: `${stats.loansDisbursedToday} loans today`,
        trend: stats.loansDisbursedToday > 0 ? 'up' : 'neutral',
        icon: DollarSign,
        color: 'purple',
        details: `Repaid: ${formatCurrency(stats.totalRepaid)}`
      },
      {
        id: 4,
        title: 'Overdue Loans',
        value: stats.overdueLoans.toLocaleString(),
        change: stats.portfolioAtRisk ? `${stats.portfolioAtRisk.toFixed(1)}% at risk` : '0% at risk',
        trend: stats.overdueLoans > 0 ? 'down' : 'neutral',
        icon: AlertTriangle,
        color: 'red',
        details: `${stats.overdueLoans} loans overdue`
      }
    ];
  };

  const quickActions = [
    {
      label: 'New Customer',
      href: '/admin/customers/new',
      icon: Users,
      color: 'blue',
      roles: ['super_admin', 'admin', 'loan_officer', 'customer_service']
    },
    {
      label: 'Create Loan',
      href: '/admin/loans/new',
      icon: CreditCard,
      color: 'green',
      roles: ['super_admin', 'admin', 'loan_officer']
    },
    {
      label: 'Review Approvals',
      href: '/admin/approvals',
      icon: Clock,
      color: 'yellow',
      roles: ['super_admin', 'admin'],
      badge: stats?.pendingApprovals || 0
    },
    {
      label: 'Manual Upload',
      href: '/admin/uploads',
      icon: FileText,
      color: 'purple',
      roles: ['super_admin', 'admin', 'loan_officer', 'customer_service']
    }
  ];

  // Add disbursement action for super admins
  if (userRole === 'super_admin' && readyForDisbursement.length > 0) {
    quickActions.push({
      label: 'Disburse Funds',
      href: '/admin/disbursements',
      icon: DollarSign,
      color: 'emerald',
      roles: ['super_admin'],
      badge: readyForDisbursement.length
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const displayStats = getDisplayStats();

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {userRole?.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
            {['today', 'week', 'month'].map((period) => (
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
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-lg`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : stat.trend === 'down'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{stat.details}</p>
            </div>
          );
        })}
      </div>

      {/* ===== MAIN CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== LEFT COLUMN - PENDING APPROVALS ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Approvals</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userRole === 'super_admin'
                      ? 'Stage 1 & 2 approvals waiting'
                      : 'Stage 1 approvals waiting for you'}
                  </p>
                </div>
              </div>
              <Link
                href="/admin/approvals"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {pendingApprovals
                .filter(loan => {
                  if (userRole === 'super_admin') return true;
                  if (userRole === 'admin') return loan.stage === 1;
                  return false;
                })
                .slice(0, 3)
                .map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      loan.riskLevel === 'low' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      <CreditCard className={`w-4 h-4 ${
                        loan.riskLevel === 'low' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {loan.customer.firstName} {loan.customer.surname}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{loan.loanId}</span>
                        {loan.stage === 2 && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-medium">
                            Final Approval
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(loan.amount)} • {loan.purpose}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Applied: {new Date(loan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
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

          {/* Recently Paid Loans */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Paid</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userRole === 'super_admin' 
                      ? 'Loans marked as paid - awaiting confirmation'
                      : 'Recent payments recorded'}
                  </p>
                </div>
              </div>
              {userRole === 'super_admin' && (
                <Link
                  href="/admin/audit"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View audit log
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {recentlyPaid.slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.customer.firstName} {payment.customer.surname}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{payment.loanId}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(payment.amount)} • Received by {payment.receivedBy.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(payment.receivedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {userRole === 'super_admin' && !payment.confirmedById && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                        Needs Confirmation
                      </span>
                      <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                        Confirm
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-6">
          {/* Ready for Disbursement - SUPER ADMIN ONLY */}
          {userRole === 'super_admin' && readyForDisbursement.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to Disburse</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fully approved, waiting for release</p>
                  </div>
                </div>
                <Link
                  href="/admin/disbursements"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Process
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {readyForDisbursement.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {loan.customer.firstName} {loan.customer.surname}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{loan.loanId}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Approved by {loan.approvedBy.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{loan.method}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Disburse
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
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
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {action.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          {stats?.recentActivities && stats.recentActivities.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {stats.recentActivities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">by {activity.user}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

