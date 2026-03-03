"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Info,
  Sparkles,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  FileText,
  FileCheck,
  FileWarning,
  Home,
  Globe,
  Award,
  Target,
  Zap,
  TrendingUp,
  Clock,
  HelpCircle
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
const SectionHeader = ({ title, icon: Icon, expanded, onToggle, accent = 'indigo' }: any) => {
  const accentColors = {
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' }
  };
  
  const colors = accentColors[accent as keyof typeof accentColors] || accentColors.indigo;
  
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colors.bg} transition-transform group-hover:scale-105`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
      </div>
      <div className={`p-1.5 rounded-lg ${expanded ? colors.bg : 'bg-gray-100 dark:bg-gray-800'} transition-all`}>
        {expanded ? (
          <ChevronUp className={`w-4 h-4 ${expanded ? colors.text : 'text-gray-500 dark:text-gray-400'}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${expanded ? colors.text : 'text-gray-500 dark:text-gray-400'}`} />
        )}
      </div>
    </button>
  );
};

// Input Field Component
const InputField = ({ label, name, value, onChange, required, type = 'text', options, min, max, step, error, icon: Icon, helper }: any) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
        className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
          error 
            ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500/20 focus:border-rose-500' 
            : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-500/20 focus:border-indigo-500'
        }`}
      />
    )}
    {helper && !error && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" />{helper}</p>}
    {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

// MAIN COMPONENT
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
      const response = await fetch(`/api/admin/customers/${params?.id}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customer');
      }
      
      setFormData(result.data);
      
      // Check age
      if (result.data.dateOfBirth) {
        const age = calculateAge(result.data.dateOfBirth);
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
      const response = await fetch(`/api/admin/customers/${params?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update customer');
      }

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ╔══════════════════════════════════════════════════════════════════╗
          ║  HERO HEADER                                                     ║
          ╚══════════════════════════════════════════════════════════════════╝ */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
        <div className="absolute -top-12 right-1/4 w-64 h-32 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/customers/${params?.id}`}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-all"
              style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">Edit customer</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formData.firstName} {formData.surname}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Update customer information and details
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Customer updated successfully!
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Redirecting to customer profile...
              </p>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-800 dark:text-rose-300">Error</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Age Warning */}
        {ageError && !success && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Age Validation</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{ageError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <SectionHeader
                title="Personal Information"
                icon={User}
                expanded={expandedSections.personal}
                onToggle={() => toggleSection('personal')}
                accent="indigo"
              />
              {expandedSections.personal && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InputField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      icon={User}
                    />
                    <InputField
                      label="Surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      required
                      icon={Users2}
                    />
                    <InputField
                      label="Middle Name"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      icon={User}
                    />
                    <InputField
                      label="Date of Birth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleDateChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      error={ageError}
                      icon={CalendarDays}
                      helper="Must be 18+ years"
                    />
                    <InputField
                      label="Gender"
                      name="gender"
                      type="select"
                      options={['Male', 'Female', 'Other']}
                      value={formData.gender}
                      onChange={handleChange}
                      icon={Users}
                    />
                    <InputField
                      label="Marital Status"
                      name="maritalStatus"
                      type="select"
                      options={['Single', 'Married', 'Divorced', 'Widowed']}
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      icon={Heart}
                    />
                    <InputField
                      label="Dependents"
                      name="dependents"
                      type="number"
                      value={formData.dependents}
                      onChange={handleChange}
                      min="0"
                      icon={Users2}
                    />
                    <InputField
                      label="National ID"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleChange}
                      icon={IdCard}
                      helper="NIDA or other official ID"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <SectionHeader
                title="Contact Information"
                icon={Phone}
                expanded={expandedSections.contact}
                onToggle={() => toggleSection('contact')}
                accent="emerald"
              />
              {expandedSections.contact && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      icon={Phone}
                      helper="Format: 255712345678"
                    />
                    <InputField
                      label="Alternative Phone"
                      name="alternativePhone"
                      value={formData.alternativePhone}
                      onChange={handleChange}
                      icon={Smartphone}
                    />
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      icon={Mail}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Address Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <SectionHeader
                title="Address"
                icon={MapPin}
                expanded={expandedSections.address}
                onToggle={() => toggleSection('address')}
                accent="amber"
              />
              {expandedSections.address && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-5">
                  <InputField
                    label="Street Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    icon={Home}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      icon={Building}
                    />
                    <InputField
                      label="Region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      icon={Globe}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Employment & Financial */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <SectionHeader
                title="Employment & Financial"
                icon={Briefcase}
                expanded={expandedSections.employment}
                onToggle={() => toggleSection('employment')}
                accent="purple"
              />
              {expandedSections.employment && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="Occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      icon={Award}
                    />
                    <InputField
                      label="Employer"
                      name="employer"
                      value={formData.employer}
                      onChange={handleChange}
                      icon={Building}
                    />
                    <InputField
                      label="Monthly Income (TSh)"
                      name="monthlyIncome"
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      min="0"
                      step="1000"
                      icon={DollarSign}
                      helper="In Tanzanian Shillings"
                    />
                    <InputField
                      label="Business Name"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      icon={Target}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Banking & Mobile Money */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <SectionHeader
                title="Banking & Mobile Money"
                icon={Landmark}
                expanded={expandedSections.banking}
                onToggle={() => toggleSection('banking')}
                accent="rose"
              />
              {expandedSections.banking && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField
                      label="Bank Name"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      icon={Landmark}
                    />
                    <InputField
                      label="Account Number"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      icon={Receipt}
                    />
                    <InputField
                      label="Mobile Money Provider"
                      name="mobileMoneyProvider"
                      type="select"
                      options={['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa']}
                      value={formData.mobileMoneyProvider}
                      onChange={handleChange}
                      icon={Smartphone}
                    />
                    <InputField
                      label="Mobile Money Number"
                      name="mobileMoneyNumber"
                      value={formData.mobileMoneyNumber}
                      onChange={handleChange}
                      icon={Wallet}
                      helper="Phone number registered with provider"
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
                  className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !!ageError}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: saving || ageError ? '#9CA3AF' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: saving || ageError ? 'none' : '0 4px 12px rgba(99,102,241,0.3)'
                  }}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}