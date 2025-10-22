'use client';

import { useState, useEffect } from 'react';
import { ValidationRule } from '@/utils/error-handler';

interface ValidatedInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password';
  value: string | number;
  onChange: (name: string, value: string | number) => void;
  validation?: ValidationRule;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export default function ValidatedInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  validation,
  placeholder,
  disabled = false,
  className = '',
  error: externalError,
}: ValidatedInputProps) {
  const [internalError, setInternalError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const error = externalError || internalError;
  const isRequired = validation?.required;

  useEffect(() => {
    if (touched && validation) {
      validateField(value);
    }
  }, [value, touched]);

  const validateField = (fieldValue: string | number) => {
    if (!validation) return;

    const val = String(fieldValue);
    const fieldLabel = validation.label || label;

    // Required validation
    if (validation.required && (!val || val.trim() === '')) {
      setInternalError(`${fieldLabel} is required`);
      return;
    }

    // Skip other validations if empty and not required
    if (!val && !validation.required) {
      setInternalError('');
      return;
    }

    // Min length validation
    if (validation.minLength && val.length < validation.minLength) {
      setInternalError(`${fieldLabel} must be at least ${validation.minLength} characters`);
      return;
    }

    // Max length validation
    if (validation.maxLength && val.length > validation.maxLength) {
      setInternalError(`${fieldLabel} must not exceed ${validation.maxLength} characters`);
      return;
    }

    // Min value validation
    if (validation.min !== undefined && Number(val) < validation.min) {
      setInternalError(`${fieldLabel} must be at least ${validation.min}`);
      return;
    }

    // Max value validation
    if (validation.max !== undefined && Number(val) > validation.max) {
      setInternalError(`${fieldLabel} must not exceed ${validation.max}`);
      return;
    }

    // Email validation
    if (validation.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setInternalError(`${fieldLabel} must be a valid email address`);
        return;
      }
    }

    // Phone validation
    if (validation.phone) {
      const cleaned = val.replace(/[\s\-\(\)]/g, '');
      const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
      if (!phoneRegex.test(cleaned)) {
        setInternalError(`${fieldLabel} must be a valid phone number`);
        return;
      }
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(val)) {
      setInternalError(`${fieldLabel} format is invalid`);
      return;
    }

    // Custom validation
    if (validation.custom && !validation.custom(val)) {
      setInternalError(`${fieldLabel} is invalid`);
      return;
    }

    // All validations passed
    setInternalError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(name, newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    validateField(value);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
