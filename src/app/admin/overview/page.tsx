"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, CreditCard, DollarSign, AlertTriangle,
  Clock, CheckCircle2, ArrowRight, FileText,
  RefreshCw, UserPlus, Sparkles, TrendingUp,
  Calendar, Shield, Zap, Activity, PieChart,
  Home, BarChart3, Award, Target, Gauge
} from 'lucide-react';

interface LoanStats {
  onTime: number;
  late: number;
  defaulted: number;
}

interface OverviewStats {
  totalCustomers: number;
  activeLoans: number;
  overdueLoans: number;
  completedLoans: number;
  totalDisbursed: number;
  totalRepaid: number;
  pendingApprovals: number;
  newCustomersToday: number;
  portfolioAtRisk: number;
  loanPerformance: LoanStats;
  upcomingPayments: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
}

// ── Simple Progress Ring (no hover animations) ──
const ProgressRing = ({ percentage, size = 100, color = '#6366f1' }: { percentage: number; size?: number; color?: string }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percentage) / 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="8"
          className="dark:stroke-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

// ── Simple Progress Bar (no hover effects) ──
const SimpleProgressBar = ({ percentage, color, label, sublabel }: { percentage: number; color: string; label: string; sublabel: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
        <p className="text-[10px] text-gray-400">{sublabel}</p>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
    </div>
    <div className="w-full h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
      <div 
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percentage}%`, background: color }}
      />
    </div>
  </div>
);

// ── Sparkline bars (simple visual) ──
const SparkBars = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const bars = 7;
  return (
    <div className="flex items-end gap-[2px] h-7">
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.max(15, Math.round(((i + 1) / bars) * 100 * (value / (max || 1))));
        return (
          <div key={i} className="w-[3px] rounded-sm"
            style={{ height: `${Math.min(100, h)}%`, background: i === bars - 1 ? color : `${color}55` }} />
        );
      })}
    </div>
  );
};

// ── Donut component (simple, no hover distortion) ──
const Donut = ({ segments, size = 88 }: { segments: { value: number; color: string }[]; size?: number }) => {
  const r = size / 2 - 9;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  const arcs: JSX.Element[] = [];
  segments.forEach((seg, i) => {
    const dash = (seg.value / total) * circ;
    const gap = circ - dash;
    arcs.push(
      <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={seg.color} strokeWidth={9}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
    );
    offset += dash;
  });
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(0,0,0,0.05)" strokeWidth={9} className="dark:stroke-gray-700" />
      {arcs}
    </svg>
  );
};

export default function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/overview-stats');
        const data = await res.json();
        setStats(data.data || data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (n: number) => {
    if (!n) return 'TSh 0';
    if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `TSh ${(n / 1_000).toFixed(1)}K`;
    return `TSh ${n.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const total = stats?.totalCustomers || 1;
  const rLow = stats?.activeLoans || 0;
  const rMed = stats?.overdueLoans || 0;
  const rHigh = stats?.completedLoans || 0;
  const disbursed = stats?.totalDisbursed || 0;
  const repaid = stats?.totalRepaid || 0;
  const repaidPct = disbursed > 0 ? Math.round((repaid / disbursed) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-500 uppercase tracking-wider">Portfolio Overview</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Overview</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time portfolio metrics and insights</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Financial Overview Ring */}
        <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <ProgressRing percentage={repaidPct} size={120} color="#6366f1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Health</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overall repayment rate</p>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Disbursed: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(disbursed)}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Repaid: <span className="font-semibold text-emerald-600">{formatCurrency(repaid)}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding: <span className="font-semibold text-amber-600">{formatCurrency(disbursed - repaid)}</span></p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCustomers || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-600">{stats?.activeLoans || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active Loans</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats?.overdueLoans || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Customers', value: stats?.totalCustomers ?? 0, icon: Users, color: '#6366f1', change: '+12%', trend: 'up' },
            { label: 'Active Loans', value: stats?.activeLoans ?? 0, icon: CreditCard, color: '#10B981', change: '+8%', trend: 'up' },
            { label: 'Overdue Loans', value: stats?.overdueLoans ?? 0, icon: AlertTriangle, color: '#EF4444', change: '-5%', trend: 'down' },
            { label: 'Completed', value: stats?.completedLoans ?? 0, icon: CheckCircle2, color: '#a855f7', change: '+15%', trend: 'up' },
          ].map(({ label, value, icon: Icon, color, change, trend }) => (
            <div key={label} className="relative bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full" style={{ background: color }} />
              <div className="flex items-start justify-between mb-3 pl-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none pl-3">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-3">{label}</p>
              <div className="absolute bottom-4 right-4 opacity-50">
                <SparkBars value={value} max={stats?.totalCustomers || 10} color={color} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Loan Performance (Fixed - NO hover effects) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.10)' }}>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Performance</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {stats?.loanPerformance?.onTime ?? 0}% on track
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <SimpleProgressBar
                  percentage={stats?.loanPerformance?.onTime ?? 0}
                  color="#10B981"
                  label="On-Time Payments"
                  sublabel="Paid within schedule"
                />
                <SimpleProgressBar
                  percentage={stats?.loanPerformance?.late ?? 0}
                  color="#F59E0B"
                  label="Late Payments"
                  sublabel="1–30 days overdue"
                />
                <SimpleProgressBar
                  percentage={stats?.loanPerformance?.defaulted ?? 0}
                  color="#EF4444"
                  label="Defaulted"
                  sublabel="30+ days overdue"
                />
              </div>
            </div>
          </div>

          {/* Right - Risk Distribution */}
          <div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.10)' }}>
                  <Shield className="w-4 h-4 text-indigo-500" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Distribution</h2>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative shrink-0">
                  <Donut size={100} segments={[
                    { value: rLow, color: '#10B981' },
                    { value: rMed, color: '#F59E0B' },
                    { value: rHigh, color: '#EF4444' },
                  ]} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{total}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-wide">total</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  {[
                    { label: 'Active', count: rLow, color: '#10B981' },
                    { label: 'Overdue', count: rMed, color: '#F59E0B' },
                    { label: 'Completed', count: rHigh, color: '#EF4444' },
                  ].map(({ label, count, color }) => {
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-800 dark:text-white">{count}</span>
                              <span className="text-[10px] text-gray-400">{pct}%</span>
                            </div>
                          </div>
                          <div className="w-full h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.10)' }}>
              <Calendar className="w-4 h-4 text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Payments</h2>
          </div>

          <div className="relative pl-5">
            <div className="absolute left-[9px] top-2 bottom-2 w-px"
              style={{ background: 'linear-gradient(180deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)' }} />
            <div className="space-y-4">
              {[
                { label: 'Next 7 days', count: stats?.upcomingPayments?.next7Days ?? 0, color: '#EF4444' },
                { label: 'Next 30 days', count: stats?.upcomingPayments?.next30Days ?? 0, color: '#F59E0B' },
                { label: 'Next 90 days', count: stats?.upcomingPayments?.next90Days ?? 0, color: '#10B981' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0 -ml-5 z-10 ring-2 ring-white dark:ring-gray-900"
                    style={{ background: color }} />
                  <div className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-base font-bold" style={{ color }}>
                      {count}
                      <span className="text-[10px] font-normal text-gray-400 ml-1">loans</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {(stats?.upcomingPayments?.next7Days ?? 0) + (stats?.upcomingPayments?.next30Days ?? 0)} due this month
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-semibold text-amber-500">{stats?.pendingApprovals ?? 0} pending approvals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
