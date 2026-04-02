"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
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
  Clock
} from "lucide-react";
import ProgressRing from '@/components/ui/ProgressRing';

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
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();

      if (!userData.user) {
        window.location.href = '/login';
        return;
      }

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
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const calculateHealthScore = () => {
    if (!customer) return 0;
    const repaymentRatio = customer.totalBorrowed > 0 ? customer.totalRepaid / customer.totalBorrowed : 0;
    const overdueRatio = customer.totalLoans > 0 ? customer.overdueLoans / customer.totalLoans : 0;
    const activeRatio = customer.totalLoans > 0 ? customer.activeLoans / customer.totalLoans : 0;
    return Math.round(repaymentRatio * 40 + (1 - overdueRatio) * 35 + (1 - Math.min(activeRatio, 1)) * 25);
  };

  // Health score interpretation
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: ShieldCheck, message: 'Your financial health is outstanding' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: Heart, message: 'You are on the right track' };
    if (score >= 40) return { text: 'Fair', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: AlertTriangle, message: 'Some attention needed' };
    return { text: 'Poor', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: Flame, message: 'Immediate action required' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading control panel...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Error loading dashboard</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const healthScore = calculateHealthScore();
  const healthStatus = getHealthStatus(healthScore);
  const HealthIcon = healthStatus.icon;
  const repaidPercentage = customer.totalBorrowed > 0 ? Math.round((customer.totalRepaid / customer.totalBorrowed) * 100) : 0;
  const hasOverdue = customer.overdueLoans > 0;
  const currentLoan = customer.loans?.find(l => l.status === 'active' || l.status === 'overdue') || customer.loans?.[0];
  const loanProgress = currentLoan ? (currentLoan.amountPaid / currentLoan.amount) * 100 : 0;
  
  const overdueDays = currentLoan?.dueDate && currentLoan.status === 'overdue'
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(currentLoan.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const penaltyAmount = currentLoan?.penalties || (overdueDays * (currentLoan?.amount || 0) * 0.01);
  const showLegalWarning = hasOverdue && overdueDays >= 60;

  // Credit score stars
  const getCreditStars = (score: number) => {
    const stars = Math.floor(score / 200);
    return "★".repeat(Math.min(5, stars)) + "☆".repeat(Math.max(0, 5 - Math.min(5, stars)));
  };

  return (
    <div className="space-y-6">
      {/* Penalty Modal */}
      {showPenaltyModal && currentLoan?.status === 'overdue' && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowPenaltyModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 border-2 border-red-500 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">⚠️ PENALTY ALERT</h3>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
                <span className="text-sm text-gray-600 dark:text-gray-400">DAYS OVERDUE:</span>
                <span className="font-bold text-red-600 dark:text-red-500 font-mono">{overdueDays} days</span>
              </div>
              <div className="flex justify-between p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                <span className="text-sm text-gray-600 dark:text-gray-400">PENALTY ACCRUED:</span>
                <span className="font-bold text-amber-600 dark:text-amber-500 font-mono">{formatCurrency(penaltyAmount)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">DAILY PENALTY RATE:</span>
                <span className="font-medium text-gray-900 dark:text-white font-mono">1% of remaining balance</span>
              </div>
              {showLegalWarning && (
                <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg border border-purple-200 dark:border-purple-500/30">
                  <p className="text-sm text-purple-700 dark:text-purple-400 font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    LEGAL NOTICE: Court action may be initiated after 90 days
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowPenaltyModal(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
                Close
              </button>
              <Link href={`/customer/loans/${currentLoan.id}`} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center">
                Make Payment
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Customer Card */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 tracking-wider">ACTIVE SESSION</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {customer?.firstName} {customer?.surname}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  {customer?.email} • {customer?.phoneNumber}
                </p>
                
                {/* Credit Score */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{customer?.creditScore || 650}</span>
                  </div>
                  <div className="text-amber-500 text-sm tracking-wider">
                    {getCreditStars(customer?.creditScore || 650)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">Member since</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.createdAt ? new Date(customer.createdAt).getFullYear() : '2024'}</p>
              </div>
            </div>
            
            {/* STAT CARDS */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-1">ACTIVE LOANS</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{customer?.activeLoans || 0}</p>
              </div>
              <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center ${hasOverdue ? 'ring-1 ring-red-500' : ''}`}>
                <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-1">OVERDUE LOANS</p>
                <p className={`text-xl font-bold ${hasOverdue ? 'text-red-600 dark:text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
                  {customer?.overdueLoans || 0}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-1">TOTAL LOANS</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{customer?.totalLoans || 0}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right - Health Ring with PURPOSE */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 h-full">
            <div className="flex flex-col items-center text-center">
              <ProgressRing
                progress={healthScore}
                size={160}
                strokeWidth={12}
                status={hasOverdue ? 'overdue' : (healthScore >= 80 ? 'completed' : 'active')}
                label="FINANCIAL HEALTH"
                value={`${healthScore}/100`}
                interactive={true}
                animateOnHover={true}
                pulseOnOverdue={hasOverdue}
                rotationEffect={true}
                glowIntensity={12}
                breatheOnOverdue={true}
                onClick={() => hasOverdue && setShowPenaltyModal(true)}
                onDark={false}
              />
              
              {/* Clear purpose message */}
              <div className="mt-4 text-center">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${healthStatus.bg} ${healthStatus.color}`}>
                  <HealthIcon className="w-3 h-3" />
                  <span>{healthStatus.text} Standing</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
                  {hasOverdue 
                    ? `⚠️ ${healthStatus.message} — ${customer.overdueLoans} loan${customer.overdueLoans > 1 ? 's are' : ' is'} overdue` 
                    : healthStatus.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DRAMATIC OVERDUE BANNER */}
      {hasOverdue && currentLoan?.status === 'overdue' && (
        <div className={`rounded-xl border overflow-hidden transition-all ${showLegalWarning ? 'border-purple-300 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/30' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30'}`}>
          <div className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center animate-pulse flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 dark:text-red-400 font-mono text-sm tracking-wide">
                  ⚠️ URGENT: Loan Overdue — {overdueDays} days
                </h3>
                <p className="text-sm text-red-600 dark:text-red-300/80 mt-1">
                  Outstanding balance: {formatCurrency(currentLoan.remainingBalance)}
                </p>
                {penaltyAmount > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono">
                    Penalty accrued: +{formatCurrency(penaltyAmount)}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button onClick={() => window.location.href = `tel:${customer?.phoneNumber}`} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                    Call Support
                  </button>
                  <Link href={`/customer/loans/${currentLoan.id}`} className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white text-sm rounded-lg transition-colors">
                    Make Payment
                  </Link>
                  {showLegalWarning && (
                    <button onClick={() => setShowPenaltyModal(true)} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                      Legal Notice
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* THE INFAMOUS SUBTLE PROGRESS BAR */}
          <div className="h-1 w-full bg-red-200 dark:bg-red-900/30">
            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${loanProgress}%` }} />
          </div>
        </div>
      )}

      {/* REPAYMENT GLOW PATH - Enhanced with more drama */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 rounded-full blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              REPAYMENT GLOW PATH
            </h3>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-mono text-gray-500">{repaidPercentage}% COMPLETE</span>
            </div>
          </div>
          
          {/* The Glowing Gradient Path with animated particles */}
          <div className="relative mb-6">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-500 rounded-full transition-all duration-1000 relative"
                style={{ width: `${repaidPercentage}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" style={{ backgroundSize: '200% 100%' }} />
              </div>
            </div>
            {/* Ghost markers */}
            <div className="absolute inset-x-0 top-0 h-4 pointer-events-none">
              <div className="h-full w-full flex justify-between px-1">
                {[25, 50, 75].map((marker) => (
                  <div key={marker} className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                ))}
              </div>
            </div>
            {/* Floating percentage indicators */}
            <div className="absolute -top-6 right-0 text-xs font-mono text-indigo-500 dark:text-indigo-400">
              {repaidPercentage}%
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 font-mono mb-1">TOTAL BORROWED</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(customer?.totalBorrowed || 0)}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 font-mono mb-1">TOTAL REPAID</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(customer?.totalRepaid || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CREDIT BLADE SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            LOAN PORTFOLIO
          </h2>
          <span className="text-xs font-mono text-gray-500">{customer.loans?.length || 0} ACTIVE BLADES</span>
        </div>
        
        {/* Loan Blades */}
        {customer.loans?.map((loan) => {
          const isExpanded = expandedLoanId === loan.id;
          const bladeProgress = (loan.amountPaid / loan.amount) * 100;
          const isLoanOverdue = loan.status === 'overdue';
          const isActive = loan.status === 'active';
          
          return (
            <div
              key={loan.id}
              className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? 'bg-gray-50 dark:bg-gray-800 border-indigo-300 dark:border-indigo-500/50' : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Blade Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Status Light - Spine indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-1.5 h-8 rounded-full ${isLoanOverdue ? 'bg-red-500 animate-pulse' : isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  </div>
                  
                  {/* Mini Ring */}
                  <div className="flex-shrink-0">
                    <ProgressRing
                      progress={bladeProgress}
                      size={48}
                      strokeWidth={4}
                      status={isLoanOverdue ? 'overdue' : (bladeProgress >= 100 ? 'completed' : 'active')}
                      interactive={true}
                      animateOnHover={true}
                      pulseOnOverdue={isLoanOverdue}
                      rotationEffect={true}
                      onDark={false}
                    />
                  </div>
                  
                  {/* Loan Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{loan.loanId}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isLoanOverdue ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {loan.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{formatCurrency(loan.amount)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 dark:text-gray-400">{loan.interestRate}%</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 dark:text-gray-400 truncate">{loan.purpose}</span>
                    </div>
                  </div>
                  
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>
              
              {/* Expanded View - Blueprint Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3 tracking-wider">PAYMENT DETAILS</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                          <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(loan.amountPaid)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                          <span className="font-mono text-amber-600 dark:text-amber-400">{formatCurrency(loan.remainingBalance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                          <span className="font-mono text-gray-900 dark:text-white">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                        {isLoanOverdue && (
                          <div className="mt-3 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/20">
                            <p className="text-xs text-red-700 dark:text-red-400 font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              PENALTY ACCRUING: +1% daily
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mb-3 tracking-wider">QUICK ACTIONS</h4>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/customer/loans/${loan.id}`} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all">
                          Make Payment
                        </Link>
                        <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-all">
                          View Statement
                        </button>
                        <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-all">
                          Request Extension
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* THE INFAMOUS SUBTLE PROGRESS BAR - Sung Jinwoo's Shadow */}
              <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800">
                <div 
                  className={`h-full transition-all duration-500 ${
                    isLoanOverdue ? 'bg-red-500' : bladeProgress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${bladeProgress}%` }}
                />
              </div>
            </div>
          );
        })}
        
        {(!customer.loans || customer.loans.length === 0) && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No active loans</p>
            <Link href="/customer/apply-loan" className="inline-block mt-3 text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
              Apply for your first loan →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

