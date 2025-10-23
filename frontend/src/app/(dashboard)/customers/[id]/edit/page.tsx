'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { customersService } from '@/services/customers.service';
import { BrandPrimaryButton, BrandSecondaryButton } from '@/components/layout/BrandHero';
import { brandPalette } from '@/utils/brand';

export default function CustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'INDIVIDUAL',
    occupation: '',
    company: '',
    panNumber: '',
    aadharNumber: '',
    kycStatus: 'PENDING',
    isVIP: false,
    notes: '',
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const customer = await customersService.getCustomer(customerId);
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        alternatePhone: customer.alternatePhone || '',
        dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
        gender: customer.gender || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
        type: customer.type || 'INDIVIDUAL',
        occupation: customer.occupation || '',
        company: customer.company || '',
        panNumber: customer.panNumber || '',
        aadharNumber: customer.aadharNumber || '',
        kycStatus: customer.kycStatus || 'PENDING',
        isVIP: customer.isVIP || false,
        notes: customer.notes || '',
      });
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customer');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      await customersService.updateCustomer(customerId, formData);
      alert('Customer updated successfully!');
      window.location.href = '/customers';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update customer');
      alert('Failed to update customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: brandPalette.primary }} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push(`/customers/${customerId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: brandPalette.secondary }}>Edit Customer</h1>
      </div>

      {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="INDIVIDUAL">Individual</option>
                <option value="CORPORATE">Corporate</option>
                <option value="NRI">NRI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">KYC Status *</label>
              <select name="kycStatus" value={formData.kycStatus} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg">
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isVIP" checked={formData.isVIP} onChange={handleChange} />
              <span className="text-sm font-medium">VIP Customer</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Occupation</label>
              <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">PAN Number</label>
              <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Aadhar Number</label>
              <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-4 py-2 border rounded-lg" placeholder="Add any notes..." />
        </div>

        <div className="flex gap-4">
          <BrandPrimaryButton type="submit" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </BrandPrimaryButton>
          <BrandSecondaryButton type="button" onClick={() => router.push(`/customers/${customerId}`)}>
            Cancel
          </BrandSecondaryButton>
        </div>
      </form>
    </div>
  );
}
