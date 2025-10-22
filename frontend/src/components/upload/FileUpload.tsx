'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import uploadService, { UploadProgress } from '@/services/upload.service';
import { validateFiles, formatBytes } from '@/utils/file-validation';

interface FileUploadProps {
  category: string;
  maxSize?: number;
  maxFiles?: number;
  allowedTypes?: string[];
  onSuccess?: (files: any[]) => void;
  onError?: (error: string) => void;
}

export default function FileUpload({
  category,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  allowedTypes,
  onSuccess,
  onError,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    try {
      validateFiles(acceptedFiles, { maxSize, maxFiles, allowedTypes });
      setUploading(true);
      setProgress({ loaded: 0, total: 0, percentage: 0 });

      const results = await uploadService.uploadMultiple(
        acceptedFiles,
        category,
        (prog) => setProgress(prog),
      );

      setUploadedFiles([...uploadedFiles, ...results]);
      onSuccess?.(results);
      setProgress(null);
    } catch (error: any) {
      onError?.(error.message);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="text-blue-600 font-medium">Uploading...</div>
            {progress && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {formatBytes(progress.loaded)} / {formatBytes(progress.total)} ({progress.percentage}%)
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="text-gray-600">Drag & drop files here, or click to browse</p>
                <p className="text-sm text-gray-500">
                  Max {maxFiles} files, up to {formatBytes(maxSize)} each
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-700">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{file.originalName}</span>
                <span className="text-xs text-gray-500">({formatBytes(file.size)})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
