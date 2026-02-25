"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  History,
  Award,
  DollarSign,
  TrendingUp,
  Shield,
  UserCheck,
  BadgeCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  Download,
  Printer,
  Share2,
  MoreVertical,
  RefreshCw,
  Landmark,
  Smartphone,
  IdCard,
  Heart,
  Users2,
  Building,
  CalendarDays,
  Percent,
  Wallet,
  PiggyBank,
  Receipt,
  Scale,
  ScrollText,
  Stamp,
  Signature,
  Fingerprint,
  Camera,
  UploadCloud,
  FileUp,
  FileDown,
  FilePlus,
  FileMinus,
  FolderOpen,
  FolderTree,
  FolderArchive,
  FolderKey,
  FolderLock,
  FolderOpenDot,
  FolderSearch,
  FolderSync,
  FolderX,
  Gavel
} from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  middleName?: string;
  phoneNumber: string;
  alternativePhone?: string;
  email?: string;
  dateOfBirth?: string;
  age?: number;
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
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  creditScore?: number;
  riskLevel?: string;
  category?: string;
  createdAt: string;
  createdBy?: {
    name: string;
    email: string;
  };
  stats?: {
    activeLoans: number;
    overdueLoans: number;
    completedLoans: number;
    totalBorrowed: number;
    totalRepaid: number;
    loanCount: number;
  };
  loans?: Array<{
    id: string;
    loanId: string;
    amount: number;
    purpose: string;
    status: string;
    createdAt: string;
  }>;
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, verified }: any) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '—'}</p>
        {verified && (
          <BadgeCheck className="w-4 h-4 text-green-500" />
        )}
      </div>
    </div>
  </div>
);

// Section Header Component
const SectionHeader = ({ title, icon: Icon, action }: any) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
    </div>
    {action && (
      <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1">
        {action} <ChevronRight className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Loan Card Component
const LoanCard = ({ loan }: any) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{loan.loanId}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{loan.purpose}</p>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${
        loan.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
        loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
        loan.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      }`}>
        {loan.status}
      </span>
    </div>
    <p className="text-lg font-bold text-gray-900 dark:text-white">
      TSh {loan.amount.toLocaleString()}
    </p>
  </div>
);

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'loans', label: 'Loans', icon: CreditCard, count: customer?.stats?.loanCount },
    { id: 'documents', label: 'Documents', icon: FileText, count: 0 },
    { id: 'activity', label: 'Activity', icon: History }
  ];

  useEffect(() => {
    if (params?.id) {
      fetchCustomer();
    }
  }, [params?.id]);

  const fetchCustomer = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/admin/customers/${params?.id}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customer');
      }
      
      setCustomer(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Customer not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/customers"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {customer.firstName} {customer.surname}
              </h1>
              {customer.riskLevel && (
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRiskColor(customer.riskLevel)}`}>
                  {customer.riskLevel} risk
                </span>
              )}
              {customer.creditScore && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                  Score: {customer.creditScore}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{customer.customerId}</span>
              <span>•</span>
              <span>Joined {formatDate(customer.createdAt)}</span>
              {customer.age && (
                <>
                  <span>•</span>
                  <span>{customer.age} years old</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomer}
            disabled={refreshing}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href={`/admin/customers/${params?.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          {user?.role === 'super_admin' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="Credit Score"
          value={customer.creditScore || 650}
          color="blue"
          trend={5}
        />
        <StatCard
          icon={CreditCard}
          label="Active Loans"
          value={customer.stats?.activeLoans || 0}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={customer.stats?.overdueLoans || 0}
          color="red"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={customer.stats?.completedLoans || 0}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <SectionHeader title="Personal Information" icon={UserCheck} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={Users}
                  label="Full Name"
                  value={`${customer.firstName} ${customer.middleName || ''} ${customer.surname}`}
                  verified
                />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={formatDate(customer.dateOfBirth)}
                />
                <InfoRow
                  icon={Users2}
                  label="Gender"
                  value={customer.gender}
                />
                <InfoRow
                  icon={Heart}
                  label="Marital Status"
                  value={customer.maritalStatus}
                />
                <InfoRow
                  icon={Users}
                  label="Dependents"
                  value={customer.dependents?.toString()}
                />
                <InfoRow
                  icon={IdCard}
                  label="National ID"
                  value={customer.nationalId}
                />
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <SectionHeader title="Contact Information" icon={Phone} />
              <div className="space-y-4">
                <InfoRow
                  icon={Phone}
                  label="Phone Number"
                  value={customer.phoneNumber}
                  verified
                />
                {customer.alternativePhone && (
                  <InfoRow
                    icon={Phone}
                    label="Alternative Phone"
                    value={customer.alternativePhone}
                  />
                )}
                {customer.email && (
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={customer.email}
                  />
                )}
                {(customer.address || customer.city || customer.region) && (
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={[customer.address, customer.city, customer.region].filter(Boolean).join(', ')}
                  />
                )}
              </div>
            </div>

            {/* Employment & Financial Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <SectionHeader title="Employment & Financial" icon={Briefcase} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={Briefcase}
                  label="Occupation"
                  value={customer.occupation}
                />
                <InfoRow
                  icon={Building}
                  label="Employer"
                  value={customer.employer}
                />
                {customer.monthlyIncome && (
                  <InfoRow
                    icon={DollarSign}
                    label="Monthly Income"
                    value={formatCurrency(customer.monthlyIncome)}
                  />
                )}
                {customer.businessName && (
                  <InfoRow
                    icon={Briefcase}
                    label="Business Name"
                    value={customer.businessName}
                  />
                )}
              </div>
            </div>

            {/* Banking & Mobile Money Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <SectionHeader title="Banking & Mobile Money" icon={Landmark} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.bankName && (
                  <InfoRow
                    icon={Landmark}
                    label="Bank Name"
                    value={customer.bankName}
                  />
                )}
                {customer.accountNumber && (
                  <InfoRow
                    icon={Receipt}
                    label="Account Number"
                    value={customer.accountNumber}
                  />
                )}
                {customer.mobileMoneyProvider && (
                  <InfoRow
                    icon={Smartphone}
                    label="Mobile Money"
                    value={`${customer.mobileMoneyProvider} - ${customer.mobileMoneyNumber}`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/admin/loans/new?customerId=${customer.id}`}
                  className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                >
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">New Loan</span>
                </Link>
                <Link
                  href={`/admin/documents/upload?customerId=${customer.id}`}
                  className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
                >
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Upload Doc</span>
                </Link>
                <Link
                  href={`/admin/payments/new?customerId=${customer.id}`}
                  className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                >
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Record Payment</span>
                </Link>
                <Link
                  href={`/admin/customers/${customer.id}/edit`}
                  className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <Edit className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Edit Info</span>
                </Link>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Financial Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Borrowed</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(customer.stats?.totalBorrowed)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Repaid</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(customer.stats?.totalRepaid)}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Repayment Rate</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {customer.stats?.totalBorrowed
                        ? Math.round((customer.stats.totalRepaid / customer.stats.totalBorrowed) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: customer.stats?.totalBorrowed
                          ? `${(customer.stats.totalRepaid / customer.stats.totalBorrowed) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Loans */}
            {customer.loans && customer.loans.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <SectionHeader
                  title="Recent Loans"
                  icon={CreditCard}
                  action="View All"
                />
                <div className="space-y-3">
                  {customer.loans.slice(0, 3).map((loan) => (
                    <LoanCard key={loan.id} loan={loan} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loan History</h3>
          {!customer.loans || customer.loans.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No loans yet</p>
              <Link
                href={`/admin/loans/new?customerId=${customer.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CreditCard className="w-4 h-4" />
                Create First Loan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.loans.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No documents uploaded yet</p>
            <Link
              href={`/admin/documents/upload?customerId=${customer.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="w-4 h-4" />
              Upload Document
            </Link>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Customer created</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  by {customer.createdBy?.name || 'System'} • {formatDate(customer.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Customer
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-medium">{customer.firstName} {customer.surname}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  router.push('/admin/customers');
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
