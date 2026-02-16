'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRight,
  Download,
  Mail,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  MoreVertical,
  Send,
  PhoneCall,
  Shield,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export default function OverdueCustomersPage() {
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
  const overdueCustomers = [
    {
      id: 'CUST-001',
      name: 'Laurent Adriano',
      phone: '+255784461743',
      email: 'adriandevelopment@gmail.com',
      loanId: 'L-342',
      loanAmount: 3420000,
      paidAmount: 3380000,
      remaining: 120000,
      dueDate: '2024-03-15',
      daysOverdue: 32,
      penalty: 80000,
      totalDue: 200000,
      lastContact: '2024-03-10',
      contactMethod: 'phone',
      risk: 'high',
      avatar: 'LA',
      notes: 'Promised payment by end of week'
    },
    {
      id: 'CUST-004',
      name: 'Robert Johnson',
      phone: '+255734567890',
      email: 'robert.j@example.com',
      loanId: 'L-345',
      loanAmount: 4500000,
      paidAmount: 2000000,
      remaining: 2500000,
      dueDate: '2024-03-01',
      daysOverdue: 15,
      penalty: 150000,
      totalDue: 2650000,
      lastContact: '2024-03-12',
      contactMethod: 'sms',
      risk: 'medium',
      avatar: 'RJ',
      notes: 'Sent reminder, no response'
    },
    {
      id: 'CUST-010',
      name: 'Sarah Johnson',
      phone: '+255790123456',
      email: 'sarah.j@example.com',
      loanId: 'L-353',
      loanAmount: 2800000,
      paidAmount: 1400000,
      remaining: 1400000,
      dueDate: '2024-02-15',
      daysOverdue: 30,
      penalty: 84000,
      totalDue: 1484000,
      lastContact: '2024-03-05',
      contactMethod: 'phone',
      risk: 'high',
      avatar: 'SJ',
      notes: 'Phone disconnected'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh').replace('.00', '');
  };

  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'low':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' };
      case 'medium':
        return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' };
      case 'high':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
    }
  };

  const filteredCustomers = overdueCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.loanId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOverdue = filteredCustomers.reduce((sum, c) => sum + c.totalDue, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Overdue Customers</h1>
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="sm:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {filteredCustomers.length} customers with overdue payments
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
            <option value="all">All Overdue</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <button className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg">
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
            <option value="all">All Overdue</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Urgent Summary */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Urgent Action Required</p>
            <p className="text-xs text-red-700 dark:text-red-400 mb-3">
              Total overdue: {formatCurrency(totalOverdue)}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2">
                <p className="text-[9px] text-gray-500 dark:text-gray-400">Avg Days</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {Math.round(filteredCustomers.reduce((sum, c) => sum + c.daysOverdue, 0) / filteredCustomers.length)}d
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2">
                <p className="text-[9px] text-gray-500 dark:text-gray-400">High Risk</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {filteredCustomers.filter(c => c.risk === 'high').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {filteredCustomers.map((customer) => {
          const risk = getRiskBadge(customer.risk);
          const isExpanded = expandedRows.includes(customer.id);
          
          return (
            <div key={customer.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Main Card Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{customer.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[9px] font-medium rounded-full ${risk.bg} ${risk.text}`}>
                    {customer.risk.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Loan #{customer.loanId}</span>
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">{customer.daysOverdue} days</span>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Total Due</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(customer.totalDue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-gray-500 dark:text-gray-400">Penalty included</span>
                    <span className="text-[9px] text-gray-600 dark:text-gray-400">
                      +{formatCurrency(customer.penalty)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Due {customer.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Phone className="w-3 h-3" />
                    <span>Last: {customer.lastContact}</span>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              <button
                onClick={() => toggleRow(customer.id)}
                className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
              >
                <span className="text-[9px] text-gray-600 dark:text-gray-400">
                  {isExpanded ? 'Show less' : 'Show notes & actions'}
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    "{customer.notes}"
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg">
                      <PhoneCall className="w-3 h-3" />
                      Call
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg">
                      <Send className="w-3 h-3" />
                      SMS
                    </button>
                  </div>
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="block w-full text-center px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-lg"
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Overdue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Amount Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Last Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredCustomers.map((customer) => {
                const risk = getRiskBadge(customer.risk);
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{customer.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm font-medium">{customer.daysOverdue}d</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Due {customer.dueDate}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(customer.totalDue)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">+{formatCurrency(customer.penalty)} penalty</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">{customer.lastContact}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">"{customer.notes}"</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${risk.bg} ${risk.text}`}>
                        {customer.risk.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                          <PhoneCall className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-lg"
                        >
                          View
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
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
