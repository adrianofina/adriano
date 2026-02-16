'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Calendar,
  UserPlus,
  FileText,
  Shield,
  Award,
  Brain,
  Target,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CustomerOverviewPage() {
  const [dateRange, setDateRange] = useState('month');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'segments']);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle section expansion on mobile
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Summary statistics
  const stats = [
    {
      title: 'Total Customers',
      value: '1,247',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      details: '32 new this month'
    },
    {
      title: 'Active Loans',
      value: '342',
      change: '+8.1%',
      trend: 'up',
      icon: CreditCard,
      color: 'green',
      details: 'TSh 892M outstanding'
    },
    {
      title: 'Overdue Payments',
      value: '23',
      change: '-5.2%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'red',
      details: 'TSh 4.2M at risk'
    },
    {
      title: 'Completed Loans',
      value: '156',
      change: '+15.3%',
      trend: 'up',
      icon: CheckCircle,
      color: 'purple',
      details: '98% repayment rate'
    }
  ];

  // Customer segments
  const segments = [
    {
      name: 'Active Customers',
      description: 'Currently have active loans',
      count: 342,
      value: '892M',
      icon: CreditCard,
      color: 'green',
      href: '/admin/customers/active',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      name: 'Overdue Customers',
      description: 'Past due payment date',
      count: 23,
      value: '4.2M',
      icon: AlertTriangle,
      color: 'red',
      href: '/admin/customers/overdue',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-300',
      urgent: true
    },
    {
      name: 'Completed',
      description: 'Fully paid all loans',
      count: 156,
      value: '1.2B',
      icon: CheckCircle,
      color: 'purple',
      href: '/admin/customers/completed',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300'
    },
    {
      name: 'Pending Approval',
      description: 'Awaiting loan approval',
      count: 28,
      value: '124M',
      icon: Clock,
      color: 'yellow',
      href: '/admin/customers/pending',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-300'
    },
    {
      name: 'High Risk',
      description: 'Critical credit score',
      count: 8,
      value: '45M',
      icon: Shield,
      color: 'red',
      href: '/admin/customers/risk-analysis',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-300',
      urgent: true
    },
    {
      name: 'New Applications',
      description: 'Last 7 days',
      count: 15,
      value: '67M',
      icon: UserPlus,
      color: 'blue',
      href: '/admin/customers/pending',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300'
    }
  ];

  // Recent customers with status (simplified for mobile)
  const recentCustomers = [
    {
      id: 'CUST-001',
      name: 'Laurent Adriano',
      phone: '+255784461743',
      loanStatus: 'overdue',
      loanAmount: 3420000,
      paidAmount: 3380000,
      dueDate: '2024-04-15',
      risk: 'low'
    },
    {
      id: 'CUST-002',
      name: 'John Doe',
      phone: '+255712345678',
      loanStatus: 'active',
      loanAmount: 5000000,
      paidAmount: 1000000,
      dueDate: '2024-06-15',
      risk: 'medium'
    },
    {
      id: 'CUST-003',
      name: 'Jane Smith',
      phone: '+255723456789',
      loanStatus: 'completed',
      loanAmount: 3000000,
      paidAmount: 3000000,
      dueDate: '2024-01-10',
      risk: 'low'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh').replace('.00', '');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Active' };
      case 'overdue':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Overdue' };
      case 'completed':
        return { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', label: 'Completed' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300', label: status };
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Customer Overview
          </h1>
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="sm:hidden p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Complete view of your customer portfolio
        </p>

        {/* Mobile Filter Panel */}
        {isMobileFilterOpen && (
          <div className="sm:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-900 dark:text-white">Filters</span>
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                Apply
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg">
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Desktop Actions - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/admin/customers/import"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Import
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Stats Section - Collapsible on Mobile */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('stats')}
          className="sm:hidden w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <span className="font-medium text-gray-900 dark:text-white">Key Statistics</span>
          {expandedSections.includes('stats') ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        <div className={`${!expandedSections.includes('stats') && isMobile ? 'hidden' : 'block'} p-4 sm:p-5`}>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 sm:p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <span className={`text-[9px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      stat.trend === 'up' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">{stat.title}</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-[8px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">{stat.details}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Segments - Collapsible on Mobile */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <button
          onClick={() => toggleSection('segments')}
          className="sm:hidden w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <span className="font-medium text-gray-900 dark:text-white">Customer Segments</span>
          {expandedSections.includes('segments') ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        <div className={`${!expandedSections.includes('segments') && isMobile ? 'hidden' : 'block'} p-4 sm:p-5`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {segments.map((segment) => {
              const Icon = segment.icon;
              return (
                <Link
                  key={segment.name}
                  href={segment.href}
                  className={`block p-3 sm:p-4 ${segment.bgColor} rounded-lg border border-${segment.color}-200 dark:border-${segment.color}-900/30 hover:shadow-md transition-all group`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-1.5 sm:p-2 bg-${segment.color}-100 dark:bg-${segment.color}-900/30 rounded-lg`}>
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${segment.color}-600 dark:text-${segment.color}-400`} />
                    </div>
                    {segment.urgent && (
                      <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[8px] sm:text-xs font-medium rounded-full animate-pulse">
                        Urgent
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">{segment.name}</h3>
                  <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 mb-2">{segment.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{segment.count}</span>
                    <span className="text-[9px] sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                      {segment.value}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Customers - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <p className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Latest customer updates
            </p>
          </div>
          <Link
            href="/admin/customers/active"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {recentCustomers.map((customer) => {
            const status = getStatusBadge(customer.loanStatus);
            const progress = Math.round((customer.paidAmount / customer.loanAmount) * 100);
            
            return (
              <Link
                key={customer.id}
                href={`/admin/customers/${customer.id}`}
                className="block p-4 border-b border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                  </div>
                  <span className={`px-2 py-1 text-[9px] font-medium rounded-full ${status.bg} ${status.text}`}>
                    {status.label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatCurrency(customer.loanAmount)}
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {progress}% paid
                  </span>
                </div>
                
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${
                      customer.loanStatus === 'overdue' ? 'bg-red-500' :
                      customer.loanStatus === 'completed' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-[9px] text-gray-500 dark:text-gray-400">
                  <span>Due: {customer.dueDate}</span>
                  <span className="flex items-center gap-1">
                    View details
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentCustomers.map((customer) => {
                const status = getStatusBadge(customer.loanStatus);
                const progress = Math.round((customer.paidAmount / customer.loanAmount) * 100);
                
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 sm:px-5 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(customer.loanAmount)}
                      </p>
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              customer.loanStatus === 'overdue' ? 'bg-red-500' :
                              customer.loanStatus === 'completed' ? 'bg-green-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3 text-sm text-gray-900 dark:text-white">
                      {customer.dueDate}
                    </td>
                    <td className="px-4 sm:px-5 py-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
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

        {/* Mobile View All Link */}
        <div className="sm:hidden p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/admin/customers/active"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
          >
            View All Customers
          </Link>
        </div>
      </div>

      {/* Quick Insights - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Risk Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            Risk Distribution
          </h3>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">Low Risk</span>
                <span className="text-[9px] sm:text-xs font-medium text-gray-900 dark:text-white">845</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '68%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">Medium Risk</span>
                <span className="text-[9px] sm:text-xs font-medium text-gray-900 dark:text-white">354</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: '28%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">High Risk</span>
                <span className="text-[9px] sm:text-xs font-medium text-gray-900 dark:text-white">48</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '4%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            Loan Performance
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">On-Time</span>
              <span className="text-[9px] sm:text-xs font-medium text-green-600 dark:text-green-400">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">Late</span>
              <span className="text-[9px] sm:text-xs font-medium text-yellow-600 dark:text-yellow-400">6%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">Defaulted</span>
              <span className="text-[9px] sm:text-xs font-medium text-red-600 dark:text-red-400">2%</span>
            </div>
          </div>
        </div>

        {/* Upcoming Due Dates */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            Upcoming Due Dates
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">Next 7 days</span>
              <span className="text-[9px] sm:text-xs font-medium text-gray-900 dark:text-white">24 loans</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">Next 30 days</span>
              <span className="text-[9px] sm:text-xs font-medium text-gray-900 dark:text-white">78 loans</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-xs text-gray-600 dark:text-gray-400">Next 90 days</span>
              <span className="text-[9px] sm:text-xs font-medium text-gray-900 dark:text-white">156 loans</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
