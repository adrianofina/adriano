'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRight,
  Download,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  UserPlus,
  DollarSign,
  Award
} from 'lucide-react';

// This will be replaced with real data from your database
const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'Laurent Adriano',
    email: 'adriandevelopment@gmail.com',
    phone: '+255784461743',
    loanId: 'L-342',
    loanAmount: 3420000,
    paidAmount: 3380000,
    remaining: 120000,
    progress: 98.8,
    dueDate: '2024-04-15',
    nextPayment: 120000,
    lastPayment: '2024-03-01',
    paymentStatus: 'on-time',
    creditScore: 750,
    risk: 'low',
    avatar: 'LA'
  },
  {
    id: 'CUST-002',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+255712345678',
    loanId: 'L-343',
    loanAmount: 5000000,
    paidAmount: 1000000,
    remaining: 4000000,
    progress: 20,
    dueDate: '2024-06-15',
    nextPayment: 500000,
    lastPayment: '2024-03-10',
    paymentStatus: 'on-time',
    creditScore: 680,
    risk: 'medium',
    avatar: 'JD'
  },
  {
    id: 'CUST-003',
    name: 'Mary Johnson',
    email: 'mary.j@example.com',
    phone: '+255756789012',
    loanId: 'L-347',
    loanAmount: 3500000,
    paidAmount: 875000,
    remaining: 2625000,
    progress: 25,
    dueDate: '2024-07-20',
    nextPayment: 350000,
    lastPayment: '2024-03-05',
    paymentStatus: 'on-time',
    creditScore: 720,
    risk: 'low',
    avatar: 'MJ'
  },
  {
    id: 'CUST-004',
    name: 'Peter Mwangi',
    email: 'peter.m@example.com',
    phone: '+255767890123',
    loanId: 'L-348',
    loanAmount: 8000000,
    paidAmount: 2000000,
    remaining: 6000000,
    progress: 25,
    dueDate: '2024-08-10',
    nextPayment: 800000,
    lastPayment: '2024-02-28',
    paymentStatus: 'late',
    creditScore: 590,
    risk: 'high',
    avatar: 'PM'
  },
  {
    id: 'CUST-005',
    name: 'Sarah Williams',
    email: 'sarah.w@example.com',
    phone: '+255778901234',
    loanId: 'L-349',
    loanAmount: 4500000,
    paidAmount: 1125000,
    remaining: 3375000,
    progress: 25,
    dueDate: '2024-09-05',
    nextPayment: 450000,
    lastPayment: '2024-03-12',
    paymentStatus: 'on-time',
    creditScore: 710,
    risk: 'low',
    avatar: 'SW'
  }
];

export default function ActiveCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [customers] = useState(mockCustomers); // This will be replaced with useCustomers() hook

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getPaymentStatusBadge = (status: string) => {
    switch(status) {
      case 'on-time':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'On Time' };
      case 'late':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Late' };
      case 'missed':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Missed' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', label: status };
    }
  };

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'low':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' };
      case 'medium':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' };
      case 'high':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' };
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.loanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = filteredCustomers.reduce((sum, c) => sum + c.remaining, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Active Customers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Customers with active loans • {customers.length} currently active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers/overview"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ← Back to Overview
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
              Active
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total active customers</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
              Outstanding
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalOutstanding)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total outstanding balance</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full">
              Average
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalOutstanding / customers.length)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Average per customer</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-full">
              Due Soon
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {customers.filter(c => c.paymentStatus === 'late').length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Customers with late payments</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Active</option>
              <option value="on-time">On Time</option>
              <option value="late">Late Payments</option>
              <option value="high-risk">High Risk</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Filter className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Loan Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Next Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCustomers.map((customer) => {
                const paymentStatus = getPaymentStatusBadge(customer.paymentStatus);
                const risk = getRiskBadge(customer.risk);
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{customer.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.loanId}</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{formatCurrency(customer.loanAmount)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Paid: {formatCurrency(customer.paidAmount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{customer.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              customer.paymentStatus === 'late' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${customer.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Left: {formatCurrency(customer.remaining)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${paymentStatus.bg} ${paymentStatus.text}`}>
                        {paymentStatus.label}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Last: {customer.lastPayment}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(customer.nextPayment)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Due: {customer.dueDate}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${risk.bg} ${risk.text}`}>
                        {customer.risk.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          View
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCustomers.length}</span> of{' '}
              <span className="font-medium">{customers.length}</span> customers
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
