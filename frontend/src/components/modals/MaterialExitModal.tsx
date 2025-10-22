'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import { api } from '@/services/api';

interface MaterialExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyId: string;
}

export default function MaterialExitModal({ isOpen, onClose, onSuccess, propertyId }: MaterialExitModalProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    materialId: '',
    projectId: '',
    quantity: '',
    exitDate: new Date().toISOString().split('T')[0],
    issuedTo: '',
    purpose: '',
    remarks: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [materialsRes, projectsRes] = await Promise.all([
        api.get('/materials'),
        api.get(`/construction-projects?propertyId=${propertyId}`)
      ]);
      
      const materialsData = Array.isArray(materialsRes.data) ? materialsRes.data : (materialsRes.data?.data || []);
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []);
      
      setMaterials(m((aterialsData || [])).filter((m: any) => m.isActive && m.currentStock > 0));
      setProjects(p((rojectsData || [])).filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING'));
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load materials and projects');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.materialId || !formData.quantity || !formData.issuedTo) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedMaterial = materials.find(m => m.id === formData.materialId);
    const quantity = parseFloat(formData.quantity);
    
    if (selectedMaterial && quantity > selectedMaterial.currentStock) {
      alert(`Insufficient stock! Available: ${selectedMaterial.currentStock} ${selectedMaterial.unitOfMeasurement}`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/material-exits', {
        materialId: formData.materialId,
        projectId: formData.projectId || null,
        quantityIssued: quantity,
        exitDate: formData.exitDate,
        issuedTo: formData.issuedTo,
        purpose: formData.purpose || null,
        remarks: formData.remarks || null,
      });

      alert('Material exit recorded successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to record material exit:', error);
      alert(error.response?.data?.message || 'Failed to record material exit');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      materialId: '',
      projectId: '',
      quantity: '',
      exitDate: new Date().toISOString().split('T')[0],
      issuedTo: '',
      purpose: '',
      remarks: '',
    });
    onClose();
  };

  const selectedMaterial = materials.find(m => m.id === formData.materialId);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Record Material Exit" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.materialId}
              onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Select Material</option>
              {((materials || [])).map((material) => (
                <option key={material.id} value={material.id}>
                  {material.materialName} ({material.materialCode})
                </option>
              ))}
            </select>
            {selectedMaterial && (
              <div className={`text-xs mt-1 ${
                selectedMaterial.currentStock <= selectedMaterial.minimumStockLevel
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-500'
              }`}>
                Available Stock: {selectedMaterial.currentStock} {selectedMaterial.unitOfMeasurement}
                {selectedMaterial.currentStock <= selectedMaterial.minimumStockLevel && ' (Low Stock!)'}
              </div>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project (Optional)
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Project</option>
              {((projects || [])).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Issue <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter quantity"
              required
            />
            {selectedMaterial && (
              <p className="text-xs text-gray-500 mt-1">
                Unit: {selectedMaterial.unitOfMeasurement}
              </p>
            )}
          </div>

          {/* Exit Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exit Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.exitDate}
              onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          {/* Issued To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issued To <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.issuedTo}
              onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Name of person receiving"
              required
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Purpose of material usage"
            />
          </div>
        </div>

        {/* Stock Warning */}
        {selectedMaterial && parseFloat(formData.quantity) > 0 && (
          <div className={`rounded-lg p-4 border-2 ${
            (selectedMaterial.currentStock - parseFloat(formData.quantity)) <= selectedMaterial.minimumStockLevel
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Stock After Exit:</span>
              <span className={`text-lg font-bold ${
                (selectedMaterial.currentStock - parseFloat(formData.quantity)) <= selectedMaterial.minimumStockLevel
                  ? 'text-red-600'
                  : 'text-gray-900'
              }`}>
                {(selectedMaterial.currentStock - parseFloat(formData.quantity)).toFixed(2)} {selectedMaterial.unitOfMeasurement}
              </span>
            </div>
            {(selectedMaterial.currentStock - parseFloat(formData.quantity)) <= selectedMaterial.minimumStockLevel && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ Warning: Stock will be below minimum level after this exit!
              </p>
            )}
          </div>
        )}

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="Any additional notes..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#A8211B' }}
          >
            {loading ? 'Recording...' : 'Record Exit'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
