import React, { useMemo } from 'react';
import { Building2, MapPin } from 'lucide-react';
import Form, { FormSection } from './Form';

interface ProjectOption {
  id: string;
  name: string;
  projectCode: string;
  status?: string;
}

interface PropertyFormProps {
  initialData?: any;
  projects: ProjectOption[];
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'Completed', label: 'Completed' },
];

const PROJECT_TYPE_OPTIONS = [
  { value: 'Township', label: 'Township' },
  { value: 'Residential', label: 'Residential Complex' },
  { value: 'Commercial', label: 'Commercial Complex' },
  { value: 'Villa', label: 'Villa/Bungalow' },
  { value: 'Apartments', label: 'Apartments' },
];

const STATE_OPTIONS = [
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Other', label: 'Other' },
];

const AREA_UNITS = [
  { value: 'sqft', label: 'Square Feet' },
  { value: 'sqm', label: 'Square Meters' },
  { value: 'acres', label: 'Acres' },
];

export default function PropertyForm({
  initialData,
  projects,
  onSubmit,
  onCancel,
  loading = false,
}: PropertyFormProps) {
  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        value: project.id,
        label: `${project.name} (${project.projectCode})`,
      })),
    [projects],
  );

  const initialValues = useMemo(() => {
    if (!initialData) {
      return {
        projectId: '',
        propertyCode: '',
        name: '',
        status: 'Active',
        projectType: 'Township',
        country: 'India',
        areaUnit: 'sqft',
        isActive: true,
        isFeatured: false,
      };
    }

    return {
      projectId: initialData.projectId ?? '',
      propertyCode: initialData.propertyCode ?? '',
      name: initialData.name ?? '',
      status: initialData.status ?? 'Active',
      projectType: initialData.projectType ?? initialData.propertyType ?? 'Township',
      country: initialData.country ?? 'India',
      address: initialData.address ?? '',
      location: initialData.location ?? '',
      city: initialData.city ?? '',
      state: initialData.state ?? 'Jharkhand',
      pincode: initialData.pincode ?? '',
      totalArea: initialData.totalArea ?? '',
      builtUpArea: initialData.builtUpArea ?? '',
      areaUnit: initialData.areaUnit ?? 'sqft',
      numberOfTowers: initialData.numberOfTowers ?? '',
      numberOfUnits: initialData.numberOfUnits ?? '',
      floorsPerTower: initialData.floorsPerTower ?? '',
      bhkTypes: Array.isArray(initialData.bhkTypes)
        ? initialData.bhkTypes.join(', ')
        : initialData.bhkTypes ?? '',
      amenities: Array.isArray(initialData.amenities)
        ? initialData.amenities.join(', ')
        : initialData.amenities ?? '',
      nearbyLandmarks: initialData.nearbyLandmarks ?? initialData.location ?? '',
      reraNumber: initialData.reraNumber ?? '',
      reraStatus: initialData.reraStatus ?? '',
      launchDate: formatDate(initialData.launchDate),
      expectedCompletionDate: formatDate(initialData.expectedCompletionDate),
      actualCompletionDate: formatDate(initialData.actualCompletionDate),
      priceMin: initialData.priceMin ?? '',
      priceMax: initialData.priceMax ?? '',
      expectedRevenue: initialData.expectedRevenue ?? '',
      isActive: initialData.isActive ?? true,
      isFeatured: initialData.isFeatured ?? false,
    };
  }, [initialData]);

  const sections: FormSection[] = [
    {
      title: 'Project Association',
      description: 'Link this property to a project.',
      fields: [
        {
          name: 'projectId',
          label: 'Project',
          type: 'select',
          required: true,
          options: projectOptions,
        },
        {
          name: 'propertyCode',
          label: 'Property Code',
          type: 'text',
          placeholder: 'EECD-PRJ-001',
          required: true,
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          name: 'name',
          label: 'Property Name',
          type: 'text',
          placeholder: 'Diamond City',
          required: true,
          icon: <Building2 className="w-5 h-5" />,
        },
        {
          name: 'projectType',
          label: 'Property Type',
          type: 'select',
          options: PROJECT_TYPE_OPTIONS,
          required: true,
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: STATUS_OPTIONS,
        },
        {
          name: 'isFeatured',
          label: 'Mark as featured project',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Location & Access',
      description: 'Tell us where this property lives and how families will reach it.',
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
          options: STATE_OPTIONS,
        },
        {
          name: 'pincode',
          label: 'Pincode',
          type: 'text',
          placeholder: '834001',
          required: true,
          validation: { pattern: /^\d{6}$/ },
        },
        {
          name: 'location',
          label: 'Location Highlights',
          type: 'text',
          placeholder: 'Near NH-33, Beside Apollo Hospital',
        },
        {
          name: 'nearbyLandmarks',
          label: 'Nearby Landmarks',
          type: 'textarea',
          rows: 2,
          placeholder: 'Schools, hospitals, transit hubs, etc.',
        },
      ],
    },
    {
      title: 'Inventory Blueprint',
      description: 'Lay out towers, units, and the living experiences you are crafting.',
      fields: [
        {
          name: 'totalArea',
          label: 'Total Area',
          type: 'number',
          placeholder: '28',
          validation: { min: 0 },
          required: true,
        },
        {
          name: 'builtUpArea',
          label: 'Built-up Area',
          type: 'number',
          placeholder: '24',
          validation: { min: 0 },
        },
        {
          name: 'areaUnit',
          label: 'Area Unit',
          type: 'select',
          required: true,
          options: AREA_UNITS,
        },
        {
          name: 'numberOfTowers',
          label: 'Number of Towers',
          type: 'number',
          placeholder: '10',
          validation: { min: 1 },
          required: true,
        },
        {
          name: 'numberOfUnits',
          label: 'Total Units',
          type: 'number',
          placeholder: '350',
          validation: { min: 1 },
          required: true,
        },
        {
          name: 'floorsPerTower',
          label: 'Floors per Tower',
          type: 'text',
          placeholder: 'G+9',
          helperText: 'Use descriptors like G+9 or 2 Basements + Stilt + 15',
        },
        {
          name: 'bhkTypes',
          label: 'BHK Mix (comma separated)',
          type: 'text',
          placeholder: '2BHK, 3BHK, Duplex',
        },
        {
          name: 'amenities',
          label: 'Key Amenities (comma separated)',
          type: 'textarea',
          rows: 2,
          placeholder: 'Clubhouse, Pool, Gym, Garden',
        },
      ],
    },
    {
      title: 'Timeline & Commercials',
      description: 'Track launch milestones and revenue expectations.',
      fields: [
        {
          name: 'launchDate',
          label: 'Launch Date',
          type: 'date',
        },
        {
          name: 'expectedCompletionDate',
          label: 'Expected Completion',
          type: 'date',
        },
        {
          name: 'actualCompletionDate',
          label: 'Actual Completion',
          type: 'date',
        },
        {
          name: 'priceMin',
          label: 'Price Range (Min)',
          type: 'number',
          placeholder: '2500000',
        },
        {
          name: 'priceMax',
          label: 'Price Range (Max)',
          type: 'number',
          placeholder: '4500000',
        },
        {
          name: 'expectedRevenue',
          label: 'Expected Revenue (₹)',
          type: 'number',
          placeholder: '250000000',
        },
        {
          name: 'reraNumber',
          label: 'RERA Number',
          type: 'text',
          placeholder: 'JRERA-RAN-2024-XXX',
        },
        {
          name: 'reraStatus',
          label: 'RERA Status',
          type: 'text',
          placeholder: 'Registered / CNT Free',
        },
      ],
    },
    {
      title: 'Operational Settings',
      description: 'Control availability of this property within the ERP.',
      fields: [
        {
          name: 'isActive',
          label: 'Property is active and visible in portfolio',
          type: 'checkbox',
        },
      ],
    },
  ];

  return (
    <Form
      sections={sections}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
      submitLabel={initialData ? 'Update Property' : 'Create Property'}
      cancelLabel="Cancel"
      columns={2}
    />
  );
}

function formatDate(value?: string | Date | null): string {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
