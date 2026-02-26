"use client";

import { useState } from 'react';
import { X, Upload, FileText, CheckCircle, FileUp, FileImage, File, XCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  customerId?: string;
}

const documentTypes = [
  { id: 'national_id', label: 'National ID (NIDA)', icon: FileText, required: true },
  { id: 'passport_photo', label: 'Passport Photo', icon: FileImage, required: true },
  { id: 'bank_statement', label: 'Bank Statement', icon: FileText, required: true },
  { id: 'salary_slip', label: 'Salary Slip', icon: FileText, required: false },
  { id: 'employment_letter', label: 'Employment Letter', icon: FileText, required: false },
  { id: 'business_license', label: 'Business License', icon: FileText, required: false },
  { id: 'tax_clearance', label: 'Tax Clearance', icon: FileText, required: false },
  { id: 'court_document', label: 'Court Document', icon: FileText, required: false },
];

export default function DocumentUploadModal({ isOpen, onClose, customerId }: DocumentUploadModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploaded, setUploaded] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedType) {
      setError('Please select a document type and file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('documentType', selectedType);
    formData.append('file', file);

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/documents`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploaded(true);
      setTimeout(() => {
        onClose(true);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return FileImage;
    }
    return FileText;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => onClose(false)}>
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Document</h2>
          <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {uploaded ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Complete!</h3>
              <p className="text-gray-600 dark:text-gray-400">Document uploaded successfully</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          selectedType === type.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${
                          selectedType === type.id ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <FileUp className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Click to upload
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (max 10MB)
                    </span>
                  </label>
                  
                  {file && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getFileIcon(file.name);
                          return <Icon className="w-5 h-5 text-blue-600" />;
                        })()}
                        <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => onClose(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || !selectedType || uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
