"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Edit,
  Upload,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  Building,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  middleName?: string;
  phoneNumber: string;
  alternativePhone?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  region?: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: number;
  businessName?: string;
  maritalStatus?: string;
  dependents?: number;
  nationalId?: string;
  bankName?: string;
  accountNumber?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  creditScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  category?: string;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  createdAt: string;
  updatedAt: string;
}

interface Loan {
  id: string;
  loanId: string;
  amount: number;
  amountPaid?: number;
  status: string;
  purpose: string;
  progress: number;
  dueDate?: string;
  interestRate?: number;
  remainingBalance?: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  verified: boolean;
}

// ─── Progress Ring ─────────────────────────────────────────────────────────
const ProgressRing = ({
  progress,
  size = 100,
  strokeWidth = 7,
  status = 'active',
  label,
  value,
  onDark = false,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status?: string;
  label: string;
  value: string;
  onDark?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const dashOffset = circumference - (circumference * clamped) / 100;
  const isEmpty = clamped === 0;

  const ringColor =
    clamped >= 100 ? '#10B981'
    : status === 'overdue' ? '#EF4444'
    : isEmpty ? (onDark ? '#374151' : '#D1D5DB')
    : '#818CF8'; // indigo-400 — our palette

  const trackColor = onDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor  = isEmpty
    ? (onDark ? '#6B7280' : '#9CA3AF')
    : (onDark ? '#FFFFFF' : '#111827');
  const subColor   = onDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" style={{ display: 'block' }}>
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
          {/* Arc */}
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={ringColor} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={isEmpty ? circumference : dashOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
              filter: isEmpty ? 'none' : `drop-shadow(0 0 6px ${ringColor}70)`,
            }}
          />
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span style={{ fontSize: size <= 86 ? '0.95rem' : '1.15rem', fontWeight: 700, color: textColor, lineHeight: 1 }}>
            {clamped}%
          </span>
          <span style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: subColor, marginTop: 3 }}>
            {label}
          </span>
        </div>
      </div>
      <span style={{ fontSize: '0.65rem', color: subColor }}>{value}</span>
    </div>
  );
};

// ─── Loan Card ────────────────────────────────────────────────────────────
const LoanCard = ({ loan, formatCurrency }: { loan: Loan; formatCurrency: (n: number) => string }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/60">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{loan.loanId}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{loan.purpose}</p>
      </div>
      <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
        loan.status === 'active'  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : loan.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      }`}>{loan.status}</span>
    </div>
    <div className="flex justify-between text-xs mb-2">
      <span className="text-gray-500 dark:text-gray-400">Amount</span>
      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</span>
    </div>
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-gray-500 dark:text-gray-400">Repayment</span>
      <span className="font-semibold text-gray-900 dark:text-white">{loan.progress}%</span>
    </div>
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className="h-full bg-indigo-500 rounded-full" style={{
        width: `${Math.min(100, loan.progress)}%`,
        transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
    {loan.dueDate && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
        Due {new Date(loan.dueDate).toLocaleDateString()}
      </p>
    )}
  </div>
);

// ─── Document Card ────────────────────────────────────────────────────────
const DocumentCard = ({ doc }: { doc: Document }) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
        <FileText className="w-4 h-4 text-purple-500 dark:text-purple-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{doc.type} · {(doc.size / 1024).toFixed(0)} KB</p>
      </div>
    </div>
    {doc.verified
      ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
      : <Clock className="w-4 h-4 text-amber-400 shrink-0" />}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────
export default function CustomerDetailsPage() {
  const params   = useParams();
  const router   = useRouter();
  const [customer,  setCustomer]  = useState<Customer | null>(null);
  const [loans,     setLoans]     = useState<Loan[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loading,   setLoading]   = useState(true);

  const customerId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, lRes, dRes] = await Promise.all([
          fetch(`/api/admin/customers/${customerId}`),
          fetch(`/api/admin/customers/${customerId}/loans`),
          fetch(`/api/admin/customers/${customerId}/documents`),
        ]);
        const cData = await cRes.json();
        const lData = await lRes.json();
        const dData = await dRes.json();
        setCustomer(cData.data || cData);
        setLoans(lData.data || []);
        setDocuments(dData.data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (customerId) fetchData();
  }, [customerId]);

  const formatCurrency = (n: number) => {
    if (!n) return 'TSh 0';
    if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `TSh ${(n / 1_000).toFixed(1)}K`;
    return `TSh ${n.toLocaleString()}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Customer Not Found</h2>
        <button onClick={() => router.push('/admin/customers')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Back to Customers
        </button>
      </div>
    </div>
  );

  // ── Derived values (all from real data) ──────────────────────────────────
  const activePercentage  = customer.totalLoans > 0
    ? Math.round((customer.activeLoans / customer.totalLoans) * 100) : 0;
  const repaidPercentage  = customer.totalBorrowed > 0
    ? Math.round((customer.totalRepaid / customer.totalBorrowed) * 100) : 0;
  const hasOverdue        = customer.overdueLoans > 0;

  // Risk pill colours for dark header surface
  const riskPillDark = {
    low:    'bg-emerald-400/15 text-emerald-300 border-emerald-400/20',
    medium: 'bg-amber-400/15   text-amber-300   border-amber-400/20',
    high:   'bg-red-400/15     text-red-300     border-red-400/20',
  }[customer.riskLevel || 'medium'] ?? 'bg-gray-400/15 text-gray-300 border-gray-400/20';

  // Score segments (visual only, no new data)
  const scoreSegments = 5;
  const scoreFilled   = customer.creditScore
    ? Math.round((customer.creditScore / 1000) * scoreSegments) : 0;
  const scoreBarColor = customer.riskLevel === 'low' ? '#10B981'
    : customer.riskLevel === 'high' ? '#EF4444' : '#F59E0B';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  HEADER — adapts light / dark                                    ║
          ║  • Always slightly moody (dark-ish) band so the glass reads well  ║
          ║  • Glassmorphism profile pill with indigo-purple-blue gradient    ║
          ║  • ONE ring (active loans) to the right of the pill               ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <header className="relative overflow-hidden
        bg-slate-900
        dark:bg-[#0d0e12]">

        {/* Dot grid — barely visible */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Colour blobs — indigo & purple only, no new colours */}
        <div className="absolute -top-12 left-[20%] w-80 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div className="absolute -top-8 right-[15%] w-64 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.13) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-8">

          {/* Nav row */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/admin/customers')}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/90 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Customers
            </button>
            <Link href={`/admin/customers/${customerId}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-white/90 transition-all text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>

          {/* Profile row */}
          <div className="flex items-center gap-5">

            {/* ── Glass pill ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl flex-1 min-w-0" style={{
              background: 'linear-gradient(130deg, rgba(99,102,241,0.20) 0%, rgba(168,85,247,0.13) 50%, rgba(59,130,246,0.10) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.25)',
            }}>
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.6) 0%, rgba(168,85,247,0.5) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                {customer.firstName?.[0]}{customer.surname?.[0]}
              </div>

              {/* Name + meta */}
              <div className="min-w-0">
                <h1 className="text-[1.05rem] font-semibold text-white leading-tight truncate">
                  {customer.firstName} {customer.surname}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10.5px] text-white/35 font-mono tracking-wide">
                    {customer.customerId}
                  </span>
                  <span className="text-white/15">·</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskPillDark}`}>
                    {(customer.riskLevel || 'N/A').toUpperCase()}
                  </span>
                  {hasOverdue && (
                    <>
                      <span className="text-white/15">·</span>
                      <span className="flex items-center gap-1 text-[11px] text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        {customer.overdueLoans} overdue
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Active loans ring — beside the pill ────────────────────── */}
            <div className="shrink-0 pr-1">
              <ProgressRing
                progress={activePercentage}
                size={90}
                strokeWidth={6}
                status={hasOverdue ? 'overdue' : 'active'}
                label="active"
                value={`${customer.activeLoans} / ${customer.totalLoans}`}
                onDark
              />
            </div>

          </div>
        </div>
      </header>
      {/* ╚══ /HEADER ══════════════════════════════════════════════════════╝ */}

      <main className="max-w-7xl mx-auto px-6 pt-6 pb-10 space-y-4">

        {/* ┌──────────────────────────────────────────────────────────────────┐
            │  STATS ROW — 4 compact cards, uniform, no ring here              │
            └──────────────────────────────────────────────────────────────────┘ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Borrowed */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Borrowed</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1.5 leading-none">
              {formatCurrency(customer.totalBorrowed)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {customer.totalLoans} loan{customer.totalLoans !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Monthly Income */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Income / mo.</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1.5 leading-none">
              {formatCurrency(customer.monthlyIncome || 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{customer.occupation || 'N/A'}</p>
          </div>

          {/* Overdue */}
          <div className={`rounded-xl border p-4 shadow-sm ${
            hasOverdue
              ? 'bg-red-50 dark:bg-red-950/25 border-red-100 dark:border-red-900/30'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          }`}>
            <p className={`text-[10px] uppercase tracking-widest ${hasOverdue ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
              Overdue
            </p>
            <p className={`text-xl font-bold mt-1.5 leading-none ${hasOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {customer.overdueLoans}
            </p>
            <p className={`text-xs mt-1 ${hasOverdue ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {hasOverdue ? 'Action needed' : 'All clear'}
            </p>
          </div>

          {/* Credit Score */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Credit</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1.5 leading-none">
                {customer.creditScore ?? '—'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">{customer.riskLevel ?? 'N/A'} risk</p>
            </div>
            {/* Mini score pip bar */}
            <div className="flex flex-col items-end gap-1 mt-0.5">
              <div className="flex gap-[3px]">
                {Array.from({ length: scoreSegments }).map((_, i) => (
                  <div key={i} className="w-[5px] h-3.5 rounded-sm" style={{
                    background: i < scoreFilled ? scoreBarColor : (undefined),
                    backgroundColor: i < scoreFilled ? undefined : 'rgba(0,0,0,0.07)',
                  }} />
                ))}
              </div>
              <span className="text-[9px] text-gray-400 dark:text-gray-600">/1000</span>
            </div>
          </div>
        </div>

        {/* ┌──────────────────────────────────────────────────────────────────┐
            │  REPAYMENT BANNER — full-width card, horizontal layout           │
            │  Ring on the left, breakdown text on right, progress bar below   │
            │  This is the "other home" of the second ring                     │
            └──────────────────────────────────────────────────────────────────┘ */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/40
          bg-white dark:bg-gray-900 shadow-sm">

          {/* Subtle indigo wash — only behind this card */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{
            background: 'linear-gradient(120deg, #6366f1 0%, #a855f7 100%)',
          }} />

          <div className="relative flex items-center gap-6 px-6 py-5">

            {/* Ring */}
            <div className="shrink-0">
              <ProgressRing
                progress={repaidPercentage}
                size={100}
                strokeWidth={7}
                status={repaidPercentage >= 100 ? 'completed' : 'active'}
                label="repaid"
                value={`${formatCurrency(customer.totalRepaid)} paid`}
                onDark={false}
              />
            </div>

            {/* Divider */}
            <div className="w-px self-stretch bg-gray-100 dark:bg-gray-800 shrink-0" />

            {/* Breakdown text — three columns */}
            <div className="flex-1 grid grid-cols-3 gap-4 min-w-0">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Borrowed</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(customer.totalBorrowed)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Repaid</p>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {formatCurrency(customer.totalRepaid)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Outstanding</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(Math.max(0, customer.totalBorrowed - customer.totalRepaid))}
                </p>
              </div>
            </div>

            {/* TrendingUp icon accent */}
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              bg-indigo-50 dark:bg-indigo-900/20">
              <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>

          {/* Full-width progress bar at the bottom of the card */}
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-r-full"
              style={{
                width: `${repaidPercentage}%`,
                transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
              }} />
          </div>
        </div>

        {/* ┌──────────────────────────────────────────────────────────────────┐
            │  CONTACT STRIP — 3 compact chips                                 │
            └──────────────────────────────────────────────────────────────────┘ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <Phone className="w-3.5 h-3.5 text-indigo-500" />, label: 'Phone',   value: customer.phoneNumber },
            { icon: <Mail  className="w-3.5 h-3.5 text-purple-500" />, label: 'Email',   value: customer.email || 'N/A' },
            { icon: <MapPin className="w-3.5 h-3.5 text-blue-500" />,  label: 'Address', value: customer.address || customer.city || customer.region || 'N/A' },
          ].map(({ icon, label, value }) => (
            <div key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl
                bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ┌──────────────────────────────────────────────────────────────────┐
            │  TABS PANEL                                                      │
            └──────────────────────────────────────────────────────────────────┘ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

          {/* Tab headers */}
          <div className="flex gap-0 border-b border-gray-100 dark:border-gray-800 px-6">
            {[
              { key: 'details',   label: 'Personal Details' },
              { key: 'loans',     label: `Loans (${loans.length})` },
              { key: 'documents', label: `Documents (${documents.length})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`py-3.5 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── Personal Details ── */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Personal info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Personal Information</h4>
                  </div>
                  <div className="space-y-2.5">
                    <Field label="Full Name"
                      value={[customer.firstName, customer.middleName, customer.surname].filter(Boolean).join(' ')} />
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="Gender"      value={customer.gender || 'N/A'} />
                      <Field label="Date of Birth"
                        value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A'} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="Marital Status" value={customer.maritalStatus || 'N/A'} />
                      <Field label="Dependents"     value={String(customer.dependents ?? 0)} />
                    </div>
                  </div>
                </div>

                {/* Employment + Banking */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Employment & Income</h4>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    <Field label="Occupation"     value={customer.occupation || 'N/A'} />
                    <Field label="Employer"       value={customer.employer || customer.businessName || 'N/A'} />
                    <Field label="Monthly Income" value={formatCurrency(customer.monthlyIncome || 0)} />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Building className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Banking Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Bank"       value={customer.bankName || 'N/A'} />
                    <Field label="Account No" value={customer.accountNumber || 'N/A'} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Loans ── */}
            {activeTab === 'loans' && (
              <div className="space-y-3">
                {loans.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No loans yet</p>
                  </div>
                ) : loans.map(loan => (
                  <LoanCard key={loan.id} loan={loan} formatCurrency={formatCurrency} />
                ))}
              </div>
            )}

            {/* ── Documents ── */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                <div className="flex justify-end mb-1">
                  <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </button>
                </div>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No documents yet</p>
                  </div>
                ) : documents.map(doc => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}

// ─── Tiny helper: labelled field cell ────────────────────────────────────────
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}