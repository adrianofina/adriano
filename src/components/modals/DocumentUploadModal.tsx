"use client";

import { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  FileUp,
  FileImage,
  File,
  Trash2,
  Eye,
  Download
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string;
  onUpload?: (document: any) => void;
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

export default function DocumentUploadModal({ isOpen, onClose, customerId, onUpload }: DocumentUploadModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedType) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      
      const newDoc = {
        id: Date.now().toString(),
        type: selectedType,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };
      
      setUploadedDocs([...uploadedDocs, newDoc]);
      setUploading(false);
      setFile(null);
      setSelectedType('');
      setStep(2);
      
      if (onUpload) onUpload(newDoc);
    }, 2000);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return FileImage;
    }
    if (['pdf'].includes(ext || '')) {
      return FileText;
    }
    return File;
  };

  const resetModal = () => {
    setStep(1);
    setSelectedType('');
    setFile(null);
    setUploadedDocs([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Document</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {step === 1 ? 'Select document type and file' : 'Upload complete'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
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
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selectedType === type.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          selectedType === type.id
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            selectedType === type.id
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</p>
                          {type.required && (
                            <span className="text-xs text-red-500">Required</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
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
                    <FileUp className="w-12 h-12 text-gray-400 mb-3" />
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
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || !selectedType || uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upload Complete!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {uploadedDocs.length} document{uploadedDocs.length !== 1 ? 's' : ''} uploaded successfully
              </p>

              {uploadedDocs.length > 0 && (
                <div className="mt-6 space-y-3">
                  {uploadedDocs.map((doc) => {
                    const Icon = getFileIcon(doc.fileName);
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {documentTypes.find(t => t.id === doc.type)?.label || doc.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => {
                    setStep(1);
                    setUploadedDocs([]);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Upload Another
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
