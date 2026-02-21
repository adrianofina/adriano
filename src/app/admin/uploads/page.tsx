"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  Users,
  ArrowRight,
  Calendar,
  User,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';

interface UploadedCustomer {
  firstName: string;
  surname: string;
  phoneNumber: string;
  email: string;
  loanAmount?: number;
  loanPurpose?: string;
  status?: 'pending' | 'approved' | 'active' | 'completed';
}

export default function ManualUploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<UploadedCustomer[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFile(file);
    setUploading(true);
    setError(null);

    // Simulate file upload
    setTimeout(() => {
      setUploading(false);
      setProcessing(true);

      // Simulate data extraction
      setTimeout(() => {
        // Mock extracted data
        setExtractedData([
          {
            firstName: 'John',
            surname: 'Doe',
            phoneNumber: '+255712345678',
            email: 'john.doe@example.com',
            loanAmount: 5000000,
            loanPurpose: 'Business Expansion',
            status: 'pending'
          },
          {
            firstName: 'Jane',
            surname: 'Smith',
            phoneNumber: '+255723456789',
            email: 'jane.smith@example.com',
            loanAmount: 3500000,
            loanPurpose: 'Education',
            status: 'pending'
          },
          {
            firstName: 'Robert',
            surname: 'Johnson',
            phoneNumber: '+255734567890',
            email: 'robert.j@example.com',
            loanAmount: 7200000,
            loanPurpose: 'Agriculture',
            status: 'pending'
          }
        ]);
        setProcessing(false);
      }, 2000);
    }, 1500);
  };

  const handleImport = async () => {
    setProcessing(true);
    
    try {
      // In a real implementation, this would send the data to your API
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/customers');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount).replace('TZS', 'TSh');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Manual Upload</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Import past customer contracts and loan data
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!extractedData.length && !success && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls,.pdf"
            onChange={handleFileSelect}
          />
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              ) : (
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {uploading ? 'Uploading...' : 'Upload customer contracts'}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {uploading 
                ? `Uploading ${uploadedFile?.name}...`
                : 'Drag and drop your file here, or click to browse'
              }
            </p>
            
            {!uploading && !uploadedFile && (
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Browse Files
              </label>
            )}

            {uploadedFile && !uploading && !extractedData.length && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4" />
                <span>{uploadedFile.name}</span>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {processing && !extractedData.length && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Extracting customer data...</p>
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedData.length > 0 && !processing && !success && (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Found {extractedData.length} customers in the uploaded file
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview Data</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Loan Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {extractedData.map((customer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.firstName} {customer.surname}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-3 h-3" />
                            {customer.phoneNumber}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(customer.loanAmount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{customer.loanPurpose}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setExtractedData([]);
                setUploadedFile(null);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={processing}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importing...
                </>
              ) : (
                <>
                  Import {extractedData.length} Customers
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Import Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {extractedData.length} customers have been added to the database.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to customers page...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">Supported File Formats</h3>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
          <li>• CSV files with customer data</li>
          <li>• Excel spreadsheets (.xlsx, .xls)</li>
          <li>• PDF contracts (data extraction may be limited)</li>
        </ul>
        <p className="text-xs text-blue-600 dark:text-blue-500 mt-4">
          The system will attempt to extract customer information and loan details automatically.
          Please review the data before importing.
        </p>
      </div>
    </div>
  );
}
