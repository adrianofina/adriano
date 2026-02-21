"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Award,
  AlertTriangle,
  Briefcase,
  DollarSign,
  Edit,
  Save,
  X,
  Clock,
  History,
  Gavel
} from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  alternativePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  region?: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: number;
  businessName?: string;
  maritalStatus?: string;
  dependents?: number;
  nationalId?: string;
  bankName?: string;
  accountNumber?: string;
  mobileMoneyNumber?: string;
  creditScore: number;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  hasCourtCase: boolean;
  loans: Loan[];
  auditLogs: AuditLog[];
}

interface Loan {
  id: string;
  loanId: string;
  amount: number;
  purpose: string;
  status: string;
  amountPaid: number;
  remainingBalance: number;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details?: any;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'loans' | 'audit'>('profile');

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers/${params.id}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Customer not found');
        } else {
          setError('Failed to load customer');
        }
        return;
      }
      
      const data = await res.json();
      setCustomer(data.customer);
      setFormData(data.customer);
    } catch (err) {
      setError('Error loading customer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setEditing(false);
        fetchCustomer();
      }
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Customer not found'}
          </h3>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.firstName} {customer.surname}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ID: {customer.customerId} • Member since {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            editing 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {editing ? (
            saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>
          ) : (
            <><Edit className="w-4 h-4" /> Edit</>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Credit Score</p>
          <p className={`text-lg font-semibold ${
            customer.creditScore >= 700 ? 'text-green-600' :
            customer.creditScore >= 600 ? 'text-yellow-600' :
            'text-red-600'
          }`}>{customer.creditScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Loans</p>
          <p className="text-lg font-semibold">{customer.totalLoans}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          <p className="text-lg font-semibold text-blue-600">{customer.activeLoans}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="text-lg font-semibold text-red-600">{customer.overdueLoans}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Court Case</p>
          <p className="text-lg font-semibold">
            {customer.hasCourtCase ? (
              <span className="text-red-600">Yes</span>
            ) : (
              <span className="text-gray-600">No</span>
            )}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'loans'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Loans ({customer.loans?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">First Name</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Surname</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.surname || ''}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.surname}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{customer.email}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              {editing ? (
                <input
                  type="text"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date of Birth</label>
              {editing ? (
                <input
                  type="date"
                  value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : '—'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gender</label>
              {editing ? (
                <select
                  value={formData.gender || ''}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.gender || '—'}</p>
              )}
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(customer);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="space-y-3">
          {!customer.loans?.length ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No loans found for this customer</p>
            </div>
          ) : (
            customer.loans.map((loan) => (
              <div key={loan.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{loan.loanId}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{loan.purpose}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>Applied: {new Date(loan.createdAt).toLocaleDateString()}</span>
                  <span>Paid: {formatCurrency(loan.amountPaid)}</span>
                  <span>Remaining: {formatCurrency(loan.remainingBalance)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b">
            <h3 className="font-medium">Activity History</h3>
          </div>
          {!customer.auditLogs?.length ? (
            <div className="p-8 text-center">
              <History className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No audit logs yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {customer.auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    by {log.userName} • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
