import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, FormSection } from './Form';
import { Home, Building2, DollarSign } from 'lucide-react';
import {
  formatFlatNumberFromTower,
  towerAreaDefaults,
} from '@/lib/flat-number-format';
import CategoryLineItemEditor, { LineItem } from './CategoryLineItemEditor';

interface FlatFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  properties?: any[];
  towers?: any[];
  customers?: any[];
  isEdit?: boolean;
  onPropertyChange?: (propertyId: string) => void;
}

export default function FlatForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  loading = false,
  properties = [],
  towers = [],
  customers = [],
  isEdit = false,
  onPropertyChange,
}: FlatFormProps) {

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    initialData?.propertyId || ''
  );

  // ── Price category breakdown (Misc / Tax tagged line-items) ──────────────
  // Seed from the new breakdown fields when present, else migrate legacy
  // parking/maintenance/registration charge columns into tagged items.
  const numOr0 = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const [miscItems, setMiscItems] = useState<LineItem[]>(() => {
    if (initialData?.miscBreakdown?.length) return initialData.miscBreakdown;
    const seed: LineItem[] = [];
    if (numOr0(initialData?.parkingCharges) > 0)     seed.push({ label: 'Parking', amount: numOr0(initialData.parkingCharges) });
    if (numOr0(initialData?.maintenanceCharges) > 0) seed.push({ label: 'Maintenance', amount: numOr0(initialData.maintenanceCharges) });
    return seed;
  });
  const [taxItems, setTaxItems] = useState<LineItem[]>(() => {
    if (initialData?.taxBreakdown?.length) return initialData.taxBreakdown;
    const seed: LineItem[] = [];
    if (numOr0(initialData?.registrationCharges) > 0) seed.push({ label: 'Registration charges', amount: numOr0(initialData.registrationCharges) });
    return seed;
  });

  const [formSnapshot, setFormSnapshot] = useState<Record<string, any>>({});
  const [towerPrefill, setTowerPrefill] = useState<Record<string, any>>({});
  const [formVersion, setFormVersion] = useState(0);
  // Tracks whether tower defaults were auto-applied for a pre-selected tower (URL param scenario).
  const preselectedDefaultsApplied = useRef(false);

  useEffect(() => {
    if (!selectedPropertyId) return;
    onPropertyChange?.(selectedPropertyId);
  }, [selectedPropertyId]);

  const [activeTower, setActiveTower] = useState<any | null>(null);

  const applyTowerDefaults = (towerId: string, current: Record<string, any>) => {
    const tower = towersForProperty.find((t) => t.id === towerId);
    if (!tower) return;
    setActiveTower(tower);
    const areas = towerAreaDefaults(tower);
    const prefill: Record<string, any> = {};
    if (areas.superBuiltUpArea && !current.superBuiltUpArea) {
      prefill.superBuiltUpArea = areas.superBuiltUpArea;
    }
    if (areas.builtUpArea && !current.builtUpArea) {
      prefill.builtUpArea = areas.builtUpArea;
    }
    if (areas.carpetArea && !current.carpetArea) {
      prefill.carpetArea = areas.carpetArea;
    }
    const floor = current.floor ?? '';
    if (!current.flatNumber && tower.flatNumberPrefix && floor !== '') {
      prefill.flatNumber = formatFlatNumberFromTower(
        tower.flatNumberPrefix,
        floor,
        1,
      );
    }
    if (Object.keys(prefill).length) {
      setTowerPrefill((prev) => ({ ...prev, ...prefill }));
      setFormVersion((v) => v + 1);
    }
  };

  const mergedInitialValues = useMemo(
    () => ({
      ...initialData,
      ...towerPrefill,
      ...formSnapshot,
      propertyId: formSnapshot.propertyId || initialData?.propertyId || '',
      towerId: formSnapshot.towerId || initialData?.towerId || '',
    }),
    [initialData, towerPrefill, formSnapshot],
  );

  const towersForProperty = useMemo(
    () => towers.filter((t) => t.propertyId === selectedPropertyId),
    [towers, selectedPropertyId],
  );

  // When a tower is pre-selected via URL param (e.g. "Add Missing Units" button)
  // or when editing an existing flat, set activeTower for defaults display and
  // apply area defaults if the flat has no area values yet.
  useEffect(() => {
    if (towersForProperty.length === 0) return;
    const preselectedId = initialData?.towerId || formSnapshot.towerId;
    if (!preselectedId) return;
    const tower = towersForProperty.find((t) => t.id === preselectedId);
    if (tower) setActiveTower(tower);
    if (preselectedDefaultsApplied.current) return;
    preselectedDefaultsApplied.current = true;
    applyTowerDefaults(preselectedId, mergedInitialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [towersForProperty]);

  const handleSubmit = async (values: any) => {
    const num = (val: any) => (val === '' || val === undefined || val === null ? undefined : Number(val));
    const list = (val: any) =>
      typeof val === 'string'
        ? val.split(',').map((x) => x.trim()).filter(Boolean)
        : Array.isArray(val)
        ? val
        : undefined;

    const payload = {
      ...values,
      type: values.type || '2BHK',
      status: values.status || 'UNDER_CONSTRUCTION',
      isAvailable: values.isAvailable !== false,
      servantRoom: values.servantRoom ?? false,
      studyRoom: values.studyRoom ?? false,
      poojaRoom: values.poojaRoom ?? false,
      vastuCompliant: values.vastuCompliant ?? true,
      cornerUnit: values.cornerUnit ?? false,
      roadFacing: values.roadFacing ?? false,
      parkFacing: values.parkFacing ?? false,
      coveredParking: values.coveredParking ?? false,
      parkingSlots: num(values.parkingSlots) ?? 0,
      floor: num(values.floor) ?? 0,
      bedrooms: num(values.bedrooms) ?? 0,
      bathrooms: num(values.bathrooms) ?? 0,
      balconies: num(values.balconies) ?? 0,
      superBuiltUpArea: num(values.superBuiltUpArea) ?? 0,
      builtUpArea: num(values.builtUpArea) ?? 0,
      carpetArea: num(values.carpetArea) ?? 0,
      balconyArea: num(values.balconyArea),
      basePrice: num(values.basePrice) ?? 0,
      pricePerSqft: num(values.pricePerSqft),
      tokenAmount: num(values.tokenAmount),
      displayOrder: num(values.displayOrder) ?? 1,
      amenities: list(values.amenities),
    };

    // ── Derive pricing from the Primary / Misc / Tax breakdown ──────────────
    const primary  = num(values.basePrice) ?? 0;
    const cleanMisc = miscItems.filter((i) => numOr0(i.amount) > 0);
    const cleanTax  = taxItems.filter((i) => numOr0(i.amount) > 0);
    const miscSum  = cleanMisc.reduce((s, i) => s + numOr0(i.amount), 0);
    const taxSum   = cleanTax.reduce((s, i) => s + numOr0(i.amount), 0);
    const discount = num(values.discountAmount) ?? 0;
    const totalPrice = primary + miscSum + taxSum;
    const finalPrice = Math.max(0, totalPrice - discount);

    payload.miscBreakdown = cleanMisc;
    payload.taxBreakdown  = cleanTax;
    payload.totalPrice    = totalPrice;
    payload.discountAmount = discount || undefined;
    payload.finalPrice    = finalPrice;
    // Keep legacy charge columns populated from the breakdown sums so existing
    // reports / PDFs that read them still show a sensible figure.
    payload.parkingCharges      = miscSum || undefined;
    payload.registrationCharges = taxSum || undefined;

    // Block save if a line-item has an amount but no label.
    const blank = [...cleanMisc, ...cleanTax].some((i) => numOr0(i.amount) > 0 && !i.label.trim());
    if (blank) {
      alert('Every Misc / Tax line-item with an amount needs a label describing what it is.');
      return;
    }

    await onSubmit(payload);
  };

  const sections: FormSection[] = [
    {
      title: 'Basic Information',
      description: 'Enter the basic details of the flat/unit',
      fields: [
        {
          name: 'propertyId',
          label: 'Property',
          type: 'select',
          required: true,
          options: properties.map(p => ({ value: p.id, label: p.name })),
          icon: <Building2 className="w-5 h-5" />,
          clearsFields: ['towerId'],
        },
        {
          name: 'towerId',
          label: 'Tower/Block',
          type: 'select',
          required: true,
          onChange: (towerId: string) => {
            applyTowerDefaults(String(towerId), {
              ...mergedInitialValues,
              ...formSnapshot,
            });
          },
          options: towersForProperty.map((t) => ({
            value: t.id,
            label: [t.name, t.towerNumber ? `(${t.towerNumber})` : ''].filter(Boolean).join(' '),
          })),
          icon: <Building2 className="w-5 h-5" />,
          disabled: !selectedPropertyId || towersForProperty.length === 0,
          helperText:
            towersForProperty.length === 0 && selectedPropertyId
              ? 'No towers are defined for this property yet.'
              : 'Block area defaults and flat number prefix apply when you pick a tower.',
        },
        {
          name: 'flatNumber',
          label: 'Flat Number',
          type: 'text',
          placeholder: 'A-101',
          required: true,
          helperText: 'Uses block prefix + floor when set on the tower (e.g. A- → A-101).',
        },
        {
          name: 'floor',
          label: 'Floor Number',
          type: 'number',
          placeholder: '1',
          required: true,
          validation: { min: 0 },
          onChange: (floorVal: string) => {
            const towerId = formSnapshot.towerId || mergedInitialValues.towerId;
            const tower = towersForProperty.find((t) => t.id === towerId);
            if (!tower?.flatNumberPrefix) return;
            const current = formSnapshot.flatNumber ?? mergedInitialValues.flatNumber;
            if (current) return;
            const suggested = formatFlatNumberFromTower(
              tower.flatNumberPrefix,
              floorVal,
              1,
            );
            if (suggested) {
              setFormSnapshot((prev) => ({ ...prev, floor: floorVal, flatNumber: suggested }));
              setFormVersion((v) => v + 1);
            }
          },
        },
        {
          name: 'name',
          label: 'Unit Name',
          type: 'text',
          placeholder: 'Luxury 2BHK',
          required: true,
        },
        {
          name: 'type',
          label: 'Unit Type',
          type: 'select',
          required: true,
          options: [
            { value: 'STUDIO', label: 'Studio' },
            { value: '1BHK', label: '1 BHK' },
            { value: '2BHK', label: '2 BHK' },
            { value: '3BHK', label: '3 BHK' },
            { value: '4BHK', label: '4 BHK' },
            { value: 'PENTHOUSE', label: 'Penthouse' },
            { value: 'DUPLEX', label: 'Duplex' },
            { value: 'VILLA', label: 'Villa' },
          ],
        },
      ],
    },
    {
      title: 'Unit Specifications',
      description: 'Room configuration and features',
      fields: [
        {
          name: 'bedrooms',
          label: 'Bedrooms',
          type: 'number',
          placeholder: '2',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'bathrooms',
          label: 'Bathrooms',
          type: 'number',
          placeholder: '2',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'balconies',
          label: 'Balconies',
          type: 'number',
          placeholder: '1',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'servantRoom',
          label: 'Servant Room',
          type: 'checkbox',
        },
        {
          name: 'studyRoom',
          label: 'Study Room',
          type: 'checkbox',
        },
        {
          name: 'poojaRoom',
          label: 'Pooja Room',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Area Details',
      description: activeTower?.defaultSuperBuiltUpArea || activeTower?.defaultBuiltUpArea || activeTower?.defaultCarpetArea
        ? `Tower defaults — Super: ${activeTower.defaultSuperBuiltUpArea ?? '—'} · Built-up: ${activeTower.defaultBuiltUpArea ?? '—'} · Carpet: ${activeTower.defaultCarpetArea ?? '—'} sq.ft. Edit per unit if this flat differs.`
        : 'Enter area measurements (in sq.ft)',
      fields: [
        {
          name: 'superBuiltUpArea',
          label: 'Super Built-up Area (sq.ft)',
          type: 'number',
          placeholder: activeTower?.defaultSuperBuiltUpArea ? String(activeTower.defaultSuperBuiltUpArea) : '1200',
          required: true,
          validation: { min: 0 },
          helperText: activeTower?.defaultSuperBuiltUpArea ? `Tower default: ${activeTower.defaultSuperBuiltUpArea} sq.ft` : undefined,
        },
        {
          name: 'builtUpArea',
          label: 'Built-up Area (sq.ft)',
          type: 'number',
          placeholder: activeTower?.defaultBuiltUpArea ? String(activeTower.defaultBuiltUpArea) : '1050',
          required: true,
          validation: { min: 0 },
          helperText: activeTower?.defaultBuiltUpArea ? `Tower default: ${activeTower.defaultBuiltUpArea} sq.ft` : undefined,
        },
        {
          name: 'carpetArea',
          label: 'Carpet Area (sq.ft)',
          type: 'number',
          placeholder: activeTower?.defaultCarpetArea ? String(activeTower.defaultCarpetArea) : '900',
          required: true,
          validation: { min: 0 },
          helperText: activeTower?.defaultCarpetArea ? `Tower default: ${activeTower.defaultCarpetArea} sq.ft` : undefined,
        },
        {
          name: 'balconyArea',
          label: 'Balcony Area (sq.ft)',
          type: 'number',
          placeholder: '80',
          validation: { min: 0 },
        },
      ],
    },
    {
      title: 'Pricing — Primary',
      description: 'Base construction cost. Miscellaneous & Tax are itemised in the breakdown panel above.',
      fields: [
        {
          name: 'basePrice',
          label: 'Primary / Base Construction Cost',
          type: 'currency',
          placeholder: '2500000',
          required: true,
          prefix: '₹',
          validation: { min: 0 },
          helperText: 'The construction / principal cost of the unit.',
        },
        {
          name: 'pricePerSqft',
          label: 'Price per Sq.ft',
          type: 'currency',
          placeholder: '2800',
          prefix: '₹',
          validation: { min: 0 },
        },
        {
          name: 'discountAmount',
          label: 'Discount Amount',
          type: 'currency',
          placeholder: '50000',
          prefix: '₹',
          validation: { min: 0 },
          helperText: 'Applied to the grand total (Primary + Misc + Tax).',
        },
      ],
    },
    {
      title: 'Status & Availability',
      description: 'Unit status and availability',
      fields: [
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { value: 'AVAILABLE', label: 'Available' },
            { value: 'BLOCKED', label: 'Blocked' },
            { value: 'BOOKED', label: 'Booked' },
            { value: 'SOLD', label: 'Sold' },
            { value: 'ON_HOLD', label: 'On Hold' },
            { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ],
        },
        {
          name: 'isAvailable',
          label: 'Available for Sale',
          type: 'checkbox',
        },
        {
          name: 'availableFrom',
          label: 'Available From',
          type: 'date',
          helperText: 'When will this unit become available for sale?',
          showIf: (values) => values.status === 'AVAILABLE',
        },
        {
          name: 'expectedPossession',
          label: 'Expected Possession',
          type: 'date',
          helperText: 'Target handover date for the buyer.',
          showIf: (values) => values.status === 'AVAILABLE',
        },
      ],
    },
    {
      title: 'Features',
      description: 'Unit features and specifications',
      fields: [
        {
          name: 'facing',
          label: 'Facing Direction',
          type: 'select',
          options: [
            { value: 'North', label: 'North' },
            { value: 'South', label: 'South' },
            { value: 'East', label: 'East' },
            { value: 'West', label: 'West' },
            { value: 'North-East', label: 'North-East' },
            { value: 'North-West', label: 'North-West' },
            { value: 'South-East', label: 'South-East' },
            { value: 'South-West', label: 'South-West' },
          ],
        },
        {
          name: 'vastuCompliant',
          label: 'Vastu Compliant',
          type: 'checkbox',
        },
        {
          name: 'cornerUnit',
          label: 'Corner Unit',
          type: 'checkbox',
        },
        {
          name: 'roadFacing',
          label: 'Road Facing',
          type: 'checkbox',
        },
        {
          name: 'parkFacing',
          label: 'Park Facing',
          type: 'checkbox',
        },
        {
          name: 'parkingSlots',
          label: 'Parking Slots',
          type: 'number',
          placeholder: '2',
          required: true,
          validation: { min: 0 },
        },
        {
          name: 'coveredParking',
          label: 'Covered Parking',
          type: 'checkbox',
        },
        {
          name: 'furnishingStatus',
          label: 'Furnishing Status',
          type: 'select',
          options: [
            { value: 'UNFURNISHED', label: 'Unfurnished' },
            { value: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
            { value: 'FULLY_FURNISHED', label: 'Fully Furnished' },
          ],
        },
      ],
    },
    {
      title: 'Customer Assignment',
      description: 'Link this unit to a customer so sales and CRM stay in sync.',
      fields: [
        {
          name: 'customerId',
          label: 'Assign Existing Customer',
          type: 'select',
          options: [
            { value: '', label: 'None' },
            ...customers.map((customer) => ({
              value: customer.id,
              label: `${customer.firstName} ${customer.lastName} (${customer.email})`,
            })),
          ],
          helperText: 'Pick an existing customer or fill details below to create a new one.',
        },
        {
          name: 'customerFirstName',
          label: 'Customer First Name',
          type: 'text',
          helperText: 'Required if you are creating a new customer while saving this unit.',
        },
        {
          name: 'customerLastName',
          label: 'Customer Last Name',
          type: 'text',
        },
        {
          name: 'customerEmail',
          label: 'Customer Email',
          type: 'email',
        },
        {
          name: 'customerPhone',
          label: 'Customer Phone',
          type: 'tel',
        },
        {
          name: 'customerType',
          label: 'Customer Type',
          type: 'select',
          options: [
            { value: 'INDIVIDUAL', label: 'Individual' },
            { value: 'CORPORATE', label: 'Corporate' },
            { value: 'NRI', label: 'NRI' },
          ],
        },
        {
          name: 'customerNotes',
          label: 'Customer Notes',
          type: 'textarea',
          rows: 3,
        },
      ],
    },
    {
      title: 'Additional Details',
      fields: [
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Detailed description of the unit...',
          rows: 4,
        },
        {
          name: 'amenities',
          label: 'Amenities',
          type: 'textarea',
          placeholder: 'AC, Modular Kitchen, Wardrobe',
          rows: 3,
          helperText: 'Separate multiple amenities with commas',
        },
        {
          name: 'specialFeatures',
          label: 'Special Features',
          type: 'textarea',
          placeholder: 'Premium flooring, High ceiling',
          rows: 2,
        },
        {
          name: 'remarks',
          label: 'Remarks',
          type: 'textarea',
          placeholder: 'Any additional notes...',
          rows: 2,
        },
      ],
    },
    {
      title: 'Display Settings',
      fields: [
        {
          name: 'displayOrder',
          label: 'Display Order',
          type: 'number',
          placeholder: '1',
          validation: { min: 0 },
          helperText: 'Order in which to display this unit',
        },
        {
          name: 'isActive',
          label: 'Mark as Active',
          type: 'checkbox',
        },
      ],
    },
    {
      title: 'Media & Links',
      description: 'Floor plans, photos, and virtual tour links',
      fields: [
        {
          name: 'floorPlanUrl',
          label: 'Floor Plan URL',
          type: 'text',
          placeholder: 'https://...',
          helperText: 'Link to the floor plan image or PDF',
        },
        {
          name: 'virtualTourUrl',
          label: 'Virtual Tour URL',
          type: 'text',
          placeholder: 'https://...',
          helperText: 'Link to 3D walkthrough or video tour',
        },
        {
          name: 'images',
          label: 'Photo URLs (comma-separated)',
          type: 'textarea',
          placeholder: 'https://img1.jpg, https://img2.jpg',
          rows: 2,
          helperText: 'Paste multiple image URLs separated by commas',
        },
      ],
    },
    {
      title: 'Statuses & Dates',
      fields: [
        { name: 'agreementDate', label: 'Agreement Date', type: 'date' },
        { name: 'registrationDate', label: 'Registration Date', type: 'date' },
        { name: 'handoverDate', label: 'Handover Date', type: 'date' },
        {
          name: 'loanStatus',
          label: 'Loan Status',
          type: 'select',
          options: [
            { value: 'NONE', label: 'None' },
            { value: 'APPLIED', label: 'Applied' },
            { value: 'SANCTIONED', label: 'Sanctioned' },
            { value: 'DISBURSED', label: 'Disbursed' },
          ],
        },
        {
          name: 'handoverStatus',
          label: 'Handover Status',
          type: 'select',
          options: [
            { value: 'PENDING', label: 'Pending' },
            { value: 'READY', label: 'Ready' },
            { value: 'HANDED_OVER', label: 'Handed Over' },
          ],
        },
        {
          name: 'verificationStatus',
          label: 'Verification Status',
          type: 'select',
          options: [
            { value: 'PENDING', label: 'Pending' },
            { value: 'VERIFIED', label: 'Verified' },
          ],
        },
      ],
    },
    {
      title: 'Assignments & Extras',
      fields: [
        { name: 'salespersonId', label: 'Salesperson ID', type: 'text' },
        { name: 'serviceContactId', label: 'Service Contact ID', type: 'text' },
        { name: 'coBuyerName', label: 'Co-buyer Name', type: 'text' },
        { name: 'coBuyerEmail', label: 'Co-buyer Email', type: 'text' },
        { name: 'coBuyerPhone', label: 'Co-buyer Phone', type: 'text' },
        { name: 'parkingNumber', label: 'Parking Number', type: 'text' },
        { name: 'parkingType', label: 'Parking Type', type: 'text' },
        { name: 'storageId', label: 'Storage/Locker ID', type: 'text' },
        {
          name: 'furnishingPack',
          label: 'Furnishing Pack',
          type: 'select',
          options: [
            { value: '', label: 'None' },
            { value: 'BASIC', label: 'Basic' },
            { value: 'PREMIUM', label: 'Premium' },
          ],
        },
        { name: 'appliancePack', label: 'Appliance Pack Applied', type: 'checkbox' },
      ],
    },
  ];

  // Live category totals for the breakdown summary.
  const livePrimary  = numOr0(formSnapshot.basePrice ?? initialData?.basePrice);
  const liveMisc     = miscItems.reduce((s, i) => s + numOr0(i.amount), 0);
  const liveTax      = taxItems.reduce((s, i) => s + numOr0(i.amount), 0);
  const liveDiscount = numOr0(formSnapshot.discountAmount ?? initialData?.discountAmount);
  const liveTotal    = livePrimary + liveMisc + liveTax;
  const liveFinal    = Math.max(0, liveTotal - liveDiscount);
  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* ── Pricing: Miscellaneous & Tax breakdown ─────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Pricing — Category Breakdown</h3>
          <p className="mt-1 text-sm text-gray-600">
            The base/construction cost is the <strong>Primary</strong> price (entered in the Pricing
            section below). Itemise everything else as <strong>Miscellaneous</strong> or{' '}
            <strong>Tax</strong> with a tag of what it truly is.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <CategoryLineItemEditor
            title="Miscellaneous"
            hint="Parking, lift, amenities, maintenance deposit, PLC, club membership…"
            items={miscItems}
            onChange={setMiscItems}
            suggestions={['Parking', 'Maintenance', 'Club membership', 'Floor-rise PLC', 'Amenities']}
          />
          <CategoryLineItemEditor
            title="Tax & Statutory"
            hint="GST, stamp duty, registration charges…"
            items={taxItems}
            onChange={setTaxItems}
            suggestions={['GST', 'Stamp duty', 'Registration charges']}
          />

          {/* Live summary */}
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100 text-sm">
            <div className="flex justify-between px-4 py-2">
              <span className="text-gray-600">Primary (base)</span>
              <span className="font-medium text-gray-900">₹{fmt(livePrimary)}</span>
            </div>
            <div className="flex justify-between px-4 py-2">
              <span className="text-gray-600">Miscellaneous</span>
              <span className="font-medium text-gray-900">₹{fmt(liveMisc)}</span>
            </div>
            <div className="flex justify-between px-4 py-2">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium text-gray-900">₹{fmt(liveTax)}</span>
            </div>
            {liveDiscount > 0 && (
              <div className="flex justify-between px-4 py-2">
                <span className="text-gray-600">Less: Discount</span>
                <span className="font-medium text-gray-900">−₹{fmt(liveDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-2.5 bg-gray-50 rounded-b-lg">
              <span className="font-semibold text-gray-900">Final Price</span>
              <span className="font-bold text-[var(--eastern-red)]">₹{fmt(liveFinal)}</span>
            </div>
          </div>
        </div>
      </div>

      <Form
        key={`flat-form-${initialData?.id ?? 'new'}-${formVersion}`}
        title={initialData ? 'Edit Flat/Unit' : 'Add New Flat/Unit'}
        description={initialData ? 'Update flat details' : 'Add a new flat/unit to the tower'}
        sections={sections}
        initialValues={mergedInitialValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        submitLabel={initialData ? 'Update Flat' : 'Create Flat'}
        cancelLabel="Cancel"
        loading={loading}
        columns={2}
        onValuesChange={(values) => {
          setFormSnapshot(values);
          if (values.propertyId !== selectedPropertyId) {
            setSelectedPropertyId(values.propertyId);
          }
        }}
      />
    </div>
  );
}
