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

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await propertiesService.getProperties({ isActive: true });
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const leadData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        status: data.status || 'NEW',
        source: data.source,
        priority: data.priority || 'MEDIUM',
        propertyId: data.propertyId,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        preferredLocation: data.preferredLocation,
        needsHomeLoan: data.needsHomeLoan || false,
        isFirstTimeBuyer: data.isFirstTimeBuyer || false,
        nextFollowUpDate: data.nextFollowUpDate,
        followUpNotes: data.followUpNotes,
        notes: data.notes,
        isActive: data.isActive !== false,
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
      />
    </div>
  );
}
