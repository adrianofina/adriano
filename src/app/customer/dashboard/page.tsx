"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  History,
  User,
  Settings,
  Bell,
  Shield,
  DollarSign,
  Award,
  Sparkles,
  Gavel,
  Phone,
  Scale
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

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => { 
    try {
      // Get current user from auth   
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();

      if (!userData.user) {
        window.location.href = '/login';
        return;
      }

      setUser(userData.user);

      // Fetch customer profile data  
      const customerRes = await fetch(`/api/customers/profile?email=${userData.user.email}`);
      const customerData = await customerRes.json();

      if (customerData.customer) {    
        setCustomer(customerData.customer);
      } else {
        // If no customer profile exists, create one
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

  // Calculate health score
  const calculateHealthScore = () => {
    if (!customer) return 0;
    const totalBorrowed = customer.totalBorrowed || 0;
    const totalRepaid = customer.totalRepaid || 0;
    const totalLoans = customer.totalLoans || 0;
    const overdueLoans = customer.overdueLoans || 0;
    const activeLoans = customer.activeLoans || 0;
    
    const repaymentRatio = totalBorrowed > 0 ? totalRepaid / totalBorrowed : 0;
    const overdueRatio = totalLoans > 0 ? overdueLoans / totalLoans : 0;
    const activeRatio = totalLoans > 0 ? activeLoans / totalLoans : 0;
    
    return Math.round(
      repaymentRatio * 40 +
      (1 - overdueRatio) * 35 +
      (1 - Math.min(activeRatio, 1)) * 25
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">       
        <div className="text-center"> 
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"    
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const healthScore = calculateHealthScore();
  const activePercentage = customer?.totalLoans && customer.totalLoans > 0 
    ? Math.round(((customer.activeLoans || 0) / customer.totalLoans) * 100) 
    : 0;
  const repaidPercentage = customer?.totalBorrowed && customer.totalBorrowed > 0 
    ? Math.round(((customer.totalRepaid || 0) / customer.totalBorrowed) * 100) 
    : 0;
  const hasOverdue = (customer?.overdueLoans || 0) > 0;
  
  // Find current loan (active or overdue)
  const currentLoan = customer.loans?.find(l =>
    l.status === 'active' || l.status === 'overdue'
  ) || customer.loans?.[0];
  
  const loanProgress = currentLoan 
    ? (currentLoan.amountPaid / currentLoan.amount) * 100 
    : 0;

  // Calculate overdue penalty message
  const overdueDays = currentLoan?.dueDate && currentLoan.status === 'overdue'
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(currentLoan.dueDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const penaltyAmount = currentLoan?.penalties || (overdueDays * (currentLoan?.amount || 0) * 0.01);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Welcome back</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {customer?.firstName || 'Customer'}! 
          </h1>
          <p className="text-indigo-100">Your trusted partner for financial solutions</p>
        </div>
      </div>

      {/* DRAMATIC OVERDUE ALERT */}
      {hasOverdue && currentLoan?.status === 'overdue' && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm overflow-hidden">
          <div className="p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-red-800 dark:text-red-300">
                  ⚠️ URGENT: Loan Overdue
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  Your payment of {formatCurrency(currentLoan.remainingBalance)} is overdue by {overdueDays} days.
                </p>
                {penaltyAmount > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                    Penalty accrued: {formatCurrency(penaltyAmount)}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button 
                    onClick={() => window.location.href = `tel:${customer?.phoneNumber}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Support
                  </button>
                  <Link
                    href={`/customer/loans/${currentLoan.id}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs rounded-lg transition-colors font-medium"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    Make Payment
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* SUBTLE PROGRESS BAR - the infamous shadow */}
          <div className="h-1 w-full bg-red-200 dark:bg-red-800">
            <div 
              className="h-full bg-red-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (currentLoan.amountPaid / currentLoan.amount) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Two Main Rings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Score Ring */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
          <ProgressRing
            progress={healthScore}
            size={120}
            strokeWidth={8}
            status={hasOverdue ? 'overdue' : (healthScore >= 80 ? 'completed' : 'active')}
            label="HEALTH"
            value={`${healthScore}/100`}
            interactive={true}
            animateOnHover={true}
            pulseOnOverdue={hasOverdue}
            onDark={false}
          />
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">Financial Health</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {hasOverdue ? '⚠️ Overdue detected' : healthScore >= 80 ? 'Excellent standing' : 'On track'}
          </p>
        </div>

        {/* Repayment Progress Ring */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 text-center">
          <ProgressRing
            progress={repaidPercentage}
            size={120}
            strokeWidth={8}
            status={repaidPercentage >= 100 ? 'completed' : 'active'}
            label="REPAID"
            value={`${formatCurrency(customer?.totalRepaid || 0)} paid`}
            interactive={true}
            animateOnHover={true}
            onDark={false}
          />
          <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">Repayment Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {repaidPercentage}% of total borrowed
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer?.creditScore || 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Credit Score</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer?.activeLoans || 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Active Loans</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(customer?.totalBorrowed || 0)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Borrowed</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
          <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(customer?.totalRepaid || 0)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Repaid</p>
        </div>
      </div>

      {/* Current Loan - With the Infamous Subtle Progress Bar */}
      {currentLoan && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Loan</h2>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                currentLoan.status === 'overdue'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
              }`}>
                {currentLoan.status.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Loan Details - Clean and simple */}
              <div className="flex-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Loan ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentLoan.loanId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(currentLoan.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Purpose</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentLoan.purpose}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Interest</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentLoan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(currentLoan.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(currentLoan.remainingBalance)}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentLoan.dueDate ? new Date(currentLoan.dueDate).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* THE INFAMOUS SUBTLE PROGRESS BAR - like Sung jin woos shadow */}
          <div className="h-1 w-full bg-gray-200 dark:bg-gray-700">
            <div 
              className={`h-full transition-all duration-500 ${
                currentLoan.status === 'overdue' ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${loanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/customer/apply-loan"
          className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 text-center hover:shadow-md transition group"
        >
          <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">Apply for Loan</span>
        </Link>

        <Link
          href="/customer/loan-history"
          className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 text-center hover:shadow-md transition group"
        >
          <History className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2 group-hover:scale-110 transition" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">Loan History</span>
        </Link>

        <Link
          href="/customer/profile"
          className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 text-center hover:shadow-md transition group"
        >
          <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">My Profile</span>
        </Link>

        <Link
          href="/customer/settings"
          className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 text-center hover:shadow-md transition group"
        >
          <Settings className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2 group-hover:scale-110 transition" />
          <span className="text-xs font-medium text-gray-900 dark:text-white">Settings</span>
        </Link>
      </div>
    </div>
  );
}
