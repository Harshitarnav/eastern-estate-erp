// Modal Usage Examples for Eastern Estate ERP
// This file shows how to use all the modal components

import React, { useState } from 'react';
import { Modal, ConfirmDialog, DeleteConfirmDialog, AlertDialog } from '@/components/modals/Modal';
import { Trash2, Edit, Eye } from 'lucide-react';

// ============================================
// EXAMPLE 1: Basic Modal with Custom Content
// ============================================
export function PropertyDetailsModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        View Details
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Diamond City - Project Details"
        description="Complete information about the project"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => alert('Edit clicked')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Project
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Project Code</label>
              <p className="text-gray-900">EECD-DC-001</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <p className="text-gray-900">Oyna, Ranchi</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Total Units</label>
              <p className="text-gray-900">732</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sold Units</label>
              <p className="text-gray-900">380</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ============================================
// EXAMPLE 2: Delete Confirmation Dialog
// ============================================
export function DeletePropertyButton({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Call your API
      const response = await fetch(`/api/v1/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Show success message
      alert('Property deleted successfully');
      setIsOpen(false);
      
      // Refresh the list or redirect
      window.location.reload();
    } catch (error) {
      alert('Failed to delete property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-red-600 hover:bg-red-50 rounded"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <DeleteConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        itemName={propertyName}
        loading={loading}
      />
    </>
  );
}

// ============================================
// EXAMPLE 3: Confirm Dialog (General)
// ============================================
export function ActivatePropertyButton({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/properties/${propertyId}/activate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to activate');

      alert('Property activated successfully');
      setIsOpen(false);
    } catch (error) {
      alert('Failed to activate property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Activate Property
      </button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleActivate}
        title="Activate Property"
        description="This will make the property visible to customers. Are you sure?"
        confirmLabel="Yes, Activate"
        cancelLabel="Cancel"
        variant="success"
        loading={loading}
      />
    </>
  );
}

// ============================================
// EXAMPLE 4: Alert Dialog (Info/Success/Error)
// ============================================
export function PaymentSuccessAlert() {
  const [isOpen, setIsOpen] = useState(false);

  // Simulate payment success
  const handlePayment = async () => {
    // ... payment logic
    setIsOpen(true); // Show success alert
  };

  return (
    <>
      <button
        onClick={handlePayment}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Process Payment
      </button>

      <AlertDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Payment Successful!"
        description="Payment of ₹50,000 has been processed successfully. Receipt has been sent to your email."
        type="success"
        closeLabel="OK"
      />
    </>
  );
}

// ============================================
// EXAMPLE 5: Full Page with Multiple Modals
// ============================================
export function PropertyManagementPage() {
  const [detailsModal, setDetailsModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [activateModal, setActivateModal] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const properties = [
    { id: '1', name: 'Diamond City', location: 'Ranchi', status: 'Active' },
    { id: '2', name: 'Eastern Satellite City', location: 'Muzaffarpur', status: 'Under Construction' },
  ];

  const handleView = (property: any) => {
    setSelectedProperty(property);
    setDetailsModal(true);
  };

  const handleDelete = async () => {
    // Delete logic
    setDeleteModal(false);
    setSuccessAlert(true);
  };

  const handleActivate = async () => {
    // Activate logic
    setActivateModal(false);
    setSuccessAlert(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Property Management</h1>

      <div className="bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Property Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {((properties || [])).map((property) => (
              <tr key={property.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {property.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {property.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {property.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleView(property)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProperty(property);
                        setDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={detailsModal}
        onClose={() => setDetailsModal(false)}
        title={selectedProperty?.name}
        size="lg"
      >
        <div className="space-y-4">
          <p>Location: {selectedProperty?.location}</p>
          <p>Status: {selectedProperty?.status}</p>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        itemName={selectedProperty?.name}
      />

      {/* Success Alert */}
      <AlertDialog
        isOpen={successAlert}
        onClose={() => setSuccessAlert(false)}
        title="Success!"
        description="Action completed successfully"
        type="success"
      />
    </div>
  );
}

// ============================================
// QUICK REFERENCE - HOW TO USE
// ============================================

/*

1. BASIC MODAL:
----------------
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  description="Optional description"
  size="md" // sm, md, lg, xl, full
>
  Your content here
</Modal>


2. DELETE CONFIRMATION:
-----------------------
<DeleteConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  itemName="Property Name"
  loading={loading}
/>


3. CONFIRM DIALOG:
------------------
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleAction}
  title="Confirm Action"
  description="Are you sure?"
  variant="danger" // default, danger, warning, success, info
  confirmLabel="Yes"
  cancelLabel="No"
  loading={loading}
/>


4. ALERT DIALOG:
----------------
<AlertDialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Success!"
  description="Operation completed"
  type="success" // success, error, warning, info
/>


5. IN YOUR COMPONENT:
---------------------
const [isOpen, setIsOpen] = useState(false);

// Open modal
<button onClick={() => setIsOpen(true)}>Open</button>

// The modal
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  ...
</Modal>

*/
