'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  Search, 
  Filter, 
  ArrowRight,
  Download,
  Award,
  Star,
  TrendingUp,
  Calendar,
  DollarSign,
  MoreVertical,
  Mail,
  Phone,
  ThumbsUp,
  Users,
  Gift,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export default function CompletedCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  // Mock data
  const completedCustomers = [
    {
      id: 'CUST-003',
      name: 'Jane Smith',
      phone: '+255723456789',
      email: 'jane.smith@example.com',
      totalLoans: 2,
      totalBorrowed: 8000000,
      totalRepaid: 8000000,
      lastLoanId: 'L-338',
      lastLoanAmount: 5000000,
      completionDate: '2024-02-15',
      memberSince: '2023-11-10',
      creditScore: 720,
      rating: 'Excellent',
      avatar: 'JS',
      referrals: 2,
      onTimePayments: 100
    },
    {
      id: 'CUST-005',
      name: 'Sarah Williams',
      phone: '+255745678901',
      email: 'sarah.w@example.com',
      totalLoans: 1,
      totalBorrowed: 3000000,
      totalRepaid: 3000000,
      lastLoanId: 'L-335',
      lastLoanAmount: 3000000,
      completionDate: '2024-01-10',
      memberSince: '2023-12-12',
      creditScore: 710,
      rating: 'Excellent',
      avatar: 'SW',
      referrals: 1,
      onTimePayments: 100
    },
    {
      id: 'CUST-012',
      name: 'Michael Mushi',
      phone: '+255712345679',
      email: 'michael.m@example.com',
      totalLoans: 3,
      totalBorrowed: 12000000,
      totalRepaid: 12000000,
      lastLoanId: 'L-340',
      lastLoanAmount: 5000000,
      completionDate: '2024-03-01',
      memberSince: '2023-08-15',
      creditScore: 780,
      rating: 'Excellent',
      avatar: 'MM',
      referrals: 4,
      onTimePayments: 100
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh').replace('.00', '');
  };

  const getRatingBadge = (rating: string) => {
    switch(rating) {
      case 'Excellent':
        return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' };
      case 'Good':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
    }
  };

  const filteredCustomers = completedCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastLoanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRepaid = filteredCustomers.reduce((sum, c) => sum + c.totalRepaid, 0);
  const avgCreditScore = Math.round(filteredCustomers.reduce((sum, c) => sum + c.creditScore, 0) / filteredCustomers.length);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Completed Loans</h1>
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="sm:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {filteredCustomers.length} customers successfully paid off loans
        </p>
      </div>

      {/* Mobile Filter Panel */}
      {isMobileFilterOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900 dark:text-white">Filters</span>
            <button onClick={() => setIsMobileFilterOpen(false)}>
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg mb-3"
          />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg mb-3"
          >
            <option value="all">All Completed</option>
            <option value="excellent">Excellent Rating</option>
            <option value="recent">Recently Completed</option>
          </select>
          <button className="w-full px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg">
            Apply Filters
          </button>
        </div>
      )}

      {/* Desktop Search */}
      <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or loan ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Completed</option>
            <option value="excellent">Excellent Rating</option>
            <option value="recent">Recently Completed</option>
          </select>
          <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Success Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <Award className="w-6 h-6 text-purple-100 mb-2" />
          <p className="text-xl font-bold">{filteredCustomers.length}</p>
          <p className="text-xs text-purple-100">Customers</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <DollarSign className="w-6 h-6 text-green-100 mb-2" />
          <p className="text-xl font-bold">{formatCurrency(totalRepaid).replace('TSh', '')}</p>
          <p className="text-xs text-green-100">Repaid</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <TrendingUp className="w-6 h-6 text-blue-100 mb-2" />
          <p className="text-xl font-bold">{avgCreditScore}</p>
          <p className="text-xs text-blue-100">Avg Score</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <Users className="w-6 h-6 text-amber-100 mb-2" />
          <p className="text-xl font-bold">{filteredCustomers.reduce((sum, c) => sum + c.referrals, 0)}</p>
          <p className="text-xs text-amber-100">Referrals</p>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filteredCustomers.map((customer) => {
          const rating = getRatingBadge(customer.rating);
          const isExpanded = expandedRows.includes(customer.id);
          
          return (
            <div key={customer.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Main Card Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{customer.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[9px] font-medium rounded-full ${rating.bg} ${rating.text}`}>
                    {customer.rating}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">Total Loans</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{customer.totalLoans}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">Total Repaid</p>
                    <p className="text-sm font-bold text-green-600">{formatCurrency(customer.totalRepaid)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Completed: {customer.completionDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Gift className="w-3 h-3 text-purple-500" />
                    <span>{customer.referrals} referrals</span>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              <button
                onClick={() => toggleRow(customer.id)}
                className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
              >
                <span className="text-[9px] text-gray-600 dark:text-gray-400">
                  {isExpanded ? 'Show less' : 'Show more details'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Last loan: {customer.lastLoanId} • {formatCurrency(customer.lastLoanAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Credit score: {customer.creditScore} • {customer.onTimePayments}% on-time
                    </span>
                  </div>
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="block w-full text-center px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg"
                  >
                    View Full Profile
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Loan History</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Completed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Credit Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Referrals</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCustomers.map((customer) => {
                const rating = getRatingBadge(customer.rating);
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{customer.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.totalLoans} loans</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(customer.totalBorrowed)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">{customer.completionDate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{customer.creditScore}</span>
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${(customer.creditScore / 850) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${rating.bg} ${rating.text}`}>
                        {customer.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Gift className="w-3 h-3 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{customer.referrals}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
