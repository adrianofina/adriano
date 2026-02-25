"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  FileSignature,
  Download,
  Eye,
  Info,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Landmark,
  Smartphone,
  IdCard,
  Heart,
  Users2,
  Building,
  DollarSign,
  CalendarDays,
  Percent,
  Wallet,
  Receipt,
  Scale,
  ScrollText,
  Stamp,
  UploadCloud,
  FileUp,
  FolderOpen,
  RefreshCw,
  CircleDashed,
  BadgeCheck,
  Gavel
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Customer {
  id: string;
  firstName: string;
  surname: string;
  middleName?: string;
  phoneNumber: string;
  alternativePhone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  region?: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: string;
  businessName?: string;
  maritalStatus?: string;
  dependents?: string;
  nationalId?: string;
  bankName?: string;
  accountNumber?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
}

interface Contract {
  id: string;
  contractNumber: string;
  contractType: string;
  sequence: number;
  status: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt: string;
}

interface MissingInfo {
  field: string;
  label: string;
  section: string;
  required: boolean;
}

// Section Header Component
const SectionHeader = ({ title, icon: Icon, section, expanded, onToggle }: any) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <span className="font-medium text-gray-900 dark:text-white">{title}</span>
    </div>
    {expanded ? (
      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
    ) : (
      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
    )}
  </button>
);

// Input Field Component
const InputField = ({ label, name, value, onChange, required, type = 'text', options, error }: any) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
      {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select {label}</option>
        {options?.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    )}
  </div>
);

// Contract Card Component
const ContractCard = ({ contract, onView }: any) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <FileSignature className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-gray-900 dark:text-white">{contract.contractNumber}</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${
        contract.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {contract.status}
      </span>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
      {contract.contractType} • {contract.sequence}th Contract
    </p>
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Uploaded {new Date(contract.uploadedAt).toLocaleDateString()}
      </p>
      <button
        onClick={() => onView(contract)}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Contract Upload Modal
const ContractUploadModal = ({ isOpen, onClose, onUpload }: any) => {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    contractType: 'loan',
    contractNumber: '',
    sequence: 1,
    description: '',
    file: null as File | null
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      onUpload(formData);
      setUploading(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload New Contract</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract Type
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                  >
                    <option value="loan">Loan Agreement</option>
                    <option value="guarantor">Guarantor Agreement</option>
                    <option value="collateral">Collateral Agreement</option>
                    <option value="general">General Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sequence Number
                  </label>
                  <select
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                  >
                    {[1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n}>{n}th Contract</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contract Number
                </label>
                <input
                  type="text"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                  placeholder="e.g., LOAN-2026-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description / Purpose
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800"
                  placeholder="Brief description of the contract..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Next: Upload File
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <UploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </span>
                </label>
                {formData.file && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {formData.file.name}
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[45%] animate-pulse" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!formData.file || uploading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Contract'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: false,
    address: false,
    employment: false,
    banking: false,
    contracts: false
  });
  const [showContractModal, setShowContractModal] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  const [formData, setFormData] = useState<Customer>({
    id: '',
    firstName: '',
    surname: '',
    middleName: '',
    phoneNumber: '',
    alternativePhone: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    region: '',
    occupation: '',
    employer: '',
    monthlyIncome: '',
    businessName: '',
    maritalStatus: '',
    dependents: '',
    nationalId: '',
    bankName: '',
    accountNumber: '',
    mobileMoneyProvider: '',
    mobileMoneyNumber: ''
  });

  const [missingInfo, setMissingInfo] = useState<MissingInfo[]>([]);

  useEffect(() => {
    if (params?.id) {
      fetchCustomer();
      fetchContracts();
    }
  }, [params?.id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${params?.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setFormData(data);
        checkMissingInfo(data);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    // Mock contracts for demo
    setContracts([
      {
        id: '1',
        contractNumber: 'LOAN-2026-001',
        contractType: 'Loan Agreement',
        sequence: 1,
        status: 'active',
        fileName: 'loan_agreement_2026.pdf',
        uploadedAt: new Date().toISOString()
      }
    ]);
  };

  const checkMissingInfo = (data: Customer) => {
    const missing: MissingInfo[] = [];
    
    if (!data.phoneNumber) missing.push({ field: 'phoneNumber', label: 'Phone Number', section: 'contact', required: true });
    if (!data.email) missing.push({ field: 'email', label: 'Email', section: 'contact', required: false });
    if (!data.nationalId) missing.push({ field: 'nationalId', label: 'National ID', section: 'personal', required: true });
    if (!data.dateOfBirth) missing.push({ field: 'dateOfBirth', label: 'Date of Birth', section: 'personal', required: true });
    if (!data.address) missing.push({ field: 'address', label: 'Address', section: 'address', required: true });
    
    setMissingInfo(missing);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/customers/${params?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/admin/customers/${params?.id}`);
        }, 1500);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update customer');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleContractUpload = (contractData: any) => {
    const newContract: Contract = {
      id: Date.now().toString(),
      contractNumber: contractData.contractNumber,
      contractType: contractData.contractType,
      sequence: contractData.sequence,
      status: 'draft',
      fileName: contractData.file?.name,
      uploadedAt: new Date().toISOString()
    };
    setContracts([newContract, ...contracts]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/customers/${params?.id}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit Customer</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update customer information and manage contracts
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Customer updated successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !success && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Missing Info Alert */}
      {missingInfo.length > 0 && !success && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                Missing Information ({missingInfo.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {missingInfo.map((item, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full flex items-center gap-1">
                    <CircleDashed className="w-3 h-3" />
                    {item.label}
                    {item.required && <span className="text-red-500">*</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader
              title="Personal Information"
              icon={User}
              section="personal"
              expanded={expandedSections.personal}
              onToggle={() => toggleSection('personal')}
            />
            {expandedSections.personal && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Middle Name"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Gender"
                    name="gender"
                    type="select"
                    options={['Male', 'Female', 'Other']}
                    value={formData.gender}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Marital Status"
                    name="maritalStatus"
                    type="select"
                    options={['Single', 'Married', 'Divorced', 'Widowed']}
                    value={formData.maritalStatus}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Dependents"
                    name="dependents"
                    type="number"
                    value={formData.dependents}
                    onChange={handleChange}
                  />
                  <InputField
                    label="National ID"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader
              title="Contact Information"
              icon={Phone}
              section="contact"
              expanded={expandedSections.contact}
              onToggle={() => toggleSection('contact')}
            />
            {expandedSections.contact && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                  <InputField
                    label="Alternative Phone"
                    name="alternativePhone"
                    value={formData.alternativePhone}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader
              title="Address"
              icon={MapPin}
              section="address"
              expanded={expandedSections.address}
              onToggle={() => toggleSection('address')}
            />
            {expandedSections.address && (
              <div className="p-6 space-y-4">
                <InputField
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Employment & Financial */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader
              title="Employment & Financial"
              icon={Briefcase}
              section="employment"
              expanded={expandedSections.employment}
              onToggle={() => toggleSection('employment')}
            />
            {expandedSections.employment && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Employer"
                    name="employer"
                    value={formData.employer}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Monthly Income (TSh)"
                    name="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Banking & Mobile Money */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader
              title="Banking & Mobile Money"
              icon={Landmark}
              section="banking"
              expanded={expandedSections.banking}
              onToggle={() => toggleSection('banking')}
            />
            {expandedSections.banking && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Account Number"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Mobile Money Provider"
                    name="mobileMoneyProvider"
                    type="select"
                    options={['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa']}
                    value={formData.mobileMoneyProvider}
                    onChange={handleChange}
                  />
                  <InputField
                    label="Mobile Money Number"
                    name="mobileMoneyNumber"
                    value={formData.mobileMoneyNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contracts Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader
              title="Contracts"
              icon={FileSignature}
              section="contracts"
              expanded={expandedSections.contracts}
              onToggle={() => toggleSection('contracts')}
            />
            {expandedSections.contracts && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage customer contracts and agreements
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowContractModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    New Contract
                  </button>
                </div>

                {contracts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <FileSignature className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-3">No contracts uploaded yet</p>
                    <button
                      type="button"
                      onClick={() => setShowContractModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Upload your first contract
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {contracts.map((contract) => (
                      <ContractCard
                        key={contract.id}
                        contract={contract}
                        onView={() => window.open(contract.fileUrl, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 -mx-4 sm:mx-0 sm:static sm:border-0 sm:p-0 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <Link
                href={`/admin/customers/${params?.id}`}
                className="w-full sm:w-auto text-center px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Contract Upload Modal */}
      <ContractUploadModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        onUpload={handleContractUpload}
      />
    </div>
  );
}
