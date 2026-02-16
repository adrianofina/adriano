'use client';

import { useState } from 'react';
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

export default function AdminDashboard() {
  const { userRole, canDisburse, canApproveStage2 } = usePermissions();
  const [timeframe, setTimeframe] = useState('today');

  // ========== DASHBOARD STATS ==========
  // These would come from your API in production
  const stats = [
    {
      id: 1,
      title: 'Total Customers',
      value: '1,247',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      details: '32 new this month'
    },
    {
      id: 2,
      title: 'Active Loans',
      value: '342',
      change: '+8.1%',
      trend: 'up',
      icon: CreditCard,
      color: 'green',
      details: 'TSh 892M outstanding'
    },
    {
      id: 3,
      title: 'Total Disbursed',
      value: 'TSh 2.84B',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'purple',
      details: 'This month: TSh 342M'
    },
    {
      id: 4,
      title: 'Overdue Loans',
      value: '23',
      change: '-5.2%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'red',
      details: 'TSh 4.2M at risk'
    }
  ];

  // ========== PENDING APPROVALS ==========
  // Different views based on role
  const pendingApprovals = [
    {
      id: 'L-3421',
      customer: 'John Doe',
      amount: 'TSh 5,000,000',
      purpose: 'Business Expansion',
      appliedDate: '2024-03-15',
      stage: 1,
      risk: 'low'
    },
    {
      id: 'L-3422',
      customer: 'Jane Smith',
      amount: 'TSh 3,500,000',
      purpose: 'Education',
      appliedDate: '2024-03-14',
      stage: 1,
      risk: 'medium'
    },
    {
      id: 'L-3423',
      customer: 'Robert Johnson',
      amount: 'TSh 7,200,000',
      purpose: 'Agriculture',
      appliedDate: '2024-03-13',
      stage: 2, // Needs super admin approval
      risk: 'low'
    }
  ];

  // ========== READY FOR DISBURSEMENT ==========
  // Only visible to super admins
  const readyForDisbursement = [
    {
      id: 'L-3418',
      customer: 'Mary Williams',
      amount: 'TSh 2,100,000',
      approvedBy: 'Admin User',
      approvedAt: '2024-03-15',
      method: 'Mobile Money'
    },
    {
      id: 'L-3419',
      customer: 'James Brown',
      amount: 'TSh 4,500,000',
      approvedBy: 'Admin User',
      approvedAt: '2024-03-14',
      method: 'Bank Transfer'
    }
  ];

  // ========== RECENTLY PAID LOANS ==========
  // These trigger notifications to super admins
  const recentlyPaid = [
    {
      id: 'L-3412',
      customer: 'Laurent Adriano',
      amount: 'TSh 120,000',
      paidBy: 'Loan Officer',
      paidAt: '2024-03-15',
      confirmedBy: null // Waiting for super admin confirmation
    }
  ];

  // ========== QUICK ACTIONS ==========
  // Role-based quick actions
  const getQuickActions = () => {
    const actions = [
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
        badge: pendingApprovals.length
      },
      {
        label: 'Manual Upload',
        href: '/admin/uploads',
        icon: FileText,
        color: 'purple',
        roles: ['super_admin', 'admin', 'loan_officer', 'customer_service']
      }
    ];

    // Add disbursement action for super admins only
    if (userRole === 'super_admin') {
      actions.push({
        label: 'Disburse Funds',
        href: '/admin/disbursements',
        icon: DollarSign,
        color: 'emerald',
        roles: ['super_admin'],
        badge: readyForDisbursement.length
      });
    }

    return actions.filter(action => action.roles.includes(userRole as any));
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {userRole?.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeframe === 'today' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeframe === 'week' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              timeframe === 'month' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 bg-${stat.color}-100 rounded-lg`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.details}</p>
            </div>
          );
        })}
      </div>

      {/* ===== MAIN CONTENT GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== LEFT COLUMN - PENDING APPROVALS ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approvals Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
                  <p className="text-xs text-gray-500">
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
                  // Filter based on role
                  if (userRole === 'super_admin') return true;
                  if (userRole === 'admin') return loan.stage === 1;
                  return false;
                })
                .map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      loan.risk === 'low' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <CreditCard className={`w-4 h-4 ${
                        loan.risk === 'low' ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{loan.customer}</p>
                        <span className="text-xs text-gray-500">#{loan.id}</span>
                        {loan.stage === 2 && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">
                            Final Approval
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{loan.amount} • {loan.purpose}</p>
                      <p className="text-xs text-gray-500 mt-1">Applied: {loan.appliedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      Review
                    </button>
                  </div>
                </div>
              ))}

              {pendingApprovals.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No pending approvals</p>
                  <p className="text-sm text-gray-500 mt-1">All caught up!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Paid Loans - Triggers notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recently Paid</h2>
                  <p className="text-xs text-gray-500">Loans marked as paid - awaiting confirmation</p>
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
              {recentlyPaid.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{loan.customer}</p>
                        <span className="text-xs text-gray-500">#{loan.id}</span>
                      </div>
                      <p className="text-sm text-gray-600">{loan.amount} • Paid by {loan.paidBy}</p>
                      <p className="text-xs text-gray-500 mt-1">{loan.paidAt}</p>
                    </div>
                  </div>
                  {userRole === 'super_admin' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
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
          {userRole === 'super_admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Ready to Disburse</h2>
                    <p className="text-xs text-gray-500">Fully approved, waiting for fund release</p>
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
                {readyForDisbursement.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{loan.customer}</p>
                        <span className="text-xs text-gray-500">#{loan.id}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{loan.amount}</p>
                      <p className="text-xs text-gray-500 mt-1">Approved by {loan.approvedBy}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{loan.method}</p>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {getQuickActions().map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group relative"
                  >
                    <div className={`p-2 bg-${action.color}-100 rounded-lg mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-5 h-5 text-${action.color}-600`} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{action.label}</span>
                    {action.badge && (
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New customer registered</p>
                  <p className="text-xs text-gray-600">Sarah Johnson • Manual upload</p>
                  <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Loan approved (Stage 1)</p>
                  <p className="text-xs text-gray-600">John Doe • TSh 5,000,000</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Documents uploaded</p>
                  <p className="text-xs text-gray-600">Loan #L-3422 • 3 files</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
