'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  Download,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function LoansPage() {
  const { userRole, canApproveStage1, canApproveStage2, canDisburse } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - In production, this would come from your API
  const loans = [
    {
      id: 'L-342',
      customer: 'Laurent Adriano',
      customerId: 'CUST-001',
      amount: 3420000,
      paid: 3380000,
      remaining: 120000,
      purpose: 'Business Expansion',
      appliedDate: '2024-02-10',
      dueDate: '2024-04-15',
      status: 'overdue',
      stage: 3,
      approvedByStage1: 'Admin User',
      approvedByStage2: null,
      disbursedBy: null,
      interestRate: 12,
      risk: 'low'
    },
    {
      id: 'L-343',
      customer: 'John Doe',
      customerId: 'CUST-002',
      amount: 5000000,
      paid: 0,
      remaining: 5000000,
      purpose: 'Business Expansion',
      appliedDate: '2024-03-15',
      dueDate: '2024-06-15',
      status: 'pending_stage1',
      stage: 1,
      approvedByStage1: null,
      approvedByStage2: null,
      disbursedBy: null,
      interestRate: 12,
      risk: 'low'
    },
    {
      id: 'L-344',
      customer: 'Jane Smith',
      customerId: 'CUST-003',
      amount: 3500000,
      paid: 0,
      remaining: 3500000,
      purpose: 'Education',
      appliedDate: '2024-03-14',
      dueDate: '2024-06-14',
      status: 'pending_stage2',
      stage: 2,
      approvedByStage1: 'Admin User',
      approvedByStage2: null,
      disbursedBy: null,
      interestRate: 10,
      risk: 'low'
    },
    {
      id: 'L-345',
      customer: 'Robert Johnson',
      customerId: 'CUST-004',
      amount: 7200000,
      paid: 0,
      remaining: 7200000,
      purpose: 'Agriculture',
      appliedDate: '2024-03-13',
      dueDate: '2024-06-13',
      status: 'approved',
      stage: 3,
      approvedByStage1: 'Admin User',
      approvedByStage2: 'Super Admin',
      disbursedBy: null,
      interestRate: 11,
      risk: 'medium'
    },
    {
      id: 'L-346',
      customer: 'Sarah Williams',
      customerId: 'CUST-005',
      amount: 2100000,
      paid: 2100000,
      remaining: 0,
      purpose: 'Medical',
      appliedDate: '2024-02-20',
      dueDate: '2024-05-20',
      status: 'paid',
      stage: 5,
      approvedByStage1: 'Admin User',
      approvedByStage2: 'Super Admin',
      disbursedBy: 'Super Admin',
      paidBy: 'Loan Officer',
      paidAt: '2024-03-15',
      interestRate: 10,
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_stage1': return 'bg-yellow-100 text-yellow-800';
      case 'pending_stage2': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'disbursed': return 'bg-indigo-100 text-indigo-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'defaulted': return 'bg-red-200 text-red-900';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending_stage1': return 'Pending (Stage 1)';
      case 'pending_stage2': return 'Pending (Stage 2)';
      case 'approved': return 'Approved';
      case 'disbursed': return 'Disbursed';
      case 'active': return 'Active';
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'defaulted': return 'Defaulted';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && loan.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all loan applications and track their status
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {(userRole === 'super_admin' || userRole === 'admin' || userRole === 'loan_officer') && (
            <Link
              href="/admin/loans/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Loan
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Loans</p>
          <p className="text-2xl font-bold text-gray-900">342</p>
          <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-blue-600">156</p>
          <p className="text-xs text-gray-500 mt-1">TSh 892M outstanding</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">28</p>
          <p className="text-xs text-gray-500 mt-1">Stage 1: 12 | Stage 2: 16</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">42</p>
          <p className="text-xs text-gray-500 mt-1">Ready to disburse: 8</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">23</p>
          <p className="text-xs text-red-600 mt-1">TSh 4.2M at risk</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search loans by ID, customer, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Loans</option>
              <option value="pending_stage1">Pending Stage 1</option>
              <option value="pending_stage2">Pending Stage 2</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loan ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{loan.id}</p>
                      <p className="text-xs text-gray-500 mt-1">{loan.purpose}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{loan.customer}</p>
                        <p className="text-xs text-gray-500">{loan.customerId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(loan.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {loan.remaining > 0 
                        ? `${formatCurrency(loan.remaining)} left`
                        : 'Fully paid'
                      }
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                      {getStatusLabel(loan.status)}
                    </span>
                    {loan.stage === 2 && userRole === 'super_admin' && (
                      <span className="block mt-1 text-xs text-purple-600 font-medium">
                        Needs your approval
                      </span>
                    )}
                    {loan.stage === 3 && userRole === 'super_admin' && !loan.disbursedBy && (
                      <span className="block mt-1 text-xs text-green-600 font-medium">
                        Ready to disburse
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          {loan.remaining === 0 
                            ? '100%' 
                            : `${Math.round((loan.paid / loan.amount) * 100)}%`
                          }
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            loan.status === 'overdue' ? 'bg-red-500' :
                            loan.status === 'paid' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`}
                          style={{ 
                            width: loan.remaining === 0 
                              ? '100%' 
                              : `${(loan.paid / loan.amount) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        Applied: {loan.appliedDate}
                      </div>
                      {loan.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          Due: {loan.dueDate}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/loans/${loan.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      {loan.stage === 1 && canApproveStage1 && (
                        <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">
                          Approve
                        </button>
                      )}
                      {loan.stage === 2 && canApproveStage2 && (
                        <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700">
                          Final Approve
                        </button>
                      )}
                      {loan.stage === 3 && canDisburse && !loan.disbursedBy && (
                        <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                          Disburse
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
              <span className="font-medium">342</span> loans
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                3
              </button>
              <span className="text-gray-500">...</span>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                14
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
