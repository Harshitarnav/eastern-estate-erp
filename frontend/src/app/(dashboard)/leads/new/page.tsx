'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LeadForm from '@/components/forms/LeadForm';
import { leadsService } from '@/services/leads.service';
import { propertiesService } from '@/services/properties.service';

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const defaultValues = {
    status: 'NEW',
    source: 'WEBSITE',
    priority: 'MEDIUM',
    isActive: true,
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertiesService.getProperties({ isActive: true });
      setProperties(response.data || response);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const toNumber = (val: any) => (val === '' || val === undefined || val === null ? undefined : Number(val));
      const clean = <T,>(val: T) => (val === '' ? undefined : val);
      const cleanEmail = (val: string | undefined) => {
        if (!val) return undefined;
        const trimmed = val.trim();
        return trimmed.length ? trimmed : undefined;
      };

      const leadData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: cleanEmail(data.email),
        phone: data.phone,
        alternatePhone: clean(data.alternatePhone),
        status: data.status || 'NEW',
        source: data.source || 'WEBSITE',
        priority: data.priority || 'MEDIUM',
        propertyId: clean(data.propertyId),
        towerId: clean(data.towerId),
        flatId: clean(data.flatId),
        budgetMin: toNumber(data.budgetMin),
        budgetMax: toNumber(data.budgetMax),
        preferredLocation: clean(data.preferredLocation),
        needsHomeLoan: !!data.needsHomeLoan,
        isFirstTimeBuyer: !!data.isFirstTimeBuyer,
        nextFollowUpDate: clean(data.nextFollowUpDate),
        followUpNotes: clean(data.followUpNotes),
        notes: clean(data.notes),
      };

      await leadsService.createLead(leadData);
      alert('Lead created successfully!');
      window.location.href = '/leads';
    } catch (error: any) {
      console.error('Error creating lead:', error);
      alert(error.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/leads');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <LeadForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        properties={properties}
        initialData={defaultValues}
      />
    </div>
  );
}
