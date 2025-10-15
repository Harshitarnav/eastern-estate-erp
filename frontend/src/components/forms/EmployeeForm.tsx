'use client';

import { Form, FormField } from './Form';

interface EmployeeFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export function EmployeeForm({ onSubmit, initialData, onCancel }: EmployeeFormProps) {
  const fields: FormField[] = [
    // Basic Information
    {
      name: 'employeeCode',
      label: 'Employee Code',
      type: 'text',
      required: true,
      placeholder: 'e.g., EMP-001',
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., John Doe',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
      placeholder: 'john.doe@example.com',
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'text',
      required: true,
      placeholder: '+91 9876543210',
    },
    {
      name: 'alternatePhone',
      label: 'Alternate Phone',
      type: 'text',
      required: false,
      placeholder: '+91 9876543210',
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true,
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      options: [
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
    {
      name: 'bloodGroup',
      label: 'Blood Group',
      type: 'select',
      required: false,
      options: [
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' },
      ],
    },
    {
      name: 'maritalStatus',
      label: 'Marital Status',
      type: 'select',
      required: false,
      options: [
        { value: 'SINGLE', label: 'Single' },
        { value: 'MARRIED', label: 'Married' },
        { value: 'DIVORCED', label: 'Divorced' },
        { value: 'WIDOWED', label: 'Widowed' },
      ],
    },

    // Address
    {
      name: 'currentAddress',
      label: 'Current Address',
      type: 'textarea',
      required: true,
      placeholder: 'Complete current address',
    },
    {
      name: 'permanentAddress',
      label: 'Permanent Address',
      type: 'textarea',
      required: false,
      placeholder: 'Complete permanent address',
    },
    {
      name: 'city',
      label: 'City',
      type: 'text',
      required: false,
      placeholder: 'e.g., Mumbai',
    },
    {
      name: 'state',
      label: 'State',
      type: 'text',
      required: false,
      placeholder: 'e.g., Maharashtra',
    },
    {
      name: 'pincode',
      label: 'Pincode',
      type: 'text',
      required: false,
      placeholder: 'e.g., 400001',
    },

    // Employment Details
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: 'MANAGEMENT', label: 'Management' },
        { value: 'SALES', label: 'Sales' },
        { value: 'MARKETING', label: 'Marketing' },
        { value: 'OPERATIONS', label: 'Operations' },
        { value: 'FINANCE', label: 'Finance' },
        { value: 'HR', label: 'HR' },
        { value: 'IT', label: 'IT' },
        { value: 'CONSTRUCTION', label: 'Construction' },
        { value: 'CUSTOMER_SERVICE', label: 'Customer Service' },
        { value: 'LEGAL', label: 'Legal' },
      ],
    },
    {
      name: 'designation',
      label: 'Designation',
      type: 'text',
      required: true,
      placeholder: 'e.g., Sales Manager',
    },
    {
      name: 'employmentType',
      label: 'Employment Type',
      type: 'select',
      required: true,
      options: [
        { value: 'FULL_TIME', label: 'Full Time' },
        { value: 'PART_TIME', label: 'Part Time' },
        { value: 'CONTRACT', label: 'Contract' },
        { value: 'INTERN', label: 'Intern' },
        { value: 'CONSULTANT', label: 'Consultant' },
      ],
    },
    {
      name: 'joiningDate',
      label: 'Joining Date',
      type: 'date',
      required: true,
    },

    // Salary & Compensation
    {
      name: 'basicSalary',
      label: 'Basic Salary (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 30000',
    },
    {
      name: 'houseRentAllowance',
      label: 'House Rent Allowance (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 15000',
    },
    {
      name: 'transportAllowance',
      label: 'Transport Allowance (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
    },
    {
      name: 'medicalAllowance',
      label: 'Medical Allowance (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 2000',
    },

    // Bank Details
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC Bank',
    },
    {
      name: 'bankAccountNumber',
      label: 'Bank Account Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 1234567890',
    },
    {
      name: 'ifscCode',
      label: 'IFSC Code',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC0001234',
    },

    // Documents
    {
      name: 'aadharNumber',
      label: 'Aadhar Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 1234 5678 9012',
    },
    {
      name: 'panNumber',
      label: 'PAN Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., ABCDE1234F',
    },

    // Additional
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any additional notes...',
    },
  ];

  return (
    <Form
      fields={fields}
      onSubmit={onSubmit}
      initialData={initialData}
      submitLabel={initialData ? 'Update Employee' : 'Add Employee'}
      onCancel={onCancel}
    />
  );
}
