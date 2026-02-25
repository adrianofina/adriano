"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Save,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar,
  Users,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react';

export default function NewCustomerPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ageError, setAgeError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    contact: false,
    address: false,
    employment: false,
    banking: false,
    additional: false
  });
  
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

  // Auto-scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  // Check auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

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

  const validateAge = (dob: string): string => {
    if (!dob) return '';
    const age = calculateAge(dob);
    if (age === null) return '';
    if (age < 18) return 'Customer must be at least 18 years old';
    if (age > 120) return 'Please enter a valid date of birth';
    return '';
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    setFormData({ ...formData, dateOfBirth: dob });
    setAgeError(validateAge(dob));
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
    
    if (!user) {
      setError('You must be logged in');
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.surname || !formData.phoneNumber) {
      setError('First name, surname, and phone number are required');
      return;
    }

    // Validate age if date of birth is provided
    if (formData.dateOfBirth) {
      const ageError = validateAge(formData.dateOfBirth);
      if (ageError) {
        setError(ageError);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // Use regular fetch to see the raw response
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to create customer');
      }

      // Handle different response formats
      let customerId;
      if (data.data?.id) {
        customerId = data.data.id;
      } else if (data.id) {
        customerId = data.id;
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from server');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/customers/${customerId}`);
        router.refresh();
      }, 1500);

    } catch (err: any) {
      console.error('Error creating customer:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, icon: Icon, section, color }: any) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <span className="font-medium text-gray-900 dark:text-white">{title}</span>
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/customers"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">New Customer</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add a new customer to the system
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Customer created successfully! Redirecting...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !success && (
        <div 
          ref={errorRef}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader title="Personal Information" icon={Users} section="personal" color="blue" />
            
            {expandedSections.personal && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Surname <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder="Enter surname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder="Enter middle name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleDateChange}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      className={`w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base ${
                        ageError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                      }`}
                    />
                    {ageError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">{ageError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base"
                    >
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <SectionHeader title="Contact Information" icon={Phone} section="contact" color="green" />
            
            {expandedSections.contact && (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      placeholder="255712345678"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Format: 255712345678</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alternative Phone
                    </label>
                    <input
                      type="tel"
                      name="alternativePhone"
                      value={formData.alternativePhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder="255712345678"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-base"
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 -mx-4 sm:mx-0 sm:static sm:border-0 sm:p-0 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
              <Link
                href="/admin/customers"
                className="w-full sm:w-auto text-center px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Customer</span>
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
