import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Filter,
  X,
  Eye,
  Edit,
  Trash2,
  Check,
  Building2,
  MapPin,
  Home,
  Calendar,
  TrendingUp
} from 'lucide-react';

// Types
interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  mobileRender?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onBulkDelete?: (rows: T[]) => void;
  onExport?: (rows: T[]) => void;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  bulkActions?: boolean;
  itemsPerPageOptions?: number[];
  emptyMessage?: string;
  mobileView?: boolean;
}

// Eastern Estate's Real Projects Data
const easternEstateProjects = [
  { 
    id: '1', 
    code: 'EECD-DC-001', 
    name: 'Diamond City', 
    location: 'Oyna, Ranchi',
    city: 'Ranchi',
    state: 'Jharkhand',
    type: 'Township',
    totalArea: 28,
    areaUnit: 'Acres',
    towers: 13,
    floors: 'G+9',
    totalUnits: 732,
    soldUnits: 380,
    availableUnits: 352,
    bhkTypes: '2BHK, 3BHK',
    reraNumber: 'CNT Free',
    status: 'Active',
    launchDate: '2018-06-15',
    possessionDate: '2024-12-31',
    priceRange: '₹25L - ₹45L',
    amenities: ['Club House', 'Swimming Pool', 'Gym', 'Park', '70% Open Space'],
    nearbyLandmarks: '3km from NH-33, Behind Apollo Hospital',
    revenue: 380000000,
    completionPercent: 75
  },
  { 
    id: '2', 
    code: 'EECD-ESC-002', 
    name: 'Eastern Satellite City', 
    location: 'Muzaffarpur',
    city: 'Muzaffarpur',
    state: 'Bihar',
    type: 'Residential Township',
    totalArea: 15,
    areaUnit: 'Acres',
    towers: 0,
    floors: 'Duplex',
    totalUnits: 100,
    soldUnits: 45,
    availableUnits: 55,
    bhkTypes: 'Duplex Elite & Premium Villas',
    reraNumber: 'BRERAP00080-1/19/R-150/2018',
    status: 'Under Construction',
    launchDate: '2019-03-20',
    possessionDate: '2025-06-30',
    priceRange: '₹45L - ₹85L',
    amenities: ['Gated Community', 'Garden', 'Security', '24/7 Power Backup'],
    nearbyLandmarks: 'Near City Center, 5km from Railway Station',
    revenue: 202500000,
    completionPercent: 45
  },
  { 
    id: '3', 
    code: 'EECD-GV-003', 
    name: 'Green Valley Residency', 
    location: 'Patna',
    city: 'Patna',
    state: 'Bihar',
    type: 'Residential Complex',
    totalArea: 8,
    areaUnit: 'Acres',
    towers: 6,
    floors: 'G+7',
    totalUnits: 240,
    soldUnits: 180,
    availableUnits: 60,
    bhkTypes: '2BHK, 3BHK',
    reraNumber: 'BRERA-PAT-2020-456',
    status: 'Active',
    launchDate: '2020-01-10',
    possessionDate: '2023-12-31',
    priceRange: '₹30L - ₹55L',
    amenities: ['Parking', 'Children Play Area', 'Rainwater Harvesting', 'CCTV'],
    nearbyLandmarks: 'Near Bailey Road, 2km from Patna Junction',
    revenue: 324000000,
    completionPercent: 90
  },
  { 
    id: '4', 
    code: 'EECD-RH-004', 
    name: 'Royal Heights', 
    location: 'Ranchi',
    city: 'Ranchi',
    state: 'Jharkhand',
    type: 'Premium Apartments',
    totalArea: 5,
    areaUnit: 'Acres',
    towers: 4,
    floors: 'G+11',
    totalUnits: 160,
    soldUnits: 160,
    availableUnits: 0,
    bhkTypes: '3BHK, 4BHK Penthouses',
    reraNumber: 'JRERA-RAN-2017-123',
    status: 'Completed',
    launchDate: '2017-08-15',
    possessionDate: '2021-03-31',
    priceRange: '₹55L - ₹95L',
    amenities: ['Luxury Clubhouse', 'Infinity Pool', 'Spa', 'Concierge Service', 'Smart Homes'],
    nearbyLandmarks: 'Main Road, Near HEC Colony',
    revenue: 1120000000,
    completionPercent: 100
  },
  { 
    id: '5',
    code: 'EECD-LB-005',
    name: 'Lakeside Boulevard',
    location: 'Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    type: 'Waterfront Premium Residences',
    totalArea: 12,
    areaUnit: 'Acres',
    towers: 5,
    floors: 'G+15',
    totalUnits: 420,
    soldUnits: 210,
    availableUnits: 210,
    bhkTypes: '2BHK, 3BHK, Sky Villas',
    reraNumber: 'WBHIRA/P/KOL/2021/001045',
    status: 'Under Construction',
    launchDate: '2021-05-01',
    possessionDate: '2026-09-30',
    priceRange: '₹65L - ₹1.5Cr',
    amenities: ['Sky Lounge', 'Floating Deck', 'Clubhouse', 'EV Charging', 'Aqua Gym'],
    nearbyLandmarks: 'Adjacent to Eco Park, 15 mins from Airport',
    revenue: 756000000,
    completionPercent: 55
  },
];

function DataTable<T extends { id: string | number }>({
  data: initialData,
  columns: initialColumns,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  onBulkDelete,
  onExport,
  searchable = true,
  filterable = true,
  exportable = true,
  bulkActions = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  emptyMessage = 'No data available',
  mobileView = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    initialColumns.reduce((acc, col) => ({ ...acc, [col.key]: !col.hidden }), {})
  );
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const visibleColumns = initialColumns.filter(col => columnVisibility[col.key]);

  const filteredData = useMemo(() => {
    let result = [...initialData];

    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row =>
          String(row[key as keyof T]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    return result;
  }, [initialData, searchTerm, filterValues]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(row => row.id)));
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleExport = () => {
    const dataToExport = selectedRows.size > 0 
      ? sortedData.filter(row => selectedRows.has(row.id))
      : sortedData;
    
    if (onExport) {
      onExport(dataToExport);
    } else {
      const headers = visibleColumns.map(col => col.label).join(',');
      const rows = dataToExport.map(row =>
        visibleColumns.map(col => String(row[col.key as keyof T])).join(',')
      ).join('\n');
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eastern-estate-export-${Date.now()}.csv`;
      a.click();
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  // Mobile Card View
  if (isMobile && mobileView) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            {exportable && (
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
            {selectedRows.size > 0 && onBulkDelete && (
              <button
                onClick={() => {
                  const rowsToDelete = sortedData.filter(row => selectedRows.has(row.id));
                  onBulkDelete(rowsToDelete);
                  setSelectedRows(new Set());
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedRows.size})
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          paginatedData.map((row: any) => (
            <div key={row.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">{row.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{row.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {row.soldUnits}/{row.totalUnits} Units Sold
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Active' ? 'bg-green-100 text-green-800' :
                      row.status === 'Under Construction' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {row.status}
                    </span>
                    <span className="text-xs text-gray-500">{row.bhkTypes}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="w-full space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects by name, location, RERA number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex gap-2">
            {filterable && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                  showFilters ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'
                } hover:bg-gray-50`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            )}
            
            <button
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Columns
            </button>

            {exportable && (
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}

            {selectedRows.size > 0 && onBulkDelete && (
              <button
                onClick={() => {
                  const rowsToDelete = sortedData.filter(row => selectedRows.has(row.id));
                  onBulkDelete(rowsToDelete);
                  setSelectedRows(new Set());
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedRows.size})
              </button>
            )}
          </div>
        </div>

        {showColumnToggle && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Show/Hide Columns</h3>
              <button onClick={() => setShowColumnToggle(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {initialColumns.map(col => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={columnVisibility[col.key]}
                    onChange={(e) => setColumnVisibility({
                      ...columnVisibility,
                      [col.key]: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {visibleColumns.filter(col => col.filterable !== false).map(col => (
                <div key={col.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {col.label}
                  </label>
                  <input
                    type="text"
                    value={filterValues[col.key] || ''}
                    onChange={(e) => setFilterValues({
                      ...filterValues,
                      [col.key]: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Filter by ${col.label}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {bulkActions && (
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === paginatedData.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: col.width }}
                    >
                      {col.sortable !== false ? (
                        <button
                          onClick={() => handleSort(col.key)}
                          className="flex items-center gap-2 hover:text-gray-700"
                        >
                          {col.label}
                          <SortIcon columnKey={col.key} />
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                      selectedRows.has(row.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    {bulkActions && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                        {col.render 
                          ? col.render(row[col.key as keyof T], row)
                          : String(row[col.key as keyof T])
                        }
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <span className="text-sm text-gray-600">
                of {sortedData.length} projects
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

// Demo with Eastern Estate Projects
export function DataTableDemo() {
  const columns: Column<typeof easternEstateProjects[0]>[] = [
    { 
      key: 'code', 
      label: 'Project Code', 
      width: '140px',
      render: (value) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{value}</span>
    },
    { 
      key: 'name', 
      label: 'Project Name', 
      width: '200px',
      render: (value, row: any) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.type}</div>
        </div>
      )
    },
    { 
      key: 'location', 
      label: 'Location',
      width: '180px',
      render: (value, row: any) => (
        <div>
          <div className="text-sm">{value}</div>
          <div className="text-xs text-gray-500">{row.city}, {row.state}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      width: '150px',
      render: (value) => {
        const colors = {
          'Active': 'bg-green-100 text-green-800',
          'Under Construction': 'bg-yellow-100 text-yellow-800',
          'Completed': 'bg-blue-100 text-blue-800'
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {value}
          </span>
        );
      }
    },
    { 
      key: 'totalUnits', 
      label: 'Total Units',
      width: '120px',
      render: (value, row: any) => (
        <div>
          <div className="font-semibold">{value}</div>
          <div className="text-xs text-gray-500">{row.bhkTypes}</div>
        </div>
      )
    },
    { 
      key: 'soldUnits', 
      label: 'Sold / Available',
      width: '150px',
      render: (value, row: any) => {
        const totalUnits = row.totalUnits || 0;
        const percent = totalUnits > 0 ? Math.round((value / totalUnits) * 100) : 0;
        return (
          <div>
            <div className="text-sm font-medium">{value} / {row.availableUnits}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{percent}% sold</div>
          </div>
        );
      }
    },
    { 
      key: 'reraNumber', 
      label: 'RERA Number',
      width: '180px',
      render: (value) => <span className="text-xs font-mono">{value}</span>
    },
    { 
      key: 'revenue', 
      label: 'Revenue',
      width: '130px',
      render: (value) => (
        <div className="font-semibold text-green-700">
          ₹{(value / 10000000).toFixed(1)}Cr
        </div>
      )
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {(() => {
          const totalProjects = easternEstateProjects.length;
          const totalUnits = easternEstateProjects.reduce((sum, project) => sum + (project.totalUnits || 0), 0);
          const soldUnits = easternEstateProjects.reduce((sum, project) => sum + (project.soldUnits || 0), 0);
          const availableUnits = easternEstateProjects.reduce((sum, project) => sum + (project.availableUnits || 0), 0);
          const totalRevenue = easternEstateProjects.reduce((sum, project) => sum + (project.revenue || 0), 0);

          return (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <h1 className="text-3xl font-bold text-gray-900">Eastern Estate Projects</h1>
                </div>
                <p className="text-gray-600">
                  Complete overview of all EECD construction and real estate projects
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                    </div>
                    <Building2 className="w-10 h-10 text-blue-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Units</p>
                      <p className="text-2xl font-bold text-gray-900">{totalUnits.toLocaleString()}</p>
                    </div>
                    <Home className="w-10 h-10 text-green-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Units Sold</p>
                      <p className="text-2xl font-bold text-green-700">{soldUnits.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0}% sold
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-700">
                        ₹{(totalRevenue / 10000000).toFixed(1)}Cr
                      </p>
                    </div>
                    <Calendar className="w-10 h-10 text-blue-600 opacity-20" />
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        <DataTable
          data={easternEstateProjects}
          columns={columns}
          onRowClick={(row) => console.log('View project:', row)}
          onEdit={(row) => alert(`Edit: ${row.name}`)}
          onDelete={(row) => alert(`Delete: ${row.name}`)}
          onBulkDelete={(rows) => alert(`Bulk delete ${rows.length} projects`)}
          searchable
          filterable
          exportable
          bulkActions
          mobileView
        />
      </div>
    </div>
  );
}
