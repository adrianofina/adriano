"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  User,
  DollarSign,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface Approval {
  id: string;
  loanId: string;
  customer: string;
  amount: number;
  purpose: string;
  appliedDate: string;
  creditScore: number;
  risk: string;
  stage: number;
}

export default function ApprovalsPage() {
  const [stage1, setStage1] = useState<Approval[]>([]);
  const [stage2, setStage2] = useState<Approval[]>([]);
  const [counts, setCounts] = useState({ stage1: 0, stage2: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stage1' | 'stage2'>('stage1');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/approvals');
      const data = await res.json();
      setStage1(data.stage1 || []);
      setStage2(data.stage2 || []);
      setCounts(data.counts || { stage1: 0, stage2: 0 });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const formatCurrency = (amount: number) => {
    if (!amount) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const getRiskColor = (risk: string) => {
    const r = risk?.toLowerCase() || '';
    if (r === 'low') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30';
    if (r === 'medium') return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30';
    if (r === 'high') return 'text-red-600 bg-red-50 dark:bg-red-950/30';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 700) return 'text-emerald-600';
    if (score >= 600) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleApprove = async (id: string, stage: number) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/approvals/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        await fetchApprovals();
      }
    } catch (error) {
      console.error('Error approving:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/approvals/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        await fetchApprovals();
      }
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const currentApprovals = activeTab === 'stage1' ? stage1 : stage2;
  const currentStage = activeTab === 'stage1' ? 1 : 2;

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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Pending Approvals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {counts.stage1 + counts.stage2} loans waiting for review
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchApprovals}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/admin/loans"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Loans
          </Link>
        </div>
      </div>

      {/* Stage Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('stage1')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            activeTab === 'stage1'
              ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Stage 1</span>
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{counts.stage1}</span>
          </div>
          <p className="text-xs text-gray-500">Initial review • Credit check • Documentation</p>
        </button>

        <button
          onClick={() => setActiveTab('stage2')}
          className={`text-left p-5 rounded-2xl border transition-all ${
            activeTab === 'stage2'
              ? 'border-indigo-300 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-500">Stage 2</span>
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{counts.stage2}</span>
          </div>
          <p className="text-xs text-gray-500">Final review • Approval • Disbursement</p>
        </button>
      </div>

      {/* Approvals List - Clean cards, no over-design */}
      {currentApprovals.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pending approvals in Stage {currentStage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentApprovals.map((loan) => (
            <div
              key={loan.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Content */}
              <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        {loan.loanId}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        currentStage === 1 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      }`}>
                        Stage {currentStage}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                    <p className="text-xs text-gray-500">{loan.purpose}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Applied</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                      {new Date(loan.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Credit Score</p>
                    <p className={`text-sm font-bold mt-0.5 ${getCreditScoreColor(loan.creditScore)}`}>
                      {loan.creditScore || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Risk Level</p>
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full mt-1 ${getRiskColor(loan.risk)}`}>
                      {loan.risk?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Amount</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{formatCurrency(loan.amount)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleApprove(loan.id, currentStage)}
                    disabled={processingId === loan.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    {processingId === loan.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(loan.id)}
                    disabled={processingId === loan.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <Link
                    href={`/admin/loans/${loan.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>
              
              {/* Simple progress bar at bottom - ONLY ONE signature element */}
              <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800">
                <div 
                  className={`h-full transition-all duration-500 ${
                    currentStage === 1 ? 'bg-amber-500' : 'bg-orange-500'
                  }`}
                  style={{ width: currentStage === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
