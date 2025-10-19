// FileUpload.tsx - Reusable File Upload Component for Eastern Estate ERP
// Save as: frontend/src/components/ui/FileUpload.tsx

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
} from 'lucide-react';

// Types
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  url?: string;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<string[]>; // Returns URLs
  onChange?: (files: UploadedFile[]) => void;
  initialFiles?: UploadedFile[];
  disabled?: boolean;
  showPreview?: boolean;
  uploadText?: string;
  className?: string;
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Get file icon
const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-blue-600" />;
  if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-600" />;
  if (type.includes('word')) return <FileText className="w-6 h-6 text-blue-600" />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileText className="w-6 h-6 text-green-600" />;
  return <File className="w-6 h-6 text-gray-600" />;
};

// Main Component
export function FileUpload({
  accept = '*',
  multiple = false,
  maxSize = 10, // 10MB default
  maxFiles = 10,
  onUpload,
  onChange,
  initialFiles = [],
  disabled = false,
  showPreview = true,
  uploadText = 'Click to upload or drag and drop',
  className = '',
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create file preview
  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileExtension = '.' + file.name.split('.').pop();
      const mimeType = file.type;

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension.toLowerCase() === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return mimeType === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Accepted types: ${accept}`;
      }
    }

    return null;
  };

  // Handle file selection
  const handleFiles = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const fileArray = Array.from(selectedFiles);

    // Check max files limit
    if (files.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Process files
    const newFiles: UploadedFile[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      const preview = await createPreview(file);
      
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        status: error ? 'error' : 'pending',
        error: error ?? undefined,
        progress: 0,
      };

      newFiles.push(uploadedFile);
    }

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onChange?.(updatedFiles);

    // Auto-upload if onUpload is provided
    if (onUpload) {
      await handleUpload(newFiles);
    }
  }, [files, disabled, maxFiles, onUpload, onChange]);

  // Handle upload
  const handleUpload = async (filesToUpload: UploadedFile[]) => {
    if (!onUpload) return;

    for (const uploadedFile of filesToUpload) {
      if (uploadedFile.status !== 'pending') continue;

      try {
        // Update status to uploading
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id
              ? { ...f, status: 'uploading' as const, progress: 0 }
              : f
          )
        );

        // Simulate progress (in real scenario, use XMLHttpRequest or axios with onUploadProgress)
        const progressInterval = setInterval(() => {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id && f.progress !== undefined && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 200);

        // Upload file
        const urls = await onUpload([uploadedFile.file]);
        clearInterval(progressInterval);

        // Update status to success
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id
              ? { ...f, status: 'success' as const, progress: 100, url: urls[0] }
              : f
          )
        );
      } catch (error) {
        // Update status to error
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        );
      }
    }
  };

  // Handle remove file
  const handleRemove = (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle click
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-700 mb-1">{uploadText}</p>
          <p className="text-xs text-gray-500">
            {accept !== '*' ? `Accepted: ${accept}` : 'All file types accepted'} • Max {maxSize}MB
          </p>
          {multiple && (
            <p className="text-xs text-gray-500 mt-1">
              Up to {maxFiles} files
            </p>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Preview or Icon */}
              {showPreview && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded">
                  {getFileIcon(file.type)}
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  
                  {/* Status */}
                  {file.status === 'uploading' && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs">{file.progress}%</span>
                    </div>
                  )}
                  {file.status === 'success' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Uploaded</span>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">{file.error}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && file.progress !== undefined && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {file.status === 'success' && file.url && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.url, '_blank');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={file.url}
                      download={file.name}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(file.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
