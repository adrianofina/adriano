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
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  middleName?: string;
  phoneNumber: string;
  email?: string;
  city?: string;
  region?: string;
  occupation?: string;
  employer?: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch customer');
      }
      const data = await res.json();
      setCustomer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customer not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {error || 'The customer you\'re looking for doesn\'t exist.'}
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Customer ID: {customer.customerId} • Joined {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>
        <Link
          href={`/admin/customers/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </Link>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Full Name</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.firstName} {customer.middleName} {customer.surname}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Phone Number</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {customer.phoneNumber}
                </dd>
              </div>
              {customer.email && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {customer.email}
                  </dd>
                </div>
              )}
              {(customer.city || customer.region) && (
                <div>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Location</dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {[customer.city, customer.region].filter(Boolean).join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employment</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Occupation</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.occupation || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Employer</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.employer || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">Created By</dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-white">
                  {customer.createdBy?.name || 'System'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link
          href={`/admin/loans/new?customerId=${id}`}
          className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Create Loan</span>
        </Link>
        <Link
          href={`/admin/documents/upload?customerId=${id}`}
          className="flex items-center justify-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Upload Document</span>
        </Link>
      </div>
    </div>
  );
}
