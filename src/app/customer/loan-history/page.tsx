"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import ProgressRing from '@/components/ui/ProgressRing';
import SungJinwooShadow from '@/components/ui/infamousshadow';

interface Loan {
  id: string;
  loanId: string;
  amount: number;
  amountPaid: number;
  remainingBalance: number;
  status: string;
  purpose: string;
  createdAt: string;
  dueDate: string;
  interestRate?: number;
}

export default function LoanHistoryPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, overdue: 0, completed: 0 });

  useEffect(() => {
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      const res = await fetch('/api/customers/loans');
      const data = await res.json();
      const loansData = data.loans || [];
      setLoans(loansData);
      
      // Calculate real stats from loans array
      setStats({
        total: loansData.length,
        active: loansData.filter((l: Loan) => l.status === 'active').length,
        overdue: loansData.filter((l: Loan) => l.status === 'overdue').length,
        completed: loansData.filter((l: Loan) => l.status === 'completed' || l.status === 'paid').length,
      });
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    if (amount >= 1_000_000) return `TSh ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `TSh ${(amount / 1_000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  const getProgressColor = (status: string, progress: number) => {
    if (status === 'overdue') return 'bg-red-500';
    if (progress >= 100) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-indigo-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/customer/dashboard"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Loan History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track all your loans in one place</p>
          </div>
        </div>
        
        {/* Compact Stats Cards */}
        <div className="flex gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-center min-w-[70px]">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center min-w-[70px]">
            <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Active</p>
            <p className="text-lg font-black text-emerald-600">{stats.active}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-center min-w-[70px] ${stats.overdue > 0 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Overdue</p>
            <p className={`text-lg font-black ${stats.overdue > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900 dark:text-white'}`}>{stats.overdue}</p>
          </div>
        </div>
      </div>

      {/* Loan Blades - Credit Blade System */}
      {loans.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No loans yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't taken any loans yet.</p>
          <Link
            href="/customer/apply-loan"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all hover:scale-105"
          >
            Apply for a Loan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => {
            const isExpanded = expandedLoanId === loan.id;
            const bladeProgress = (loan.amountPaid / loan.amount) * 100;
            const isOverdue = loan.status === 'overdue';
            const isActive = loan.status === 'active';
            const isCompleted = loan.status === 'completed' || loan.status === 'paid';
            
            // Determine status for ring
            let ringStatus: 'active' | 'overdue' | 'completed' | 'pending' = 'pending';
            if (isOverdue) ringStatus = 'overdue';
            else if (isActive) ringStatus = 'active';
            else if (isCompleted) ringStatus = 'completed';
            
            return (
              <div
                key={loan.id}
                className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? 'bg-gray-50 dark:bg-gray-800 border-indigo-300 dark:border-indigo-500/50' 
                    : isOverdue
                      ? 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                {/* Blade Header - Click to expand */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    
                    {/* Status Bar - Colored vertical line */}
                    <div className="flex-shrink-0">
                      <div className={`w-1.5 h-10 rounded-full ${
                        isOverdue ? 'bg-red-500 animate-pulse' : 
                        isActive ? 'bg-emerald-500' : 
                        isCompleted ? 'bg-purple-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    {/* Mini Progress Ring */}
                    <div className="flex-shrink-0">
                      <ProgressRing
                        progress={bladeProgress}
                        size={52}
                        strokeWidth={5}
                        status={ringStatus}
                        interactive={true}
                        animateOnHover={true}
                        pulseOnOverdue={isOverdue}
                        rotationEffect={true}
                        onDark={false}
                      />
                    </div>
                    
                    {/* Loan Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                          {loan.loanId}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          isCompleted ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {loan.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                        <span className="text-gray-600 dark:text-gray-400 font-mono">{formatCurrency(loan.amount)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400">{loan.purpose}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Expand Indicator */}
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                {/* Blueprint Section - Slides in when expanded */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div 
                    className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50"
                    style={{
                      transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Payment Details */}
                      <div>
                        <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">
                          PAYMENT DETAILS
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount</span>
                            <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Amount Paid</span>
                            <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">{formatCurrency(loan.amountPaid)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Remaining Balance</span>
                            <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">{formatCurrency(loan.remainingBalance)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Applied Date</span>
                            <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">{new Date(loan.createdAt).toLocaleDateString()}</span>
                          </div>
                          {isOverdue && (
                            <div className="mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                              <p className="text-[10px] text-red-600 dark:text-red-400 font-mono flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                OVERDUE: Payment required immediately
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div>
                        <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">
                          QUICK ACTIONS
                        </p>
                        <div className="flex flex-col gap-2">
                          {(isActive || isOverdue) && (
                            <Link
                              href={`/customer/loans/${loan.id}`}
                              className="w-full py-2.5 px-4 rounded-xl text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-300 hover:scale-105"
                            >
                              Make Payment
                            </Link>
                          )}
                          <button className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all duration-300 border border-gray-200 dark:border-gray-700">
                            View Statement
                          </button>
                          <button className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all duration-300 border border-gray-200 dark:border-gray-700">
                            Request Extension
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sung Jinwoo's Shadow - The infamous progress bar */}
                <SungJinwooShadow 
                  progress={bladeProgress} 
                  status={ringStatus}
                  height="h-0.5"
                />
              </div>
            );
          })}
        </div>
      )}
      
      {/* Compact Summary Footer */}
      {loans.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total borrowed:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(loans.reduce((sum, l) => sum + l.amount, 0))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total repaid:</span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(loans.reduce((sum, l) => sum + l.amountPaid, 0))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Outstanding:</span>
              <span className="text-sm font-bold text-amber-600">
                {formatCurrency(loans.reduce((sum, l) => sum + l.remainingBalance, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

