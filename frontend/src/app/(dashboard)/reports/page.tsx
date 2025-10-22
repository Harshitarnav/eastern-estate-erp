'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, DollarSign, Users, Building2, TrendingUp, Package } from 'lucide-react';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const reports = [
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Comprehensive sales analysis including leads, customers, and bookings',
      icon: TrendingUp,
      color: '#10B981',
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Payment collections, pending amounts, and financial summary',
      icon: DollarSign,
      color: '#8B5CF6',
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels, low stock items, and inventory valuation',
      icon: Package,
      color: '#3B82F6',
    },
    {
      id: 'property',
      title: 'Property Report',
      description: 'Property portfolio, occupancy rates, and availability',
      icon: Building2,
      color: '#A8211B',
    },
    {
      id: 'employee',
      title: 'Employee Report',
      description: 'Employee attendance, leave, and payroll summary',
      icon: Users,
      color: '#F59E0B',
    },
    {
      id: 'construction',
      title: 'Construction Report',
      description: 'Project progress, milestones, and budget tracking',
      icon: FileText,
      color: '#EF4444',
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId);
    // In a real implementation, this would fetch and generate the report
    alert(`Generating ${((reports || [])).find(r => r.id === reportId)?.title}...\n\nDate Range: ${dateRange.from || 'All'} to ${dateRange.to || 'All'}\n\nThis feature would generate a comprehensive PDF/Excel report with all relevant data.`);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!selectedReport) {
      alert('Please select a report first');
      return;
    }
    alert(`Exporting to ${format.toUpperCase()}...\n\nIn production, this would download a ${format} file with the report data.`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8" style={{ color: '#A8211B' }} />
          <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
            Reports
          </h1>
        </div>
        <p className="text-gray-600">
          Generate comprehensive reports for sales, finance, inventory, and more.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
            />
          </div>
          <button
            onClick={() => setDateRange({ from: '', to: '' })}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {((reports || [])).map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          
          return (
            <div
              key={report.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer ${
                isSelected ? 'ring-2' : ''
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${report.color}20` }}
                  >
                    <Icon className="h-8 w-8" style={{ color: report.color }} />
                  </div>
                  {isSelected && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${report.color}20`, color: report.color }}
                    >
                      Selected
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold mb-2" style={{ color: '#7B1E12' }}>
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {report.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReport(report.id);
                  }}
                  className="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: report.color,
                    color: 'white',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Generate Report
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Options */}
      {selectedReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>
            Export Options
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleExport('pdf')}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2"
              style={{ borderColor: '#EF4444', color: '#EF4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#EF4444';
              }}
            >
              <Download className="h-5 w-5" />
              <span>Export as PDF</span>
            </button>
            
            <button
              onClick={() => handleExport('excel')}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border-2"
              style={{ borderColor: '#10B981', color: '#10B981' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#10B981';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#10B981';
              }}
            >
              <Download className="h-5 w-5" />
              <span>Export as Excel</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Preview */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: '#7B1E12' }}>
          Quick Stats Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold" style={{ color: '#10B981' }}>₹0</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Active Properties</p>
            <p className="text-2xl font-bold" style={{ color: '#A8211B' }}>0</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>0</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">Inventory Value</p>
            <p className="text-2xl font-bold" style={{ color: '#3B82F6' }}>₹0</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          * Connect to backend to see real-time statistics
        </p>
      </div>

      {/* Brand Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Eastern Estate ERP • Building Homes, Nurturing Bonds
        </p>
      </div>
    </div>
  );
}
