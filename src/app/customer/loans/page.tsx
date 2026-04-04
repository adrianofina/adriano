"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  ChevronRight,
  TrendingUp,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Send,
  ArrowLeft
} from 'lucide-react';
import ProgressRing from '@/components/ui/ProgressRing';
import SungJinwooShadow from '@/components/ui/infamousshadow';
import ApplyLoanModal from '@/components/modals/ApplyLoanModal';

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

export default function LoanCenterPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, overdue: 0, completed: 0, totalBorrowed: 0, totalRepaid: 0 });

  useEffect(() => {
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      const res = await fetch('/api/customers/loans');
      const data = await res.json();
      const loansData = data.loans || [];
      setLoans(loansData);
      
      // Calculate stats
            // Calculate stats - EXCLUDE pending loans from totals
      const activeLoans = loansData.filter((l: Loan) => l.status === 'active').length;
      const completedLoans = loansData.filter((l: Loan) => l.status === 'completed' || l.status === 'paid').length;
      const overdueLoans = loansData.filter((l: Loan) => l.status === 'overdue').length;
      
      // Only include active, completed, and overdue in totals (NOT pending)
      const approvedLoans = loansData.filter((l: Loan) => 
        l.status === 'active' || l.status === 'completed' || l.status === 'paid' || l.status === 'overdue'
      );
      
      const totalBorrowed = approvedLoans.reduce((sum: number, l: Loan) => sum + l.amount, 0);
      const totalRepaid = approvedLoans.reduce((sum: number, l: Loan) => sum + l.amountPaid, 0);
      
      setStats({
        total: approvedLoans.length,
        active: activeLoans,
        overdue: overdueLoans,
        completed: completedLoans,
        totalBorrowed: totalBorrowed,
        totalRepaid: totalRepaid,
      });
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Loan Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your loans or apply for a new one</p>
        </div>
        
        {/* Apply Button - Prominent */}
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Apply for a New Loan
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Loans</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
        </div>
        <div className={`bg-white dark:bg-gray-900 rounded-xl p-4 border ${stats.overdue > 0 ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-800'}`}>
          <p className="text-[10px] text-red-600 uppercase tracking-wider">Overdue</p>
          <p className={`text-2xl font-black ${stats.overdue > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900 dark:text-white'}`}>{stats.overdue}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-purple-600 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-purple-600">{stats.completed}</p>
        </div>
      </div>

      {/* Financial Summary Row */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Borrowed:</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalBorrowed)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Repaid:</span>
            <span className="text-sm font-bold text-emerald-600">{formatCurrency(stats.totalRepaid)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Outstanding:</span>
            <span className="text-sm font-bold text-amber-600">{formatCurrency(stats.totalBorrowed - stats.totalRepaid)}</span>
          </div>
        </div>
      </div>

      {/* Loan Blades Section */}
      {loans.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No loans yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't taken any loans yet.</p>
          <button
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Apply for Your First Loan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Your Loans
            </h2>
            <span className="text-[10px] font-mono text-gray-400">{loans.length} ACTIVE LOANS</span>
          </div>

          {loans.map((loan) => {
            const isExpanded = expandedLoanId === loan.id;
            const bladeProgress = (loan.amountPaid / loan.amount) * 100;
            const isOverdue = loan.status === 'overdue';
            const isActive = loan.status === 'active';
            const isCompleted = loan.status === 'completed' || loan.status === 'paid';
            
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
                      ? 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 hover:border-red-300'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                {/* Blade Header */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    
                    {/* Status Bar */}
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
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{loan.loanId}</span>
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
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                {/* Blueprint Section */}
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
                        <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">PAYMENT DETAILS</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500">Total Amount</span>
                            <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500">Amount Paid</span>
                            <span className="font-mono font-bold text-xs text-emerald-600">{formatCurrency(loan.amountPaid)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-xs text-gray-500">Remaining</span>
                            <span className="font-mono font-bold text-xs text-amber-600">{formatCurrency(loan.remainingBalance)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div>
                        <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">QUICK ACTIONS</p>
                        <div className="flex flex-col gap-2">
                          {(isActive || isOverdue) && (
                            <Link
                              href={`/customer/loans/${loan.id}`}
                              className="w-full py-2.5 px-4 rounded-xl text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-300 hover:scale-105"
                            >
                              Make Payment
                            </Link>
                          )}
                          <button className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all duration-300">
                            View Statement
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sung Jinwoo's Shadow */}
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

      {/* Apply Loan Modal */}
      <ApplyLoanModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={() => {
          fetchLoanHistory();
        }}
      />
    </div>
  );
}

