'use client';

import { useState } from 'react';
import { Form, FormField } from './Form';

interface EmployeeFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel?: () => void;
}

export default function EmployeeForm({ onSubmit, initialData, onCancel }: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formValues, setFormValues] = useState<Record<string, any>>(initialData || {});


  // Tab 1: Basic Information
  const basicFields: FormField[] = [
    {
      name: 'employeeCode',
      label: 'Employee Code',
      type: 'text',
      required: true,
      placeholder: 'e.g., EECD-EMP-001',
      validation: {
        pattern: /^[a-zA-Z0-9_-]+$/,
      },
    },
    {
      name: 'fullName',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., John Doe',
      validation: {
        minLength: 3,
      },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
      placeholder: 'e.g., john.doe@example.com',
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      },
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      type: 'tel',
      required: true,
      placeholder: 'e.g., 9876543210',
      validation: {
        pattern: /^[6-9]\d{9}$/,
      },
    },
    {
      name: 'alternatePhone',
      label: 'Alternate Phone',
      type: 'tel',
      required: false,
      placeholder: 'e.g., 9876543211',
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      validation: {
        custom: (value) => {
          if (!value) return null;

          const dob = new Date(value);
          const today = new Date();

          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();

          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }

          return age < 18 ? 'Employee must be at least 18 years old' : null;
        },
      },
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
  ];

  // Tab 2: Address Information
  const addressFields: FormField[] = [
    {
      name: 'currentAddress',
      label: 'Current Address',
      type: 'textarea',
      required: true,
      placeholder: 'Complete current address...',
    },
    {
      name: 'permanentAddress',
      label: 'Permanent Address',
      type: 'textarea',
      required: false,
      placeholder: 'Complete permanent address (if different)...',
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
      validation: {
        pattern: /^\d{6}$/,
      },
    },
  ];

  // Tab 3: Employment Details
  const employmentFields: FormField[] = [
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
      placeholder: 'e.g., Senior Manager, Developer',
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
      name: 'employmentStatus',
      label: 'Employment Status',
      type: 'select',
      required: true,
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'ON_LEAVE', label: 'On Leave' },
        { value: 'SUSPENDED', label: 'Suspended' },
        { value: 'TERMINATED', label: 'Terminated' },
        { value: 'RESIGNED', label: 'Resigned' },
      ],
    },
    {
      name: 'joiningDate',
      label: 'Joining Date',
      type: 'date',
      required: true,
    },
    {
      name: 'confirmationDate',
      label: 'Confirmation Date',
      type: 'date',
      required: false,
    },
    {
      name: 'resignationDate',
      label: 'Resignation Date',
      type: 'date',
      required: false,
      validation: {
        custom: (value) => {
          if (!value) return null;
          const joining = new Date(formValues.joiningDate);
          const resign = new Date(value);
          return resign <= joining
            ? 'Resignation date must be after joining date'
            : null;
        },
      },
    },
    {
      name: 'lastWorkingDate',
      label: 'Last Working Date',
      type: 'date',
      required: false,
    },
    {
      name: 'reportingManagerName',
      label: 'Reporting Manager',
      type: 'text',
      required: false,
      placeholder: 'e.g., Jane Smith',
    },
  ];

  // Tab 4: Salary & Compensation
  const salaryFields: FormField[] = [
    {
      name: 'basicSalary',
      label: 'Basic Salary (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 30000',
      validation: {
        min: 0,
      },
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
      placeholder: 'e.g., 3000',
    },
    {
      name: 'medicalAllowance',
      label: 'Medical Allowance (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 2000',
    },
    {
      name: 'otherAllowances',
      label: 'Other Allowances (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
    },
    {
      name: 'grossSalary',
      label: 'Gross Salary (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 55000',
      validation: {
        custom: (value) => {
          if (!value) return null;
          return value < Number(formValues.basicSalary || 0)
            ? 'Gross salary cannot be less than basic salary'
            : null;
        },
      },
    },
    {
      name: 'pfDeduction',
      label: 'PF Deduction (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 3600',
    },
    {
      name: 'esiDeduction',
      label: 'ESI Deduction (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 412',
    },
    {
      name: 'taxDeduction',
      label: 'Tax Deduction (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5000',
    },
    {
      name: 'otherDeductions',
      label: 'Other Deductions (₹)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 1000',
    },
    {
      name: 'netSalary',
      label: 'Net Salary (₹)',
      type: 'number',
      required: true,
      placeholder: 'e.g., 44988',
      validation: {
        custom: (value) => {
          if (!value) return null;
          return value > Number(formValues.grossSalary || 0)
            ? 'Net salary cannot exceed gross salary'
            : null;
        },
      },
    },
  ];

  // Tab 5: Bank Details
  const bankFields: FormField[] = [
    {
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC Bank',
    },
    {
      name: 'bankAccountNumber',
      label: 'Account Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 12345678901234',
      validation: {
        pattern: /^\d{9,18}$/,
      },
    },
    {
      name: 'ifscCode',
      label: 'IFSC Code',
      type: 'text',
      required: false,
      placeholder: 'e.g., HDFC0001234',
      validation: {
        pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
      },
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., Mumbai Main Branch',
    },
  ];

  // Tab 6: Documents & IDs
  const documentsFields: FormField[] = [
    {
      name: 'aadharNumber',
      label: 'Aadhar Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 1234 5678 9012',
      validation: {
        pattern: /^\d{12}$/,
      },
    },
    {
      name: 'panNumber',
      label: 'PAN Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., ABCDE1234F',
      validation: {
        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      },
    },
    {
      name: 'pfNumber',
      label: 'PF Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., MH/MUM/1234567/000/0001234',
    },
    {
      name: 'esiNumber',
      label: 'ESI Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 1234567890',
    },
    {
      name: 'uanNumber',
      label: 'UAN Number',
      type: 'text',
      required: false,
      placeholder: 'e.g., 123456789012',
    },
  ];

  // Tab 7: Emergency Contact
  const emergencyFields: FormField[] = [
    {
      name: 'emergencyContactName',
      label: 'Emergency Contact Name',
      type: 'text',
      required: false,
      placeholder: 'e.g., Jane Doe',
      validation: {
        minLength: 3,
      },
    },
    {
      name: 'emergencyContactPhone',
      label: 'Emergency Contact Phone',
      type: 'tel',
      required: false,
      placeholder: 'e.g., 9876543210',
      validation: {
        pattern: /^[6-9]\d{9}$/,
      },
    },
    {
      name: 'emergencyContactRelation',
      label: 'Relation',
      type: 'select',
      required: false,
      options: [
        { value: 'SPOUSE', label: 'Spouse' },
        { value: 'PARENT', label: 'Parent' },
        { value: 'SIBLING', label: 'Sibling' },
        { value: 'CHILD', label: 'Child' },
        { value: 'FRIEND', label: 'Friend' },
        { value: 'OTHER', label: 'Other' },
      ],
    },
  ];

  // Tab 8: Leave & Attendance
  const leaveFields: FormField[] = [
    {
      name: 'casualLeaveBalance',
      label: 'Casual Leave Balance',
      type: 'number',
      required: false,
      placeholder: 'e.g., 10',
    },
    {
      name: 'sickLeaveBalance',
      label: 'Sick Leave Balance',
      type: 'number',
      required: false,
      placeholder: 'e.g., 7',
    },
    {
      name: 'earnedLeaveBalance',
      label: 'Earned Leave Balance',
      type: 'number',
      required: false,
      placeholder: 'e.g., 15',
    },
    {
      name: 'leaveTaken',
      label: 'Leave Taken (This Year)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5',
    },
    {
      name: 'totalPresent',
      label: 'Total Days Present',
      type: 'number',
      required: false,
      placeholder: 'e.g., 240',
    },
    {
      name: 'totalAbsent',
      label: 'Total Days Absent',
      type: 'number',
      required: false,
      placeholder: 'e.g., 10',
    },
    {
      name: 'totalLateArrival',
      label: 'Total Late Arrivals',
      type: 'number',
      required: false,
      placeholder: 'e.g., 5',
    },
  ];

  // Tab 9: Performance & Qualifications
  const performanceFields: FormField[] = [
    {
      name: 'skills',
      label: 'Skills',
      type: 'textarea',
      required: false,
      placeholder: 'e.g., JavaScript, React, Node.js, Project Management',
    },
    {
      name: 'qualifications',
      label: 'Qualifications',
      type: 'textarea',
      required: false,
      placeholder: 'e.g., B.Tech in Computer Science, MBA',
    },
    {
      name: 'experience',
      label: 'Previous Experience',
      type: 'textarea',
      required: false,
      placeholder: 'e.g., 5 years at XYZ Corp as Senior Developer',
    },
    {
      name: 'performanceRating',
      label: 'Performance Rating (0-5)',
      type: 'number',
      required: false,
      placeholder: 'e.g., 4.5',
    },
  ];

  // Tab 10: Notes
  const notesFields: FormField[] = [
    {
      name: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Any additional notes about this employee...',
    },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', fields: basicFields },
    { id: 'address', label: 'Address', fields: addressFields },
    { id: 'employment', label: 'Employment', fields: employmentFields },
    { id: 'salary', label: 'Salary', fields: salaryFields },
    { id: 'bank', label: 'Bank Details', fields: bankFields },
    { id: 'documents', label: 'Documents', fields: documentsFields },
    { id: 'emergency', label: 'Emergency Contact', fields: emergencyFields },
    { id: 'leave', label: 'Leave & Attendance', fields: leaveFields },
    { id: 'performance', label: 'Performance', fields: performanceFields },
    { id: 'notes', label: 'Notes', fields: notesFields },
  ];

  const currentFields = tabs.find(t => t.id === activeTab)?.fields || [];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-[#A8211B] text-[#A8211B]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Form */}
      <Form
        fields={currentFields}
        onSubmit={onSubmit}
        initialValues={initialData}
        submitLabel={initialData ? 'Update Employee' : 'Add Employee'}
        onCancel={onCancel}
        onValuesChange={setFormValues}
      />
    </div>
  );
}
