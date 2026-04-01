"use client";

import { useState } from 'react';
import { X, CreditCard, Clock, CheckCircle, AlertCircle, PlayCircle, Gavel, BellRing, PhoneCall, Scale } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  customerId?: string;
}

export default function LoanModal({ isOpen, onClose, customerId }: LoanModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    term: '12',
    interestRate: '12',
    status: 'pending',
    nextPaymentDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUrgentWarning, setShowUrgentWarning] = useState(false);

  if (!isOpen) return null;

  const statusOptions = [
    { 
      id: 'pending', 
      label: 'Pending', 
      icon: Clock, 
      color: 'amber', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      selectedBg: 'bg-amber-100 dark:bg-amber-900/40',
      description: 'Awaiting approval'
    },
    { 
      id: 'active', 
      label: 'Active', 
      icon: PlayCircle, 
      color: 'emerald', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      selectedBg: 'bg-emerald-100 dark:bg-emerald-900/40',
      description: 'Customer owes money'
    },
    { 
      id: 'completed', 
      label: 'Completed', 
      icon: CheckCircle, 
      color: 'purple', 
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      selectedBg: 'bg-purple-100 dark:bg-purple-900/40',
      description: 'Fully paid'
    },
    { 
      id: 'overdue', 
      label: 'OVERDUE', 
      icon: AlertCircle, 
      color: 'red', 
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      selectedBg: 'bg-red-100 dark:bg-red-900/40',
      description: 'URGENT: Contact immediately',
      urgent: true
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Dramatic confirmation for overdue loans
    if (formData.status === 'overdue') {
      const confirmUrgent = confirm(
        '⚠️ URGENT ACTION REQUIRED ⚠️\n\n' +
        'This loan is being marked as OVERDUE.\n\n' +
        'This will:\n' +
        '• Flag this customer for immediate contact\n' +
        '• Add to overdue reports\n' +
        '• May trigger collection procedures\n\n' +
        'Do you want to proceed?'
      );
      if (!confirmUrgent) return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          term: parseInt(formData.term),
          interestRate: parseFloat(formData.interestRate),
          nextPaymentDate: formData.nextPaymentDate ? new Date(formData.nextPaymentDate) : null
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to create loan');
      }

      setFormData({
        amount: '',
        purpose: '',
        term: '12',
        interestRate: '12',
        status: 'pending',
        nextPaymentDate: ''
      });

      onClose(true);

    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStatusChange = (statusId: string) => {
    setFormData({ ...formData, status: statusId });
    if (statusId === 'overdue') {
      setShowUrgentWarning(true);
      setTimeout(() => setShowUrgentWarning(false), 3000);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      purpose: '',
      term: '12',
      interestRate: '12',
      status: 'pending',
      nextPaymentDate: ''
    });
    setError('');
    onClose(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Loan</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {showUrgentWarning && (
          <div className="mx-5 mt-4 p-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 rounded-lg animate-pulse">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-red-600 animate-bounce" />
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                ⚠️ URGENT: This loan will be marked as OVERDUE
              </p>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 ml-6">
              Customer requires immediate contact. Collection procedures may be triggered.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Loan Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">TSh</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="0.00"
                required
                min="1000"
                step="1000"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Purpose
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Business expansion"
              required
            />
          </div>

          {/* Term and Interest Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Term
              </label>
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              >
                {[3, 6, 9, 12, 18, 24, 36].map(m => (
                  <option key={m} value={m}>{m} months</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Interest
              </label>
              <input
                type="number"
                name="interestRate"
                step="0.1"
                value={formData.interestRate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                placeholder="12"
              />
            </div>
          </div>

          {/* Status Selection - Compact Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Loan Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map(option => {
                const Icon = option.icon;
                const isSelected = formData.status === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleStatusChange(option.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
                      isSelected 
                        ? `${option.selectedBg} border-2 ${option.border} shadow-sm` 
                        : `${option.bg} border border-gray-200 dark:border-gray-700 hover:shadow-sm`
                    } ${option.urgent && isSelected ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? `text-${option.color}-600` : 'text-gray-500'}`} />
                    <div className="text-left min-w-0 flex-1">
                      <p className={`text-xs font-semibold ${isSelected ? `text-${option.color}-700` : 'text-gray-700 dark:text-gray-300'}`}>
                        {option.label}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{option.description}</p>
                    </div>
                    {option.urgent && isSelected && (
                      <BellRing className="w-3 h-3 text-red-500 animate-pulse flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* First Due Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              First Due Date
            </label>
            <input
              type="date"
              name="nextPaymentDate"
              value={formData.nextPaymentDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[10px] text-gray-400 mt-1">Optional</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                formData.status === 'overdue'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {formData.status === 'overdue' ? (
                    <>
                      <Gavel className="w-4 h-4" />
                      Create Overdue Loan
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Create Loan
                    </>
                  )}
                </>
              )}
            </button>
          </div>

          {/* Legal Disclaimer for Overdue */}
          {formData.status === 'overdue' && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                    Legal Action May Be Required
                  </p>
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                    Overdue loans may result in collection proceedings. A court case file may be opened if payment is not received.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
