"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  FileText,
  History,
  User,
  Settings,
  DollarSign,
  Award,
  Phone,
  Calendar,
  ChevronRight,
  Scale,
  Gavel,
  Zap,
  Heart,
  ShieldCheck,
  Flame,
  Target,
  Clock,
  Bell,
  X,
  Mail,
  MapPin,
  Briefcase,
  Building,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import ProgressRing from '@/components/ui/ProgressRing';
import SungJinwooShadow from '@/components/ui/infamousshadow';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  isStaff: boolean;
}

interface CustomerData {
  id: string;
  firstName: string;
  surname: string;
  phoneNumber: string;
  email: string;
  creditScore: number;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  loans: LoanData[];
  createdAt?: string;
  occupation?: string;
  employer?: string;
  address?: string;
  city?: string;
}

interface LoanData {
  id: string;
  loanId: string;
  amount: number;
  amountPaid: number;
  remainingBalance: number;
  status: string;
  dueDate: string;
  purpose: string;
  interestRate: number;
  penalties: number;
}

export default function CustomerDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [showOverdueBanner, setShowOverdueBanner] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const statusMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (!userData.user) { window.location.href = '/login'; return; }
      setUser(userData.user);
      const customerRes = await fetch(`/api/customers/profile?email=${userData.user.email}`);
      const customerData = await customerRes.json();
      if (customerData.customer) {
        setCustomer(customerData.customer);
      } else {
        const createRes = await fetch('/api/customers/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.user.email,
            firstName: userData.user.name?.split(' ')[0] || 'Customer',
            surname: userData.user.name?.split(' ')[1] || '',
            phoneNumber: '',
          })
        });
        const newCustomer = await createRes.json();
        setCustomer(newCustomer.customer);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'TSh 0';
    // Show full numbers, no K/M abbreviations
    return `TSh ${amount.toLocaleString()}`;
  };

  const getActualOverdueCount = () => customer?.loans?.filter(l => l.status === 'overdue').length || 0;
  const hasActualOverdue = getActualOverdueCount() > 0;

  const calculateHealthScore = () => {
    if (!customer) return 0;
    const totalBorrowed = customer.totalBorrowed || 0;
    const totalRepaid = customer.totalRepaid || 0;
    const totalLoans = customer.loans?.length || 0;
    const overdueCount = getActualOverdueCount();
    const activeCount = customer.loans?.filter(l => l.status === 'active').length || 0;
    const repaymentRatio = totalBorrowed > 0 ? totalRepaid / totalBorrowed : 0;
    const overdueRatio = totalLoans > 0 ? overdueCount / totalLoans : 0;
    const activeRatio = totalLoans > 0 ? activeCount / totalLoans : 0;
    return Math.round(repaymentRatio * 40 + (1 - overdueRatio) * 35 + (1 - Math.min(activeRatio, 1)) * 25);
  };

  const healthScore = calculateHealthScore();
  const overdueLoan = customer?.loans?.find(l => l.status === 'overdue');
  const overdueDays = overdueLoan?.dueDate ? Math.max(0, Math.floor((new Date().getTime() - new Date(overdueLoan.dueDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const penaltyAmount = overdueLoan?.penalties || (overdueDays * (overdueLoan?.amount || 0) * 0.01);
  const showLegalWarning = hasActualOverdue && overdueDays >= 60;
  const totalBorrowed = customer?.totalBorrowed || 0;
  const totalRepaid = customer?.totalRepaid || 0;
  const repaidPercentage = totalBorrowed > 0 ? Math.round((totalRepaid / totalBorrowed) * 100) : 0;

  useEffect(() => {
    if (hasActualOverdue && !showOverdueBanner) {
      setHasUnreadNotification(true);
    } else {
      setHasUnreadNotification(false);
    }
  }, [hasActualOverdue, showOverdueBanner]);

  const getRingStatus = () => {
    if (hasActualOverdue) return 'overdue';
    if (healthScore >= 80) return 'completed';
    if (healthScore >= 60) return 'active';
    return 'pending';
  };

  const getHealthDisplay = () => {
    if (hasActualOverdue) {
      const loanWord = getActualOverdueCount() === 1 ? 'loan' : 'loans';
      return {
        text: 'CRITICAL',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/30',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: Flame,
        shortMessage: `⚠️ ${getActualOverdueCount()} ${loanWord} overdue`,
        tapMessage: 'tap for details'
      };
    }
    if (healthScore >= 80) return {
      text: 'EXCELLENT', color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20', borderColor: 'border-emerald-200 dark:border-emerald-800',
      icon: ShieldCheck, shortMessage: 'Outstanding financial health', tapMessage: 'View details'
    };
    if (healthScore >= 60) return {
      text: 'GOOD', color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/20', borderColor: 'border-blue-200 dark:border-blue-800',
      icon: Heart, shortMessage: "You're on the right track", tapMessage: 'View details'
    };
    if (healthScore >= 40) return {
      text: 'FAIR', color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20', borderColor: 'border-amber-200 dark:border-amber-800',
      icon: AlertTriangle, shortMessage: 'Monitor your loans closely', tapMessage: 'View details'
    };
    return {
      text: 'POOR', color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/20', borderColor: 'border-red-200 dark:border-red-800',
      icon: Flame, shortMessage: 'Immediate action required', tapMessage: 'View details'
    };
  };

  const healthDisplay = getHealthDisplay();
  const HealthIcon = healthDisplay.icon;

  const handleBellClick = () => {
    if (hasActualOverdue) {
      setShowPopupModal(true);
      setShowOverdueBanner(true);
      setHasUnreadNotification(false);
    }
  };

  const handleStatusMessageClick = () => {
    if (hasActualOverdue) {
      setShowPopupModal(true);
      setShowOverdueBanner(true);
      setHasUnreadNotification(false);
    }
  };

  const handleRingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClosePopup = () => setShowPopupModal(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Error loading dashboard</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm">Retry</button>
        </div>
      </div>
    );
  }

  const overdueCount = getActualOverdueCount();
  const loanWord = overdueCount === 1 ? 'loan' : 'loans';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Notification Bell */}
      {hasActualOverdue && (
        <div className="fixed top-20 right-6 z-40">
          <button onClick={handleBellClick} className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all">
            <Bell className={`w-5 h-5 ${hasUnreadNotification ? 'text-red-500 animate-pulse' : 'text-amber-500 dark:text-amber-400'}`} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{overdueCount}</span>
            {hasUnreadNotification && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-50" />}
          </button>
        </div>
      )}

      {/* Popup Modal */}
      {showPopupModal && hasActualOverdue && overdueLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={handleClosePopup}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 tracking-widest">URGENT NOTICE</p>
                    <h3 className="text-base font-black text-gray-900 dark:text-white">⚠️ Overdue Loans</h3>
                  </div>
                </div>
                <button onClick={handleClosePopup} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="space-y-3 mb-5">
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono font-bold">{overdueCount} {loanWord} Overdue — {overdueDays} days</p>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">Outstanding</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white font-mono">{formatCurrency(overdueLoan.remainingBalance)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">Penalty Accrued</span>
                  <span className="text-sm font-black text-amber-700 dark:text-amber-300 font-mono">+{formatCurrency(penaltyAmount)}<span className="text-[10px] font-normal ml-1 opacity-60">daily</span></span>
                </div>
                {showLegalWarning && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-700 dark:text-purple-400 font-mono flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" />Court action may be initiated after 90 days</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.location.href = `tel:${customer.phoneNumber}`} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold">Call Support</button>
                <Link href={`/customer/loans/${overdueLoan.id}`} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center">Make Payment</Link>
              </div>
            </div>
            <SungJinwooShadow progress={(overdueLoan.amountPaid / overdueLoan.amount) * 100} status="overdue" height="h-1" />
          </div>
        </div>
      )}

      {/* Header Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#0d0e12] dark:to-gray-900">
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.10]" style={{ backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-12 left-[20%] w-80 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -top-8 right-[15%] w-64 h-36 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.10) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-8">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 tracking-wider font-bold">Welcome back, {customer.firstName}</span>
            </div>
            <Link href="/customer/profile" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 dark:text-white/60 dark:hover:text-white/90 border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent transition-all"><User className="w-3.5 h-3.5" />Profile</Link>
          </div>

          {/* SIDE BY SIDE LAYOUT: Customer Banner (left) + Ring Box (right) */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Customer Banner - Left side*/}
            <div className="flex-1 min-w-0 px-5 py-5 rounded-2xl" style={{
              background: 'linear-gradient(130deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(59,130,246,0.07) 100%)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,102,241,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 12px rgba(99,102,241,0.08)',
            }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-white text-sm" style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(168,85,247,0.75) 100%)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                }}>{customer.firstName?.[0]}{customer.surname?.[0]}</div>
                <div className="min-w-0">
                  <h1 className="text-base font-black text-gray-900 dark:text-white leading-tight truncate">{customer.firstName} {customer.surname}</h1>
                  <p className="text-[10.5px] text-gray-400 dark:text-white/35 font-mono mt-0.5">Member since {customer.createdAt ? new Date(customer.createdAt).getFullYear() : '2024'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl p-2.5 text-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-500/20">
                  <p className="text-[9px] font-mono text-gray-400 dark:text-gray-500 tracking-widest mb-0.5">TOTAL</p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{customer.totalLoans || customer.loans?.length || 0}</p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">loans</p>
                </div>
                <div className="rounded-xl p-2.5 text-center bg-white/60 dark:bg-white/5 border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[9px] font-mono text-gray-400 dark:text-gray-500 tracking-widest mb-0.5">ACTIVE</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{customer.loans?.filter(l => l.status === 'active').length || 0}</p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">running</p>
                </div>
                <div className={`rounded-xl p-2.5 text-center ${hasActualOverdue ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800' : 'bg-white/60 dark:bg-white/5 border border-gray-100 dark:border-white/10'}`}>
                  <p className="text-[9px] font-mono text-gray-400 dark:text-gray-500 tracking-widest mb-0.5">OVERDUE</p>
                  <p className={`text-xl font-black ${hasActualOverdue ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>{overdueCount}</p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">unpaid</p>
                </div>
              </div>
            </div>

            {/* Ring Box - Right side */}
            <div className="lg:w-[38%] flex flex-col items-center justify-center rounded-2xl cursor-pointer select-none p-6" style={{ 
              background: 'rgba(255,255,255,0.02)', 
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.05)',
            }} onClick={handleStatusMessageClick}>
              
              {/* Data on LEFT, Ring on RIGHT - Within the ring box */}
              <div className="flex flex-row items-center justify-center gap-4 w-full">
                
                {/* Data Section -an afterthought */}
                <div className="flex-shrink-0 text-left">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${healthDisplay.bg} ${healthDisplay.color} ${healthDisplay.borderColor} ${hasActualOverdue ? 'animate-pulse' : ''}`}>
                    <HealthIcon className="w-3 h-3" />
                    {healthDisplay.text}
                  </div>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 max-w-[100px]">{healthDisplay.shortMessage}</p>
                  {hasActualOverdue && (
                    <p className="text-[8px] font-mono text-red-500 dark:text-red-400 font-bold mt-1 animate-pulse">🔴 {healthDisplay.tapMessage}</p>
                  )}
                </div>

                {/* Ring Section - RIGHT side (STAR of the show)*/}
                <div className="flex-1 flex items-center justify-center" onClick={handleRingClick}>
                  <ProgressRing
                    progress={healthScore}
                    size={160}
                    strokeWidth={12}
                    status={getRingStatus()}
                    label="HEALTH"
                    value={`${healthScore}/100`}
                    interactive={true}
                    animateOnHover={true}
                    pulseOnOverdue={hasActualOverdue}
                    rotationEffect={true}
                    glowIntensity={14}
                    breatheOnOverdue={true}
                    onDark={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-10 space-y-4">

        {/* Inline Overdue Banner - Initially HIDDEN */}
        {hasActualOverdue && showOverdueBanner && overdueLoan && (
          <div className="rounded-2xl overflow-hidden bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 animate-slide-in">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700"><AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div><h3 className="text-sm font-black text-amber-800 dark:text-amber-300">⚠️ Overdue Loans</h3><p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-0.5">{overdueCount} {loanWord} — {overdueDays} days past due</p></div>
                    <span className="shrink-0 text-lg font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-0.5 rounded-lg font-mono">{overdueCount}</span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-amber-700 dark:text-amber-400">Total overdue</span><span className="font-mono font-bold text-amber-800 dark:text-amber-300">{formatCurrency(overdueLoan.remainingBalance)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-amber-700 dark:text-amber-400">Penalty accrued</span><span className="font-mono font-bold text-red-600 dark:text-red-400">+{formatCurrency(penaltyAmount)}<span className="font-normal opacity-60 ml-1">(increases daily)</span></span></div>
                  </div>
                  <div className="flex flex-wrap gap-2.5 mt-4">
                    <button onClick={() => window.location.href = `tel:${customer.phoneNumber}`} className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all hover:scale-105">Call Support</button>
                    <button onClick={() => window.location.href = `mailto:${customer.email}`} className="px-4 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all hover:scale-105">Email Support</button>
                    <Link href={`/customer/loans/${overdueLoan.id}`} className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all hover:scale-105">Pay Loan</Link>
                  </div>
                </div>
              </div>
            </div>
            <SungJinwooShadow progress={(overdueLoan.amountPaid / overdueLoan.amount) * 100} status="overdue" height="h-1" />
          </div>
        )}

        {/* COLLAPSIBLE CONTACT STRIP  */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsContactExpanded(!isContactExpanded)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white">Personal Information</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">tap to {isContactExpanded ? 'collapse' : 'expand'}</p>
              </div>
            </div>
            <div className="transition-transform duration-300">
              {isContactExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              )}
            </div>
          </button>
          
          {/* Expandable content */}
          <div className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight: isContactExpanded ? '300px' : '0px', opacity: isContactExpanded ? 1 : 0 }}>
            <div className="border-t border-gray-100 dark:border-gray-800 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Phone</p><p className="text-sm font-medium text-gray-800 dark:text-gray-100">{customer.phoneNumber}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Email</p><p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{customer.email || 'N/A'}</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                  <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Address</p><p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{customer.address || customer.city || 'N/A'}</p></div>
                </div>
              </div>
            </div>
          </div>
          <SungJinwooShadow progress={isContactExpanded ? 100 : 0} status="active" height="h-0.5" />
        </div>

        {/* Repayment Glow Path */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-gray-900 shadow-sm">
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]" style={{ background: 'linear-gradient(120deg, #6366f1 0%, #a855f7 100%)' }} />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center"><Target className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /></div>
                <div><h3 className="font-black text-gray-900 dark:text-white text-sm tracking-tight">LOAN EQUITY TRACKER</h3><p className="text-[10px] text-gray-400 font-mono mt-0.5">overall progress tracker</p></div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20"><Clock className="w-3 h-3 text-indigo-400" /><span className="text-xs font-black font-mono text-indigo-500 dark:text-indigo-400">{repaidPercentage}%</span></div>
            </div>
            <div className="relative mb-6">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full relative transition-all duration-1000" style={{ width: `${repaidPercentage}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8, #10b981)', boxShadow: repaidPercentage > 0 ? '0 0 12px rgba(99,102,241,0.4)' : 'none' }}><div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} /></div>
              </div>
              <div className="absolute inset-0 flex pointer-events-none">{ [25, 50, 75].map(m => <div key={m} className="absolute top-0 bottom-0 w-px bg-gray-300/60 dark:bg-gray-600/60" style={{ left: `${m}%` }} />) }</div>
              <div className="absolute -top-6 right-0 text-xs font-black font-mono text-indigo-500 dark:text-indigo-400">{repaidPercentage}%</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"><p className="text-[9px] text-gray-400 font-mono tracking-widest mb-1 uppercase">TOTAL BORROWED</p><p className="text-base font-black text-gray-900 dark:text-white">{formatCurrency(totalBorrowed)}</p></div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"><p className="text-[9px] text-gray-400 font-mono tracking-widest mb-1 uppercase">TOTAL REPAID</p><p className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRepaid)}</p></div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"><p className="text-[9px] text-gray-400 font-mono tracking-widest mb-1 uppercase">OUTSTANDING</p><p className="text-base font-black text-amber-600 dark:text-amber-400">{formatCurrency(Math.max(0, totalBorrowed - totalRepaid))}</p></div>
            </div>
          </div>
          <SungJinwooShadow progress={repaidPercentage} height="h-1.5" />
        </div>

        {/* Loan Portfolio Blades - blade master */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center"><CreditCard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /></div><h2 className="font-black text-gray-900 dark:text-white tracking-tight">LOAN PORTFOLIO</h2></div>
            <span className="text-[10px] font-mono text-gray-400 tracking-widest">{customer.loans?.length || 0} ACTIVE BLADES</span>
          </div>

          {customer.loans?.map((loan) => {
            const isExpanded = expandedLoanId === loan.id;
            const bladeProgress = (loan.amountPaid / loan.amount) * 100;
            const isLoanOverdue = loan.status === 'overdue';
            const isActive = loan.status === 'active';
            const bladeStatus = isLoanOverdue ? 'overdue' : bladeProgress >= 100 ? 'completed' : 'active';

            return (
              <div key={loan.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isExpanded ? 'border-indigo-200 dark:border-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-500/5' : isLoanOverdue ? 'border-red-100 dark:border-red-900/40 bg-red-50/10 dark:bg-red-950/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                
                {/* Blade Header */}
                <div className="p-4 cursor-pointer" onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className={`w-1 h-10 rounded-full shrink-0 ${isLoanOverdue ? 'bg-red-500 animate-pulse' : isActive ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <div className="shrink-0"><ProgressRing progress={bladeProgress} size={48} strokeWidth={4} status={bladeStatus} interactive={true} animateOnHover={true} pulseOnOverdue={isLoanOverdue} rotationEffect={true} onDark={false} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1"><span className="font-black text-sm text-gray-900 dark:text-white font-mono">{loan.loanId}</span><span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${isLoanOverdue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>{loan.status.toUpperCase()}</span></div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap"><span className="font-mono">{formatCurrency(loan.amount)}</span><span className="text-gray-300 dark:text-gray-600">·</span><span>{loan.interestRate}% p.a.</span><span className="text-gray-300 dark:text-gray-600">·</span><span className="truncate">{loan.purpose}</span></div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-all duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Blueprint - cause i am */}
                <div className="overflow-hidden transition-all duration-500 ease-out" style={{ maxHeight: isExpanded ? '500px' : '0px' }}>
                  <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900/80">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <p className="text-[9px] font-mono text-indigo-500 dark:text-indigo-400 tracking-widest font-bold mb-3 transition-all duration-500 ease-out" style={{ transitionDelay: isExpanded ? '0ms' : '0ms', transform: isExpanded ? 'translateX(0) rotateY(0) scale(1)' : 'translateX(-40px) rotateY(15deg) scale(0.95)', opacity: isExpanded ? 1 : 0 }}>PAYMENT DETAILS</p>
                        <div className="space-y-0">
                          {[
                            { label: 'Total Amount', value: formatCurrency(loan.amount), color: 'text-gray-900 dark:text-white', delay: 50 },
                            { label: 'Amount Paid', value: formatCurrency(loan.amountPaid), color: 'text-emerald-600 dark:text-emerald-400', delay: 100 },
                            { label: 'Remaining', value: formatCurrency(loan.remainingBalance), color: 'text-amber-600 dark:text-amber-400', delay: 150 },
                            { label: 'Due Date', value: loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Not set', color: isLoanOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300', delay: 200 },
                          ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-all duration-500 ease-out" style={{ transitionDelay: isExpanded ? `${item.delay}ms` : '0ms', transform: isExpanded ? 'translateX(0) rotateY(0) scale(1)' : 'translateX(-30px) rotateY(10deg) scale(0.95)', opacity: isExpanded ? 1 : 0 }}>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                              <span className={`font-mono font-bold text-xs ${item.color}`}>{item.value}</span>
                            </div>
                          ))}
                          {isLoanOverdue && (
                            <div className="mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 transition-all duration-500 ease-out" style={{ transitionDelay: isExpanded ? '250ms' : '0ms', transform: isExpanded ? 'translateX(0) rotateY(0) scale(1)' : 'translateX(-20px) rotateY(5deg) scale(0.98)', opacity: isExpanded ? 1 : 0 }}>
                              <p className="text-[10px] text-red-600 dark:text-red-400 font-mono flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 shrink-0" />PENALTY ACCRUING: +1% daily</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[9px] font-mono text-indigo-500 dark:text-indigo-400 tracking-widest font-bold mb-3 transition-all duration-500 ease-out" style={{ transitionDelay: isExpanded ? '100ms' : '0ms', transform: isExpanded ? 'translateX(0) rotateY(0) scale(1)' : 'translateX(40px) rotateY(-15deg) scale(0.95)', opacity: isExpanded ? 1 : 0 }}>QUICK ACTIONS</p>
                        <div className="flex flex-col gap-2">
                          <Link href={`/customer/loans/${loan.id}`} className="w-full py-2.5 px-4 rounded-xl text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-500 hover:scale-105" style={{ transitionDelay: isExpanded ? '150ms' : '0ms', transform: isExpanded ? 'translateX(0) rotateY(0) scale(1)' : 'translateX(30px) rotateY(10deg) scale(0.95)', opacity: isExpanded ? 1 : 0 }}>Make Payment</Link>
                          <button className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all duration-500 border border-gray-200 dark:border-gray-700" style={{ transitionDelay: isExpanded ? '200ms' : '0ms', transform: isExpanded ? 'translateX(0) rotateY(0) scale(1)' : 'translateX(20px) rotateY(5deg) scale(0.98)', opacity: isExpanded ? 1 : 0 }}>View Statement</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <SungJinwooShadow progress={bladeProgress} status={bladeStatus} height="h-0.5" />
              </div>
            );
          })}

          {(!customer.loans || customer.loans.length === 0) && (
            <div className="text-center py-12 rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700">
              <CreditCard className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">No loans yet</p>
              <Link href="/customer/apply-loan" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105">Apply for First Loan<ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          )}
        </div>

        {/* Employment Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center"><Briefcase className="w-3.5 h-3.5 text-indigo-500" /></div><h2 className="text-sm font-bold text-gray-900 dark:text-white">Employment Information</h2></div></div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3.5 py-3"><p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Occupation</p><p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{customer.occupation || 'Not specified'}</p></div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3.5 py-3"><p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Employer</p><p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{customer.employer || 'Not specified'}</p></div>
          </div>
        </div>
      </main>
    </div>
  );
}



