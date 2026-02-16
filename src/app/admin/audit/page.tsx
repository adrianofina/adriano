'use client';

import { useState } from 'react';
import { 
  Archive, 
  Search, 
  Filter, 
  Download,
  User,
  CreditCard,
  Users,
  Settings,
  Shield,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function AuditPage() {
  const { userRole, canAuditLogs } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterDate, setFilterDate] = useState('today');

  // Mock data - In production, this would come from your API
  const auditLogs = [
    {
      id: 'AUD-001',
      timestamp: '2024-03-15 14:23:45',
      user: 'Super Admin',
      userRole: 'super_admin',
      action: 'LOAN_DISBURSED',
      entityType: 'loan',
      entityId: 'L-345',
      details: {
        amount: 7200000,
        customer: 'Robert Johnson',
        method: 'bank_transfer',
        reference: 'TRX-789012'
      },
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AUD-002',
      timestamp: '2024-03-15 11:15:22',
      user: 'Admin User',
      userRole: 'admin',
      action: 'LOAN_APPROVED_STAGE1',
      entityType: 'loan',
      entityId: 'L-344',
      details: {
        amount: 3500000,
        customer: 'Jane Smith'
      },
      ipAddress: '192.168.1.101'
    },
    {
      id: 'AUD-003',
      timestamp: '2024-03-15 09:45:10',
      user: 'Super Admin',
      userRole: 'super_admin',
      action: 'LOAN_APPROVED_STAGE2',
      entityType: 'loan',
      entityId: 'L-345',
      details: {
        amount: 7200000,
        customer: 'Robert Johnson'
      },
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AUD-004',
      timestamp: '2024-03-14 16:30:00',
      user: 'Loan Officer',
      userRole: 'loan_officer',
      action: 'CUSTOMER_CREATED',
      entityType: 'customer',
      entityId: 'CUST-006',
      details: {
        customerName: 'Peter Mwangi',
        method: 'manual_upload'
      },
      ipAddress: '192.168.1.102'
    },
    {
      id: 'AUD-005',
      timestamp: '2024-03-14 14:12:33',
      user: 'Admin User',
      userRole: 'admin',
      action: 'LOAN_MARKED_PAID',
      entityType: 'loan',
      entityId: 'L-346',
      details: {
        amount: 2100000,
        customer: 'Sarah Williams'
      },
      ipAddress: '192.168.1.101'
    },
    {
      id: 'AUD-006',
      timestamp: '2024-03-14 10:05:17',
      user: 'Customer Service',
      userRole: 'customer_service',
      action: 'CUSTOMER_UPLOADED',
      entityType: 'customer',
      entityId: 'CUST-007',
      details: {
        customerName: 'Mary Johnson',
        fileName: 'customers_march_2024.csv'
      },
      ipAddress: '192.168.1.103'
    }
  ];

  const getActionColor = (action: string) => {
    if (action.includes('DISBURSED')) return 'bg-green-100 text-green-800';
    if (action.includes('APPROVED')) return 'bg-blue-100 text-blue-800';
    if (action.includes('CREATED') || action.includes('UPLOADED')) return 'bg-purple-100 text-purple-800';
    if (action.includes('PAID')) return 'bg-emerald-100 text-emerald-800';
    if (action.includes('REJECTED') || action.includes('DELETED')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('DISBURSED')) return DollarSign;
    if (action.includes('APPROVED')) return CheckCircle;
    if (action.includes('CREATED') || action.includes('UPLOADED')) return FileText;
    if (action.includes('PAID')) return CheckCircle;
    if (action.includes('REJECTED')) return XCircle;
    return Clock;
  };

  // Check permission - Super Admin only
  if (!canAuditLogs) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            This page is only accessible to Super Administrators.
            You don't have permission to view audit logs.
          </p>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500">
              Your current role: <span className="font-medium text-gray-700">{userRole?.replace('_', ' ').toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-600 mt-2">
          Complete system activity log. All actions are recorded for compliance and security.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Archive className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,247</p>
          <p className="text-sm text-gray-600 mt-1">Total Events</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">342</p>
          <p className="text-sm text-gray-600 mt-1">Approvals</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">86</p>
          <p className="text-sm text-gray-600 mt-1">Disbursements</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">124</p>
          <p className="text-sm text-gray-600 mt-1">User Actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by user, action, or entity ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="approval">Approvals</option>
              <option value="disbursement">Disbursements</option>
              <option value="customer">Customer Actions</option>
              <option value="loan">Loan Actions</option>
            </select>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{log.timestamp.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500">{log.timestamp.split(' ')[1]}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.user}</p>
                          <p className="text-xs text-gray-500">{log.userRole.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${getActionColor(log.action)}`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.entityType}</p>
                        <p className="text-xs text-gray-500">{log.entityId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1">
                            <span className="text-xs text-gray-500 capitalize">{key}:</span>
                            <span className="text-xs font-medium text-gray-900">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-600">{log.ipAddress}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of{' '}
              <span className="font-medium">1,247</span> events
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
                42
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Compliance & Security</p>
            <p className="text-xs text-blue-700 mt-1">
              All actions are logged for audit purposes. Logs are retained for 7 years as per regulatory requirements.
              This page is only accessible to Super Administrators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
