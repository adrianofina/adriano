"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  CreditCard,
  Calendar,
  FileText,
  ArrowRight,
  RefreshCw
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
  approvedBy?: string;
}

export default function ApprovalsPage() {
  const [stage1, setStage1] = useState<Approval[]>([]);
  const [stage2, setStage2] = useState<Approval[]>([]);
  const [counts, setCounts] = useState({ stage1: 0, stage2: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stage1' | 'stage2'>('stage1');

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
      setStage1([]);
      setStage2([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentApprovals = activeTab === 'stage1' ? stage1 : stage2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {counts.stage1 + counts.stage2} loans waiting for review
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchApprovals}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            href="/admin/loans"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ← Back to Loans
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Stage 1 Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{counts.stage1}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Stage 2 Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{counts.stage2}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('stage1')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stage1'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stage 1 ({counts.stage1})
          </button>
          <button
            onClick={() => setActiveTab('stage2')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stage2'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stage 2 ({counts.stage2})
          </button>
        </div>
      </div>

      {/* Approval Cards */}
      <div className="space-y-3">
        {currentApprovals.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No pending approvals</p>
          </div>
        ) : (
          currentApprovals.map((loan) => (
            <div key={loan.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{loan.customer}</h3>
                    <span className="text-xs text-gray-500">#{loan.loanId}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRiskColor(loan.risk)}`}>
                      {loan.risk.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Amount</p>
                      <p className="text-sm font-bold text-gray-900 break-all">{formatCurrency(loan.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Purpose</p>
                      <p className="text-sm text-gray-600 truncate">{loan.purpose}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Applied</p>
                      <p className="text-sm text-gray-600">{loan.appliedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Credit Score</p>
                      <p className="text-sm font-medium text-gray-900">{loan.creditScore}</p>
                    </div>
                  </div>

                  {loan.approvedBy && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700">
                        ✓ Approved by {loan.approvedBy}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2">
                  <Link
                    href={`/admin/loans/${loan.id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100"
                  >
                    <FileText className="w-3 h-3" />
                    Details
                  </Link>
                  {activeTab === 'stage1' && (
                    <>
                      <button className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-3 py-1.5 border border-red-300 text-red-700 text-xs rounded-lg hover:bg-red-50">
                        Decline
                      </button>
                    </>
                  )}
                  {activeTab === 'stage2' && (
                    <button className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700">
                      Final Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
