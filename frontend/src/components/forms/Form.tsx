import React, { useState } from 'react';
import {
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  File,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Building2,
  User,
  Phone,
  Mail,
  IndianRupee
} from 'lucide-react';

// Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'currency';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string | number; label: string }[];
  onChange?: (value: any) => void; // Add onChange callback
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  helperText?: string;
  icon?: React.ReactNode;
  accept?: string; // for file inputs
  multiple?: boolean; // for file inputs
  rows?: number; // for textarea
  prefix?: string; // for currency
  suffix?: string;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormProps {
  title?: string;
  description?: string;
  sections?: FormSection[];
  fields?: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  columns?: 1 | 2 | 3;
}

// Validation function
const validateField = (field: FormField, value: any): string | null => {
  if (field.required && (!value || value === '')) {
    return `${field.label} is required`;
  }

  if (!value) return null;

  const validation = field.validation;
  if (!validation) return null;

  if (validation.min !== undefined && Number(value) < validation.min) {
    return `${field.label} must be at least ${validation.min}`;
  }

  if (validation.max !== undefined && Number(value) > validation.max) {
    return `${field.label} must be at most ${validation.max}`;
  }

  if (validation.minLength && String(value).length < validation.minLength) {
    return `${field.label} must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength && String(value).length > validation.maxLength) {
    return `${field.label} must be at most ${validation.maxLength} characters`;
  }

  if (validation.pattern && !validation.pattern.test(String(value))) {
    return `${field.label} format is invalid`;
  }

  if (validation.custom) {
    return validation.custom(value);
  }

  return null;
};

// Form Component
export default function Form({
  title,
  description,
  sections,
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  columns = 2,
}: FormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const allFields = sections 
    ? sections.flatMap(section => section.fields)
    : fields || [];

  const handleChange = (name: string, value: any) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on change
    const field = allFields.find(f => f.name === name);
    if (field) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
      
      // Call field's onChange callback if provided
      if (field.onChange) {
        field.onChange(value);
      }
    }
  };

  const handleFileChange = (name: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setUploadedFiles(prev => ({ ...prev, [name]: fileArray }));
    handleChange(name, fileArray);
  };

  const handleRemoveFile = (fieldName: string, index: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    allFields.forEach(field => {
      const error = validateField(field, formValues[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus('error');
      return;
    }

    try {
      await onSubmit(formValues);
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = touched[field.name] && errors[field.name];
    const value = formValues[field.name] || '';

    const inputClasses = `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-500' : 'border-gray-300'
    } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <div className="relative">
            {field.icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {field.icon}
              </div>
            )}
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={`${inputClasses} ${field.icon ? 'pl-10' : ''}`}
            />
          </div>
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword[field.name] ? 'text' : 'password'}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={`${inputClasses} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, [field.name]: !prev[field.name] }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword[field.name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
              {field.prefix || '₹'}
            </span>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={`${inputClasses} pl-8`}
            />
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={field.disabled}
              className={`${inputClasses} pl-10`}
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={field.disabled}
            className={inputClasses}
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            rows={field.rows || 4}
            className={inputClasses}
          />
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={field.disabled}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </span>
                {field.accept && (
                  <span className="block text-xs text-gray-500 mt-1">
                    {field.accept}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept={field.accept}
                multiple={field.multiple}
                onChange={(e) => handleFileChange(field.name, e.target.files)}
                disabled={field.disabled}
                className="hidden"
              />
            </label>

            {uploadedFiles[field.name]?.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(field.name, index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderFormField = (field: FormField) => {
    if (field.type === 'checkbox') {
      return (
        <div key={field.name} className="col-span-full">
          {renderField(field)}
          {touched[field.name] && errors[field.name] && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors[field.name]}
            </p>
          )}
        </div>
      );
    }

    return (
      <div key={field.name}>
        <label className="block mb-2">
          <span className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
        {renderField(field)}
        {field.helperText && !errors[field.name] && (
          <p className="mt-1 text-sm text-gray-500">{field.helperText}</p>
        )}
        {touched[field.name] && errors[field.name] && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors[field.name]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        {(title || description) && (
          <div className="px-6 py-4 border-b border-gray-200">
            {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {sections ? (
            sections.map((section, idx) => (
              <div key={idx}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  {section.description && (
                    <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                  )}
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
                  {section.fields.map(renderFormField)}
                </div>
                {idx < sections.length - 1 && <hr className="mt-6" />}
              </div>
            ))
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
              {fields?.map(renderFormField)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
          <div>
            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Saved successfully!</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Please fix the errors above</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {cancelLabel}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// Demo: Property Form for Eastern Estate
function PropertyFormDemo() {
  const sections: FormSection[] = [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of the property',
      fields: [
        {
          name: 'projectCode',
          label: 'Project Code',
          type: 'text',
          placeholder: 'EECD-XXX-001',
          required: true,
          icon: <Building2 className="w-5 h-5" />,
          validation: {
            pattern: /^EECD-[A-Z]+-\d{3}$/,
          },
          helperText: 'Format: EECD-XXX-001',
        },
        {
          name: 'projectName',
          label: 'Project Name',
          type: 'text',
          placeholder: 'Diamond City',
          required: true,
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          name: 'projectType',
          label: 'Project Type',
          type: 'select',
          required: true,
          options: [
            { value: 'township', label: 'Township' },
            { value: 'residential', label: 'Residential Complex' },
            { value: 'commercial', label: 'Commercial Complex' },
            { value: 'villa', label: 'Villa/Bungalow' },
            { value: 'apartment', label: 'Apartments' },
          ],
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { value: 'planning', label: 'Planning' },
            { value: 'under_construction', label: 'Under Construction' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
          ],
        },
      ],
    },
    {
      title: 'Location Details',
      description: 'Specify the location and address',
      fields: [
        {
          name: 'address',
          label: 'Address',
          type: 'textarea',
          placeholder: 'Enter complete address',
          required: true,
          rows: 3,
        },
        {
          name: 'city',
          label: 'City',
          type: 'text',
          placeholder: 'Ranchi',
          required: true,
          icon: <MapPin className="w-5 h-5" />,
        },
        {
          name: 'state',
          label: 'State',
          type: 'select',
          required: true,
          options: [
            { value: 'jharkhand', label: 'Jharkhand' },
            { value: 'bihar', label: 'Bihar' },
            { value: 'west_bengal', label: 'West Bengal' },
            { value: 'odisha', label: 'Odisha' },
          ],
        },
        {
          name: 'pincode',
          label: 'Pincode',
          type: 'text',
          placeholder: '834001',
          required: true,
          validation: {
            pattern: /^\d{6}$/,
          },
        },
      ],
    },
    {
      title: 'Project Specifications',
      description: 'Technical details and specifications',
      fields: [
        {
          name: 'totalArea',
          label: 'Total Area',
          type: 'number',
          placeholder: '28',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'areaUnit',
          label: 'Area Unit',
          type: 'select',
          required: true,
          options: [
            { value: 'acres', label: 'Acres' },
            { value: 'sqft', label: 'Square Feet' },
            { value: 'sqm', label: 'Square Meters' },
          ],
        },
        {
          name: 'totalTowers',
          label: 'Number of Towers/Blocks',
          type: 'number',
          placeholder: '13',
          validation: { min: 0 },
        },
        {
          name: 'totalUnits',
          label: 'Total Units',
          type: 'number',
          placeholder: '732',
          required: true,
          validation: { min: 1 },
        },
        {
          name: 'bhkTypes',
          label: 'BHK Types Available',
          type: 'text',
          placeholder: '2BHK, 3BHK, 4BHK',
          required: true,
        },
        {
          name: 'reraNumber',
          label: 'RERA Registration Number',
          type: 'text',
          placeholder: 'JRERA-RAN-2024-XXX',
          helperText: 'Leave blank if not applicable',
        },
      ],
    },
    {
      title: 'Financial Details',
      description: 'Pricing and financial information',
      fields: [
        {
          name: 'priceMin',
          label: 'Minimum Price',
          type: 'currency',
          placeholder: '2500000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'priceMax',
          label: 'Maximum Price',
          type: 'currency',
          placeholder: '4500000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
        },
      ],
    },
    {
      title: 'Dates',
      description: 'Important project dates',
      fields: [
        {
          name: 'launchDate',
          label: 'Launch Date',
          type: 'date',
          required: true,
        },
        {
          name: 'possessionDate',
          label: 'Expected Possession Date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      title: 'Additional Information',
      fields: [
        {
          name: 'description',
          label: 'Project Description',
          type: 'textarea',
          placeholder: 'Detailed description of the project...',
          rows: 5,
        },
        {
          name: 'amenities',
          label: 'Amenities',
          type: 'textarea',
          placeholder: 'Swimming Pool, Gym, Club House, Park...',
          rows: 3,
        },
        {
          name: 'brochure',
          label: 'Project Brochure',
          type: 'file',
          accept: '.pdf,.doc,.docx',
          helperText: 'Upload project brochure (PDF, DOC)',
        },
        {
          name: 'images',
          label: 'Project Images',
          type: 'file',
          accept: 'image/*',
          multiple: true,
          helperText: 'Upload project images',
        },
        {
          name: 'isActive',
          label: 'Mark as Active',
          type: 'checkbox',
        },
      ],
    },
  ];

  const handleSubmit = async (values: Record<string, any>) => {
    console.log('Form submitted:', values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Project</h1>
        <p className="text-gray-600">Create a new property project for Eastern Estate</p>
      </div>
      
      <Form
        sections={sections}
        onSubmit={handleSubmit}
        onCancel={() => alert('Form cancelled')}
        submitLabel="Create Project"
        cancelLabel="Cancel"
        columns={2}
      />
    </div>
  );
}

export { Form, PropertyFormDemo };
