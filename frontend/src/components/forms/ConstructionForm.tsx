'use client';

import { useState } from 'react';
import { Save, X } from 'lucide-react';

interface ConstructionFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export default function ConstructionForm({ initialData, onSubmit, onCancel }: ConstructionFormProps) {
    const [formData, setFormData] = useState({
        projectCode: initialData?.projectCode || '',
        name: initialData?.name || '',
        propertyId: initialData?.propertyId || '',
        description: initialData?.description || '',
        phase: initialData?.phase || 'Site Preparation',
        contractorName: initialData?.contractorName || '',
        contractorContact: initialData?.contractorContact || '',
        contractorEmail: initialData?.contractorEmail || '',
        estimatedBudget: initialData?.estimatedBudget || '',
        actualCost: initialData?.actualCost || 0,
        startDate: initialData?.startDate || '',
        expectedEndDate: initialData?.expectedEndDate || '',
        actualEndDate: initialData?.actualEndDate || '',
        progressPercentage: initialData?.progressPercentage || 0,
        status: initialData?.status || 'Planned',
        notes: initialData?.notes || '',
    });

    const phases = [
        'Site Preparation',
        'Foundation',
        'Plinth Beam',
        'Columns & Beams',
        'Slab Work',
        'Brickwork',
        'Plastering',
        'Electrical Work',
        'Plumbing Work',
        'Flooring',
        'Doors & Windows',
        'Painting',
        'Final Inspection'
    ];

    const statuses = ['Planned', 'Active', 'On Hold', 'Completed', 'Cancelled'];

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
                {/* Project Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Code *
                    </label>
                    <input
                        type="text"
                        name="projectCode"
                        value={formData.projectCode}
                        onChange={handleChange}
                        required
                        placeholder="e.g., CONST-2025-001"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Project Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Sunshine Residency - Phase 1"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Phase */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Construction Phase *
                    </label>
                    <select
                        name="phase"
                        value={formData.phase}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {phases.map(phase => (
                            <option key={phase} value={phase}>{phase}</option>
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

                {/* Contractor Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contractor Name *
                    </label>
                    <input
                        type="text"
                        name="contractorName"
                        value={formData.contractorName}
                        onChange={handleChange}
                        required
                        placeholder="ABC Construction"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Contractor Contact */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contractor Contact *
                    </label>
                    <input
                        type="text"
                        name="contractorContact"
                        value={formData.contractorContact}
                        onChange={handleChange}
                        required
                        placeholder="+91 9876543210"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Contractor Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contractor Email
                    </label>
                    <input
                        type="email"
                        name="contractorEmail"
                        value={formData.contractorEmail}
                        onChange={handleChange}
                        placeholder="contractor@example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Progress Percentage */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Progress Percentage (0-100)
                    </label>
                    <input
                        type="number"
                        name="progressPercentage"
                        value={formData.progressPercentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Estimated Budget */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Budget (₹) *
                    </label>
                    <input
                        type="number"
                        name="estimatedBudget"
                        value={formData.estimatedBudget}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="5000000"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Actual Cost */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Cost (₹)
                    </label>
                    <input
                        type="number"
                        name="actualCost"
                        value={formData.actualCost}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0"
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

                {/* Expected End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected End Date *
                    </label>
                    <input
                        type="date"
                        name="expectedEndDate"
                        value={formData.expectedEndDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Actual End Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual End Date
                    </label>
                    <input
                        type="date"
                        name="actualEndDate"
                        value={formData.actualEndDate}
                        onChange={handleChange}
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
                    placeholder="Project description..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Additional notes..."
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
                    {initialData ? 'Update' : 'Create'} Project
                </button>
            </div>
        </form>
    );
}
export default ConstructionForm;
