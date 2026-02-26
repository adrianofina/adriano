"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Plus,
  X
} from 'lucide-react';

interface Loan {
  id: string;
  loanId: string;
  amount: number;
  purpose: string;
  status: string;
}

interface Customer {
  id: string;
  firstName: string;
  surname: string;
  customerId: string;
  phoneNumber: string;
  email?: string;
  stats?: {
    loanCount: number;
  };
  loans?: Loan[];
}

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanError, setLoanError] = useState('');
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: '',
    purpose: '',
    term: '12',
    interestRate: '12'
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
      
      setCustomer(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoanLoading(true);
    setLoanError('');
    
    try {
      console.log('Creating loan for customer:', params?.id);
      console.log('Loan data:', loanForm);
      
      const response = await fetch(`/api/admin/customers/${params?.id}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanForm)
      });

      const result = await response.json();
      console.log('Loan creation response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create loan');
      }

      // Success - reset and close
      setLoanForm({ amount: '', purpose: '', term: '12', interestRate: '12' });
      setShowLoanModal(false);
      fetchCustomer(); // Refresh the page
      
    } catch (err: any) {
      console.error('Loan creation error:', err);
      setLoanError(err.message);
    } finally {
      setLoanLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Customer not found</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/admin/customers" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{customer.firstName} {customer.surname}</h1>
        </div>
        <button onClick={fetchCustomer} className="p-2 border rounded-lg">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <p><strong>Customer ID:</strong> {customer.customerId}</p>
        <p><strong>Phone:</strong> {customer.phoneNumber}</p>
        {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
      </div>

      {/* Loans Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Loans ({customer.stats?.loanCount || 0})</h2>
          <button
            onClick={() => {
              setShowLoanModal(true);
              setLoanError('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Loan
          </button>
        </div>

        {customer.loans && customer.loans.length > 0 ? (
          <div className="space-y-3">
            {customer.loans.map((loan) => (
              <div key={loan.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{loan.loanId}</p>
                    <p className="text-sm text-gray-600">{loan.purpose}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded ${
                    loan.status === 'active' ? 'bg-green-100 text-green-700' :
                    loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    loan.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {loan.status}
                  </span>
                </div>
                <p className="text-xl font-bold mt-2">{formatCurrency(loan.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 py-4">No loans yet</p>
        )}
      </div>

      {/* Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Loan</h2>
              <button onClick={() => setShowLoanModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loanError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Error:</strong> {loanError}
              </div>
            )}

            <form onSubmit={createLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (TSh)</label>
                <input
                  type="number"
                  value={loanForm.amount}
                  onChange={(e) => setLoanForm({...loanForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  min="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purpose</label>
                <input
                  type="text"
                  value={loanForm.purpose}
                  onChange={(e) => setLoanForm({...loanForm, purpose: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Term (months)</label>
                  <input
                    type="number"
                    value={loanForm.term}
                    onChange={(e) => setLoanForm({...loanForm, term: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanForm.interestRate}
                    onChange={(e) => setLoanForm({...loanForm, interestRate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loanLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loanLoading ? 'Creating...' : 'Create Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
