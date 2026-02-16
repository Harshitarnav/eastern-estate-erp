'use client';

import { useState, useEffect } from 'react';
import { databaseService, TableOverview, DatabaseStats } from '@/services/database.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Table, 
  Search, 
  BarChart3, 
  Eye,
  RefreshCw,
  HardDrive,
  Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function DatabasePage() {
  const router = useRouter();
  const [tables, setTables] = useState<TableOverview[]>([]);
  const [filteredTables, setFilteredTables] = useState<TableOverview[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTables(
        tables.filter(table => 
          table.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTables(tables);
    }
  }, [searchTerm, tables]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching database info...');
      
      const tablesResponse = await databaseService.getTablesOverview();
      console.log('Tables response:', tablesResponse);
      
      const statsResponse = await databaseService.getDatabaseStats();
      console.log('Stats response:', statsResponse);
      
      setTables(tablesResponse);
      setFilteredTables(tablesResponse);
      setStats(statsResponse);
    } catch (error: any) {
      console.error('Failed to fetch database info:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Error loading database: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Database Explorer
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize and explore your database schema and data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/database/viewer')}>
            <Eye className="w-4 h-4 mr-2" />
            Data Viewer
          </Button>
          <Button onClick={() => router.push('/database/relationships')} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relationships
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tables</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalTables}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Table className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Records</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.totalRows.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Layers className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Database Size</p>
                <p className="text-3xl font-bold text-purple-600">{stats.databaseSize}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <HardDrive className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Tables Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables && filteredTables.length > 0 ? filteredTables.map((table) => (
            <Card
              key={table.name}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-300"
              onClick={() => router.push(`/database/tables/${table.name}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded">
                    <Table className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{table.name}</h3>
                    <p className="text-xs text-gray-500">Database Table</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Records:</span>
                  <Badge variant="secondary">
                    {table.rowCount.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Columns:</span>
                  <Badge variant="outline">
                    {table.columnCount}
                  </Badge>
                </div>
              </div>

              <Button
                className="w-full mt-4"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/database/tables/${table.name}`);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Card>
          )) : null}
        </div>
      )}

      {!loading && (!filteredTables || filteredTables.length === 0) && (
        <Card className="p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tables found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try a different search term' : 'No tables available in the database'}
          </p>
        </Card>
      )}
    </div>
  );
}
