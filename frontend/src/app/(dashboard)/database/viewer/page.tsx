'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { databaseService } from '@/services/database.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, 
  Search, 
  RefreshCw, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Database,
  ArrowLeft,
  Edit,
  Save,
  X,
  Trash2,
  Plus,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

export default function DatabaseViewerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const initialTable = searchParams.get('table') || '';
  
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [tableData, setTableData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [primaryKeys, setPrimaryKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable, page, limit, searchTerm, sortBy, sortOrder]);

  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      console.log('Fetching tables for viewer...');
      const data = await databaseService.getTables();
      console.log('Tables fetched:', data);
      console.log('Tables array:', Array.isArray(data), 'Length:', data?.length);
      setTables(data || []);
    } catch (error: any) {
      console.error('Failed to fetch tables:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tables',
        type: 'error',
      });
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchTableData = async () => {
    if (!selectedTable) return;
    
    try {
      setLoading(true);
      const [dataResponse, pkResponse] = await Promise.all([
        databaseService.getTableData(selectedTable, {
          page,
          limit,
          search: searchTerm || undefined,
          sortBy: sortBy || undefined,
          sortOrder,
        }),
        databaseService.getPrimaryKeys(selectedTable),
      ]);
      
      setTableData(dataResponse.data);
      setTotal(dataResponse.meta.total);
      setTotalPages(dataResponse.meta.totalPages);
      setPrimaryKeys(pkResponse);
      
      // Extract columns from first row
      if (dataResponse.data.length > 0) {
        setColumns(Object.keys(dataResponse.data[0]));
      } else {
        setColumns([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch table data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch table data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (table: string) => {
    setSelectedTable(table);
    setPage(1);
    setSearchTerm('');
    setSortBy('');
    setEditMode(false);
    setEditingRow(null);
    router.push(`/database/viewer?table=${table}`);
  };

  const startEdit = (rowIndex: number, row: any) => {
    setEditingRow(rowIndex);
    setEditedData({ ...row });
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const saveEdit = async (rowIndex: number, originalRow: any) => {
    try {
      setActionLoading(true);
      
      // Extract primary key values
      const primaryKey: Record<string, any> = {};
      primaryKeys.forEach(pk => {
        primaryKey[pk] = originalRow[pk];
      });

      await databaseService.updateRecord(selectedTable, primaryKey, editedData);
      
      toast({
        title: 'Success',
        description: 'Record updated successfully',
        type: 'success',
      });
      
      // Refresh data
      await fetchTableData();
      setEditingRow(null);
      setEditedData({});
    } catch (error: any) {
      console.error('Failed to update record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update record',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (row: any) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;

    try {
      setActionLoading(true);
      
      // Extract primary key values
      const primaryKey: Record<string, any> = {};
      primaryKeys.forEach(pk => {
        primaryKey[pk] = rowToDelete[pk];
      });

      await databaseService.deleteRecord(selectedTable, primaryKey);
      
      toast({
        title: 'Success',
        description: 'Record deleted successfully',
        type: 'success',
      });
      
      // Refresh data
      await fetchTableData();
      setDeleteDialogOpen(false);
      setRowToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete record',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateDialog = () => {
    // Initialize with empty values or defaults
    const initialData: Record<string, any> = {};
    columns.forEach(col => {
      if (!primaryKeys.includes(col)) {
        initialData[col] = '';
      }
    });
    setNewRecordData(initialData);
    setCreateDialogOpen(true);
  };

  const createRecord = async () => {
    try {
      setActionLoading(true);
      
      // Filter out empty values and prepare data
      const dataToCreate: Record<string, any> = {};
      Object.keys(newRecordData).forEach(key => {
        const value = newRecordData[key];
        if (value !== '' && value !== null && value !== undefined) {
          dataToCreate[key] = value;
        }
      });

      await databaseService.createRecord(selectedTable, dataToCreate);
      
      toast({
        title: 'Success',
        description: 'Record created successfully',
        type: 'success',
      });
      
      // Refresh data
      await fetchTableData();
      setCreateDialogOpen(false);
      setNewRecordData({});
    } catch (error: any) {
      console.error('Failed to create record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create record',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    if (!tableData || tableData.length === 0 || !columns || columns.length === 0) return;

    // Convert to CSV
    const headers = columns.join(',');
    const rows = tableData.map(row => 
      columns.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-600' : 'text-red-600'}>{String(value)}</span>;
    }
    if (typeof value === 'object') {
      return <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{JSON.stringify(value)}</code>;
    }
    if (String(value).length > 50) {
      return <span className="text-sm" title={String(value)}>{String(value).substring(0, 50)}...</span>;
    }
    return <span className="text-sm">{String(value)}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/database')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-600" />
              Database Viewer & Editor
            </h1>
            <p className="text-gray-600 mt-1">View, edit, and manage live database data</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setEditMode(!editMode)}
            disabled={!selectedTable || loading}
            variant={editMode ? 'default' : 'outline'}
          >
            <Edit className="w-4 h-4 mr-2" />
            {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
          </Button>
          <Button
            onClick={fetchTableData}
            disabled={!selectedTable || loading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Edit Mode Alert */}
      {editMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Edit Mode Active</AlertTitle>
          <AlertDescription>
            You can now edit, delete, or create records. Click on the edit icon next to any row to start editing.
            Primary keys cannot be modified.
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Table Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Table</label>
            {loadingTables ? (
              <Skeleton className="h-10" />
            ) : (
              <Select value={selectedTable} onValueChange={handleTableChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a table..." />
                </SelectTrigger>
                <SelectContent>
                  {tables && tables.length > 0 ? tables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  )) : (
                    <SelectItem value="__empty__" disabled>No tables available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
                disabled={!selectedTable}
              />
            </div>
          </div>

          {/* Page Size */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rows per page</label>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(parseInt(value));
                setPage(1);
              }}
              disabled={!selectedTable}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export */}
          <div className="flex items-end">
            <Button
              onClick={handleExport}
              disabled={!selectedTable || tableData.length === 0}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Add New Record Button */}
        {editMode && selectedTable && (
          <div className="mt-4">
            <Button
              onClick={openCreateDialog}
              disabled={loading || actionLoading}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Record
            </Button>
          </div>
        )}
      </Card>

      {/* Data Table */}
      {!selectedTable ? (
        <Card className="p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a table</h3>
          <p className="text-gray-500">Choose a table from the dropdown above to view its data</p>
        </Card>
      ) : loading ? (
        <Card className="p-6">
          <Skeleton className="h-96" />
        </Card>
      ) : tableData.length === 0 ? (
        <Card className="p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No data found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No records match your search' : 'This table is empty'}
          </p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total.toLocaleString()} records
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2 text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {editMode && <TableHead className="w-[120px]">Actions</TableHead>}
                  {columns && columns.length > 0 ? columns.map((column) => (
                    <TableHead 
                      key={column}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        if (sortBy === column) {
                          setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                        } else {
                          setSortBy(column);
                          setSortOrder('ASC');
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {column}
                        {primaryKeys.includes(column) && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">PK</span>
                        )}
                        {sortBy === column && (
                          <span className="text-xs">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                  )) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData && tableData.length > 0 ? tableData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {editMode && (
                      <TableCell>
                        {editingRow === rowIndex ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => saveEdit(rowIndex, row)}
                              disabled={actionLoading}
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              disabled={actionLoading}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(rowIndex, row)}
                              disabled={editingRow !== null || actionLoading}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteDialog(row)}
                              disabled={editingRow !== null || actionLoading}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column}>
                        {editingRow === rowIndex && !primaryKeys.includes(column) ? (
                          <Input
                            value={editedData[column] ?? ''}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              [column]: e.target.value,
                            })}
                            className="min-w-[150px]"
                          />
                        ) : (
                          formatValue(row[column])
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )) : null}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total: {total.toLocaleString()} records
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {rowToDelete && (
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-2">Record details:</p>
              <div className="bg-gray-50 p-3 rounded text-xs max-h-48 overflow-auto">
                {columns.map(col => (
                  <div key={col} className="flex gap-2 mb-1">
                    <span className="font-semibold">{col}:</span>
                    <span>{String(rowToDelete[col])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Record Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Record</DialogTitle>
            <DialogDescription>
              Fill in the details for the new record. Primary key fields will be auto-generated if applicable.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {columns.filter(col => !primaryKeys.includes(col)).map(column => (
              <div key={column} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {column}
                  <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <Input
                  value={newRecordData[column] ?? ''}
                  onChange={(e) => setNewRecordData({
                    ...newRecordData,
                    [column]: e.target.value,
                  })}
                  placeholder={`Enter ${column}...`}
                />
              </div>
            ))}
            {columns.length === primaryKeys.length && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This table only has primary key columns. New records will be created with auto-generated values if supported.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={createRecord}
              disabled={actionLoading}
            >
              {actionLoading ? 'Creating...' : 'Create Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
