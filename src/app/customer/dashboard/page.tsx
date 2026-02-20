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
  Award
} from "lucide-react";

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

  // Find current loan (active or overdue)
  const currentLoan = customer.loans?.find(l => 
    l.status === 'active' || l.status === 'overdue'
  ) || customer.loans?.[0];

  const paidPercentage = currentLoan 
    ? (currentLoan.amountPaid / currentLoan.amount) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Shows only first name */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {customer.firstName}! 👋
        </h1>
        <p className="text-blue-100">Your trusted partner for financial solutions</p>
      </div>

      {/* Overdue Alert */}
      {customer.overdueLoans > 0 && currentLoan?.status === 'overdue' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-300">Loan Overdue</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Your loan payment of {formatCurrency(currentLoan.remainingBalance)} is overdue.
              </p>
              {currentLoan.penalties > 0 && (
                <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                  Penalty: {formatCurrency(currentLoan.penalties)}
                </p>
              )}
            </div>
            <Link
              href={`/customer/loans/${currentLoan.id}`}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Pay Now
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.creditScore}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Credit Score</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.activeLoans}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Active Loans</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(customer.totalBorrowed).replace('TSh', '')}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Borrowed</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(customer.totalRepaid).replace('TSh', '')}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Repaid</p>
        </div>
      </div>

      {/* Current Loan Progress */}
      {currentLoan && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Loan</h2>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              currentLoan.status === 'overdue' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {currentLoan.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Loan ID</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentLoan.loanId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(currentLoan.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentLoan.purpose}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Interest Rate</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{currentLoan.interestRate}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Payment Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(currentLoan.amountPaid)} / {formatCurrency(currentLoan.amount)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  currentLoan.status === 'overdue' ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{ width: `${paidPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentLoan.remainingBalance)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Due Date</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {currentLoan.dueDate ? new Date(currentLoan.dueDate).toLocaleDateString() : '—'}
              </p>
            </div>
            {currentLoan.penalties > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <p className="text-xs text-red-600 dark:text-red-400 mb-1">Penalty</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(currentLoan.penalties)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/customer/apply-loan"
          className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 text-center hover:shadow-md transition group"
        >
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" />
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
          <User className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition" />
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
