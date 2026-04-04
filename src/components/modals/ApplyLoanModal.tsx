"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Send,
  Calculator
} from 'lucide-react';

interface ApplyLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyLoanModal({ isOpen, onClose, onSuccess }: ApplyLoanModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    term: '12',
    description: ''
  });

  // Interest calculation state
  const [interestRate] = useState(3.5); // 3.5% per month (BOT regulation)
  const [totalInterest, setTotalInterest] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalRepayment, setTotalRepayment] = useState(0);

  const loanPurposes = [
    'Business Expansion',
    'School Fees',
    'Medical Emergency',
    'Home Improvement',
    'Vehicle Purchase',
    'Agriculture',
    'Personal Loan',
    'Other'
  ];

  // Calculate interest whenever amount or term changes
  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const termMonths = parseInt(formData.term) || 0;
    
    if (amount > 0 && termMonths > 0) {
      // Simple interest calculation: Principal × Rate × Time
      // Rate is 3.5% per month = 0.035
      const interest = amount * (interestRate / 100) * termMonths;
      const total = amount + interest;
      const monthly = total / termMonths;
      
      setTotalInterest(interest);
      setTotalRepayment(total);
      setMonthlyPayment(monthly);
    } else {
      setTotalInterest(0);
      setTotalRepayment(0);
      setMonthlyPayment(0);
    }
  }, [formData.amount, formData.term, interestRate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const amount = parseFloat(formData.amount);
    const termMonths = parseInt(formData.term);
    const interest = amount * (interestRate / 100) * termMonths;
    const totalAmount = amount + interest;

    try {
      const res = await fetch('/api/customers/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          purpose: formData.purpose,
          term: termMonths,
          description: formData.description,
          interestRate: interestRate,
          totalInterest: interest,
          totalAmount: totalAmount,
          monthlyPayment: totalAmount / termMonths
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return 'TSh 0';
    return `TSh ${amount.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply for a Loan</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill out the form to start your application</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Application Submitted!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your loan application has been received. Our team will review it within 24-48 hours.
            </p>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Amount *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Enter amount in TSh"
                    required
                    min="50000"
                    step="10000"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: TSh 50,000</p>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Purpose *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select purpose</option>
                  {loanPurposes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Loan Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Term (months) *
                </label>
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>

              {/* Interest Rate Info */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Interest Rate: {interestRate}% per month</span>
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">As per BOT regulations</p>
              </div>

              {/* Interest Calculation Preview */}
              {parseFloat(formData.amount) > 0 && parseInt(formData.term) > 0 && (
                <div className="bg-indigo-50/30 dark:bg-indigo-950/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                  <p className="text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">Loan Breakdown</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Principal Amount:</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total Interest ({interestRate}% × {formData.term} months):</span>
                      <span className="text-sm font-bold text-amber-600">{formatCurrency(totalInterest)}</span>
                    </div>
                    <div className="border-t border-indigo-100 dark:border-indigo-800 pt-2 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total Repayment:</span>
                        <span className="text-base font-black text-indigo-600">{formatCurrency(totalRepayment)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">Monthly Payment:</span>
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(monthlyPayment)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us more about why you need this loan..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !formData.amount || !formData.purpose}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Application
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
