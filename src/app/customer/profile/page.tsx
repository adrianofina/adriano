"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Award,
  CreditCard,
  Upload,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Save,
  Edit2,
  X,
  FileText,
  DollarSign,
  Banknote,
  Smartphone,
  Shield,
  IdCard,
  ChevronDown,
  ChevronUp,
  Heart,
  ShieldCheck,
  Flame
} from "lucide-react";
import ProgressRing from '@/components/ui/ProgressRing';
import SungJinwooShadow from '@/components/ui/infamousshadow';

interface CustomerData {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  middleName?: string;
  phoneNumber: string;
  alternativePhone?: string;
  email: string;
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
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  creditScore?: number;
  riskLevel?: string;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  verified: boolean;
  verifiedAt?: string;
  notes?: string;
  status?: string;
}

export default function CustomerProfile() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CustomerData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: true,
    address: true,
    employment: true,
    banking: true
  });

  useEffect(() => {
    fetchCustomerData();
    fetchDocuments();
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchCustomerData = async () => {
    try {
      const res = await fetch('/api/customers/profile');
      const data = await res.json();
      if (data.customer) {
        setCustomer(data.customer);
        setEditForm(data.customer);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/customers/documents');
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return 'TSh 0';
    if (amount >= 1_000_000) return `TSh ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `TSh ${(amount / 1_000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const calculateHealthScore = () => {
    if (!customer) return 0;
    const totalBorrowed = customer.totalBorrowed || 0;
    const totalRepaid = customer.totalRepaid || 0;
    const totalLoans = customer.totalLoans || 0;
    const overdueLoans = customer.overdueLoans || 0;
    const activeLoans = customer.activeLoans || 0;
    
    const repaymentRatio = totalBorrowed > 0 ? totalRepaid / totalBorrowed : 0;
    const overdueRatio = totalLoans > 0 ? overdueLoans / totalLoans : 0;
    const activeRatio = totalLoans > 0 ? activeLoans / totalLoans : 0;
    return Math.round(repaymentRatio * 40 + (1 - overdueRatio) * 35 + (1 - Math.min(activeRatio, 1)) * 25);
  };

  const healthScore = calculateHealthScore();
  const hasOverdue = (customer?.overdueLoans || 0) > 0;

  const getRingStatus = () => {
    if (hasOverdue) return 'overdue';
    if (healthScore >= 80) return 'completed';
    if (healthScore >= 60) return 'active';
    return 'pending';
  };

  const getHealthStatus = () => {
    if (hasOverdue) return { text: 'Critical', color: 'text-red-600', icon: Flame };
    if (healthScore >= 80) return { text: 'Excellent', color: 'text-emerald-600', icon: ShieldCheck };
    if (healthScore >= 60) return { text: 'Good', color: 'text-blue-600', icon: Heart };
    if (healthScore >= 40) return { text: 'Fair', color: 'text-amber-600', icon: AlertTriangle };
    return { text: 'Poor', color: 'text-red-600', icon: Flame };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/customers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.customer) {
        setCustomer(data.customer);
        setIsEditing(false);
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile || !selectedDocumentType) {
      setError('Please select a file and document type');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', selectedDocumentType);

    setUploading(true);
    setError(null);
    try {
      const res = await fetch('/api/customers/documents', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.document) {
        setDocuments([data.document, ...documents]);
        setSuccess('Document uploaded successfully');
        setShowDocumentModal(false);
        setSelectedFile(null);
        setSelectedDocumentType("");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to upload document');
      }
    } catch (err) {
      setError('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/customers/documents/${docId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(documents.filter(d => d.id !== docId));
        setSuccess('Document deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to delete document');
      }
    } catch (err) {
      setError('Error deleting document');
    }
    setShowDeleteConfirm(null);
  };

  const documentTypes = [
    { value: 'national_id', label: 'National ID', icon: IdCard },
    { value: 'passport_photo', label: 'Passport Photo', icon: User },
    { value: 'bank_statement', label: 'Bank Statement', icon: Banknote },
    { value: 'salary_slip', label: 'Salary Slip', icon: DollarSign },
    { value: 'employment_letter', label: 'Employment Letter', icon: Briefcase },
    { value: 'business_license', label: 'Business License', icon: Building },
    { value: 'tax_clearance', label: 'Tax Clearance', icon: FileText },
    { value: 'other', label: 'Other', icon: FileText },
  ];

  const getDocumentTypeLabel = (type: string) => {
    return documentTypes.find(dt => dt.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500">Failed to load profile</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 animate-slide-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{success}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 animate-slide-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and documents</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all hover:scale-105"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm(customer);
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all hover:scale-105 disabled:opacity-50"
            >
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Information Sections */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Personal Information - Collapsible */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('personal')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-gray-900 dark:text-white">Personal Information</h2>
              </div>
              {expandedSections.personal ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.personal && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.firstName} {customer.surname}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Middle Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.middleName || ''}
                        onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.middleName || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Gender</label>
                    {isEditing ? (
                      <select
                        value={editForm.gender || ''}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.gender || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.dateOfBirth?.split('T')[0] || ''}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Marital Status</label>
                    {isEditing ? (
                      <select
                        value={editForm.maritalStatus || ''}
                        onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.maritalStatus || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Dependents</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.dependents || 0}
                        onChange={(e) => setEditForm({ ...editForm, dependents: parseInt(e.target.value) })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.dependents || 0}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <SungJinwooShadow progress={expandedSections.personal ? 100 : 0} status="active" height="h-0.5" />
          </div>

          {/* Contact Information - Collapsible */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('contact')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-gray-900 dark:text-white">Contact Information</h2>
              </div>
              {expandedSections.contact ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.contact && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phoneNumber || ''}
                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.phoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Alternative Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.alternativePhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, alternativePhone: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.alternativePhone || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">National ID</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.nationalId || ''}
                        onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.nationalId || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <SungJinwooShadow progress={expandedSections.contact ? 100 : 0} status="active" height="h-0.5" />
          </div>

          {/* Address Information - Collapsible */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('address')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-gray-900 dark:text-white">Address Information</h2>
              </div>
              {expandedSections.address ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.address && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.address || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.city || ''}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.city || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Region</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.region || ''}
                        onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.region || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <SungJinwooShadow progress={expandedSections.address ? 100 : 0} status="active" height="h-0.5" />
          </div>

          {/* Employment Information - Collapsible */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('employment')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-gray-900 dark:text-white">Employment & Income</h2>
              </div>
              {expandedSections.employment ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.employment && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Occupation</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.occupation || ''}
                        onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.occupation || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Employer / Business</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.employer || editForm.businessName || ''}
                        onChange={(e) => setEditForm({ ...editForm, employer: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.employer || customer.businessName || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Monthly Income</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.monthlyIncome || 0}
                        onChange={(e) => setEditForm({ ...editForm, monthlyIncome: parseInt(e.target.value) })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(customer.monthlyIncome || 0)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <SungJinwooShadow progress={expandedSections.employment ? 100 : 0} status="active" height="h-0.5" />
          </div>

          {/* Banking Information - Collapsible */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection('banking')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-gray-900 dark:text-white">Banking & Mobile Money</h2>
              </div>
              {expandedSections.banking ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {expandedSections.banking && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Bank Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.bankName || ''}
                        onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.bankName || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Account Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.accountNumber || ''}
                        onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.accountNumber || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Mobile Money Provider</label>
                    {isEditing ? (
                      <select
                        value={editForm.mobileMoneyProvider || ''}
                        onChange={(e) => setEditForm({ ...editForm, mobileMoneyProvider: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select</option>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Tigo Pesa">Tigo Pesa</option>
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="HaloPesa">HaloPesa</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.mobileMoneyProvider || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Mobile Money Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.mobileMoneyNumber || ''}
                        onChange={(e) => setEditForm({ ...editForm, mobileMoneyNumber: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{customer.mobileMoneyNumber || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <SungJinwooShadow progress={expandedSections.banking ? 100 : 0} status="active" height="h-0.5" />
          </div>
        </div>

        {/* Right Column - Health Ring & Documents */}
        <div className="space-y-6">
          {/* Health Ring Card - Replacing Credit Score */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex flex-col items-center">
              <ProgressRing
                progress={healthScore}
                size={120}
                strokeWidth={8}
                status={getRingStatus()}
                label="HEALTH"
                value={`${healthScore}/100`}
                interactive={true}
                animateOnHover={true}
                pulseOnOverdue={hasOverdue}
                rotationEffect={true}
                glowIntensity={12}
                breatheOnOverdue={true}
                onDark={true}
              />
              <div className="mt-4 text-center">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20 ${healthStatus.color}`}>
                  <HealthIcon className="w-3 h-3" />
                  <span>{healthStatus.text} Standing</span>
                </div>
                <p className="text-xs text-white/80 mt-2">Based on your loan repayment history</p>
              </div>
            </div>
          </div>

          {/* Loan Summary Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <h3 className="font-bold text-gray-900 dark:text-white">Loan Summary</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Loans</span>
                <span className="font-bold text-gray-900 dark:text-white">{customer.totalLoans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Loans</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{customer.activeLoans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overdue Loans</span>
                <span className={`font-bold ${customer.overdueLoans > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{customer.overdueLoans}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Borrowed</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(customer.totalBorrowed)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Repaid</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(customer.totalRepaid)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Card - Admin Style Upload */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">My Documents</h3>
                </div>
                <button
                  onClick={() => setShowDocumentModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all"
                >
                  <Upload className="w-3 h-3" />
                  Upload
                </button>
              </div>
            </div>
            <div className="p-5">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No documents uploaded yet</p>
                  <button
                    onClick={() => setShowDocumentModal(true)}
                    className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Upload your first document
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.fileName}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{getDocumentTypeLabel(doc.documentType)}</span>
                            <span className="text-[10px] text-gray-400">•</span>
                            <span className="text-[10px] text-gray-500">{formatFileSize(doc.fileSize)}</span>
                            {doc.verified && (
                              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            )}
                            {doc.status === 'pending' && (
                              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </a>
                        <a href={doc.fileUrl} download className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
                          <Download className="w-3.5 h-3.5 text-gray-500" />
                        </a>
                        <button onClick={() => setShowDeleteConfirm(doc.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <SungJinwooShadow progress={documents.length > 0 ? 100 : 0} status="active" height="h-0.5" />
          </div>
        </div>
      </div>

      {/* Document Upload Modal - Admin Style */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDocumentModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Document</h3>
              </div>
              <button onClick={() => setShowDocumentModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Type</label>
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select document type</option>
                  {documentTypes.map(dt => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
              </div>
              {selectedFile && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Selected: {selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDocumentUpload}
                disabled={!selectedFile || !selectedDocumentType || uploading}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Upload className="w-4 h-4" />}
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-red-200 dark:border-red-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Document</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this document? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition">Cancel</button>
              <button onClick={() => handleDeleteDocument(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
