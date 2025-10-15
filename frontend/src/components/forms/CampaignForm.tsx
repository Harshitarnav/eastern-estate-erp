'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';

interface CampaignFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function CampaignForm({ initialData, onSubmit, onCancel }: CampaignFormProps) {
    const [formData, setFormData] = useState({
        campaignCode: initialData?.campaignCode || '',
        name: initialData?.name || '',
        description: initialData?.description || '',
        type: initialData?.type || 'Digital',
        channel: initialData?.channel || 'Facebook',
        status: initialData?.status || 'Draft',
        startDate: initialData?.startDate || '',
        endDate: initialData?.endDate || '',
        totalBudget: initialData?.totalBudget || '',
        targetAudience: initialData?.targetAudience || '',
        targetLocation: initialData?.targetLocation || '',
        utmSource: initialData?.utmSource || '',
        utmMedium: initialData?.utmMedium || '',
        utmCampaign: initialData?.utmCampaign || '',
        agencyName: initialData?.agencyName || '',
        agencyContact: initialData?.agencyContact || '',
        objectives: initialData?.objectives || '',
    });

    const campaignTypes = ['Digital', 'Social Media', 'Email', 'SMS', 'Print', 'TV', 'Radio', 'Outdoor', 'Event', 'Referral'];
    const channels = ['Facebook', 'Instagram', 'Google', 'LinkedIn', 'Twitter', 'YouTube', 'WhatsApp', 'Email', 'SMS', 'Print', 'TV', 'Radio', 'Outdoor', 'Direct Mail', 'Referral', 'Event', 'Webinar', 'Other'];
    const statuses = ['Draft', 'Planned', 'Active', 'Paused', 'Completed', 'Cancelled'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Code *
                    </label>
                    <input
                        type="text"
                        name="campaignCode"
                        value={formData.campaignCode}
                        onChange={handleChange}
                        required
                        placeholder="e.g., CAMP-2025-001"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Campaign Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Summer Sale 2025"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Campaign Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Type *
                    </label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {campaignTypes.map(type => (
                            <option key={type} value={type.replace(' ', '_').toUpperCase()}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Channel */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Channel *
                    </label>
                    <select
                        name="channel"
                        value={formData.channel}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {channels.map(channel => (
                            <option key={channel} value={channel.replace(' ', '_').toUpperCase()}>{channel}</option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* Total Budget */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Budget (₹) *
                    </label>
                    <input
                        type="number"
                        name="totalBudget"
                        value={formData.totalBudget}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="100000"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                    </label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Target Audience */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                    </label>
                    <input
                        type="text"
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleChange}
                        placeholder="e.g., First-time homebuyers"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Target Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Location
                    </label>
                    <input
                        type="text"
                        name="targetLocation"
                        value={formData.targetLocation}
                        onChange={handleChange}
                        placeholder="e.g., Mumbai, Pune"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* UTM Source */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        UTM Source
                    </label>
                    <input
                        type="text"
                        name="utmSource"
                        value={formData.utmSource}
                        onChange={handleChange}
                        placeholder="e.g., facebook"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* UTM Medium */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        UTM Medium
                    </label>
                    <input
                        type="text"
                        name="utmMedium"
                        value={formData.utmMedium}
                        onChange={handleChange}
                        placeholder="e.g., cpc"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* UTM Campaign */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        UTM Campaign
                    </label>
                    <input
                        type="text"
                        name="utmCampaign"
                        value={formData.utmCampaign}
                        onChange={handleChange}
                        placeholder="e.g., summer_sale_2025"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Agency Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agency Name
                    </label>
                    <input
                        type="text"
                        name="agencyName"
                        value={formData.agencyName}
                        onChange={handleChange}
                        placeholder="e.g., ABC Marketing Agency"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Agency Contact */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agency Contact
                    </label>
                    <input
                        type="text"
                        name="agencyContact"
                        value={formData.agencyContact}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Campaign description..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Objectives */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objectives
                </label>
                <textarea
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Campaign objectives and goals..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                    <X className="h-4 w-4" />
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Save className="h-4 w-4" />
                    {initialData ? 'Update' : 'Create'} Campaign
                </button>
            </div>
        </form>
    );
}
