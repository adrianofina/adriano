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
  Upload,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  Building,
  AlertCircle,
  TrendingUp,
  Plus,
  X,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import LoanModal from '@/components/modals/LoanModal';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';

interface Customer {
  id: string;
  customerId: string;
  firstName: string;
  surname: string;
  middleName?: string;
  phoneNumber: string;
  alternativePhone?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  region?: string;
  occupation?: string;
  employer?: string;
  monthlyIncome?: number;
  businessName?: string;
  maritalStatus?: string;
  dependents?: number;
  nationalId?: string;
  bankName?: string;
  accountNumber?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  creditScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  category?: string;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  totalBorrowed: number;
  totalRepaid: number;
  createdAt: string;
  updatedAt: string;
}

interface Loan {
  id: string;
  loanId: string;
  amount: number;
  amountPaid?: number;
  status: string;
  purpose: string;
  progress: number;
  dueDate?: string;
  interestRate?: number;
  remainingBalance?: number;
}

interface Document {
  id: string;
  name?: string;
  fileName?: string;
  type?: string;
  documentType?: string;
  size?: number;
  fileSize?: number;
  fileUrl?: string;
  uploadedAt: string;
  verified: boolean;
}


// ─── Progress Ring ───
const ProgressRing = ({
  progress,
  size = 100,
  strokeWidth = 7,
  status = 'active',
  label,
  value,
  onDark = false,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  status?: string;
  label: string;
  value: string;
  onDark?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const dashOffset = circumference - (circumference * clamped) / 100;
  const isEmpty = clamped === 0;

  const ringColor =
    clamped >= 100 ? '#10B981'
    : status === 'overdue' ? '#EF4444'
    : isEmpty ? (onDark ? '#374151' : '#D1D5DB')
    : '#818CF8';

  const trackColor = onDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor  = isEmpty
    ? (onDark ? '#6B7280' : '#9CA3AF')
    : (onDark ? '#FFFFFF' : '#111827');
  const subColor   = onDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" style={{ display: 'block' }}>
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={ringColor} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={isEmpty ? circumference : dashOffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)',
              filter: isEmpty ? 'none' : `drop-shadow(0 0 6px ${ringColor}70)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span style={{ fontSize: size <= 86 ? '0.95rem' : '1.15rem', fontWeight: 700, color: textColor, lineHeight: 1 }}>
            {clamped}%
          </span>
          <span style={{ fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: subColor, marginTop: 3 }}>
            {label}
          </span>
        </div>
      </div>
      <span style={{ fontSize: '0.65rem', color: subColor }}>{value}</span>
    </div>
  );
};

// ─── Loan Card ───
const LoanCard = ({ loan, formatCurrency }: { loan: Loan; formatCurrency: (n: number) => string }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700/60">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{loan.loanId}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{loan.purpose}</p>
      </div>
      <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full ${
        loan.status === 'active'  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : loan.status === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
      }`}>{loan.status}</span>
    </div>
    <div className="flex justify-between text-xs mb-2">
      <span className="text-gray-500 dark:text-gray-400">Amount</span>
      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</span>
    </div>
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-gray-500 dark:text-gray-400">Repayment</span>
      <span className="font-semibold text-gray-900 dark:text-white">{loan.progress}%</span>
    </div>
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className="h-full bg-indigo-500 rounded-full" style={{
        width: `${Math.min(100, loan.progress)}%`,
        transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
    {loan.dueDate && (
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
        Due {new Date(loan.dueDate).toLocaleDateString()}
      </p>
    )}
  </div>
);
// ─── Document Card Component (with delete button) ───
const DocumentCard = ({ doc, customerId, onDelete }: { doc: Document; customerId: string; onDelete: (id: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false); 
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Gets the correct field names 
  const fileName = doc.fileName || doc.name || 'Untitled';
  const documentType = doc.documentType || doc.type || 'Document';
  const fileSize = doc.fileSize || doc.size || 0;
  const fileUrl = doc.fileUrl || '#';

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This action can be undone later.')) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/documents/${doc.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        onDelete(doc.id);
      } else {
        alert(result.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get document type label for display
  const documentTypeLabels: Record<string, string> = {
    national_id: 'National ID',
    passport_photo: 'Passport Photo',
    bank_statement: 'Bank Statement',
    salary_slip: 'Salary Slip',
    employment_letter: 'Employment Letter',
    business_license: 'Business License',
    tax_clearance: 'Tax Clearance',
    court_document: 'Court Document',
    contract: 'Contract',
    guarantor_letter: 'Guarantor Letter'
  };
  
  const displayType = documentTypeLabels[documentType] || documentType;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fileName}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
              {displayType}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(fileSize)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        {doc.verified ? (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium" title="Verified">
            <CheckCircle className="w-3 h-3" />
          </span>
        ) : (
          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-medium" title="Pending verification">
            <Clock className="w-3 h-3" />
          </span>
        )}
        {fileUrl !== '#' && (
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="View document"
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </a>
        )}
        <a 
          href={fileUrl} 
          download 
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Download document"
        >
          <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </a>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete document"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-red-500" />
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Page ────
export default function CustomerDetailsPage() {
  const params   = useParams();
  const router   = useRouter();
  const [customer,  setCustomer]  = useState<Customer | null>(null);
  const [loans,     setLoans]     = useState<Loan[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loading,   setLoading]   = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const customerId = params.id as string;

  const fetchData = async () => {
    try {
      const [cRes, lRes, dRes] = await Promise.all([
        fetch(`/api/admin/customers/${customerId}`),
        fetch(`/api/admin/customers/${customerId}/loans`),
        fetch(`/api/admin/customers/${customerId}/documents`),
      ]);
      const cData = await cRes.json();
      const lData = await lRes.json();
      const dData = await dRes.json();
      setCustomer(cData.data || cData);
      setLoans(lData.data || []);
      setDocuments(dData.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchData();
  }, [customerId]);

  const formatCurrency = (n: number) => {
    if (!n) return 'TSh 0';
    if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `TSh ${(n / 1_000).toFixed(1)}K`;
    return `TSh ${n.toLocaleString()}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  );

  if (!customer) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Customer Not Found</h2>
        <button onClick={() => router.push('/admin/customers')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">
          Back to Customers
        </button>
      </div>
    </div>
  );

  const activePercentage  = customer.totalLoans > 0
    ? Math.round((customer.activeLoans / customer.totalLoans) * 100) : 0;
  const repaidPercentage  = customer.totalBorrowed > 0
    ? Math.round((customer.totalRepaid / customer.totalBorrowed) * 100) : 0;
  const hasOverdue        = customer.overdueLoans > 0;

  const riskPill = {
    low:    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-400/15 dark:text-emerald-300 dark:border-emerald-400/20',
    medium: 'bg-amber-100   text-amber-700   border-amber-200   dark:bg-amber-400/15   dark:text-amber-300   dark:border-amber-400/20',
    high:   'bg-red-100     text-red-700     border-red-200     dark:bg-red-400/15     dark:text-red-300     dark:border-red-400/20',
  }[customer.riskLevel || 'medium'] ?? 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <header className="relative overflow-hidden
        bg-gradient-to-br from-indigo-50 via-white to-purple-50
        dark:from-gray-900 dark:via-[#0d0e12] dark:to-gray-900">

        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div className="absolute -top-12 left-[20%] w-80 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute -top-8 right-[15%] w-64 h-36 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.10) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-8">

          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/admin/customers')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white/90 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Customers
            </button>
            <Link href={`/admin/customers/${customerId}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-900 dark:text-white/60 dark:hover:text-white/90 transition-all text-sm border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-transparent">
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>

          <div className="flex items-center gap-5">

            <div className="flex items-center gap-4 px-5 py-4 rounded-2xl flex-1 min-w-0" style={{
              background: 'linear-gradient(130deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 50%, rgba(59,130,246,0.07) 100%)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,102,241,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 12px rgba(99,102,241,0.08)',
            }}>
              <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center font-bold text-white text-sm" style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.85) 0%, rgba(168,85,247,0.75) 100%)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}>
                {customer.firstName?.[0]}{customer.surname?.[0]}
              </div>

              <div className="min-w-0">
                <h1 className="text-[1.05rem] font-semibold text-gray-900 dark:text-white leading-tight truncate">
                  {customer.firstName} {customer.surname}
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10.5px] text-gray-400 dark:text-white/35 font-mono tracking-wide">
                    {customer.customerId}
                  </span>
                  <span className="text-gray-300 dark:text-white/15">·</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskPill}`}>
                    {(customer.riskLevel || 'N/A').toUpperCase()}
                  </span>
                  {hasOverdue && (
                    <>
                      <span className="text-gray-300 dark:text-white/15">·</span>
                      <span className="flex items-center gap-1 text-[11px] text-red-500 dark:text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        {customer.overdueLoans} overdue
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 pr-1">
              <ProgressRing
                progress={activePercentage}
                size={90}
                strokeWidth={6}
                status={hasOverdue ? 'overdue' : 'active'}
                label="active"
                value={`${customer.activeLoans} / ${customer.totalLoans}`}
                onDark={false}
              />
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-6 pb-10 space-y-4">

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: <Phone className="w-3.5 h-3.5 text-indigo-500" />, label: 'Phone',   value: customer.phoneNumber },
            { icon: <Mail  className="w-3.5 h-3.5 text-purple-500" />, label: 'Email',   value: customer.email || 'N/A' },
            { icon: <MapPin className="w-3.5 h-3.5 text-blue-500" />,  label: 'Address', value: customer.address || customer.city || customer.region || 'N/A' },
          ].map(({ icon, label, value }) => (
            <div key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl
                bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Repayment Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-white dark:bg-gray-900 shadow-sm">
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.05]" style={{
            background: 'linear-gradient(120deg, #6366f1 0%, #a855f7 100%)',
          }} />
          <div className="relative flex items-center gap-6 px-6 py-5">
            <div className="shrink-0">
              <ProgressRing
                progress={repaidPercentage}
                size={100}
                strokeWidth={7}
                status={repaidPercentage >= 100 ? 'completed' : 'active'}
                label="repaid"
                value={`${formatCurrency(customer.totalRepaid)} paid`}
                onDark={false}
              />
            </div>
            <div className="w-px self-stretch bg-gray-100 dark:bg-gray-800 shrink-0" />
            <div className="flex-1 grid grid-cols-3 gap-4 min-w-0">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Borrowed</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(customer.totalBorrowed)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Repaid</p>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(customer.totalRepaid)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">Outstanding</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(Math.max(0, customer.totalBorrowed - customer.totalRepaid))}
                </p>
              </div>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20">
              <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            </div>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-r-full"
              style={{ width: `${repaidPercentage}%`, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

          <div className="flex gap-0 border-b border-gray-100 dark:border-gray-800 px-6">
            {[
              { key: 'details',   label: 'Personal Details' },
              { key: 'loans',     label: `Loans (${loans.length})` },
              { key: 'documents', label: `Documents (${documents.length})` },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`py-3.5 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* Personal Details */}
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Personal Information</h4>
                  </div>
                  <div className="space-y-2.5">
                    <Field label="Full Name"
                      value={[customer.firstName, customer.middleName, customer.surname].filter(Boolean).join(' ')} />
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="Gender"      value={customer.gender || 'N/A'} />
                      <Field label="Date of Birth"
                        value={customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'N/A'} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <Field label="Marital Status" value={customer.maritalStatus || 'N/A'} />
                      <Field label="Dependents"     value={String(customer.dependents ?? 0)} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Employment & Income</h4>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    <Field label="Occupation"     value={customer.occupation || 'N/A'} />
                    <Field label="Employer"       value={customer.employer || customer.businessName || 'N/A'} />
                    <Field label="Monthly Income" value={formatCurrency(customer.monthlyIncome || 0)} />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                      <Building className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Banking Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field label="Bank"       value={customer.bankName || 'N/A'} />
                    <Field label="Account No" value={customer.accountNumber || 'N/A'} />
                  </div>
                </div>
              </div>
            )}

            {/* Loans Tab */}
            {activeTab === 'loans' && (
              <div className="space-y-3">
                <div className="flex justify-end mb-1">
                  <button
                    onClick={() => setShowLoanModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Loan
                  </button>
                </div>
                {loans.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 dark:text-gray-500">No loans yet</p>
                    <button
                      onClick={() => setShowLoanModal(true)}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Loan
                    </button>
                  </div>
                ) : (
                  <>
                    {loans.map(loan => (
                      <LoanCard key={loan.id} loan={loan} formatCurrency={formatCurrency} />
                    ))}
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setShowLoanModal(true)}
                        className="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Loan
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

           {/* ── Documents Tab ── */}
{activeTab === 'documents' && (
  <div className="space-y-3">
    <div className="flex justify-end mb-1">
      <button
        onClick={() => setShowDocumentModal(true)}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
      >
        <Upload className="w-3.5 h-3.5" />
        Upload Document
      </button>
    </div>
    {documents.length === 0 ? (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
        <p className="text-sm text-gray-400 dark:text-gray-500">No documents yet</p>
        <button
          onClick={() => setShowDocumentModal(true)}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload First Document
        </button>
      </div>
    ) : (
      <>
        {documents.map(doc => (
          <DocumentCard 
            key={doc.id} 
            doc={doc} 
            customerId={customerId}
            onDelete={(deletedId) => {
          setDocuments(documents.filter(d => d.id !== deletedId));
           }}
          />
        ))}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowDocumentModal(true)}
            className="px-4 py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Another Document
          </button>
        </div>
      </>
    )}
  </div>
)}

          </div>
        </div>

      </main>

      {/* Loan Modal */}
      {showLoanModal && customer && (
        <LoanModal
          isOpen={showLoanModal}
          onClose={(refresh) => {
            setShowLoanModal(false);
            if (refresh) {
              fetchData();
            }
          }}
          customerId={customer.id}
        />
      )}

      {/* Document Modal */}
      {showDocumentModal && customer && (
        <DocumentUploadModal
          isOpen={showDocumentModal}
          onClose={(refresh) => {
            setShowDocumentModal(false);
            if (refresh) {
              fetchData();
            }
          }}
          customerId={customer.id}
        />
      )}
    </div>
  );
}

// Field component
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}