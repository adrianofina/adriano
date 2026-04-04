"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Download,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import ProgressRing from '@/components/ui/ProgressRing';
import SungJinwooShadow from '@/components/ui/infamousshadow';

interface Loan {
  id: string;
  loanId: string;
  customer: string;
  amount: number;
  amountPaid: number;
  remainingBalance: number;
  purpose: string;
  status: string;
  appliedDate: string;
  dueDate: string;
  risk: string;
  interestRate?: number;
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState({ 
    total: 0, active: 0, pending: 0, overdue: 0, completed: 0 
  });
  const [loading, setLoading] = useState(true);
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/loans');
      const data = await res.json();
      const loansData = data.loans || [];
      
      const mappedLoans = loansData.map((loan: any) => {
        const amount = Number(loan.amount) || 0;
        const progress = Number(loan.progress) || 0;
        const status = (loan.status || 'pending').toLowerCase();
        
        // CRITICAL FIX: Calculate amountPaid from progress for ALL loans
        // Because the API's 'paid' field is only populated for completed loans
        let amountPaid = (progress / 100) * amount;
        let remainingBalance = amount - amountPaid;
        
        // For completed loans, ensure exact numbers
        if (status === 'completed' || status === 'paid') {
          amountPaid = amount;
          remainingBalance = 0;
        }
        
        // For overdue loans that show 100% progress
        if (progress >= 99.5) {
          amountPaid = amount;
          remainingBalance = 0;
        }
        
        // Get customer name
        let customerName = 'Unknown';
        if (loan.customer) {
          if (typeof loan.customer === 'object') {
            customerName = `${loan.customer.firstName || ''} ${loan.customer.surname || ''}`.trim();
            if (!customerName) customerName = loan.customer.name || 'Unknown';
          } else if (typeof loan.customer === 'string') {
            customerName = loan.customer;
          }
        }
        
        console.log(`Loan ${loan.loanId}: amount=${amount}, progress=${progress}%, paid=${Math.round(amountPaid)}, status=${status}`);
        
        return {
          id: loan.id,
          loanId: loan.loanId || loan.id,
          customer: customerName,
          amount: amount,
          amountPaid: amountPaid,
          remainingBalance: remainingBalance,
          purpose: loan.purpose || 'N/A',
          status: status,
          appliedDate: loan.appliedDate || loan.createdAt || new Date().toISOString(),
          dueDate: loan.dueDate,
          risk: loan.risk || loan.riskLevel || 'medium',
          interestRate: loan.interestRate || 12,
          progress: progress,
        };
      });
      
      setLoans(mappedLoans);
      
      setStats({
        total: mappedLoans.length,
        active: mappedLoans.filter((l: Loan) => l.status === 'active').length,
        pending: mappedLoans.filter((l: Loan) => l.status === 'pending').length,
        overdue: mappedLoans.filter((l: Loan) => l.status === 'overdue').length,
        completed: mappedLoans.filter((l: Loan) => l.status === 'completed' || l.status === 'paid').length,
      });
      
    } catch (error) {
      console.error('Error:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'TSh 0';
    if (amount >= 1_000_000) return `TSh ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `TSh ${(amount / 1_000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active') {
      return { barColor: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30', ringStatus: 'active' as const };
    }
    if (s === 'completed' || s === 'paid') {
      return { barColor: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-400', badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30', ringStatus: 'completed' as const };
    }
    if (s === 'overdue') {
      return { barColor: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400', badgeBg: 'bg-red-100 dark:bg-red-900/30', ringStatus: 'overdue' as const };
    }
    if (s === 'pending') {
      return { barColor: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-400', badgeBg: 'bg-amber-100 dark:bg-amber-900/30', ringStatus: 'pending' as const };
    }
    return { barColor: 'bg-gray-500', textColor: 'text-gray-700 dark:text-gray-400', badgeBg: 'bg-gray-100 dark:bg-gray-800', ringStatus: 'pending' as const };
  };

  const getRiskColor = (risk: string) => {
    const r = risk?.toLowerCase() || '';
    if (r === 'low') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (r === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (r === 'high') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Loan Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and track all customer loans</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLoans} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link href="/admin/loans/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all hover:scale-105">
            <Plus className="w-4 h-4" />
            New Loan
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-amber-600 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-black text-amber-600">{stats.pending}</p>
        </div>
        <div className={`bg-white dark:bg-gray-900 rounded-xl p-4 border ${stats.overdue > 0 ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-800'}`}>
          <p className="text-[10px] text-red-600 uppercase tracking-wider">Overdue</p>
          <p className={`text-2xl font-black ${stats.overdue > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900 dark:text-white'}`}>{stats.overdue}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-emerald-600">{stats.completed}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Loan ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
        </select>
        <button className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Loan Blades */}
      {filteredLoans.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No loans found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLoans.map((loan) => {
            const isExpanded = expandedLoanId === loan.id;
            const isOverdue = loan.status === 'overdue';
            const statusStyle = getStatusStyle(loan.status);
            const bladeProgress = loan.status === 'completed' || loan.status === 'paid' ? 100 : (loan as any).progress || 0;
            
            return (
              <div
                key={loan.id}
                className={`group rounded-xl border transition-all duration-300 overflow-hidden relative ${
                  isExpanded 
                    ? 'bg-gray-50 dark:bg-gray-800 border-indigo-300 dark:border-indigo-500/50' 
                    : isOverdue
                      ? 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 hover:border-red-300'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                {/* Full height status spine */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${statusStyle.barColor} ${isOverdue ? 'animate-pulse' : ''}`}
                  style={{ borderTopLeftRadius: '0.75rem', borderBottomLeftRadius: '0.75rem' }}
                />
                
                {/* Blade Header */}
                <div 
                  className="p-4 pl-5 cursor-pointer"
                  onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    
                    {/* Mini Progress Ring */}
                    <div className="flex-shrink-0">
                      <ProgressRing
                        progress={bladeProgress}
                        size={52}
                        strokeWidth={5}
                        status={statusStyle.ringStatus}
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
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${statusStyle.badgeBg} ${statusStyle.textColor}`}>
                          {loan.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${getRiskColor(loan.risk)}`}>
                          {loan.risk?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <User className="w-3 h-3" />
                          {loan.customer}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400 font-mono">{formatCurrency(loan.amount)}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400">{loan.purpose}</span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Due: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                
                {/* Blueprint Section */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div 
                    className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50"
                    style={{ transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)', transition: 'transform 0.3s ease-out' }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
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
                      
                      {/* Loan Details */}
                      <div>
                        <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">LOAN DETAILS</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500">Interest Rate</span>
                            <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">{loan.interestRate || 12}%</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500">Applied Date</span>
                            <span className="font-mono font-bold text-xs text-gray-900 dark:text-white">{new Date(loan.appliedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="font-mono font-bold text-xs text-indigo-600">{Math.round(bladeProgress)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div>
                        <p className="text-[9px] font-mono text-indigo-600 dark:text-indigo-400 tracking-widest font-bold mb-3">QUICK ACTIONS</p>
                        <div className="flex flex-col gap-2">
                          <Link href={`/admin/loans/${loan.id}`} className="w-full py-2 px-4 rounded-xl text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all">View Details</Link>
                          {(loan.status === 'active' || isOverdue) && (
                            <Link href={`/admin/loans/${loan.id}/payment`} className="w-full py-2 px-4 rounded-xl text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all">Record Payment</Link>
                          )}
                          {loan.status === 'pending' && (
                            <Link href={`/admin/approvals/${loan.id}`} className="w-full py-2 px-4 rounded-xl text-center bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all">Review Application</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <SungJinwooShadow progress={bladeProgress} status={statusStyle.ringStatus} height="h-0.5" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
