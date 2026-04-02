"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  History,
  User,
  Settings,
  DollarSign,
  Award,
  Gavel,
  Phone,
  Scale,
  Calendar,
  Zap,
  Shield,
  Eye,
  ChevronRight
} from "lucide-react";
import ProgressRing from '@/components/ui/ProgressRing';

// Interfaces remain the same
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading control panel...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Error loading dashboard</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const healthScore = calculateHealthScore();
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowPenaltyModal(false)}>
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-red-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">PENALTY MATRIX</h3>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="text-sm text-gray-400">DAYS OVERDUE:</span>
                <span className="font-bold text-red-500">{overdueDays} days</span>
              </div>
              <div className="flex justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <span className="text-sm text-gray-400">PENALTY ACCRUED:</span>
                <span className="font-bold text-amber-500">{formatCurrency(penaltyAmount)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-400">DAILY PENALTY RATE:</span>
                <span className="font-medium text-white">1% of remaining balance</span>
              </div>
              {showLegalWarning && (
                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-purple-400 font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    LEGAL NOTICE: Action may be initiated if unpaid within 30 days
                  </p>
                </div>
              )}
            </div>
            <button onClick={() => setShowPenaltyModal(false)} className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}

      {/* HEADER SECTION - Control Panel Style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Customer Identity Card */}
        <div className="lg:col-span-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono text-indigo-400 tracking-wider">ACTIVE SESSION</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {customer?.firstName} {customer?.surname}
                  </h1>
                  <p className="text-gray-400 text-sm mb-4">
                    {customer?.createdAt ? `MEMBER SINCE ${new Date(customer.createdAt).getFullYear()}` : 'VERIFIED CUSTOMER'}
                  </p>
                  
                  {/* Credit Score with visual indicator */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="font-mono font-bold text-white">{customer?.creditScore || 650}</span>
                    </div>
                    <div className="text-amber-500 text-sm tracking-wider">
                      {getCreditStars(customer?.creditScore || 650)}
                    </div>
                  </div>
                </div>
                
                {/* Quick Action Buttons - Mechanical style */}
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-xs font-medium text-gray-300 transition-all flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    SUPPORT
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-all flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    DETAILS
                  </button>
                </div>
              </div>
              
              {/* STAT CARDS - The "Hangar Rack" */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gray-700">
                <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-1">ACTIVE LOANS</p>
                  <p className="text-2xl font-bold text-white">{customer?.activeLoans || 0}</p>
                </div>
                <div className={`bg-gray-800/50 rounded-lg p-3 text-center border ${hasOverdue ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700'}`}>
                  <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-1">OVERDUE LOANS</p>
                  <p className={`text-2xl font-bold ${hasOverdue ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {customer?.overdueLoans || 0}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
                  <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-1">TOTAL LOANS</p>
                  <p className="text-2xl font-bold text-white">{customer?.totalLoans || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Health Ring (The Lord of the Rings style) */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6 h-full flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <div className="relative">
              <ProgressRing
                progress={healthScore}
                size={140}
                strokeWidth={10}
                status={hasOverdue ? 'overdue' : (healthScore >= 80 ? 'completed' : 'active')}
                label="HEALTH"
                value={`${healthScore}/100`}
                interactive={true}
                animateOnHover={true}
                pulseOnOverdue={hasOverdue}
                rotationEffect={true}
                glowIntensity={12}
                breatheOnOverdue={true}
                onClick={() => hasOverdue && setShowPenaltyModal(true)}
                onDark={true}
              />
              <p className="text-center text-xs text-gray-400 mt-4 font-mono">
                {hasOverdue ? '⚠️ PENALTY DETECTED — TAP FOR DETAILS' : (healthScore >= 80 ? 'EXCELLENT STANDING' : 'ACTIVE ACCOUNT')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DRAMATIC OVERDUE BANNER - Urgency First */}
      {hasOverdue && currentLoan?.status === 'overdue' && (
        <div className={`rounded-xl border overflow-hidden transition-all ${showLegalWarning ? 'border-purple-500 bg-gradient-to-r from-red-950/50 to-purple-950/50' : 'border-red-500/50 bg-red-950/30'}`}>
          <div className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-400 font-mono tracking-wide">
                  ⚠️ CRITICAL: LOAN OVERDUE — {overdueDays} DAYS
                </h3>
                <p className="text-sm text-red-300/80 mt-1">
                  Outstanding balance: {formatCurrency(currentLoan.remainingBalance)}
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button onClick={() => window.location.href = `tel:${customer?.phoneNumber}`} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                    CALL SUPPORT
                  </button>
                  <Link href={`/customer/loans/${currentLoan.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm rounded-lg transition-colors">
                    <Gavel className="w-4 h-4" />
                    MAKE PAYMENT
                  </Link>
                  {showLegalWarning && (
                    <button onClick={() => setShowPenaltyModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm rounded-lg transition-colors">
                      <Scale className="w-4 h-4" />
                      LEGAL NOTICE
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* The Infamous Subtle Progress Bar - Sung Jinwoo's Shadow */}
          <div className="h-1 w-full bg-red-900/30">
            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${Math.min(100, (currentLoan.amountPaid / currentLoan.amount) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* CREDIT BLADE SECTION - The "Hangar Rack" for Loans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            LOAN PORTFOLIO
          </h2>
          <span className="text-xs font-mono text-gray-500">{customer.loans?.length || 0} ACTIVE BLADES</span>
        </div>
        
        {/* Loan Blades - Each is a "Blade" in the rack */}
        {customer.loans?.map((loan, index) => {
          const isExpanded = expandedLoanId === loan.id;
          const bladeProgress = (loan.amountPaid / loan.amount) * 100;
          const isLoanOverdue = loan.status === 'overdue';
          const isActive = loan.status === 'active';
          
          return (
            <div
              key={loan.id}
              className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
                isExpanded ? 'bg-gray-800 border-indigo-500/50' : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Blade Header - Always visible */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Status Light - The Spine indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-8 rounded-full ${isLoanOverdue ? 'bg-red-500 animate-pulse' : isActive ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                  </div>
                  
                  {/* Mini Ring - The LoanProgressRing */}
                  <div className="flex-shrink-0">
                    <ProgressRing
                      progress={bladeProgress}
                      size={48}
                      strokeWidth={4}
                      status={isLoanOverdue ? 'overdue' : (bladeProgress >= 100 ? 'completed' : 'active')}
                      interactive={true}
                      animateOnHover={true}
                      onDark={true}
                    />
                  </div>
                  
                  {/* Loan Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-white">{loan.loanId}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isLoanOverdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {loan.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs">
                      <span className="text-gray-400">{formatCurrency(loan.amount)}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400">{loan.interestRate}%</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400">{loan.purpose}</span>
                    </div>
                  </div>
                  
                  {/* Expand Indicator */}
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>
              
              {/* Expanded View - The "Blueprint" Details */}
              {isExpanded && (
                <div className="border-t border-gray-700 p-4 bg-gray-900/50 animate-slide-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left - Payment Matrix / Amortization */}
                    <div>
                      <h4 className="text-xs font-mono text-indigo-400 mb-3 tracking-wider">PAYMENT MATRIX</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Amount:</span>
                          <span className="font-mono text-white">{formatCurrency(loan.amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Amount Paid:</span>
                          <span className="font-mono text-emerald-400">{formatCurrency(loan.amountPaid)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Remaining:</span>
                          <span className="font-mono text-amber-400">{formatCurrency(loan.remainingBalance)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Due Date:</span>
                          <span className="font-mono text-white">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Not set'}</span>
                        </div>
                        {isLoanOverdue && (
                          <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                            <p className="text-xs text-red-400 font-mono">⚠️ PENALTY ACCRUING: +1% daily</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Right - Quick Actions */}
                    <div>
                      <h4 className="text-xs font-mono text-indigo-400 mb-3 tracking-wider">QUICK ACTIONS</h4>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/customer/loans/${loan.id}`} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-all">
                          MAKE PAYMENT
                        </Link>
                        <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium text-gray-300 transition-all">
                          VIEW STATEMENT
                        </button>
                        <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium text-gray-400 transition-all">
                          REQUEST EXTENSION
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* The Infamous Subtle Progress Bar - Shadow at bottom of each blade */}
              <div className="h-0.5 w-full bg-gray-800">
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
      </div>
      
      {/* REPAYMENT OVERVIEW - The Signature Glow Path */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            REPAYMENT GLOW PATH
          </h3>
          <span className="text-xs font-mono text-gray-500">{repaidPercentage}% COMPLETE</span>
        </div>
        
        {/* The Glowing Gradient Path */}
        <div className="relative mb-6">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-500 rounded-full transition-all duration-700 relative"
              style={{ width: `${repaidPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          {/* Ghost path markers */}
          <div className="absolute inset-x-0 top-0 h-3 pointer-events-none">
            <div className="h-full w-full flex justify-between px-1">
              {[25, 50, 75].map((marker) => (
                <div key={marker} className="h-3 w-px bg-gray-600/50" />
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-500 font-mono mb-1">TOTAL BORROWED</p>
            <p className="text-xl font-bold text-white">{formatCurrency(customer?.totalBorrowed || 0)}</p>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-500 font-mono mb-1">TOTAL REPAID</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(customer?.totalRepaid || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
