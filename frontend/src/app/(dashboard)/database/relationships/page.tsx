'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { databaseService, TableRelationship } from '@/services/database.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Search, 
  RefreshCw, 
  ArrowRight,
  Table as TableIcon,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DatabaseRelationshipsPage() {
  const router = useRouter();
  const [relationships, setRelationships] = useState<TableRelationship[]>([]);
  const [filteredRelationships, setFilteredRelationships] = useState<TableRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uniqueTables, setUniqueTables] = useState<string[]>([]);

  useEffect(() => {
    fetchRelationships();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredRelationships(
        relationships.filter(rel => 
          rel.fromTable.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rel.toTable.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rel.fromColumn.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rel.toColumn.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredRelationships(relationships);
    }
  }, [searchTerm, relationships]);

  const fetchRelationships = async () => {
    try {
      setLoading(true);
      console.log('Fetching relationships...');
      const data = await databaseService.getTableRelationships();
      console.log('Raw relationships data:', data);
      console.log('Number of relationships:', data?.length || 0);
      console.log('Sample relationship:', data?.[0]);
      
      setRelationships(data || []);
      setFilteredRelationships(data || []);
      
      // Get unique tables
      const tables = new Set<string>();
      if (data && Array.isArray(data)) {
        data.forEach(rel => {
          if (rel.fromTable) tables.add(rel.fromTable);
          if (rel.toTable) tables.add(rel.toTable);
        });
      }
      const uniqueTablesArray = Array.from(tables).sort();
      console.log('Unique tables:', uniqueTablesArray);
      setUniqueTables(uniqueTablesArray);
    } catch (error: any) {
      console.error('Failed to fetch relationships:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getRelationshipsByTable = (tableName: string) => {
    return {
      outgoing: relationships.filter(rel => rel.fromTable === tableName),
      incoming: relationships.filter(rel => rel.toTable === tableName),
    };
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
              <Network className="w-8 h-8 text-blue-600" />
              Database Relationships
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize foreign key relationships between tables
            </p>
          </div>
        </div>
        <Button
          onClick={fetchRelationships}
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TableIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tables with Relationships</p>
                <p className="text-3xl font-bold text-blue-600">{uniqueTables.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Network className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Foreign Keys</p>
                <p className="text-3xl font-bold text-green-600">{relationships.length}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search tables or columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredRelationships.length === 0 ? (
        <Card className="p-12 text-center">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No matching relationships' : 'No Foreign Key Relationships Found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Try a different search term' 
              : 'No foreign key constraints are defined in your database yet'}
          </p>
          {!searchTerm && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-2xl mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                How to Enable Relationships
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Your database needs foreign key constraints to visualize relationships. Follow these steps:
              </p>
              <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                <li>Navigate to: <code className="bg-blue-100 px-2 py-1 rounded">backend/src/database/migrations/</code></li>
                <li>Read the <code className="bg-blue-100 px-2 py-1 rounded">README.md</code> file for instructions</li>
                <li>Run the <code className="bg-blue-100 px-2 py-1 rounded">add-foreign-keys.sql</code> migration</li>
                <li>Refresh this page to see relationships</li>
              </ol>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This is a one-time setup. The migration is safe and won't lose any data.
                </p>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* Relationships by Table */}
          <div className="space-y-6">
            {uniqueTables && uniqueTables.length > 0 ? (
              uniqueTables
                .filter(tableName => {
                  // If no search term, show all
                  if (!searchTerm) return true;
                  
                  // Check if table name matches search
                  if (tableName.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return true;
                  }
                  
                  // Check if any relationships match search
                  const { outgoing, incoming } = getRelationshipsByTable(tableName);
                  return outgoing.length > 0 || incoming.length > 0;
                })
                .map((tableName, idx) => {
                  const { outgoing, incoming } = getRelationshipsByTable(tableName);

                  return (
                    <Card key={`table-${tableName}-${idx}`} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <TableIcon className="w-5 h-5 text-blue-600" />
                          {tableName}
                        </h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            {outgoing.length} outgoing
                          </Badge>
                          <Badge variant="outline">
                            {incoming.length} incoming
                          </Badge>
                        </div>
                      </div>

                      {/* Outgoing Relationships */}
                      {outgoing.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            References to other tables:
                          </p>
                          <div className="space-y-2">
                            {outgoing.map((rel, index) => (
                            <div
                                key={`${tableName}-out-${rel.constraintName}-${index}`}
                                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                            >
                                <Badge variant="outline" className="bg-white">
                                {rel.fromColumn}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                <Badge 
                                className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                                onClick={() => router.push(`/database/tables/${rel.toTable}`)}
                                >
                                {rel.toTable}.{rel.toColumn}
                                </Badge>
                                <span className="text-xs text-gray-500 ml-auto">
                                {rel.constraintName}
                                </span>
                            </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Incoming Relationships */}
                      {incoming.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Referenced by other tables:
                          </p>
                          <div className="space-y-2">
                            {incoming.map((rel, index) => (
                            <div
                                key={`${tableName}-in-${rel.constraintName}-${index}`}
                                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                            >
                                <Badge 
                                className="bg-green-600 text-white cursor-pointer hover:bg-green-700"
                                onClick={() => router.push(`/database/tables/${rel.fromTable}`)}
                                >
                                {rel.fromTable}.{rel.fromColumn}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-green-600" />
                                <Badge variant="outline" className="bg-white">
                                {rel.toColumn}
                                </Badge>
                                <span className="text-xs text-gray-500 ml-auto">
                                {rel.constraintName}
                                </span>
                            </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })
            ) : null}
          </div>

          {/* All Relationships List */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">
              All Relationships ({filteredRelationships ? filteredRelationships.length : 0})
            </h3>
            <div className="space-y-2">
              {filteredRelationships && filteredRelationships.length > 0 ? filteredRelationships.map((rel, index) => (
                <div
                  key={`${rel.constraintName}-${rel.fromTable}-${rel.toTable}-${index}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => router.push(`/database/tables/${rel.fromTable}`)}
                  >
                    {rel.fromTable}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {rel.fromColumn}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => router.push(`/database/tables/${rel.toTable}`)}
                  >
                    {rel.toTable}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {rel.toColumn}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto font-mono">
                    {rel.constraintName}
                  </span>
                </div>
              )) : null}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
