"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Download,
  Printer,
  History,
  Upload,
  FileSignature,
  Hash,
  Layers,
  User,
  CalendarDays,
  DollarSign,
  Landmark,
  Smartphone,
  IdCard,
  Heart,
  Users2,
  Briefcase as BriefcaseIcon,
  Building,
  FileCheck,
  Gavel
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
  createdBy: {
    name: string;
    email: string;
  };
  _count: {
    loans: number;
    documents: number;
    courtCases: number;
  };
  loans: Array<{
    id: string;
    loanId: string;
    amount: number;
    purpose: string;
    status: string;
    stage: number;
    createdAt: string;
    remainingBalance: number;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    status: string;
    uploadedAt: string;
  }>;
  courtCases: Array<{
    id: string;
    caseNumber: string;
    status: string;
    filingDate: string;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    userName: string;
    userRole: string;
    timestamp: string;
    details: any;
  }>;
}

// Contract interface
interface Contract {
  id: string;
  contractNumber: string;
  contractType: 'loan' | 'guarantor' | 'collateral' | 'other';
  contractDate: string;
  contractNumber_seq: number; // 1st, 2nd, 3rd, etc.
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: 'draft' | 'active' | 'completed' | 'terminated';
  signedBy?: string;
  signedAt?: string;
  expiryDate?: string;
  notes?: string;
  uploadedById: string;
  uploadedBy: {
    name: string;
  };
  createdAt: string;
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Contract form state
  const [contractForm, setContractForm] = useState({
    contractType: 'loan',
    contractNumber: '',
    contractNumber_seq: 1,
    description: '',
    file: null as File | null,
    expiryDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomer();
    fetchContracts();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      const data = await res.json();
      if (res.ok) {
        setCustomer(data);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const fetchContracts = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}/contracts`);
      const data = await res.json();
      if (res.ok) {
        setContracts(data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        router.push('/admin/customers');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete customer');
    }
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append('contractType', contractForm.contractType);
    formData.append('contractNumber', contractForm.contractNumber);
    formData.append('contractNumber_seq', contractForm.contractNumber_seq.toString());
    formData.append('description', contractForm.description);
    formData.append('expiryDate', contractForm.expiryDate);
    formData.append('notes', contractForm.notes);
    if (contractForm.file) {
      formData.append('file', contractForm.file);
    }

    try {
      const res = await fetch(`/api/admin/customers/${id}/contracts`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setShowContractModal(false);
        fetchContracts();
        setContractForm({
          contractType: 'loan',
          contractNumber: '',
          contractNumber_seq: 1,
          description: '',
          file: null,
          expiryDate: '',
          notes: ''
        });
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload contract');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload contract');
    } finally {
      setUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customer not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The customer you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.firstName} {customer.surname}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span>{customer.customerId}</span>
              <span>•</span>
              <span>Joined {formatDate(customer.createdAt)}</span>
              {customer.age && (
                <>
                  <span>•</span>
                  <span>{customer.age} years old</span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/customers/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>
          {user?.role === 'super_admin' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loans</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{customer._count.loans}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Documents</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{customer._count.documents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Gavel className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Court Cases</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{customer._count.courtCases}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FileSignature className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contracts</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{contracts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-6 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'contracts', label: `Contracts (${contracts.length})`, icon: FileSignature },
            { id: 'loans', label: `Loans (${customer._count.loans})`, icon: CreditCard },
            { id: 'documents', label: `Documents (${customer._count.documents})`, icon: FileText },
            { id: 'audit', label: 'Audit Trail', icon: History }
          ].map((tab) => {
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
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {customer.firstName} {customer.middleName} {customer.surname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 capitalize">
                    {customer.gender?.toLowerCase() || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : 'Not specified'}
                    {customer.age && ` (${customer.age} years)`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Marital Status</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 capitalize">
                    {customer.maritalStatus?.toLowerCase() || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dependents</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {customer.dependents || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">National ID</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {customer.nationalId || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                Contact Information
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {customer.phoneNumber}
                  </p>
                </div>
                {customer.alternativePhone && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alternative Phone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {customer.alternativePhone}
                    </p>
                  </div>
                )}
                {customer.email && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {customer.email}
                    </p>
                  </div>
                )}
                {(customer.address || customer.city || customer.region) && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {[customer.address, customer.city, customer.region].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Employment & Financial */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                Employment & Financial
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Occupation</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {customer.occupation || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employer</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {customer.employer || 'Not specified'}
                  </p>
                </div>
                {customer.monthlyIncome && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Income</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {formatCurrency(customer.monthlyIncome)}
                    </p>
                  </div>
                )}
                {customer.businessName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Business Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {customer.businessName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Credit Score</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {customer.creditScore || 650}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Risk Level</p>
                  <p className={`text-sm font-medium mt-1 capitalize ${
                    customer.riskLevel === 'low' ? 'text-green-600' :
                    customer.riskLevel === 'medium' ? 'text-yellow-600' :
                    customer.riskLevel === 'high' ? 'text-orange-600' :
                    customer.riskLevel === 'critical' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {customer.riskLevel || 'medium'}
                  </p>
                </div>
              </div>
            </div>

            {/* Banking & Mobile Money */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Banking & Mobile Money
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {customer.bankName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bank Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {customer.bankName}
                    </p>
                  </div>
                )}
                {customer.accountNumber && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Number</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {customer.accountNumber}
                    </p>
                  </div>
                )}
                {customer.mobileMoneyProvider && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mobile Money</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {customer.mobileMoneyProvider} - {customer.mobileMoneyNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Assessment</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credit Score</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{customer.creditScore || 650}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                      style={{ width: `${((customer.creditScore || 650) / 1000) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
                    <span className={`text-sm font-medium capitalize ${
                      customer.riskLevel === 'low' ? 'text-green-600' :
                      customer.riskLevel === 'medium' ? 'text-yellow-600' :
                      customer.riskLevel === 'high' ? 'text-orange-600' :
                      customer.riskLevel === 'critical' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {customer.riskLevel || 'medium'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Loans */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Loans</h2>
              <div className="space-y-4">
                {customer.loans.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.loanId}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(loan.amount)}</p>
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
                ))}
                {customer.loans.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No loans yet
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowContractModal(true)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FileSignature className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Contract</span>
                </button>
                <Link
                  href={`/admin/loans/new?customerId=${id}`}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Create New Loan</span>
                </Link>
                <Link
                  href={`/admin/documents/upload?customerId=${id}`}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Document</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contracts</h2>
            <button
              onClick={() => setShowContractModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Contract
            </button>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <FileSignature className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No contracts uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <FileSignature className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {contract.contractNumber}
                        </p>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                          {getOrdinalSuffix(contract.contractNumber_seq)} Contract
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contract.contractType.charAt(0).toUpperCase() + contract.contractType.slice(1)} Contract
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Uploaded {formatDate(contract.createdAt)} by {contract.uploadedBy.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.fileUrl && (
                      <a
                        href={contract.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loans Tab (simplified for brevity) */}
      {activeTab === 'loans' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loans</h2>
          <p className="text-gray-600 dark:text-gray-400">Loan management coming soon...</p>
        </div>
      )}

      {/* Documents Tab (simplified for brevity) */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
          <p className="text-gray-600 dark:text-gray-400">Document management coming soon...</p>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audit Trail</h2>
          <div className="space-y-4">
            {customer.auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{log.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    by {log.userName} ({log.userRole}) • {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Customer</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this customer? This action will be logged and cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full sm:flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Upload Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Contract</h3>
            <form onSubmit={handleContractSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contract Type
                  </label>
                  <select
                    value={contractForm.contractType}
                    onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="loan">Loan Contract</option>
                    <option value="guarantor">Guarantor Contract</option>
                    <option value="collateral">Collateral Contract</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contract Sequence
                  </label>
                  <select
                    value={contractForm.contractNumber_seq}
                    onChange={(e) => setContractForm({ ...contractForm, contractNumber_seq: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{getOrdinalSuffix(num)} Contract</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract Number
                </label>
                <input
                  type="text"
                  value={contractForm.contractNumber}
                  onChange={(e) => setContractForm({ ...contractForm, contractNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., LOAN-2026-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={contractForm.description}
                  onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Brief description of the contract"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiry Date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={contractForm.expiryDate}
                    onChange={(e) => setContractForm({ ...contractForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contract File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setContractForm({ ...contractForm, file: e.target.files?.[0] || null })}
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={contractForm.notes}
                  onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Any additional notes about the contract"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Contract</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
