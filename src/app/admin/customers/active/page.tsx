'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, DollarSign, TrendingUp, Clock, RefreshCw,
  Plus, Search, Filter, ArrowUpRight, Eye,
  Phone, Mail, Calendar, UserCheck, Sparkles,
  CreditCard, AlertCircle, CheckCircle2, Zap,
  ChevronRight, MoreHorizontal, Download, FileText
} from 'lucide-react';

interface ActiveCustomer {
  id: string;
  firstName: string;
  surname: string;
  phone: string;
  email?: string;
  loanId: string;
  loanAmount: number;
  remaining: number;
  progress: number;
  paymentStatus: string;
  nextPayment: number;
  dueDate: string;
  lastPayment?: string;
  creditScore?: number;
}

interface Stats {
  total: number;
  totalOutstanding: number;
  averageLoan: number;
  latePayments: number;
}

// ── helper for currency formatting ──
const formatCurrency = (amount: number) => {
  if (!amount && amount !== 0) return 'TSh 0';
  if (amount >= 1_000_000_000) return `TSh ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `TSh ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `TSh ${(amount / 1_000).toFixed(1)}K`;
  return `TSh ${amount.toLocaleString()}`;
};

// ── Sparkline bars for visual flair ──
const SparkBars = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const bars = 7;
  return (
    <div className="flex items-end gap-[2px] h-6">
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.max(15, Math.round(((i + 1) / bars) * 100 * (value / (max || 1))));
        return (
          <div
            key={i}
            className="w-[3px] rounded-sm transition-all duration-300 group-hover:h-[calc(100%+4px)]"
            style={{ height: `${Math.min(100, h)}%`, background: i === bars - 1 ? color : `${color}40` }}
          />
        );
      })}
    </div>
  );
};

export default function ActiveCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<ActiveCustomer[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    totalOutstanding: 0,
    averageLoan: 0,
    latePayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers/active');
      const data = await res.json();
      
      setCustomers(data.customers || []);
      
      const totalOutstanding = data.customers?.reduce((sum: number, c: any) => sum + (c.remaining || 0), 0) || 0;
      setStats({
        total: data.customers?.length || 0,
        totalOutstanding: totalOutstanding,
        averageLoan: data.customers?.length > 0 ? Math.round(totalOutstanding / data.customers.length) : 0,
        latePayments: data.customers?.filter((c: any) => c.paymentStatus === 'late').length || 0
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.loanId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  HERO HEADER                                                     ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute -top-12 right-1/4 w-64 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

        <div className="relative px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">Active portfolio</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Customers</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stats.total} customer{stats.total !== 1 ? 's' : ''} with active loans
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/admin/customers/export')}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 transition-all flex items-center gap-2"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => router.push('/admin/customers/new')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.25)'
                }}>
                <Plus className="w-4 h-4" />
                New Customer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">

        {/* ╔══════════════════════════════════════════════════════════════════╗
            ║  STAT CARDS                                                      ║
            ╚══════════════════════════════════════════════════════════════════╝ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Customers', value: stats.total, icon: Users, accent: '#6366f1', bg: 'rgba(99,102,241,0.08)', change: '+2 this month', positive: true },
            { label: 'Total Outstanding', value: formatCurrency(stats.totalOutstanding), icon: DollarSign, accent: '#10B981', bg: 'rgba(16,185,129,0.08)', sub: 'Principal + interest' },
            { label: 'Average per Customer', value: formatCurrency(stats.averageLoan), icon: TrendingUp, accent: '#a855f7', bg: 'rgba(168,85,247,0.08)', sub: 'Per active loan' },
            { label: 'Late Payments', value: stats.latePayments, icon: Clock, accent: '#EF4444', bg: 'rgba(239,68,68,0.08)', sub: stats.latePayments === 0 ? 'All payments on time' : 'Needs attention' }
          ].map(({ label, value, icon: Icon, accent, bg, change, sub, positive }) => (
            <div key={label}
              className="relative group bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              style={{ border: `1px solid ${accent}20` }}>
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full" style={{ background: accent }} />
              <div className="flex items-start justify-between mb-3 pl-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                {change && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none pl-3">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-3">{label}</p>
              {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-3">{sub}</p>}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <SparkBars value={typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) || 0 : value} max={100} color={accent} />
              </div>
            </div>
          ))}
        </div>

        {/* ╔══════════════════════════════════════════════════════════════════╗
            ║  SEARCH & FILTER                                                 ║
            ╚══════════════════════════════════════════════════════════════════╝ */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, phone, or loan ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all"
              />
            </div>
            <button className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 transition-all group">
              <Filter className="w-4 h-4 group-hover:text-indigo-500 transition-colors" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* ╔══════════════════════════════════════════════════════════════════╗
            ║  CUSTOMERS TABLE                                                 ║
            ╚══════════════════════════════════════════════════════════════════╝ */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Customer', 'Loan Details', 'Progress', 'Payment Status', 'Next Payment'].map(h => (
                    <th key={h} className="px-6 py-4 text-left">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{h}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, idx) => (
                  <tr
                    key={customer.id}
                    className="group relative cursor-pointer transition-all hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10"
                    style={{ borderBottom: idx < filteredCustomers.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                    onClick={() => router.push(`/admin/customers/${customer.id}`)}
                    onMouseEnter={() => setHoveredRow(customer.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {customer.firstName?.[0]}{customer.surname?.[0]}
                          </div>
                          {hoveredRow === customer.id && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                              <Eye className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {customer.firstName} {customer.surname}
                            </p>
                            {hoveredRow === customer.id && (
                              <ChevronRight className="w-3 h-3 text-indigo-400 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </p>
                            {customer.email && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{customer.loanId}</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(customer.loanAmount)}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="w-40">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{customer.progress}%</span>
                        </div>
                        <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${customer.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] mt-2">
                          <span className="text-gray-400 dark:text-gray-500">Left</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(customer.remaining)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                        customer.paymentStatus === 'late'
                          ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {customer.paymentStatus === 'late' ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {customer.paymentStatus === 'late' ? 'Late' : 'On Time'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(customer.nextPayment)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {customer.dueDate || 'N/A'}
                        </p>
                        {customer.lastPayment && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-600">Last: {customer.lastPayment}</p>
                        )}
                      </div>
                    </td>

                    {/* Hover overlay indicator */}
                    {hoveredRow === customer.id && (
                      <td className="absolute inset-y-0 right-0 flex items-center pr-6">
                        <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 text-xs font-medium bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-900">
                          <span>View details</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)' }}>
                        <Users className="w-8 h-8 text-indigo-300 dark:text-indigo-700" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No customers found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Try adjusting your search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium text-gray-700 dark:text-gray-300">1</span> to{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">{filteredCustomers.length}</span> of{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">{filteredCustomers.length}</span> results
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                  1
                </button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}