"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, CreditCard, DollarSign, AlertTriangle,
  Clock, CheckCircle2, ArrowRight, FileText,
  RefreshCw, UserCheck, UserPlus, Landmark, Sparkles,
  TrendingUp, Zap, Shield, Calendar, ArrowUpRight,
  Activity, Bell, ChevronRight, CircleDollarSign,
  BadgeCheck, BadgeAlert, BadgeX, Gauge, PieChart,
} from 'lucide-react';
import SungJinwooShadow from '@/components/ui/infamousshadow';
import { usePermissions } from '@/hooks/usePermissions';

interface DashboardStats {
  totalCustomers: number; activeLoans: number; overdueLoans: number;
  completedLoans: number; pendingApprovals: number; totalDisbursed: number;
  totalRepaid: number; portfolioAtRisk: number; newCustomersToday: number;
  paymentsToday: number; loansDisbursedToday: number;
  recentActivities: Array<{ id: string; user: string; action: string; entityType: string; timestamp: string }>;
}
interface PendingLoan {
  id: string; loanId: string;
  customer: { firstName: string; surname: string };
  amount: number; purpose: string; createdAt: string; stage: number; riskLevel: string;
}
interface RecentPayment {
  id: string; loanId: string;
  customer: { firstName: string; surname: string };
  amount: number; receivedBy: { name: string }; receivedAt: string; confirmedById: string | null;
}

const fmt = (n: number | undefined | null) => {
  if (!n && n !== 0) return 'TSh 0';
  return new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .format(n).replace('TZS', 'TSh');
};

const compact = (n: number | undefined | null) => {
  if (!n && n !== 0) return 'TSh 0';
  if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `TSh ${(n / 1_000).toFixed(1)}K`;
  return `TSh ${n.toLocaleString()}`;
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const roleLabel = (r: string) => r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

function CardHeader({ icon: Icon, iconBg, iconColor, title, sub, href, linkLabel = 'View all', badge }: any) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative" style={{ background: iconBg }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
          {badge && badge > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900">{badge}</span>}
        </div>
        <div><h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2><p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p></div>
      </div>
      {href && <Link href={href} className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:gap-1.5 transition-all group">{linkLabel} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></Link>}
    </div>
  );
}

function Empty({ msg, sub, icon: Icon = CheckCircle2 }: any) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.06)' }}><Icon className="w-6 h-6 text-indigo-300 dark:text-indigo-700" /></div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{msg}</p><p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{sub}</p>
    </div>
  );
}

function MiniRing({ percentage, size = 36, color = '#10B981' }: any) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percentage) / 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
    </div>
  );
}

function SparkBars({ value, max, color }: any) {
  const bars = 7;
  return (
    <div className="flex items-end gap-[2px] h-6">
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.max(15, Math.round(((i + 1) / bars) * 100 * (value / (max || 1))));
        return <div key={i} className="w-[3px] rounded-sm" style={{ height: `${Math.min(100, h)}%`, background: i === bars - 1 ? color : `${color}40` }} />;
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const { userRole } = usePermissions();
  const [timeframe, setTimeframe] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pending, setPending] = useState<PendingLoan[]>([]);
  const [paid, setPaid] = useState<RecentPayment[]>([]);

  const load = async () => {
    try {
      setRefreshing(true);
      const statsRes = await fetch('/api/admin/stats');
      const statsResult = await statsRes.json();
      if (statsResult.success && statsResult.data) setStats(statsResult.data);
      
      const pendingRes = await fetch('/api/admin/pending-approvals');
      const pendingResult = await pendingRes.json();
      if (pendingResult.success && Array.isArray(pendingResult.data)) setPending(pendingResult.data);
      
      const paymentsRes = await fetch('/api/admin/recent-payments?limit=10');
      const paymentsResult = await paymentsRes.json();
      if (paymentsResult.success && Array.isArray(paymentsResult.data)) setPaid(paymentsResult.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  // Filter payments by timeframe
  const getFilteredPayments = () => {
    const now = new Date();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
    if (timeframe === 'today') return paid.filter(p => new Date(p.receivedAt) >= today);
    if (timeframe === 'week') return paid.filter(p => new Date(p.receivedAt) >= weekAgo);
    return paid.filter(p => new Date(p.receivedAt) >= monthAgo);
  };

  const filteredPaid = getFilteredPayments().slice(0, 5);
  const visiblePending = pending.filter(l => userRole === 'super_admin' || (userRole === 'admin' && l.stage === 1)).slice(0, 3);

  const quickActions = [
    { label: 'New Customer', href: '/admin/customers/new', Icon: UserPlus, accent: '#6366f1' },
    { label: 'Create Loan', href: '/admin/loans/new', Icon: CreditCard, accent: '#10B981' },
    { label: 'Review Approvals', href: '/admin/approvals', Icon: Clock, accent: '#F59E0B', badge: stats?.pendingApprovals },
    { label: 'Manual Upload', href: '/admin/uploads', Icon: FileText, accent: '#a855f7' },
  ];

  const statCards = stats ? [
    { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), sub: stats.newCustomersToday > 0 ? `+${stats.newCustomersToday} today` : 'No new today', Icon: Users, accent: '#6366f1', positive: stats.newCustomersToday > 0, detail: `${stats.totalCustomers} total` },
    { label: 'Active Loans', value: stats.activeLoans.toLocaleString(), sub: stats.loansDisbursedToday > 0 ? `+${stats.loansDisbursedToday} today` : 'No new today', Icon: CreditCard, accent: '#10B981', positive: stats.loansDisbursedToday > 0, detail: compact(stats.totalDisbursed) + ' outstanding' },
    { label: 'Total Disbursed', value: compact(stats.totalDisbursed), sub: `${stats.loansDisbursedToday || 0} loans today`, Icon: DollarSign, accent: '#a855f7', positive: true, detail: `Repaid: ${compact(stats.totalRepaid)}` },
    { label: 'Overdue Loans', value: stats.overdueLoans.toLocaleString(), sub: stats.portfolioAtRisk ? `${stats.portfolioAtRisk.toFixed(1)}% at risk` : '0% at risk', Icon: AlertTriangle, accent: '#EF4444', positive: stats.overdueLoans === 0, detail: `${stats.overdueLoans} overdue` },
  ] : [];

  const totalDisbursed = stats?.totalDisbursed || 0;
  const totalRepaid = stats?.totalRepaid || 0;
  const portfolioHealth = totalDisbursed > 0 ? Math.round(((totalDisbursed - totalRepaid) / totalDisbursed) * 100) : 0;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl px-6 py-5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(168,85,247,0.06) 55%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(99,102,241,0.12)' }}>
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.9) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-8 right-1/3 w-72 h-28 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.10) 0%, transparent 70%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /><span className="text-xs font-medium" style={{ color: '#6366f1' }}>{greeting()}</span></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.10))', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>{roleLabel(userRole || 'Admin')}</span>
              {(stats?.pendingApprovals ?? 0) > 0 && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.18)' }}><AlertTriangle className="w-3 h-3" />{stats!.pendingApprovals} pending</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl gap-0.5" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
              {['today', 'week', 'month'].map(p => (
                <button key={p} onClick={() => setTimeframe(p)} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all" style={timeframe === p ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.10))', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' } : {}}>
                  <span className={timeframe !== p ? 'text-gray-500 dark:text-gray-400' : ''}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                </button>
              ))}
            </div>
            <button onClick={load} disabled={refreshing} className="p-2 rounded-xl transition-all" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}><RefreshCw className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} /></button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(({ label, value, sub, Icon, accent, positive, detail }) => (
          <div key={label} className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm overflow-hidden" style={{ border: `1px solid ${accent}20` }}>
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: accent }} />
            <div className="flex items-start justify-between mb-3 pl-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}><Icon className="w-4 h-4" style={{ color: accent }} /></div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full max-w-[110px] text-right leading-tight" style={{ background: positive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: positive ? '#10B981' : '#EF4444' }}>{sub}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none pl-2">{value}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 pl-2">{label}</p>
            <div className="flex items-center justify-between mt-2 pl-2"><p className="text-[10px] text-gray-400 dark:text-gray-600">{detail}</p><SparkBars value={parseInt(value.toString().replace(/\D/g, '')) || 0} max={100} color={accent} /></div>
          </div>
        ))}
      </div>

      {/* Main Grid - 3 columns, right column 40% width */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column - 2/3 space */}
        <div className="flex-1 space-y-4">
          {/* Pending Approvals */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <CardHeader icon={Clock} iconBg="rgba(245,158,11,0.10)" iconColor="#D97706" title="Pending Approvals" sub={userRole === 'super_admin' ? 'Stage 1 & 2 awaiting review' : 'Stage 1 approvals waiting for you'} href="/admin/approvals" badge={stats?.pendingApprovals} />
            <div className="space-y-3">
              {visiblePending.length === 0 ? <Empty msg="No pending approvals" sub="All caught up!" /> : visiblePending.map(loan => (
                <div key={loan.id} className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-sm" style={{ background: loan.riskLevel === 'high' ? 'rgba(239,68,68,0.04)' : 'rgba(0,0,0,0.02)', border: loan.riskLevel === 'high' ? '1px solid rgba(239,68,68,0.10)' : '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: loan.stage === 2 ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'linear-gradient(135deg, #F59E0B, #EF8C0A)' }}>S{loan.stage}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{loan.customer.firstName} {loan.customer.surname}</span>
                        <span className="text-[10px] text-gray-400 font-mono">#{loan.loanId}</span>
                        {loan.stage === 2 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>Final</span>}
                        {loan.riskLevel === 'high' && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5" style={{ background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' }}><BadgeAlert className="w-2.5 h-2.5" />High Risk</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fmt(loan.amount)} · {loan.purpose}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Applied {new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button className="px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-md" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>Approve</button>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-300 transition-all hover:bg-black/5" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>Review</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Paid - with timeframe filtering */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <CardHeader icon={CheckCircle2} iconBg="rgba(16,185,129,0.10)" iconColor="#10B981" title="Recently Paid" sub={`${timeframe === 'today' ? 'Today\'s' : timeframe === 'week' ? 'This week\'s' : 'This month\'s'} payments`} />
            <div className="space-y-3">
              {filteredPaid.length === 0 ? <Empty msg={`No payments ${timeframe === 'today' ? 'today' : timeframe === 'week' ? 'this week' : 'this month'}`} sub="Payments will appear here" /> : filteredPaid.map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-sm" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(5,150,105,0.03))', border: '1px solid rgba(16,185,129,0.10)' }}>
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{payment.customer.firstName} {payment.customer.surname}</span>
                        <span className="text-[10px] text-gray-400 font-mono">#{payment.loanId}</span>
                        {!payment.confirmedById && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.15)' }}>Unconfirmed</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{fmt(payment.amount)} · via {payment.receivedBy.name}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(payment.receivedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {userRole === 'super_admin' && !payment.confirmedById && <button className="ml-3 px-3 py-1.5 text-white text-xs font-semibold rounded-lg" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>Confirm</button>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 40% width */}
        <div className="lg:w-[40%] space-y-4">
          {/* Portfolio Health Card */}
          <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-sm" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.10)' }}><PieChart className="w-4 h-4 text-indigo-500" /></div><h2 className="text-sm font-bold text-gray-900 dark:text-white">Portfolio Health</h2></div>
                <div className="flex items-center gap-1"><MiniRing percentage={100 - portfolioHealth} color="#10B981" /><span className="text-xs font-medium text-gray-500">{100 - portfolioHealth}% healthy</span></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Disbursed</span><span className="text-sm font-bold text-gray-900">{compact(totalDisbursed)}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Repaid</span><span className="text-sm font-bold text-emerald-600">{compact(totalRepaid)}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">Outstanding</span><span className="text-sm font-bold text-amber-600">{compact(totalDisbursed - totalRepaid)}</span></div>
                <div className="flex items-center justify-between"><span className="text-xs text-gray-500">At Risk</span><span className="text-sm font-bold text-red-600">{compact(((totalDisbursed) * (stats?.portfolioAtRisk || 0)) / 100)}</span></div>
              </div>

              {/* Progress bar with FULL GRADIENT and Sung Jinwoo Shadow */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1"><span>Portfolio utilization</span><span>{portfolioHealth}%</span></div>
                <div className="relative">
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${portfolioHealth}%`, background: 'linear-gradient(90deg, #10B981, #F59E0B, #EF4444)' }} />
                  </div>
                  <div className="absolute inset-0 pointer-events-none"><SungJinwooShadow progress={portfolioHealth} status={portfolioHealth >= 70 ? 'active' : portfolioHealth >= 40 ? 'pending' : 'overdue'} height="h-1.5" /></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Horizontal 2x2 grid */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" />Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, href, Icon, accent, badge }) => (
                <Link key={label} href={href} className="relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all group hover:scale-105 text-center" style={{ background: `${accent}08`, border: `1px solid ${accent}20` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style={{ background: `${accent}15` }}><Icon className="w-5 h-5" style={{ color: accent }} /></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  {badge && badge > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse" style={{ background: '#EF4444', boxShadow: '0 0 0 2px white' }}>{badge > 9 ? '9+' : badge}</span>}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {stats?.recentActivities && stats.recentActivities.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400" />Recent Activity</h2>
              <div className="space-y-3">
                {stats.recentActivities.slice(0, 4).map((a, i) => (
                  <div key={a.id} className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-105" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}><UserCheck className="w-3.5 h-3.5 text-indigo-400" /></div>
                      {i < 3 && <div className="w-px flex-1 my-1" style={{ background: 'rgba(99,102,241,0.08)', minHeight: '16px' }} />}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-snug">{a.action}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">by {a.user}</p>
                      <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">{new Date(a.timestamp).toLocaleString()}</p>
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
