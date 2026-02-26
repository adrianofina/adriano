"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  Shield,
  UserPlus,
  RefreshCw,
  Filter,
  Download,
  Search,
  PieChart,
  BarChart3,
  Activity,
  Eye,
  Edit,
  MoreHorizontal,
  Upload,
  FileText,
  FileSignature,
  X,
  Plus,
  Home,
  Trash2,
  Archive,
  History,
  UserCheck,
  UserX,
  Skull
} from 'lucide-react';

interface DeletedItem {
  id: string;
  entityType: string;
  entityName: string;
  deletedBy: string;
  deletedByRole: string;
  deletedAt: string;
  reason?: string;
  details?: any;
}

export default function OverviewPage() {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [stats, setStats] = useState({
    totalDeleted: 0,
    deletedToday: 0,
    deletedThisWeek: 0,
    deletedThisMonth: 0
  });

  useEffect(() => {
    fetchDeletedItems();
  }, []);

  const fetchDeletedItems = async () => {
    try {
      const res = await fetch('/api/admin/audit/deleted');
      const data = await res.json();
      
      if (data.success) {
        setDeletedItems(data.items);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching deleted items:', error);
    } finally {
      setLoading(false);
    }
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

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-100 text-purple-700';
      case 'admin': return 'bg-blue-100 text-blue-700';
      case 'loan_officer': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor system activity and deleted records
          </p>
        </div>
        <button
          onClick={fetchDeletedItems}
          className="p-2 border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Skull className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-bold">{stats.totalDeleted}</span>
          </div>
          <p className="text-sm text-gray-600">Total Deleted</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-bold">{stats.deletedToday}</span>
          </div>
          <p className="text-sm text-gray-600">Deleted Today</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold">{stats.deletedThisWeek}</span>
          </div>
          <p className="text-sm text-gray-600">This Week</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold">{stats.deletedThisMonth}</span>
          </div>
          <p className="text-sm text-gray-600">This Month</p>
        </div>
      </div>

      {/* Deleted Items Timeline */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Deleted Items Timeline</h2>
          </div>
          <div className="flex gap-2">
            {['day', 'week', 'month', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1 text-sm rounded-lg ${
                  timeframe === period
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {deletedItems.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No deleted items found</p>
            </div>
          ) : (
            deletedItems.map((item, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.entityName}
                      </h3>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {item.entityType}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Deleted by <span className="font-medium">{item.deletedBy}</span>
                      {item.reason && ` • Reason: ${item.reason}`}
                    </p>

                    <div className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getRoleBadgeColor(item.deletedByRole)}`}>
                        {item.deletedByRole}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(item.deletedAt)}
                      </span>
                    </div>

                    {/* Details expandable */}
                    {item.details && (
                      <details className="mt-3">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                          View details
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs overflow-auto">
                          {JSON.stringify(item.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/audit"
          className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Full Audit Log</h3>
          </div>
          <p className="text-sm text-gray-600">View complete audit trail of all actions</p>
        </Link>

        <Link
          href="/admin/reports/deleted"
          className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Deletion Reports</h3>
          </div>
          <p className="text-sm text-gray-600">Generate reports on deleted records</p>
        </Link>

        <Link
          href="/admin/customers"
          className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Active Customers</h3>
          </div>
          <p className="text-sm text-gray-600">View all active (non-deleted) customers</p>
        </Link>
      </div>
    </div>
  );
}
