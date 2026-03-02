"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Edit,
  RefreshCw,
  Upload,
  Eye,
  Download,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  AlertCircle
} from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  riskLevel?: string;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
}

interface Loan {
  id: string;
  loanId: string;
  amount: number;
  status: string;
  purpose: string;
  progress: number;
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeTab, setActiveTab] = useState('loans');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const customerId = params.id as string;

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      
      // Fetch customer data using the ID from URL
      const customerRes = await fetch(`/api/admin/customers/${customerId}`);
      if (!customerRes.ok) throw new Error('Failed to fetch customer');
      const customerData = await customerRes.json();
      
      // Fetch loans
      const loansRes = await fetch(`/api/admin/customers/${customerId}/loans`);
      const loansData = loansRes.ok ? await loansRes.json() : { data: [] };

      setCustomer(customerData.data || customerData);
      setLoans(loansData.data || []);
      
    } catch (error) {
      console.error('Error fetching customer:', error);
      setError('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `TSh ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `TSh ${(amount / 1000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Customer Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The customer could not be found'}</p>
          <button
            onClick={() => router.push('/admin/customers')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/customers')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {customer.firstName} {customer.surname}
              </h1>
              <p className="text-sm text-gray-600">{customer.customerId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCustomerData}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            <Link
              href={`/admin/customers/${customerId}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {customer.firstName[0]}{customer.surname[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{customer.firstName} {customer.surname}</h3>
                  <p className="text-sm text-gray-600">{customer.customerId}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{customer.phoneNumber}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{customer.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <CreditCard className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-2xl font-bold">{customer.activeLoans}</p>
                <p className="text-xs text-gray-600">Active Loans</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <DollarSign className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-2xl font-bold">{formatCurrency(customer.totalBorrowed)}</p>
                <p className="text-xs text-gray-600">Total Borrowed</p>
              </div>
            </div>
          </div>

          {/* Right Column - Loans */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 px-6">
                <div className="flex gap-6">
                  <button
                    onClick={() => setActiveTab('loans')}
                    className={`py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'loans'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600'
                    }`}
                  >
                    Loans ({loans.length})
                  </button>
                </div>
              </div>

              <div className="p-6">
                {loans.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No loans yet</p>
                    <Link
                      href={`/admin/loans/new?customerId=${customer.id}`}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Loan
                    </Link>
                  </div>
                ) : (
                  loans.map((loan) => (
                    <div key={loan.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{loan.loanId}</span>
                        <span className="text-sm text-green-600">{loan.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{loan.purpose}</p>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{formatCurrency(loan.amount)}</span>
                        <span>{loan.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${loan.progress}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}