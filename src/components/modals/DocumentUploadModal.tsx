"use client";

import { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle, 
  FileUp, 
  FileImage, 
  File,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Download,
  Grid,
  List
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  customerId?: string;
}

interface DocumentFile {
  id: string;
  file: File;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const documentTypes = [
  { id: 'national_id', label: 'National ID (NIDA)', icon: FileText, required: true, color: 'blue' },
  { id: 'passport_photo', label: 'Passport Photo', icon: FileImage, required: true, color: 'green' },
  { id: 'bank_statement', label: 'Bank Statement', icon: FileText, required: true, color: 'purple' },
  { id: 'salary_slip', label: 'Salary Slip', icon: FileText, required: false, color: 'orange' },
  { id: 'employment_letter', label: 'Employment Letter', icon: FileText, required: false, color: 'pink' },
  { id: 'business_license', label: 'Business License', icon: FileText, required: false, color: 'indigo' },
  { id: 'tax_clearance', label: 'Tax Clearance', icon: FileText, required: false, color: 'cyan' },
  { id: 'court_document', label: 'Court Document', icon: FileText, required: false, color: 'red' },
  { id: 'contract', label: 'Contract Agreement', icon: FileText, required: false, color: 'amber' },
  { id: 'guarantor_letter', label: 'Guarantor Letter', icon: FileText, required: false, color: 'emerald' }
];

export default function EnhancedDocumentUploadModal({ isOpen, onClose, customerId }: DocumentUploadModalProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadAllProgress, setUploadAllProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [completedUploads, setCompletedUploads] = useState<any[]>([]);

  if (!isOpen) return null;

  const addDocuments = (files: FileList | null) => {
    if (!files) return;

    const newDocs: DocumentFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      type: '',
      progress: 0,
      status: 'pending'
    }));

    setDocuments([...documents, ...newDocs]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const updateDocumentType = (id: string, type: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, type } : doc
    ));
  };

  const uploadDocument = async (doc: DocumentFile) => {
    setDocuments(prev => prev.map(d => 
      d.id === doc.id ? { ...d, status: 'uploading', progress: 0 } : d
    ));

    const formData = new FormData();
    formData.append('documentType', doc.type);
    formData.append('file', doc.file);

    try {
      const interval = setInterval(() => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id && d.progress < 90 
            ? { ...d, progress: d.progress + 10 } 
            : d
        ));
      }, 200);

      const response = await fetch(`/api/admin/customers/${customerId}/documents`, {
        method: 'POST',
        body: formData
      });

      clearInterval(interval);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'success', progress: 100 } : d
      ));

      setCompletedUploads(prev => [...prev, result.data]);

    } catch (error: any) {
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, status: 'error', error: error.message } : d
      ));
    }
  };

  const uploadAll = async () => {
    setUploading(true);
    
    const pendingDocs = documents.filter(d => 
      d.status === 'pending' && d.type
    );

    for (let i = 0; i < pendingDocs.length; i++) {
      const doc = pendingDocs[i];
      await uploadDocument(doc);
      setUploadAllProgress(Math.round(((i + 1) / pendingDocs.length) * 100));
    }

    setUploading(false);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return FileImage;
    }
    return FileText;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'uploading': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => onClose(false)}>
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Documents</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upload multiple documents at once • {documents.length} file{documents.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button onClick={() => onClose(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="file-upload-multiple"
              className="hidden"
              multiple
              onChange={(e) => addDocuments(e.target.files)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label
              htmlFor="file-upload-multiple"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-lg font-medium text-blue-600 dark:text-blue-400">
                Click to select files
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                or drag and drop multiple files (PDF, DOC, DOCX, JPG, PNG)
              </span>
            </label>
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Documents to Upload</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {documents.filter(d => d.status === 'success').length} / {documents.length} uploaded
                  </span>
                  {documents.some(d => d.status === 'pending' && d.type) && (
                    <button
                      onClick={uploadAll}
                      disabled={uploading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading... {uploadAllProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload All</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar for All Uploads */}
              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">{uploadAllProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadAllProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Document Cards */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                {documents.map((doc) => {
                  const Icon = getFileIcon(doc.file.name);
                  const typeColor = doc.type ? documentTypes.find(t => t.id === doc.type)?.color || 'gray' : 'gray';
                  
                  return (
                    <div
                      key={doc.id}
                      className={`border rounded-xl p-4 transition-all ${getStatusColor(doc.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${typeColor}-100`}>
                          <Icon className={`w-5 h-5 text-${typeColor}-600`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {doc.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.file.size)}
                              </p>
                            </div>
                            
                            {doc.status === 'pending' && (
                              <button
                                onClick={() => removeDocument(doc.id)}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                aria-label="Remove document"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            )}
                            
                            {doc.status === 'success' && (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                            
                            {doc.status === 'error' && (
                              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                          </div>

                          {/* Document Type Selection */}
                          {doc.status === 'pending' && (
                            <div className="mt-3">
                              <select
                                value={doc.type}
                                onChange={(e) => updateDocumentType(doc.id, e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                              >
                                <option value="">Select document type</option>
                                {documentTypes.map(type => (
                                  <option key={type.id} value={type.id}>
                                    {type.label} {type.required ? '(Required)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Upload Progress */}
                          {doc.status === 'uploading' && (
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Uploading...</span>
                                <span>{doc.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 transition-all duration-300"
                                  style={{ width: `${doc.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {doc.status === 'error' && (
                            <p className="mt-2 text-xs text-red-600">{doc.error}</p>
                          )}

                          {/* Upload Single Button */}
                          {doc.status === 'pending' && doc.type && (
                            <button
                              onClick={() => uploadDocument(doc)}
                              className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Uploads Section */}
          {completedUploads.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recently Uploaded</h3>
              <div className="space-y-2">
                {completedUploads.slice(-3).map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {documentTypes.find(t => t.id === doc.documentType)?.label || doc.documentType}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-200 rounded" aria-label="View">
                        <Eye className="w-4 h-4" />
                      </a>
                      <a href={doc.fileUrl} download className="p-1 hover:bg-gray-200 rounded" aria-label="Download">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            {documents.length > 0 && documents.every(d => d.status === 'success') && (
              <button
                onClick={() => onClose(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}