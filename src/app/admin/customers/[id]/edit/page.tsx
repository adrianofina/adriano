"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
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
  RefreshCw,
  Info
} from 'lucide-react';

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
const InputField = ({ label, name, value, onChange, required, type = 'text', options, min, max, step, error }: any) => (
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
        className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
        }`}
      />
    )}
    {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
  </div>
);

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
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
    banking: false
  });
  
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

  useEffect(() => {
    if (params?.id) {
      fetchCustomer();
    }
  }, [params?.id]);

  const fetchCustomer = async () => {
    try {
      const data = await apiFetch<any>(`/api/admin/customers/${params?.id}`);
      setFormData(data);
      
      // Check age
      if (data.dateOfBirth) {
        const age = calculateAge(data.dateOfBirth);
        if (age && age < 18) {
          setAgeError('Customer is under 18 years old');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      await apiFetch(`/api/admin/customers/${params?.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/customers/${params?.id}`);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/customers/${params?.id}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Edit Customer</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Update customer information
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Customer updated successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !success && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Age Warning */}
      {ageError && !success && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Age Validation</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{ageError}</p>
          </div>
        </div>
      )}

      {/* Form */}
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
                    error={ageError}
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
                    min="0"
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
                    min="0"
                    step="1000"
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
                disabled={saving || !!ageError}
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
    </div>
  );
}
