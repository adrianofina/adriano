'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  Heart,
  CreditCard,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Edit,
  MoreVertical,
  Shield,
  Award,
  TrendingUp,
  DollarSign,
  Upload,
  Camera,
  IdCard,
  Landmark,
  Smartphone,
  Users,
  FileSignature,
  Copy,
  History
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const { userRole, canEditCustomer, canDeleteCustomer } = usePermissions();
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'documents' | 'audit'>('overview');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  // Mock customer data - In production, this would come from API
  const customer = {
    id: customerId,
    firstName: 'Laurent',
    surname: 'Adriano',
    middleName: 'John',
    phoneNumber: '+255784461743',
    alternativePhone: '+255712345678',
    email: 'adriandevelopment@gmail.com',
    dateOfBirth: '1969-02-14',
    age: 55,
    gender: 'Male',
    placeOfBirth: 'Mwanza',
    
    address: 'Business Street, Mwanza',
    city: 'Mwanza',
    region: 'Mwanza',
    district: 'Nyamagana',
    ward: 'Mkolani',
    street: 'Business Street',
    postalCode: '33100',
    country: 'Tanzania',
    
    occupation: 'Business Man',
    employer: 'Self Employed',
    monthlyIncome: 3500000,
    businessName: 'Adriano Enterprises',
    businessType: 'Retail',
    businessRegistration: '123456789',
    
    maritalStatus: 'Married',
    dependents: 3,
    spouseName: 'Maria Adriano',
    spousePhone: '+255756789012',
    
    nextOfKinName: 'Maria Adriano',
    nextOfKinRelation: 'Spouse',
    nextOfKinPhone: '+255756789012',
    
    guarantorName: 'John Mkude',
    guarantorRelation: 'Business Partner',
    guarantorPhone: '+255767890123',
    guarantorOccupation: 'Business Man',
    guarantorMonthlyIncome: 4000000,
    
    nationalId: '19800123-45678',
    passportNumber: 'AB123456',
    votersId: 'VOTER-789012',
    driversLicense: 'DL-345678',
    tinNumber: '123-456-789',
    
    bankName: 'NMB',
    accountNumber: '1234567890',
    accountName: 'Laurent Adriano',
    mobileMoneyProvider: 'vodacom',
    mobileMoneyNumber: '+255784461743',
    
    creditScore: 750,
    riskLevel: 'low',
    category: 'Premium',
    
    registrationMethod: 'app',
    uploadedBy: 'admin@adriancims.com',
    uploadedAt: '2024-01-15',
    verifiedBy: 'Super Admin',
    verifiedAt: '2024-01-16',
    
    totalLoans: 3,
    activeLoans: 1,
    overdueLoans: 1,
    totalBorrowed: 15000000,
    totalRepaid: 13800000,
    averageRepaymentDays: 45,
    defaultCount: 0,
    
    createdBy: 'Admin User',
    createdAt: '2024-01-15',
    updatedBy: 'Loan Officer',
    updatedAt: '2024-03-10',
    
    notes: [
      {
        id: 'NOTE-001',
        author: 'Admin User',
        role: 'admin',
        content: 'Customer has good payment history. Recommended for premium status.',
        date: '2024-01-16',
        isPrivate: false
      },
      {
        id: 'NOTE-002',
        author: 'Loan Officer',
        role: 'loan_officer',
        content: 'Current loan #L-342 is 40% overdue. Customer contacted, promised payment by end of week.',
        date: '2024-03-15',
        isPrivate: true
      }
    ]
  };

  // Mock documents - Essential Tanzanian documents
  const documents = [
    {
      id: 'DOC-001',
      type: 'national_id',
      name: 'national_id_laurent.pdf',
      size: '2.4 MB',
      uploadedBy: 'Admin User',
      uploadedAt: '2024-01-15',
      verified: true,
      verifiedBy: 'Super Admin',
      verifiedAt: '2024-01-16',
      expiryDate: '2030-01-15',
      url: '#'
    },
    {
      id: 'DOC-002',
      type: 'passport_photo',
      name: 'passport_photo_laurent.jpg',
      size: '1.2 MB',
      uploadedBy: 'Admin User',
      uploadedAt: '2024-01-15',
      verified: true,
      verifiedBy: 'Super Admin',
      verifiedAt: '2024-01-16',
      url: '#'
    },
    {
      id: 'DOC-003',
      type: 'bank_statement',
      name: 'bank_statement_mar2024.pdf',
      size: '3.1 MB',
      uploadedBy: 'Loan Officer',
      uploadedAt: '2024-03-10',
      verified: false,
      url: '#'
    },
    {
      id: 'DOC-004',
      type: 'salary_slip',
      name: 'salary_slip_feb2024.pdf',
      size: '1.8 MB',
      uploadedBy: 'Loan Officer',
      uploadedAt: '2024-03-10',
      verified: false,
      url: '#'
    },
    {
      id: 'DOC-005',
      type: 'employment_letter',
      name: 'employment_letter.pdf',
      size: '1.5 MB',
      uploadedBy: 'Admin User',
      uploadedAt: '2024-01-15',
      verified: true,
      verifiedBy: 'Super Admin',
      verifiedAt: '2024-01-16',
      url: '#'
    },
    {
      id: 'DOC-006',
      type: 'mdhamini_letter',
      name: 'guarantor_letter_john_mkude.pdf',
      size: '2.2 MB',
      uploadedBy: 'Loan Officer',
      uploadedAt: '2024-03-10',
      verified: false,
      url: '#'
    },
    {
      id: 'DOC-007',
      type: 'business_license',
      name: 'business_license.pdf',
      size: '1.9 MB',
      uploadedBy: 'Admin User',
      uploadedAt: '2024-01-15',
      verified: true,
      verifiedBy: 'Super Admin',
      verifiedAt: '2024-01-16',
      url: '#'
    },
    {
      id: 'DOC-008',
      type: 'tax_clearance',
      name: 'tin_certificate.pdf',
      size: '1.1 MB',
      uploadedBy: 'Admin User',
      uploadedAt: '2024-01-15',
      verified: true,
      verifiedBy: 'Super Admin',
      verifiedAt: '2024-01-16',
      url: '#'
    }
  ];

  // Mock loans
  const loans = [
    {
      id: 'L-342',
      amount: 3420000,
      purpose: 'Business Expansion',
      status: 'overdue',
      stage: 3,
      appliedDate: '2024-02-10',
      approvedDate: '2024-02-12',
      disbursedDate: '2024-02-15',
      dueDate: '2024-04-15',
      amountPaid: 3380000,
      remaining: 120000,
      createdBy: 'Loan Officer',
      stage1Approval: {
        by: 'Admin User',
        at: '2024-02-11',
        notes: 'Good business plan'
      },
      stage2Approval: {
        by: 'Super Admin',
        at: '2024-02-12',
        notes: 'Approved'
      },
      disbursement: {
        by: 'Super Admin',
        at: '2024-02-15',
        method: 'bank_transfer'
      }
    },
    {
      id: 'L-338',
      amount: 5000000,
      purpose: 'Stock Purchase',
      status: 'paid',
      stage: 5,
      appliedDate: '2023-11-15',
      approvedDate: '2023-11-17',
      disbursedDate: '2023-11-20',
      paidDate: '2024-02-15',
      amountPaid: 5000000,
      remaining: 0,
      createdBy: 'Loan Officer',
      stage1Approval: {
        by: 'Admin User',
        at: '2023-11-16'
      },
      stage2Approval: {
        by: 'Super Admin',
        at: '2023-11-17'
      },
      paidBy: 'Loan Officer',
      paidAt: '2024-02-15'
    },
    {
      id: 'L-335',
      amount: 3000000,
      purpose: 'Equipment',
      status: 'paid',
      stage: 5,
      appliedDate: '2023-09-10',
      approvedDate: '2023-09-12',
      disbursedDate: '2023-09-15',
      paidDate: '2024-01-10',
      amountPaid: 3000000,
      remaining: 0,
      createdBy: 'Loan Officer',
      stage1Approval: {
        by: 'Admin User',
        at: '2023-09-11'
      },
      stage2Approval: {
        by: 'Super Admin',
        at: '2023-09-12'
      },
      paidBy: 'Loan Officer',
      paidAt: '2024-01-10'
    }
  ];

  // Mock audit trail
  const auditTrail = [
    {
      id: 'AUD-001',
      action: 'CUSTOMER_CREATED',
      user: 'Admin User',
      role: 'admin',
      timestamp: '2024-01-15 10:30:22',
      details: 'Initial registration via app',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'AUD-002',
      action: 'DOCUMENT_UPLOADED',
      user: 'Admin User',
      role: 'admin',
      timestamp: '2024-01-15 10:32:15',
      details: 'Uploaded national ID, passport photo, employment letter',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'AUD-003',
      action: 'DOCUMENT_VERIFIED',
      user: 'Super Admin',
      role: 'super_admin',
      timestamp: '2024-01-16 09:15:43',
      details: 'Verified all uploaded documents',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AUD-004',
      action: 'LOAN_CREATED',
      user: 'Loan Officer',
      role: 'loan_officer',
      timestamp: '2024-02-10 14:20:10',
      details: 'Created loan L-342 for 3,420,000 TSh',
      ipAddress: '192.168.1.102'
    },
    {
      id: 'AUD-005',
      action: 'LOAN_APPROVED_STAGE1',
      user: 'Admin User',
      role: 'admin',
      timestamp: '2024-02-11 11:30:45',
      details: 'Approved loan L-342 (Stage 1)',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'AUD-006',
      action: 'LOAN_APPROVED_STAGE2',
      user: 'Super Admin',
      role: 'super_admin',
      timestamp: '2024-02-12 09:45:30',
      details: 'Final approval for loan L-342',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AUD-007',
      action: 'LOAN_DISBURSED',
      user: 'Super Admin',
      role: 'super_admin',
      timestamp: '2024-02-15 10:00:00',
      details: 'Disbursed 3,420,000 TSh via bank transfer',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'AUD-008',
      action: 'DOCUMENT_UPLOADED',
      user: 'Loan Officer',
      role: 'loan_officer',
      timestamp: '2024-03-10 15:20:33',
      details: 'Uploaded bank statement, salary slip, guarantor letter',
      ipAddress: '192.168.1.102'
    },
    {
      id: 'AUD-009',
      action: 'CUSTOMER_UPDATED',
      user: 'Loan Officer',
      role: 'loan_officer',
      timestamp: '2024-03-10 15:25:18',
      details: 'Updated income information',
      ipAddress: '192.168.1.102'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'national_id': 'National ID (NIDA)',
      'passport': 'Passport',
      'voters_id': 'Voter\'s ID',
      'drivers_license': 'Driver\'s License',
      'bank_statement': 'Bank Statement',
      'salary_slip': 'Salary Slip',
      'employment_letter': 'Employment Letter',
      'mdhamini_letter': 'Mdhamini Letter (Guarantor)',
      'business_license': 'Business License',
      'passport_photo': 'Passport Photo',
      'utility_bill': 'Utility Bill',
      'tax_clearance': 'Tax Clearance (TIN)',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes('national') || type.includes('id')) return IdCard;
    if (type.includes('passport_photo')) return Camera;
    if (type.includes('bank')) return Landmark;
    if (type.includes('salary') || type.includes('employment')) return Briefcase;
    if (type.includes('mdhamini')) return Users;
    if (type.includes('tax')) return FileSignature;
    return FileText;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {customer.firstName} {customer.surname}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customer ID: {customer.id} • Member since {customer.createdAt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEditCustomer && (
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'loans'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Loans ({loans.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents ({documents.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Audit Trail
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                    Credit Score
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.creditScore}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Excellent</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
                    Active Loans
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.activeLoans}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total: {customer.totalLoans}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full">
                    Total Borrowed
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(customer.totalBorrowed)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Repaid: {formatCurrency(customer.totalRepaid)}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full">
                    Risk Level
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{customer.riskLevel}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Category: {customer.category}</p>
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    Personal Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.firstName} {customer.middleName} {customer.surname}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {customer.dateOfBirth} ({customer.age} years)
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gender</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Place of Birth</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.placeOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marital Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.maritalStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dependents</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.dependents}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Primary Phone</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Alternative Phone</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.alternativePhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.address}, {customer.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-500" />
                    Professional Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Occupation</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.occupation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employer</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.employer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Income</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(customer.monthlyIncome)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Business Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.businessName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Business Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.businessType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Registration</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.businessRegistration}</p>
                    </div>
                  </div>
                </div>

                {/* Next of Kin & Guarantor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Next of Kin */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-gray-500" />
                      Next of Kin
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.nextOfKinName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Relation</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.nextOfKinRelation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.nextOfKinPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Guarantor (Mdhamini) */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      Mdhamini (Guarantor)
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.guarantorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Relation</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.guarantorRelation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.guarantorPhone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Occupation</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.guarantorOccupation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Income</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(customer.guarantorMonthlyIncome)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Identification & Banking */}
              <div className="space-y-6">
                {/* Identification */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-gray-500" />
                    Identification
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">National ID (NIDA)</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{customer.nationalId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Passport Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.passportNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Voter's ID</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.votersId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Driver's License</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.driversLicense}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">TIN Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.tinNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Banking */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-gray-500" />
                    Banking
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bank Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{customer.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.accountName}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      Mobile Money
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Provider</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{customer.mobileMoneyProvider}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Number</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.mobileMoneyNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Notes
                  </h2>
                  
                  <div className="space-y-4">
                    {customer.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-900 dark:text-white">{note.author}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{note.role}</span>
                            {note.isPrivate && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-[10px]">
                                Private
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500">{note.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Registration Info */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-500" />
                    Registration Info
                  </h2>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Method</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{customer.registrationMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded By</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.uploadedBy}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{customer.uploadedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Verified By</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.verifiedBy}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{customer.verifiedAt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.updatedBy}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{customer.updatedAt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOANS TAB */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            {loans.map((loan) => (
              <div key={loan.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Loan Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{loan.id}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(loan.status)}`}>
                        {loan.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purpose</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.purpose}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                loan.status === 'overdue' ? 'bg-red-500' :
                                loan.status === 'paid' ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${(loan.amountPaid / loan.amount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {Math.round((loan.amountPaid / loan.amount) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Approval Chain - WHO did WHAT */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Approval Chain</p>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{loan.createdBy}</span>
                        </div>
                        <ArrowLeft className="w-3 h-3 text-gray-400" />
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{loan.stage1Approval.by}</span>
                        </div>
                        <ArrowLeft className="w-3 h-3 text-gray-400" />
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-gray-600 dark:text-gray-400">{loan.stage2Approval.by}</span>
                        </div>
                        {loan.disbursement && (
                          <>
                            <ArrowLeft className="w-3 h-3 text-gray-400" />
                            <div className="flex items-center gap-1">
                              <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <DollarSign className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                              </div>
                              <span className="text-gray-600 dark:text-gray-400">{loan.disbursement.by}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Applied</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.appliedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.approvedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Disbursed</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.disbursedDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Due</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.dueDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Link
                      href={`/admin/loans/${loan.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload New Document */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Document</h2>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Files
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Supported formats: PDF, JPG, PNG (Max size: 10MB)
              </p>
            </div>

            {/* Document Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Essential Documents - Must have */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Essential Documents
                </h3>
                <div className="space-y-3">
                  {documents.filter(d => ['national_id', 'passport_photo', 'employment_letter', 'mdhamini_letter'].includes(d.type))
                    .map((doc) => {
                      const Icon = getDocumentIcon(doc.type);
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white dark:bg-gray-700 rounded">
                              <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{getDocumentTypeLabel(doc.type)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{doc.name} • {doc.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.verified ? (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <Download className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Financial Documents */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Financial Documents
                </h3>
                <div className="space-y-3">
                  {documents.filter(d => ['bank_statement', 'salary_slip', 'tax_clearance', 'business_license'].includes(d.type))
                    .map((doc) => {
                      const Icon = getDocumentIcon(doc.type);
                      return (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white dark:bg-gray-700 rounded">
                              <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{getDocumentTypeLabel(doc.type)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{doc.name} • {doc.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.verified ? (
                              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                              <Download className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* All Documents Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Documents</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Uploaded By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {documents.map((doc) => {
                      const Icon = getDocumentIcon(doc.type);
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 dark:text-white">{getDocumentTypeLabel(doc.type)}</p>
                            {doc.expiryDate && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">Expires: {doc.expiryDate}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 dark:text-white">{doc.uploadedBy}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 dark:text-white">{doc.uploadedAt}</p>
                          </td>
                          <td className="px-6 py-4">
                            {doc.verified ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle className="w-3 h-3" />
                                Verified by {doc.verifiedBy}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                <Download className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Complete Activity Log</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Every action is tracked for absolute transparency
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {auditTrail.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{entry.timestamp.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.timestamp.split(' ')[1]}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.user}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{entry.role}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">{entry.action.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{entry.details}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{entry.ipAddress}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
