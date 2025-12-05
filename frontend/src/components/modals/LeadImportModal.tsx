'use client';

import { useState, useRef } from 'react';
import Modal from './Modal';
import { leadsService } from '@/services/leads.service';

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function LeadImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: LeadImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [towerId, setTowerId] = useState('');
  const [flatId, setFlatId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    // Create CSV template
    const template = 'First Name,Last Name,Phone,Email,Source,Status,Notes,PropertyId,TowerId,FlatId\n' +
      'John,Doe,9876543210,john@example.com,WEBSITE,NEW,Interested in 2BHK,PROPERTY_UUID,,\n' +
      'Jane,Smith,9876543211,jane@example.com,REFERRAL,CONTACTED,Looking for 3BHK,PROPERTY_UUID,TOWER_UUID,FLAT_UUID';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
        parseCSVPreview(selectedFile);
      } else {
        setError('Please select a CSV file');
        setFile(null);
      }
    }
  };

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',');
        return {
          firstName: values[0]?.trim() || '',
          lastName: values[1]?.trim() || '',
          phone: values[2]?.trim() || '',
          email: values[3]?.trim() || '',
          source: values[4]?.trim() || '',
          status: values[5]?.trim() || 'NEW',
          notes: values[6]?.trim() || '',
        };
      });
      
      setPreviewData(preview);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row
        const dataLines = lines.slice(1);
        
        const leads = dataLines.map(line => {
          const values = line.split(',');
          return {
            firstName: values[0]?.trim() || '',
            lastName: values[1]?.trim() || '',
            phone: values[2]?.trim() || '',
            email: values[3]?.trim() || '',
            source: values[4]?.trim() || 'OTHER',
            status: values[5]?.trim() || 'NEW',
            notes: values[6]?.trim() || '',
            propertyId: values[7]?.trim() || '',
            towerId: values[8]?.trim() || '',
            flatId: values[9]?.trim() || '',
          };
        }).filter(lead => lead.firstName && lead.phone); // Basic validation

        const result = await leadsService.importLeads({
          leads,
          propertyId: propertyId || undefined,
          towerId: towerId || undefined,
          flatId: flatId || undefined,
        });
        setImportResult(result);
        
        if (result.errorCount === 0) {
          setTimeout(() => {
            onImportComplete();
            handleClose();
          }, 2000);
        }
      };

      reader.readAsText(file);
    } catch (err: any) {
      setError(err.message || 'Failed to import leads');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(null);
      setError('');
      setImportResult(null);
      setPreviewData([]);
      setPropertyId('');
      setTowerId('');
      setFlatId('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Leads from CSV"
      size="lg"
    >
      <div className="space-y-4">
        {!importResult ? (
          <>
            {/* Download Template */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Download Template</h4>
                  <p className="text-sm text-blue-700">
                    Use our CSV template to ensure your data is formatted correctly
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Download
                </button>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loading}
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Preview */}
            {previewData.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Preview (First 5 rows)
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-auto max-h-64">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Phone</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Source</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((lead, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {lead.firstName} {lead.lastName}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{lead.phone}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{lead.email}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{lead.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Property ID (optional)
                </label>
                <input
                  type="text"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  placeholder="UUID applied to all rows if set"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Tower ID (optional)
                </label>
                <input
                  type="text"
                  value={towerId}
                  onChange={(e) => setTowerId(e.target.value)}
                  placeholder="UUID applied to all rows if set"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Flat ID (optional)
                </label>
                <input
                  type="text"
                  value={flatId}
                  onChange={(e) => setFlatId(e.target.value)}
                  placeholder="UUID applied to all rows if set"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleImport}
                disabled={loading || !file}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </span>
                ) : (
                  'Import Leads'
                )}
              </button>
              
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          /* Import Result */
          <div className="space-y-4">
            <div className={`border-l-4 p-4 rounded-lg ${
              importResult.errorCount === 0 
                ? 'bg-green-50 border-green-400' 
                : 'bg-yellow-50 border-yellow-400'
            }`}>
              <h4 className="font-medium text-gray-900 mb-2">Import Complete</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Rows</p>
                  <p className="text-lg font-semibold">{importResult.totalRows}</p>
                </div>
                <div>
                  <p className="text-gray-600">Success</p>
                  <p className="text-lg font-semibold text-green-600">{importResult.successCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Errors</p>
                  <p className="text-lg font-semibold text-red-600">{importResult.errorCount}</p>
                </div>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Errors</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-48 overflow-auto">
                  <ul className="text-sm text-red-800 space-y-1">
                    {importResult.errors.slice(0, 10).map((err: any, index: number) => (
                      <li key={index}>
                        Row {err.row}: {err.error}
                      </li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li className="font-medium">
                        ...and {importResult.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
