'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Download,
  UserPlus,
  FileText,
  Clock,
  MapPin,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  region?: string;
  createdAt: string;
  _count?: { loans: number };
  lastActive?: string;
}

// ── helper for relative time ──
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Sparkline bars for stats ──
const SparkBars = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const bars = 7;
  return (
    <div className="flex items-end gap-[2px] h-6">
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeToday: 0,
    totalLoans: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers');
      const data = await res.json();
      
      if (data.success) {
        setCustomers(data.data || []);
        // Calculate stats
        const now = new Date();
        const today = new Date(now.setHours(0,0,0,0));
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        setStats({
          totalCustomers: data.data?.length || 0,
          activeToday: data.data?.filter((c: any) => new Date(c.updatedAt) >= today).length || 0,
          totalLoans: data.data?.reduce((acc: number, c: any) => acc + (c._count?.loans || 0), 0) || 0,
          newThisMonth: data.data?.filter((c: any) => new Date(c.createdAt) >= monthStart).length || 0
        });
      } else {
        setError(data.error || 'Failed to fetch customers');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      const res = await fetch(`/api/admin/customers/${customerToDelete.id}/soft-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Deleted from list' })
      });

      const data = await res.json();

      if (data.success) {
        setCustomers(customers.filter(c => c.id !== customerToDelete.id));
        setShowDeleteModal(false);
        setCustomerToDelete(null);
      } else {
        alert(data.error || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

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

        <div className="relative px-6 py-5 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">Customer directory</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and view all customers
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchCustomers}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <RefreshCw className="w-4 h-4" />
              </button>
              <Link
                href="/admin/customers/export"
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 transition-all flex items-center gap-2"
                style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <Download className="w-4 h-4" />
                Export
              </Link>
              <Link
                href="/admin/customers/new"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.25)'
                }}>
                <UserPlus className="w-4 h-4" />
                New Customer
              </Link>
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
            { label: 'Total Customers', value: stats.totalCustomers, icon: Users, accent: '#6366f1', bg: 'rgba(99,102,241,0.08)', sub: 'All time' },
            { label: 'Active Today', value: stats.activeToday, icon: Clock, accent: '#10B981', bg: 'rgba(16,185,129,0.08)', sub: 'Last 24 hours' },
            { label: 'Total Loans', value: stats.totalLoans, icon: TrendingUp, accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)', sub: 'Across all customers' },
            { label: 'New This Month', value: stats.newThisMonth, icon: Calendar, accent: '#a855f7', bg: 'rgba(168,85,247,0.08)', sub: 'Since ' + new Date().toLocaleDateString('en-US', { month: 'short' }) }
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
                <SparkBars value={value} max={stats.totalCustomers || 10} color={accent} />
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
                placeholder="Search by name, phone, email, or ID..."
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
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)' }}>
              <Users className="w-8 h-8 text-indigo-300 dark:text-indigo-700" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first customer</p>
            <Link
              href="/admin/customers/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)'
              }}>
              <Plus className="w-4 h-4" />
              Add Customer
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Customer', 'Contact', 'Loans', 'Joined', 'Last Active', ''].map(h => (
                      <th key={h} className="px-6 py-4 text-left">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{h}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCustomers.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className="group relative cursor-pointer transition-all hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10"
                      onMouseEnter={() => setHoveredId(customer.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => window.location.href = `/admin/customers/${customer.id}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {customer.firstName[0]}{customer.surname[0]}
                            </div>
                            {hoveredId === customer.id && (
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
                              {hoveredId === customer.id && (
                                <ChevronRight className="w-3 h-3 text-indigo-400 animate-pulse" />
                              )}
                            </div>
                            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">{customer.customerId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {customer.phoneNumber}
                          </p>
                          {customer.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {customer.email}
                            </p>
                          )}
                          {(customer.city || customer.region) && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" />
                              {[customer.city, customer.region].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                          <FileText className="w-3.5 h-3.5" />
                          {customer._count?.loans || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(customer.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatRelativeTime(customer.updatedAt || customer.createdAt)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                            onClick={(e) => e.stopPropagation()}
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </Link>
                          <Link
                            href={`/admin/customers/${customer.id}/edit`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                            onClick={(e) => e.stopPropagation()}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(customer);
                            }}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Customer</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action can be undone later</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">
                {customerToDelete.firstName} {customerToDelete.surname}
              </span>? They will be moved to the deleted customers archive.
            </p>

            {customerToDelete._count?.loans && customerToDelete._count.loans > 0 && (
              <div className="mb-6 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  This customer has {customerToDelete._count.loans} loan{customerToDelete._count.loans > 1 ? 's' : ''}. Deleting will archive them as well.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all hover:shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.25)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}