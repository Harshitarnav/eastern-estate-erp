import { useState } from 'react';
import uploadService, { FileUploadResponse, UploadProgress } from '@/services/upload.service';
import { validateFiles, ValidationRules } from '@/utils/file-validation';

interface UseFileUploadReturn {
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  uploadedFiles: FileUploadResponse[];
  uploadFiles: (files: File[], category: string) => Promise<void>;
  reset: () => void;
}

export const useFileUpload = (validationRules?: ValidationRules): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);

  const uploadFiles = async (files: File[], category: string) => {
    try {
      setError(null);
      if (validationRules) validateFiles(files, validationRules);
      setUploading(true);
      const results = await uploadService.uploadMultiple(files, category, (prog) => setProgress(prog));
      setUploadedFiles((prev) => [...prev, ...results]);
      setProgress(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(null);
    setError(null);
    setUploadedFiles([]);
  };

  return { uploading, progress, error, uploadedFiles, uploadFiles, reset };
};
