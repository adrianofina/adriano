'use client';

import { useState } from 'react';
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
  Shield,
  AlertTriangle
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function ApprovalsPage() {
  const { userRole, canApproveStage1, canApproveStage2 } = usePermissions();
  const [activeTab, setActiveTab] = useState('stage1');

  // Mock data - will be replaced with real data from API
  const stage1Approvals = [
    {
      id: 'L-343',
      customer: 'John Doe',
      amount: 5000000,
      purpose: 'Business Expansion',
      appliedDate: '2024-03-15',
      creditScore: 680,
      risk: 'low',
      documents: 3
    },
    {
      id: 'L-347',
      customer: 'Mary Johnson',
      amount: 3500000,
      purpose: 'Education',
      appliedDate: '2024-03-14',
      creditScore: 720,
      risk: 'low',
      documents: 2
    }
  ];

  const stage2Approvals = [
    {
      id: 'L-344',
      customer: 'Jane Smith',
      amount: 3500000,
      purpose: 'Education',
      appliedDate: '2024-03-14',
      approvedBy: 'Admin User',
      approvedAt: '2024-03-15',
      creditScore: 720,
      risk: 'low'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
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

  if (!canApproveStage1 && !canApproveStage2) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to approve loans.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Review and approve loan applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stage 1 Approvals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stage1Approvals.length}</p>
            </div>
          </div>
        </div>
        
        {userRole === 'super_admin' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stage 2 Approvals</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stage2Approvals.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-8">
          {canApproveStage1 && (
            <button
              onClick={() => setActiveTab('stage1')}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'stage1'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Stage 1 Approvals ({stage1Approvals.length})
            </button>
          )}
          {canApproveStage2 && (
            <button
              onClick={() => setActiveTab('stage2')}
              className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'stage2'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Stage 2 Approvals ({stage2Approvals.length})
            </button>
          )}
        </div>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {activeTab === 'stage1' && stage1Approvals.map((loan) => (
          <div key={loan.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{loan.customer}</h3>
                      <span className="text-sm text-gray-500">#{loan.id}</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRiskColor(loan.risk)}`}>
                        {loan.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Purpose</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.purpose}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Applied</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.appliedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Credit Score</p>
                        <p className={`text-sm font-medium ${
                          loan.creditScore >= 700 ? 'text-green-600' :
                          loan.creditScore >= 600 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {loan.creditScore}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {loan.documents} documents uploaded
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:w-48">
                <Link
                  href={`/admin/loans/${loan.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  View Details
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50">
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'stage2' && stage2Approvals.map((loan) => (
          <div key={loan.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{loan.customer}</h3>
                      <span className="text-sm text-gray-500">#{loan.id}</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRiskColor(loan.risk)}`}>
                        {loan.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Purpose</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.purpose}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Credit Score</p>
                        <p className={`text-sm font-medium ${
                          loan.creditScore >= 700 ? 'text-green-600' :
                          loan.creditScore >= 600 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {loan.creditScore}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">
                          Approved by {loan.approvedBy}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {loan.approvedAt} • Stage 1 approval complete
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:w-48">
                <Link
                  href={`/admin/loans/${loan.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  View Details
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
                  <CheckCircle className="w-4 h-4" />
                  Final Approve
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50">
                  <XCircle className="w-4 h-4" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
