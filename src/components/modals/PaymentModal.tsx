"use client";

import { useState } from 'react';
import { X, DollarSign, CreditCard, Smartphone, Banknote, Receipt, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  loanId: string;
  loanAmount: number;
  remainingBalance: number;
  customerName: string;
  loanIdNumber: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  loanId, 
  remainingBalance,
  customerName,
  loanIdNumber
}: PaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'cash',
    reference: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `TSh ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `TSh ${(amount / 1_000).toFixed(1)}K`;
    return `TSh ${amount.toLocaleString()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amount > remainingBalance) {
      setError(`Amount cannot exceed remaining balance (${formatCurrency(remainingBalance)})`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/loans/${loanId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: formData.method,
          reference: formData.reference,
          notes: formData.notes
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to record payment');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      method: 'cash',
      reference: '',
      notes: ''
    });
    setError('');
    setSuccess(false);
    onClose(false);
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'emerald' },
    { id: 'mobile', label: 'Mobile Money', icon: Smartphone, color: 'purple' },
    { id: 'bank', label: 'Bank Transfer', icon: CreditCard, color: 'blue' },
    { id: 'cheque', label: 'Cheque', icon: Receipt, color: 'amber' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !success && handleClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
        
        {success ? (
          // Success View
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Payment Recorded!</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Payment of {formatCurrency(parseFloat(formData.amount))} recorded.
            </p>
            <button
              onClick={() => onClose(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Record Payment</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                      {customerName} • {loanIdNumber}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Remaining Balance Display */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Remaining Balance</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(remainingBalance)}</p>
              </div>

              {error && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Amount (TSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">TSh</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                    placeholder="0.00"
                    required
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    const isSelected = formData.method === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, method: method.id })}
                        className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all ${
                          isSelected
                            ? `bg-${method.color}-100 dark:bg-${method.color}-900/30 border-${method.color}-500`
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        } border`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? `text-${method.color}-600` : 'text-gray-500'}`} />
                        <span className={`text-[9px] font-medium ${isSelected ? `text-${method.color}-700` : 'text-gray-500'}`}>
                          {method.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reference (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reference <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="TRX123456"
                />
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-3 h-3" />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
