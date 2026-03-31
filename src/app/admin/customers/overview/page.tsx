"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, CreditCard, AlertTriangle, TrendingUp, Clock,
  CheckCircle, ArrowRight, Calendar, UserPlus, RefreshCw,
  Home, ArrowUpRight, Zap, Shield,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n: number) => {
  if (!n && n !== 0) return 'TSh 0';
  if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `TSh ${(n / 1_000).toFixed(1)}K`;
  return `TSh ${n.toLocaleString()}`;
};

const loanStatusStyle: Record<string, string> = {
  active:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800',
  overdue:   'bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800',
  completed: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:ring-violet-800',
  pending:   'bg-gray-100 text-gray-500 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700',
};

const riskStyle: Record<string, string> = {
  low:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800',
  high:   'bg-red-50 text-red-600 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800',
};

const progressColor = (s?: string) =>
  s === 'overdue' ? '#EF4444' : s === 'completed' ? '#10B981' : '#6366F1';

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// RISK DONUT RING
// Hover: hovered segment expands outward + whole ring tilts toward it
// ─────────────────────────────────────────────────────────────────────────────
interface RiskSegment { value: number; color: string; label: string; key: string; }

function RiskDonut({
  segments, size = 120, totalLabel,
}: {
  segments: RiskSegment[]; size?: number; totalLabel: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tiltAngle, setTiltAngle]   = useState(0);
  const tiltRaf = useRef<number | null>(null);
  const tiltRef = useRef(0);
  const targetTilt = useRef(0);

  const baseR    = size / 2 - 14;
  const expandR  = baseR + 7;   // expanded segment radius
  const circ     = (r: number) => 2 * Math.PI * r;
  const total    = segments.reduce((a, s) => a + s.value, 0) || 1;

  // Compute each segment's start angle (in degrees, from top = -90)
  const segAngles: { start: number; mid: number; span: number }[] = [];
  let acc = 0;
  segments.forEach(seg => {
    const span = (seg.value / total) * 360;
    segAngles.push({ start: acc, mid: acc + span / 2, span });
    acc += span;
  });

  // Smooth tilt animation
  const animateTilt = useCallback(() => {
    const diff = targetTilt.current - tiltRef.current;
    if (Math.abs(diff) < 0.1) {
      tiltRef.current = targetTilt.current;
      setTiltAngle(tiltRef.current);
      tiltRaf.current = null;
      return;
    }
    tiltRef.current += diff * 0.12; // spring factor
    setTiltAngle(tiltRef.current);
    tiltRaf.current = requestAnimationFrame(animateTilt);
  }, []);

  const handleSegHover = useCallback((idx: number) => {
    setHoveredIdx(idx);
    // Tilt so hovered segment midpoint moves toward 12 o'clock (-90°)
    // Current mid angle (from top) = segAngles[idx].mid - 90
    // We want to rotate so that midpoint = -90 (top)
    // rotation needed = -segAngles[idx].mid (to bring it to 0 from top)
    const midFromTop = segAngles[idx].mid; // degrees from -90 start
    targetTilt.current = -midFromTop * 0.18; // subtle tilt, not full rotation
    if (!tiltRaf.current) tiltRaf.current = requestAnimationFrame(animateTilt);
  }, [segAngles, animateTilt]);

  const handleLeave = useCallback(() => {
    setHoveredIdx(null);
    targetTilt.current = 0;
    if (!tiltRaf.current) tiltRaf.current = requestAnimationFrame(animateTilt);
  }, [animateTilt]);

  // Build arc paths
  const buildArc = (
    startDeg: number, spanDeg: number,
    r: number, cx: number, cy: number
  ): string => {
    const toRad = (d: number) => (d - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(startDeg + spanDeg));
    const y2 = cy + r * Math.sin(toRad(startDeg + spanDeg));
    const large = spanDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const cx = size / 2;
  const cy = size / 2;
  const GAP_DEG = total > 0 ? 2 : 0; // gap between segments in degrees

  const hovered = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ width: size, height: size }}
      onMouseLeave={handleLeave}
      onTouchEnd={handleLeave}
    >
      <svg
        width={size} height={size}
        style={{
          display: 'block',
          transform: `rotate(${tiltAngle}deg)`,
          transition: 'none', // driven by rAF spring
        }}
      >
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={baseR} fill="none"
          stroke="rgba(0,0,0,0.06)" strokeWidth={8}
          className="dark:stroke-gray-800" />

        {segments.map((seg, i) => {
          const { start, span } = segAngles[i];
          if (span <= 0) return null;
          const isHov = hoveredIdx === i;
          const r = isHov ? expandR : baseR;
          const gapEach = GAP_DEG / 2;
          const path = buildArc(start + gapEach, span - GAP_DEG, r, cx, cy);
          return (
            <path
              key={seg.key}
              d={path}
              fill="none"
              stroke={seg.color}
              strokeWidth={isHov ? 10 : 8}
              strokeLinecap="round"
              style={{
                filter: isHov
                  ? `drop-shadow(0 0 8px ${hexToRgba(seg.color, 0.7)})`
                  : 'none',
                transition: 'stroke-width 0.2s ease, filter 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={() => handleSegHover(i)}
              onTouchStart={() => handleSegHover(i)}
            />
          );
        })}
      </svg>

      {/* Centre label — outside SVG so it doesn't tilt */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ transition: 'all 0.25s ease' }}
      >
        {hovered ? (
          <>
            <span
              className="text-xl font-black leading-none"
              style={{ color: hovered.color }}
            >
              {hovered.value}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest mt-1"
              style={{ color: hovered.color }}>
              {hovered.label}
            </span>
          </>
        ) : (
          <>
            <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
              {totalLabel}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1">
              total
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAN PERFORMANCE RING
// Shared ring above the bar chart — 3 arcs (on-time / late / defaulted)
// Hover on a bar OR arc segment: that arc expands + bar highlights
// ─────────────────────────────────────────────────────────────────────────────
interface PerfSegment { key: string; label: string; sub: string; pct: number; color: string; }

function LoanPerfRing({
  segments, size = 110,
}: {
  segments: PerfSegment[]; size?: number;
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const baseR = size / 2 - 14;
  const cx    = size / 2;
  const cy    = size / 2;
  const GAP   = 4; // degrees gap between arcs

  // Each arc occupies its pct of 360 - gaps
  const usable = 360 - GAP * segments.length;
  let acc = 0;
  const arcData = segments.map(seg => {
    const span  = (seg.pct / 100) * usable;
    const start = acc;
    acc += span + GAP;
    return { ...seg, start, span };
  });

  const toRad = (d: number) => (d - 90) * (Math.PI / 180);
  const buildPath = (startDeg: number, spanDeg: number, r: number) => {
    if (spanDeg <= 0) return '';
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(startDeg + spanDeg));
    const y2 = cy + r * Math.sin(toRad(startDeg + spanDeg));
    const large = spanDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const hovSeg = hoveredKey ? segments.find(s => s.key === hoveredKey) : null;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Ring */}
      <div
        className="relative"
        style={{ width: size, height: size }}
        onMouseLeave={() => setHoveredKey(null)}
        onTouchEnd={() => setHoveredKey(null)}
      >
        <svg width={size} height={size} style={{ display: 'block' }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={baseR} fill="none"
            stroke="rgba(0,0,0,0.06)" strokeWidth={8}
            className="dark:stroke-gray-800" />

          {arcData.map(arc => {
            const isHov = hoveredKey === arc.key;
            const r = isHov ? baseR + 6 : baseR;
            const path = buildPath(arc.start, arc.span, r);
            if (!path) return null;
            return (
              <path
                key={arc.key}
                d={path}
                fill="none"
                stroke={arc.color}
                strokeWidth={isHov ? 10 : 7}
                strokeLinecap="round"
                style={{
                  filter: isHov ? `drop-shadow(0 0 7px ${hexToRgba(arc.color, 0.65)})` : 'none',
                  transition: 'stroke-width 0.2s ease, filter 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredKey(arc.key)}
                onTouchStart={() => setHoveredKey(arc.key)}
              />
            );
          })}
        </svg>

        {/* Centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hovSeg ? (
            <>
              <span className="text-xl font-black leading-none" style={{ color: hovSeg.color }}>
                {hovSeg.pct}%
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-center px-2 leading-tight"
                style={{ color: hovSeg.color }}>
                {hovSeg.label}
              </span>
            </>
          ) : (
            <>
              <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                {segments.find(s => s.key === 'ontime')?.pct ?? 0}%
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                on track
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bars — hover links back to ring */}
      <div className="w-full space-y-4">
        {segments.map(seg => {
          const isHov = hoveredKey === seg.key;
          return (
            <div
              key={seg.key}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredKey(seg.key)}
              onMouseLeave={() => setHoveredKey(null)}
              onTouchStart={() => setHoveredKey(seg.key)}
              onTouchEnd={() => setHoveredKey(null)}
            >
              <div className="flex items-end justify-between mb-1.5">
                <div>
                  <p
                    className="text-xs font-semibold transition-colors"
                    style={{ color: isHov ? seg.color : undefined }}
                  >
                    <span className="text-gray-800 dark:text-gray-200"
                      style={{ color: isHov ? seg.color : undefined }}>
                      {seg.label}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-400">{seg.sub}</p>
                </div>
                <span
                  className="text-base font-black tabular-nums transition-all"
                  style={{
                    color: seg.color,
                    transform: isHov ? 'scale(1.15)' : 'scale(1)',
                    display: 'inline-block',
                    transformOrigin: 'right center',
                  }}
                >
                  {seg.pct}%
                </span>
              </div>
              <div
                className="w-full rounded-full overflow-hidden"
                style={{
                  height: isHov ? 6 : 4,
                  background: 'rgba(0,0,0,0.05)',
                  transition: 'height 0.2s ease',
                }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${seg.pct}%`,
                    background: seg.color,
                    boxShadow: isHov ? `0 0 8px ${hexToRgba(seg.color, 0.5)}` : 'none',
                    transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({
  label, value, Icon, accent, change, positive, max,
}: {
  label: string; value: number; Icon: React.ElementType;
  accent: string; change: string; positive: boolean; max: number;
}) {
  const bars = 6;
  return (
    <div
      className="relative bg-white dark:bg-gray-900 rounded-2xl p-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ border: `1px solid ${accent}1A` }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)` }}
      />

      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}12` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: positive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            color: positive ? '#10B981' : '#EF4444',
          }}
        >
          {change}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{value}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 font-medium">{label}</p>
        </div>
        {/* Mini spark */}
        <div className="flex items-end gap-[2px]" style={{ height: 18 }}>
          {Array.from({ length: bars }).map((_, i) => {
            const h = Math.max(20, Math.round(((i + 1) / bars) * 100 * (value / (max || 1))));
            return (
              <div key={i} style={{
                width: 3, height: `${Math.min(100, h)}%`, borderRadius: 2,
                background: i === bars - 1 ? accent : `${accent}44`,
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CustomerOverviewPage() {
  const router = useRouter();
  const [stats, setStats]                     = useState<Stats | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [isRefreshing, setIsRefreshing]       = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
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
    finally { setLoading(false); setIsRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  );

  const total     = stats?.totalCustomers || 1;
  const rLow      = stats?.riskDistribution?.low    ?? 0;
  const rMed      = stats?.riskDistribution?.medium ?? 0;
  const rHigh     = stats?.riskDistribution?.high   ?? 0;
  const disbursed = stats?.totalDisbursed ?? 0;
  const repaid    = stats?.totalRepaid    ?? 0;
  const repaidPct = disbursed > 0 ? Math.round((repaid / disbursed) * 100) : 0;

  const riskSegments: RiskSegment[] = [
    { key: 'low',    label: 'Low',    value: rLow,  color: '#10B981' },
    { key: 'medium', label: 'Medium', value: rMed,  color: '#F59E0B' },
    { key: 'high',   label: 'High',   value: rHigh, color: '#EF4444' },
  ];

  const perfSegments: PerfSegment[] = [
    { key: 'ontime',    label: 'On-Time Payments', sub: 'Paid within schedule', pct: stats?.loanPerformance?.onTime    ?? 0, color: '#10B981' },
    { key: 'late',      label: 'Late Payments',    sub: '1–30 days overdue',    pct: stats?.loanPerformance?.late      ?? 0, color: '#F59E0B' },
    { key: 'defaulted', label: 'Defaulted',        sub: '30+ days overdue',     pct: stats?.loanPerformance?.defaulted ?? 0, color: '#EF4444' },
  ];

  return (
    <div className="space-y-4 pb-8">

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      {/* Light mode: very subtle indigo-tinted white. Dark mode: deep near-black */}
      <div
        className="relative overflow-hidden rounded-2xl
          bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60
          dark:from-[#0c0d14] dark:via-[#0f1018] dark:to-[#0c0d14]"
        style={{ border: '1px solid rgba(99,102,241,0.14)' }}
      >
        {/* Dot grid — subtle in light, more visible in dark */}
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.18]" style={{
          backgroundImage: 'radial-gradient(rgba(99,102,241,1) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }} />
        {/* Glows */}
        <div className="absolute -top-10 right-1/4 w-60 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-6 left-1/4 w-52 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />

        <div className="relative px-6 pt-5 pb-6">
          {/* Nav */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard"
                className="p-2 rounded-xl transition-colors
                  bg-white/80 border border-indigo-100 text-indigo-400 hover:text-indigo-600
                  dark:bg-white/5 dark:border-white/10 dark:text-white/50 dark:hover:text-white/80">
                <Home className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Customer Overview
                </h1>
                <p className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5">Real-time portfolio metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchData}
                className="p-2 rounded-xl transition-all
                  bg-white/80 border border-gray-200 text-gray-400
                  dark:bg-white/5 dark:border-white/10 dark:text-white/40
                  hover:border-indigo-200 dark:hover:border-white/20">
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/admin/customers/new"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white
                  hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.30)',
                }}>
                <UserPlus className="w-4 h-4" />
                New Customer
              </Link>
            </div>
          </div>

          {/* Financial totals */}
          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Total Disbursed', value: fmt(disbursed),                       accent: '#6366f1', Icon: CreditCard, sub: 'All time' },
              { label: 'Total Repaid',    value: fmt(repaid),                          accent: '#10B981', Icon: TrendingUp, sub: `${repaidPct}% recovered` },
              { label: 'Outstanding',     value: fmt(Math.max(0, disbursed - repaid)), accent: '#a855f7', Icon: Zap,        sub: 'Remaining balance' },
            ].map(({ label, value, accent, Icon, sub }) => (
              <div key={label}>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{ background: `${accent}14` }}>
                    <Icon className="w-3 h-3" style={{ color: accent }} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: accent }}>
                    {label}
                  </p>
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                  {value}
                </p>
                <p className="text-[10px] mt-1 text-gray-400 dark:text-white/30">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery bar */}
        <div className="h-[3px] w-full bg-gray-100 dark:bg-white/5">
          <div className="h-full rounded-r-full"
            style={{
              width: `${repaidPct}%`,
              background: 'linear-gradient(90deg, #6366f1, #10B981)',
              transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
            }} />
        </div>
      </div>

      {/* ── 4 STAT CARDS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0}
          Icon={Users}         accent="#6366f1" change="+12%" positive max={total} />
        <StatCard label="Active Loans"    value={stats?.activeLoans    ?? 0}
          Icon={CreditCard}    accent="#10B981" change="+8%"  positive max={total} />
        <StatCard label="Overdue Loans"   value={stats?.overdueLoans   ?? 0}
          Icon={AlertTriangle} accent="#EF4444" change="-5%"  positive={false} max={total} />
        <StatCard label="Completed"       value={stats?.completedLoans ?? 0}
          Icon={CheckCircle}   accent="#a855f7" change="+15%" positive max={total} />
      </div>

      {/* ── MIDDLE ROW ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT — Loan Performance with ring above bars */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Loan Performance</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Payment behavior breakdown</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.14)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {stats?.loanPerformance?.onTime ?? 0}% on track
                </span>
              </div>
            </div>

            {/* Ring embedded above bars — centred */}
            <div className="flex justify-center mb-5">
              <LoanPerfRing segments={perfSegments} size={110} />
            </div>
          </div>

          {/* Segment jump tiles */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/admin/customers/active',    label: 'Active',    count: stats?.activeLoans    ?? 0, Icon: Users,       accent: '#10B981', sub: 'live loans'     },
              { href: '/admin/customers/overdue',   label: 'Overdue',   count: stats?.overdueLoans   ?? 0, Icon: Clock,       accent: '#EF4444', sub: 'need attention'  },
              { href: '/admin/customers/completed', label: 'Completed', count: stats?.completedLoans ?? 0, Icon: CheckCircle, accent: '#a855f7', sub: 'fully repaid'    },
            ].map(({ href, label, count, Icon, accent, sub }) => (
              <Link key={href} href={href}
                className="group relative overflow-hidden rounded-2xl p-4
                  bg-white dark:bg-gray-900 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ border: `1px solid ${accent}1A` }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `${accent}06` }} />
                <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: `${accent}12` }}>
                      <Icon className="w-4 h-4" style={{ color: accent }} />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all
                      group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{ color: accent }} />
                  </div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tight">{count}</p>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1">{label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT — Risk + Upcoming */}
        <div className="lg:col-span-2 space-y-4">

          {/* Risk Donut */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Risk Distribution</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Portfolio health snapshot</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <RiskDonut
                segments={riskSegments}
                size={120}
                totalLabel={String(total)}
              />

              {/* Legend */}
              <div className="w-full space-y-2.5">
                {riskSegments.map(seg => {
                  const pct = Math.round((seg.value / total) * 100);
                  return (
                    <div key={seg.key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
                          <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                            {seg.label} Risk
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-900 dark:text-white">{seg.value}</span>
                          <span className="text-[10px] text-gray-400">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1 rounded-full overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.05)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: seg.color, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-violet-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Payments</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Collection forecast</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: '7 days',  count: stats?.upcomingPayments?.next7Days  ?? 0, color: '#EF4444', urgent: true  },
                { label: '30 days', count: stats?.upcomingPayments?.next30Days ?? 0, color: '#F59E0B', urgent: false },
                { label: '90 days', count: stats?.upcomingPayments?.next90Days ?? 0, color: '#10B981', urgent: false },
              ].map(({ label, count, color, urgent }) => (
                <div key={label}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                  style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: color, boxShadow: urgent ? `0 0 5px ${color}` : 'none' }} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Next {label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black" style={{ color }}>{count}</span>
                    <span className="text-[10px] text-gray-400 ml-0.5">loans</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.10)' }}>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  {(stats?.upcomingPayments?.next7Days ?? 0) + (stats?.upcomingPayments?.next30Days ?? 0)} due this month
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-500">
                  {stats?.pendingApprovals ?? 0} pending
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── RECENT CUSTOMERS TABLE ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden"
        style={{ border: '1px solid rgba(99,102,241,0.08)' }}>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Customers</h2>
              <p className="text-[10px] text-gray-400 mt-0.5">Last 5 onboarded</p>
            </div>
          </div>
          <Link href="/admin/customers"
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2.5 transition-all">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.015)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                {['Customer', 'Loan Status', 'Risk Level', 'Loan Amount', 'Repayment'].map(h => (
                  <th key={h} className="px-6 py-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {h}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.10)' }}>
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No customers yet</p>
                    <Link href="/admin/customers/new"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                      <UserPlus className="w-3.5 h-3.5" /> Add your first customer
                    </Link>
                  </td>
                </tr>
              ) : recentCustomers.map((c, i) => (
                <tr key={c.id}
                  className="group cursor-pointer transition-colors hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10"
                  style={{ borderBottom: i < recentCustomers.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                  onClick={() => router.push(`/admin/customers/${c.id}`)}>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-xs"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                        {c.firstName?.[0]}{c.surname?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white
                          group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {c.firstName} {c.surname}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                          {c.customerId}
                        </p>
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
                    <div className="flex items-center gap-2.5 w-28">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.06)' }}>
                        <div className="h-full rounded-full"
                          style={{
                            width: `${c.progress || 0}%`,
                            background: progressColor(c.loanStatus),
                            transition: 'width 0.6s ease',
                          }} />
                      </div>
                      <span className="text-xs font-black tabular-nums shrink-0"
                        style={{ color: progressColor(c.loanStatus) }}>
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