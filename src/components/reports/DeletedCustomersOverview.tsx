"use client";

import { useState, useEffect } from 'react';
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
  Archive,
  Clock,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import Link from 'next/link';

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
    documents: number;
  };
}

export default function DeletedCustomersOverview() {
  const { user } = useAuth();
  const [deletedCustomers, setDeletedCustomers] = useState<DeletedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');
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

  const exportToCSV = () => {
    const headers = ['Name', 'Customer ID', 'Phone', 'Email', 'Deleted At', 'Deleted By', 'Reason', 'Loans', 'Documents'];
    const rows = deletedCustomers.map(c => [
      `${c.firstName} ${c.surname}`,
      c.customerId,
      c.phoneNumber,
      c.email || '',
      new Date(c.deletedAt).toLocaleString(),
      c.deletedBy?.name || 'Unknown',
      c.deletionReason || '',
      c.stats?.totalLoans || 0,
      c.stats?.documents || 0
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deleted-customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 7) return `${diffDays} day ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Deleted Records Overview</h2>
          <div className="flex gap-2">
            <button
              onClick={fetchDeletedCustomers}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={exportToCSV}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Archive className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Total Deleted</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalDeleted}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <p className="text-2xl font-bold">{stats.deletedToday}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600">This Week</span>
            </div>
            <p className="text-2xl font-bold">{stats.deletedThisWeek}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">This Month</span>
            </div>
            <p className="text-2xl font-bold">{stats.deletedThisMonth}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Deleted Customers List */}
      {deletedCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deleted records</h3>
          <p className="text-gray-600 dark:text-gray-400">All customers are currently active</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deletedCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {customer.firstName} {customer.surname}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.customerId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{customer.phoneNumber}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Deleted by: {customer.deletedBy?.name || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(customer.deletedAt)}
                    </span>
                    {customer.deletionReason && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        Reason: {customer.deletionReason}
                      </span>
                    )}
                    {customer.stats && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 rounded">
                        {customer.stats.totalLoans} loans, {customer.stats.documents} docs
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  {['super_admin', 'admin'].includes(user?.role || '') && (
                    <button
                      onClick={() => handleRestore(customer.id)}
                      className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                      title="Restore Customer"
                    >
                      <RotateCcw className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
