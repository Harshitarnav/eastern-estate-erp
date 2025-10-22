export interface ValidationRules {
  maxSize?: number;
  minSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const validateFile = (file: File, rules: ValidationRules = {}): void => {
  const { maxSize = 10 * 1024 * 1024, minSize = 0, allowedTypes = [] } = rules;

  if (file.size > maxSize) {
    throw new FileValidationError(
      `File size (${formatBytes(file.size)}) exceeds maximum allowed size (${formatBytes(maxSize)})`
    );
  }

  if (file.size < minSize) {
    throw new FileValidationError(
      `File size (${formatBytes(file.size)}) is below minimum required size (${formatBytes(minSize)})`
    );
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new FileValidationError(
      `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    );
  }
};

export const validateFiles = (files: File[], rules: ValidationRules = {}): void => {
  const { maxFiles } = rules;

  if (maxFiles && files.length > maxFiles) {
    throw new FileValidationError(
      `Maximum ${maxFiles} files allowed. You selected ${files.length} files.`
    );
  }

  files.forEach((file, index) => {
    try {
      validateFile(file, rules);
    } catch (error: any) {
      throw new FileValidationError(`File ${index + 1}: ${error.message}`);
    }
  });
};
