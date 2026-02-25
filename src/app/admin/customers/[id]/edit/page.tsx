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
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Landmark,
  Smartphone,
  IdCard,
  DollarSign,
  Percent,
  Clock,
  AlertTriangle
} from 'lucide-react';

// Helper function for ordinal suffixes
const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Helper function to calculate age
const calculateAge = (dob: string): number | null => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Section Header Component
const SectionHeader = ({ title, icon: Icon, expanded, onToggle }: any) => (
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
const InputField = ({ label, name, value, onChange, required, type = 'text', options, min, max, step }: any) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
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
        min={min}
        max={max}
        step={step}
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
      />
    )}
  </div>
);

// Simple Loan Card Component
const LoanCard = ({ loan, onView }: any) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{loan.loanId}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{loan.purpose}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(loan.status)}`}>
          {loan.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="font-medium">TSh {loan.amount?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Interest</p>
          <p className="font-medium">{loan.interestRate}%</p>
        </div>
      </div>
    </div>
  );
};

// Simple Loan Modal
const LoanModal = ({ isOpen, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    term: '12',
    interestRate: '12',
    status: 'active',
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Loan</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <InputField
            label="Loan Amount (TSh)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={(e: any) => setFormData({ ...formData, amount: e.target.value })}
            required
            min="1000"
          />
          
          <InputField
            label="Purpose"
            name="purpose"
            value={formData.purpose}
            onChange={(e: any) => setFormData({ ...formData, purpose: e.target.value })}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Term (months)"
              name="term"
              type="number"
              value={formData.term}
              onChange={(e: any) => setFormData({ ...formData, term: e.target.value })}
              required
              min="1"
            />
            <InputField
              label="Interest Rate (%)"
              name="interestRate"
              type="number"
              step="0.1"
              value={formData.interestRate}
              onChange={(e: any) => setFormData({ ...formData, interestRate: e.target.value })}
              required
            />
          </div>

          <InputField
            label="Status"
            name="status"
            type="select"
            options={['pending', 'active', 'completed', 'overdue']}
            value={formData.status}
            onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
            required
          />

          <InputField
            label="First Due Date"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e: any) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              Create Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ageError, setAgeError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: false,
    address: false,
    employment: false,
    banking: false,
    loans: false
  });
  
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (params?.id) {
      fetchCustomer();
      fetchLoans();
    }
  }, [params?.id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${params?.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setFormData(data);
        
        // Validate age
        if (data.dateOfBirth) {
          const age = calculateAge(data.dateOfBirth);
          if (age && age < 18) {
            setAgeError('Customer is under 18 years old!');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${params?.id}/loans`);
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    setFormData({ ...formData, dateOfBirth: dob });
    
    if (dob) {
      const age = calculateAge(dob);
      if (age && age < 18) {
        setAgeError('Customer must be at least 18 years old');
      } else {
        setAgeError('');
      }
    } else {
      setAgeError('');
    }
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
    
    if (ageError) {
      setError('Cannot save: Customer is under 18 years old');
      return;
    }

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

  const handleSaveLoan = async (loanData: any) => {
    try {
      setSaving(true);
      console.log('Creating loan:', loanData);
      
      const res = await fetch(`/api/admin/customers/${params?.id}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create loan');
      }

      // Refresh loans list
      await fetchLoans();
      setShowLoanModal(false);
      alert('✅ Loan created successfully!');
      
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
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
            Update customer information and manage loans
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

      {/* Age Warning */}
      {ageError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{ageError}</p>
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
                    onChange={handleDateChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
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
              expanded={expandedSections.address}
              onToggle={() => toggleSection('address')}
            />
            {expandedSections.address && (
              <div className="p-6">
                <InputField
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

          {/* Loans Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader
              title="Loans"
              icon={CreditCard}
              expanded={expandedSections.loans}
              onToggle={() => toggleSection('loans')}
            />
            {expandedSections.loans && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {loans.length} loan{loans.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLoanModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Loan
                  </button>
                </div>

                {loans.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No loans yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {loans.map((loan) => (
                      <LoanCard key={loan.id} loan={loan} onView={() => {}} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <Link
              href={`/admin/customers/${params?.id}`}
              className="w-full sm:w-auto text-center px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !!ageError}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
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
        </form>
      )}

      {/* Loan Modal */}
      <LoanModal
        isOpen={showLoanModal}
        onClose={() => setShowLoanModal(false)}
        onSave={handleSaveLoan}
      />
    </div>
  );
}
