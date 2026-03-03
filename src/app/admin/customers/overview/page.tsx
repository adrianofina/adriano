"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, CreditCard, AlertTriangle, TrendingUp, Clock,
  CheckCircle, ArrowRight, Calendar, UserPlus, RefreshCw,
  Home, ArrowUpRight, Zap, Shield,
} from 'lucide-react';

// ─── interfaces ───────────────────────────────────────────────────────────────
interface Customer {
  id: string; firstName: string; surname: string;
  phoneNumber: string; customerId: string;
  loanStatus?: 'active' | 'overdue' | 'completed' | 'pending';
  loanAmount?: number; progress?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Stats {
  totalCustomers: number; activeLoans: number;
  overdueLoans: number; completedLoans: number;
  totalDisbursed: number; totalRepaid: number;
  pendingApprovals: number; highRiskCustomers: number;
  newCustomersToday: number;
  riskDistribution: { low: number; medium: number; high: number };
  loanPerformance: { onTime: number; late: number; defaulted: number };
  upcomingPayments: { next7Days: number; next30Days: number; next90Days: number };
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => {
  if (!n && n !== 0) return 'TSh 0';
  if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `TSh ${(n / 1_000).toFixed(1)}K`;
  return `TSh ${n.toLocaleString()}`;
};

const loanStatusStyle: Record<string, string> = {
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  overdue:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pending:   'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};
const riskStyle: Record<string, string> = {
  low:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const progressColor = (s?: string) =>
  s === 'overdue' ? '#EF4444' : s === 'completed' ? '#10B981' : '#6366F1';

// ─── SVG Donut ────────────────────────────────────────────────────────────────
function Donut({ segments, size = 88 }: { segments: { value: number; color: string }[]; size?: number }) {
  const r     = size / 2 - 9;
  const circ  = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset  = 0;
  const arcs: JSX.Element[] = [];
  segments.forEach((seg, i) => {
    const dash = (seg.value / total) * circ;
    const gap  = circ - dash;
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
        stroke="rgba(0,0,0,0.05)" strokeWidth={9} />
      {arcs}
    </svg>
  );
}

// ─── Sparkline bars ───────────────────────────────────────────────────────────
function SparkBars({ value, max, color }: { value: number; max: number; color: string }) {
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
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CustomerOverviewPage() {
  const router = useRouter();
  const [stats, setStats]                     = useState<Stats | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]                 = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([
        fetch('/api/admin/overview-stats'),
        fetch('/api/admin/recent-customers?limit=5'),
      ]);
      const sd = await sRes.json();
      const cd = await cRes.json();
      setStats(sd.data || sd);
      setRecentCustomers(cd.customers || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  );

  const total      = stats?.totalCustomers || 1;
  const rLow       = stats?.riskDistribution?.low    ?? 0;
  const rMed       = stats?.riskDistribution?.medium ?? 0;
  const rHigh      = stats?.riskDistribution?.high   ?? 0;
  const disbursed  = stats?.totalDisbursed ?? 0;
  const repaid     = stats?.totalRepaid    ?? 0;
  const repaidPct  = disbursed > 0 ? Math.round((repaid / disbursed) * 100) : 0;

  return (
    <div className="space-y-4">

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  HERO HEADER                                                     ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="relative overflow-hidden rounded-2xl" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(168,85,247,0.06) 55%, rgba(59,130,246,0.05) 100%)',
        border: '1px solid rgba(99,102,241,0.12)',
      }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.9) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }} />
        {/* Blobs */}
        <div className="absolute -top-8 right-1/4 w-56 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-4 left-1/3 w-48 h-28 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.09) 0%, transparent 70%)' }} />

        <div className="relative px-6 pt-5 pb-6">
          {/* Nav row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard"
                className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 dark:text-gray-400 transition-colors"
                style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <Home className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Customer Overview</h1>
                <p className="text-[11px] text-gray-400 mt-0.5">Real-time portfolio metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchData}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 transition-all"
                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.07)' }}>
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link href="/admin/customers/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 2px 12px rgba(99,102,241,0.28)' }}>
                <UserPlus className="w-4 h-4" />
                New Customer
              </Link>
            </div>
          </div>

          {/* Three financial totals */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total Disbursed', value: fmt(disbursed),                         accent: '#6366f1', Icon: CreditCard  },
              { label: 'Total Repaid',    value: fmt(repaid),                            accent: '#10B981', Icon: TrendingUp  },
              { label: 'Outstanding',     value: fmt(Math.max(0, disbursed - repaid)),   accent: '#a855f7', Icon: Zap         },
            ].map(({ label, value, accent, Icon }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className="w-3 h-3" style={{ color: accent }} />
                  <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: accent }}>{label}</p>
                </div>
                <p className="text-[1.6rem] font-black text-gray-900 dark:text-white leading-none">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Repaid progress bar at bottom edge */}
        <div className="h-[3px] w-full" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <div className="h-full rounded-r-full"
            style={{ width: `${repaidPct}%`, background: 'linear-gradient(90deg, #6366f1, #10B981)', transition: 'width 1s ease' }} />
        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  4 STAT CARDS                                                    ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Customers', value: stats?.totalCustomers ?? 0, Icon: Users,         accent: '#6366f1', change: '+12%', pos: true  },
          { label: 'Active Loans',    value: stats?.activeLoans    ?? 0, Icon: CreditCard,    accent: '#10B981', change: '+8%',  pos: true  },
          { label: 'Overdue Loans',   value: stats?.overdueLoans   ?? 0, Icon: AlertTriangle, accent: '#EF4444', change: '-5%',  pos: false },
          { label: 'Completed',       value: stats?.completedLoans ?? 0, Icon: CheckCircle,   accent: '#a855f7', change: '+15%', pos: true  },
        ].map(({ label, value, Icon, accent, change, pos }) => (
          <div key={label}
            className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 overflow-hidden shadow-sm"
            style={{ border: `1px solid ${accent}20` }}>
            {/* Accent left stripe */}
            <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full" style={{ background: accent }} />

            <div className="flex items-start justify-between mb-3 pl-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}12` }}>
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: pos ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', color: pos ? '#10B981' : '#EF4444' }}>
                {change}
              </span>
            </div>

            <div className="pl-3 flex items-end justify-between">
              <div>
                <p className="text-[26px] font-black text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{label}</p>
              </div>
              <SparkBars value={value} max={stats?.totalCustomers || 10} color={accent} />
            </div>
          </div>
        ))}
      </div>

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  MIDDLE ROW — asymmetric 5-col grid                             ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left (3 cols) — Portfolio Health + segment tiles */}
        <div className="lg:col-span-3 space-y-4">

          {/* Loan Performance card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.10)' }}>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Loan Performance</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.12)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {stats?.loanPerformance?.onTime ?? 0}% on track
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'On-Time Payments', pct: stats?.loanPerformance?.onTime    ?? 0, color: '#10B981', sub: 'Paid within schedule' },
                { label: 'Late Payments',    pct: stats?.loanPerformance?.late      ?? 0, color: '#F59E0B', sub: '1–30 days overdue'   },
                { label: 'Defaulted',        pct: stats?.loanPerformance?.defaulted ?? 0, color: '#EF4444', sub: '30+ days overdue'    },
              ].map(({ label, pct, color, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-[3px] self-stretch rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{label}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
                      </div>
                      <span className="text-sm font-black ml-2 shrink-0" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segment quick-jump tiles */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/admin/customers/active',    label: 'Active',    count: stats?.activeLoans    ?? 0, Icon: Users,       accent: '#10B981' },
              { href: '/admin/customers/overdue',   label: 'Overdue',   count: stats?.overdueLoans   ?? 0, Icon: Clock,       accent: '#EF4444' },
              { href: '/admin/customers/completed', label: 'Completed', count: stats?.completedLoans ?? 0, Icon: CheckCircle, accent: '#a855f7' },
            ].map(({ href, label, count, Icon, accent }) => (
              <Link key={href} href={href}
                className="group relative overflow-hidden rounded-2xl p-4 bg-white dark:bg-gray-900 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ border: `1px solid ${accent}20` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                  style={{ background: `${accent}07` }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}12` }}>
                      <Icon className="w-4 h-4" style={{ color: accent }} />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{ color: accent }} />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{count}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{label}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* Right (2 cols) — Donut + Upcoming Payments */}
        <div className="lg:col-span-2 space-y-4">

          {/* Risk Donut */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Risk Distribution</h3>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Donut size={88} segments={[
                  { value: rLow,  color: '#10B981' },
                  { value: rMed,  color: '#F59E0B' },
                  { value: rHigh, color: '#EF4444' },
                ]} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{total}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">total</p>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                {[
                  { label: 'Low',    count: rLow,  color: '#10B981' },
                  { label: 'Medium', count: rMed,  color: '#F59E0B' },
                  { label: 'High',   count: rHigh, color: '#EF4444' },
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
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Payments — timeline */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Payments</h3>
            </div>

            {/* Timeline */}
            <div className="relative pl-5">
              <div className="absolute left-[9px] top-2 bottom-2 w-px"
                style={{ background: 'linear-gradient(180deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)' }} />
              <div className="space-y-3">
                {[
                  { label: 'Next 7 days',  count: stats?.upcomingPayments?.next7Days  ?? 0, color: '#EF4444' },
                  { label: 'Next 30 days', count: stats?.upcomingPayments?.next30Days ?? 0, color: '#F59E0B' },
                  { label: 'Next 90 days', count: stats?.upcomingPayments?.next90Days ?? 0, color: '#10B981' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0 -ml-5 z-10 ring-2 ring-white dark:ring-gray-900"
                      style={{ background: color }} />
                    <div className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-black" style={{ color }}>
                        {count}
                        <span className="text-[10px] font-normal text-gray-400 ml-1">loans</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.10)' }}>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {(stats?.upcomingPayments?.next7Days ?? 0) + (stats?.upcomingPayments?.next30Days ?? 0)} due this month
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-semibold text-amber-500">{stats?.pendingApprovals ?? 0} pending</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  RECENT CUSTOMERS TABLE                                          ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden"
        style={{ border: '1px solid rgba(99,102,241,0.09)' }}>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Customers</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Last 5 onboarded</p>
            </div>
          </div>
          <Link href="/admin/customers"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                {['Customer', 'Loan Status', 'Risk Level', 'Loan Amount', 'Repayment'].map(h => (
                  <th key={h} className="px-6 py-3 text-left">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <Users className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No customers yet</p>
                  </td>
                </tr>
              ) : recentCustomers.map((c, i) => (
                <tr key={c.id}
                  className="group cursor-pointer transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10"
                  style={{ borderBottom: i < recentCustomers.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                  onClick={() => router.push(`/admin/customers/${c.id}`)}>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-xs"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                        {c.firstName?.[0]}{c.surname?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {c.firstName} {c.surname}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{c.customerId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${loanStatusStyle[c.loanStatus || 'pending']}`}>
                      {c.loanStatus || 'pending'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${riskStyle[c.riskLevel || 'medium']}`}>
                      {c.riskLevel || 'medium'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{fmt(c.loanAmount || 0)}</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5 w-32">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${c.progress || 0}%`, background: progressColor(c.loanStatus), transition: 'width 0.5s ease' }} />
                      </div>
                      <span className="text-xs font-bold shrink-0" style={{ color: progressColor(c.loanStatus) }}>
                        {c.progress || 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}