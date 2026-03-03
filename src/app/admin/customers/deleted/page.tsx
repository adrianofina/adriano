'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Trash2,
  RefreshCw,
  Eye,
  RotateCcw,
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  Archive,
  Clock,
  Filter,
  Sparkles,
  TrendingDown,
  UserX,
  FileText,
  ChevronRight,
  Info,
  Download,
  Shield,
  Search
} from 'lucide-react';

interface DeletedCustomer {
  id: string;
  firstName: string;
  surname: string;
  customerId: string;
  phoneNumber: string;
  email?: string;
  deletedAt: string;
  deletedBy?: {
    name: string;
    email: string;
  };
  deletionReason?: string;
  stats?: {
    totalLoans: number;
    activeLoans: number;
    documents: number;
  };
}

// ── helper for relative time ──
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Sparkline bars for stats ──
const SparkBars = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const bars = 7;
  return (
    <div className="flex items-end gap-[2px] h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.max(15, Math.round(((i + 1) / bars) * 100 * (value / (max || 1))));
        return (
          <div
            key={i}
            className="w-[3px] rounded-sm transition-all duration-300"
            style={{ height: `${Math.min(100, h)}%`, background: i === bars - 1 ? color : `${color}40` }}
          />
        );
      })}
    </div>
  );
};

export default function DeletedCustomersPage() {
  const { user } = useAuth();
  const [deletedCustomers, setDeletedCustomers] = useState<DeletedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalDeleted: 0,
    deletedToday: 0,
    deletedThisWeek: 0,
    deletedThisMonth: 0
  });

  useEffect(() => {
    fetchDeletedCustomers();
  }, [timeframe]);

  const fetchDeletedCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers/deleted?timeframe=' + timeframe);
      const data = await res.json();
      
      if (data.success) {
        setDeletedCustomers(data.customers || []);
        setStats(data.stats || {
          totalDeleted: data.customers?.length || 0,
          deletedToday: 0,
          deletedThisWeek: 0,
          deletedThisMonth: 0
        });
      }
    } catch (error) {
      console.error('Error fetching deleted customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (customerId: string) => {
    if (!confirm('Are you sure you want to restore this customer?')) return;
    
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (data.success) {
        setDeletedCustomers(deletedCustomers.filter(c => c.id !== customerId));
      } else {
        alert('Failed to restore customer: ' + data.error);
      }
    } catch (error) {
      console.error('Restore error:', error);
      alert('Failed to restore customer');
    }
  };

  const filteredCustomers = deletedCustomers.filter(c => 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber?.includes(searchTerm) ||
    c.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-red-200 dark:border-red-900 border-t-red-500 animate-spin" />
        </div>
      </div>
    );
  }

  const canRestore = ['super_admin', 'admin'].includes(user?.role || '');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  HERO HEADER                                                     ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #EF4444 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute -top-12 right-1/4 w-64 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(239,68,68,0.05) 0%, transparent 70%)' }} />

        <div className="relative px-6 py-5 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium text-red-500 dark:text-red-400">Archive</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deleted Customers</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and restore soft-deleted customers
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDeletedCustomers}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ╔══════════════════════════════════════════════════════════════════╗
            ║  STATS CARDS                                                     ║
            ╚══════════════════════════════════════════════════════════════════╝ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Deleted', value: stats.totalDeleted, icon: Archive, accent: '#EF4444', bg: 'rgba(239,68,68,0.08)', sub: 'All time' },
            { label: 'Today', value: stats.deletedToday, icon: Clock, accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)', sub: 'Last 24 hours' },
            { label: 'This Week', value: stats.deletedThisWeek, icon: Calendar, accent: '#3B82F6', bg: 'rgba(59,130,246,0.08)', sub: 'Last 7 days' },
            { label: 'This Month', value: stats.deletedThisMonth, icon: Calendar, accent: '#a855f7', bg: 'rgba(168,85,247,0.08)', sub: 'Last 30 days' }
          ].map(({ label, value, icon: Icon, accent, bg, sub }) => (
            <div key={label}
              className="relative group bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              style={{ border: `1px solid ${accent}20` }}>
              <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full" style={{ background: accent }} />
              <div className="flex items-start justify-between mb-3 pl-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none pl-3">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-3">{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-3">{sub}</p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <SparkBars value={value} max={stats.totalDeleted || 10} color={accent} />
              </div>
            </div>
          ))}
        </div>

        {/* ╔══════════════════════════════════════════════════════════════════╗
            ║  FILTERS & SEARCH                                                ║
            ╚══════════════════════════════════════════════════════════════════╝ */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-400 transition-colors" />
            <input
              type="text"
              placeholder="Search deleted customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* ╔══════════════════════════════════════════════════════════════════╗
            ║  DELETED CUSTOMERS LIST                                          ║
            ╚══════════════════════════════════════════════════════════════════╝ */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <Archive className="w-8 h-8 text-red-300 dark:text-red-700" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deleted customers</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">All customers are currently active</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-all"
                onMouseEnter={() => setHoveredId(customer.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: hoveredId === customer.id ? 'linear-gradient(135deg, rgba(239,68,68,0.02), transparent)' : ''
                }}
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full" />
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Avatar with deletion indicator */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {customer.firstName?.[0]}{customer.surname?.[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-gray-900 rounded-full border-2 border-red-200 dark:border-red-900 flex items-center justify-center">
                          <Trash2 className="w-2.5 h-2.5 text-red-500" />
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Name and ID */}
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {customer.firstName} {customer.surname}
                          </h3>
                          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {customer.customerId}
                          </span>
                          {customer.stats && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {customer.stats.totalLoans} loans
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{customer.phoneNumber}</span>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{customer.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Deletion metadata */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                            <Clock className="w-3.5 h-3.5" />
                            {formatRelativeTime(customer.deletedAt)}
                          </span>
                          
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <User className="w-3.5 h-3.5" />
                            By: {customer.deletedBy?.name || 'Unknown'}
                          </span>

                          {customer.deletionReason && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                              <Info className="w-3.5 h-3.5" />
                              {customer.deletionReason}
                            </span>
                          )}
                        </div>

                        {/* Stats badges */}
                        {customer.stats && (customer.stats.documents > 0 || customer.stats.activeLoans > 0) && (
                          <div className="flex flex-wrap items-center gap-2 mt-4">
                            {customer.stats.activeLoans > 0 && (
                              <span className="text-xs px-2 py-1 rounded-md bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                                ⚠️ {customer.stats.activeLoans} active loan{customer.stats.activeLoans > 1 ? 's' : ''} at deletion
                              </span>
                            )}
                            {customer.stats.documents > 0 && (
                              <span className="text-xs px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                📄 {customer.stats.documents} document{customer.stats.documents > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                      style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="lg:hidden">View</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform lg:hidden" />
                    </Link>
                    
                    {canRestore && (
                      <button
                        onClick={() => handleRestore(customer.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:shadow-md"
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          boxShadow: '0 2px 8px rgba(16,185,129,0.25)'
                        }}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="lg:hidden">Restore</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover indicator */}
                {hoveredId === customer.id && (
                  <div className="absolute bottom-4 right-4 text-xs text-red-500 dark:text-red-400 animate-pulse flex items-center gap-1">
                    <span>Click to view details</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}