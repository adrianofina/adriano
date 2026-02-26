"use client";

import { useState } from 'react';
import {
  X,
  AlertTriangle,
  Shield,
  Key,
  Fingerprint,
  Skull,
  Archive,
  Clock,
  User,
  Mail,
  Hash,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, verification: string) => void;
  customerName: string;
  customerId: string;
  stats?: {
    loans: number;
    documents: number;
    payments: number;
  };
}

export default function DeletionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  customerName, 
  customerId,
  stats = { loans: 0, documents: 0, payments: 0 }
}: DeletionModalProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [verification, setVerification] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const [typedText, setTypedText] = useState('');

  if (!isOpen) return null;

  const customerNameArray = customerName.split('');
  const verificationTarget = customerId.slice(-6); // Last 6 chars of ID

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTypedText(value);
    setTypingIndex(value.length);
  };

  const steps = [
    {
      title: 'Warning: Permanent Action',
      icon: AlertTriangle,
      color: 'red',
      description: 'You are about to delete a customer permanently.'
    },
    {
      title: 'Review Customer Data',
      icon: Archive,
      color: 'orange',
      description: 'Review what will be archived.'
    },
    {
      title: 'Super Admin Verification',
      icon: Shield,
      color: 'purple',
      description: 'Verify your super admin status.'
    },
    {
      title: 'Final Confirmation',
      icon: Skull,
      color: 'red',
      description: 'This action cannot be undone.'
    }
  ];

  const currentStep = steps[step - 1];
  const StepIcon = currentStep.icon;

  const getStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Skull className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 dark:text-red-300 text-lg">This is a PERMANENT action</h3>
                  <p className="text-red-600 dark:text-red-400 mt-1">
                    Deleting {customerName} will:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-red-700 dark:text-red-300">
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Remove all customer data from active system
                    </li>
                    <li className="flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      Move data to archive (can be restored by super admin)
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Log this action permanently in audit trail
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ This action will be recorded with your admin credentials and cannot be reversed without another super admin.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Customer</p>
                <p className="font-bold">{customerName}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">ID</p>
                <p className="font-mono text-sm">{customerId}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.loans}</p>
                <p className="text-xs text-gray-600">Loans</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.documents}</p>
                <p className="text-xs text-gray-600">Documents</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.payments}</p>
                <p className="text-xs text-gray-600">Payments</p>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                All this data will be archived and marked as deleted.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason for deletion (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Customer requested, Fraud, Duplicate account..."
                rows={3}
                className="w-full px-4 py-2 border rounded-xl"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Key className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800 dark:text-purple-300">Super Admin Verification</h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Enter the verification code to confirm super admin access
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Enter the last 6 characters of customer ID: <span className="font-mono bg-purple-100 px-2 py-1 rounded">{verificationTarget}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showVerification ? 'text' : 'password'}
                      value={verification}
                      onChange={(e) => setVerification(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border rounded-xl font-mono text-lg tracking-wider"
                      placeholder="••••••"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowVerification(!showVerification)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"
                    >
                      {showVerification ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This confirms you have physical access to the customer record
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-2">Verification status:</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${verification === verificationTarget ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      {verification === verificationTarget 
                        ? '✓ Verified - Proceed to final step' 
                        : '✗ Not verified - Check the customer ID'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative typing animation */}
            <div className="border rounded-xl p-4">
              <p className="text-sm font-medium mb-2">Type to confirm:</p>
              <p className="text-sm text-gray-600 mb-3">
                Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE {customerName}</span>
              </p>
              <input
                type="text"
                value={typedText}
                onChange={handleTyping}
                placeholder="Type here..."
                className="w-full px-4 py-2 border rounded-xl font-mono"
              />
              <div className="mt-2 flex gap-1">
                {customerNameArray.map((char, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded ${
                      i < typingIndex
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Final Confirmation</h3>
              <p className="text-red-600 dark:text-red-400 mb-4">
                You are about to delete <span className="font-bold">{customerName}</span>
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm mb-2">Deletion summary:</p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Customer will be archived</li>
                  <li>• Reason: {reason || 'Not specified'}</li>
                  <li>• Verification: {verification === verificationTarget ? '✅' : '❌'}</li>
                  <li>• Timestamp: {new Date().toLocaleString()}</li>
                </ul>
              </div>

              <label className="flex items-center gap-2 justify-center">
                <input
                  type="checkbox"
                  checked={agreeChecked}
                  onChange={(e) => setAgreeChecked(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  I understand this action is permanent and will be logged
                </span>
              </label>
            </div>
          </div>
        );
    }
  };

  const canProceed = () => {
    switch(step) {
      case 1: return true;
      case 2: return true; // Reason is optional
      case 3: return verification === verificationTarget && typedText === `DELETE ${customerName}`;
      case 4: return agreeChecked;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onConfirm(reason, verification);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${currentStep.color}-100 dark:bg-${currentStep.color}-900/20 rounded-xl`}>
              <StepIcon className={`w-6 h-6 text-${currentStep.color}-600 dark:text-${currentStep.color}-400`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentStep.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentStep.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {[1,2,3,4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === step
                    ? 'bg-blue-600 text-white'
                    : s < step
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && <div className={`w-12 h-1 mx-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {getStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={step === 4 ? () => onConfirm(reason, verification) : handleNext}
            disabled={!canProceed()}
            className={`px-6 py-2 rounded-lg transition-colors ${
              step === 4
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {step === 4 ? 'Permanently Delete' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
