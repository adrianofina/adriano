"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  Save,
  Info,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Landmark,
  Smartphone,
  IdCard,
  Heart,
  Users2,
  DollarSign,
  CalendarDays,
  Wallet,
  Receipt,
  Home,
  Globe,
  Award,
  Target
} from 'lucide-react';

interface FormData {
  firstName: string;
  surname: string;
  middleName: string;
  phoneNumber: string;
  alternativePhone: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  region: string;
  occupation: string;
  employer: string;
  monthlyIncome: string;
  businessName: string;
  maritalStatus: string;
  dependents: string;
  nationalId: string;
  bankName: string;
  accountNumber: string;
  mobileMoneyProvider: string;
  mobileMoneyNumber: string;
}

const InputField = ({
  label,
  name,
  value,
  onChange,
  required,
  type = 'text',
  options,
  icon: Icon,
  helper
}: any) => (
  <div className="space-y-1.5 group">
    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 transition-colors">
      {label}
      {required && <span className="text-rose-400 ml-0.5">*</span>}
    </label>
    <div className="relative flex items-center rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-indigo-400 bg-white dark:bg-gray-800/80">
      {Icon && (
        <div className="pl-3.5 pr-2 pointer-events-none">
          <Icon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-focus-within:text-indigo-400" />
        </div>
      )}
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 py-2.5 pr-4 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
        >
          <option value="">Select...</option>
          {options?.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="flex-1 py-2.5 pr-4 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
        />
      )}
    </div>
    {helper && (
      <p className="flex items-center gap-1 text-[10px] text-gray-400">
        <Info className="w-2.5 h-2.5" />
        {helper}
      </p>
    )}
  </div>
);

const SectionDivider = ({ label, icon: Icon, color }: { label: string; icon: any; color: string }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="h-px flex-none w-4 rounded-full" style={{ background: color }} />
    <div className="flex items-center gap-2 shrink-0">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
    </div>
    <div className="flex-1 h-px rounded-full" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
  </div>
);

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.surname || !formData.phoneNumber) {
      setError('First name, surname, and phone number are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the actual error message from the API
        throw new Error(data.error || 'Failed to create customer');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create customer');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/customers/${data.data.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error creating customer:', err);
      setError(err.message || 'Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#0d0e12] dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.7) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }} />
        <div className="absolute -top-10 left-1/4 w-72 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />

        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/customers"
              className="mt-0.5 p-2 rounded-xl transition-all shrink-0 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.12)' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400">New customer</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                Add New Customer
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Enter customer information across all sections below
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6">

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Customer created successfully!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Redirecting to customer profile...</p>
            </div>
            <div className="ml-auto w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0 mt-1" />
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl mb-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-rose-100 dark:bg-rose-900/30">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Something went wrong</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">

              {/* Personal Information */}
              <div className="px-6 pt-6">
                <SectionDivider label="Personal Information" icon={User} color="#6366f1" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required icon={User} />
                <InputField label="Surname" name="surname" value={formData.surname} onChange={handleChange} required icon={Users2} />
                <InputField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} icon={User} />
                <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} icon={CalendarDays} helper="Must be 18+ years" />
                <InputField label="Gender" name="gender" type="select" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleChange} icon={Users} />
                <InputField label="Marital Status" name="maritalStatus" type="select" options={['Single', 'Married', 'Divorced', 'Widowed']} value={formData.maritalStatus} onChange={handleChange} icon={Heart} />
                <InputField label="Dependents" name="dependents" type="number" min="0" value={formData.dependents} onChange={handleChange} icon={Users2} />
                <InputField label="National ID" name="nationalId" value={formData.nationalId} onChange={handleChange} icon={IdCard} helper="NIDA or other official ID" />
              </div>

              {/* Contact Information */}
              <div className="px-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <SectionDivider label="Contact Information" icon={Phone} color="#5ec2a0" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required icon={Phone} helper="Format: 255712345678" />
                <InputField label="Alternative Phone" name="alternativePhone" value={formData.alternativePhone} onChange={handleChange} icon={Smartphone} />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} />
              </div>

              {/* Address */}
              <div className="px-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <SectionDivider label="Address" icon={MapPin} color="#fdc565" />
              </div>
              <div className="px-6 pb-6 space-y-4">
                <InputField label="Street Address" name="address" value={formData.address} onChange={handleChange} icon={Home} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="City" name="city" value={formData.city} onChange={handleChange} icon={Building} />
                  <InputField label="Region" name="region" value={formData.region} onChange={handleChange} icon={Globe} />
                </div>
              </div>

              {/* Employment */}
              <div className="px-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <SectionDivider label="Employment & Financial" icon={Briefcase} color="#c997f8" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} icon={Award} />
                <InputField label="Employer" name="employer" value={formData.employer} onChange={handleChange} icon={Building} />
                <InputField label="Monthly Income (TSh)" name="monthlyIncome" type="number" min="0" step="1000" value={formData.monthlyIncome} onChange={handleChange} icon={DollarSign} helper="In Tanzanian Shillings" />
                <InputField label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} icon={Target} />
              </div>

              {/* Banking */}
              <div className="px-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <SectionDivider label="Banking & Mobile Money" icon={Landmark} color="#fd7878" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} icon={Landmark} />
                <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleChange} icon={Receipt} />
                <InputField label="Mobile Money Provider" name="mobileMoneyProvider" type="select" options={['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa']} value={formData.mobileMoneyProvider} onChange={handleChange} icon={Smartphone} />
                <InputField label="Mobile Money Number" name="mobileMoneyNumber" value={formData.mobileMoneyNumber} onChange={handleChange} icon={Wallet} helper="Phone number registered with provider" />
              </div>

            </div>

            {/* Form Actions */}
            <div className="sticky bottom-0 mt-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 -mx-4 sm:mx-0 sm:static sm:border-0 sm:p-0 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                <Link
                  href="/admin/customers"
                  className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(99,102,241,0.3)'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Customer
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
