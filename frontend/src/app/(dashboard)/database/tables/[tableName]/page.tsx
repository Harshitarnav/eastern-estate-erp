'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { databaseService, TableInfo, TableColumn } from '@/services/database.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table as TableIcon, 
  ArrowLeft, 
  Key, 
  Link as LinkIcon,
  Database,
  Eye,
  Columns,
  Hash
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

export default function TableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tableName = params.tableName as string;
  
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tableName && tableName !== 'undefined' && typeof tableName === 'string') {
      fetchTableInfo();
    } else {
      setLoading(false);
    }
  }, [tableName]);

  const fetchTableInfo = async () => {
    if (!tableName || tableName === 'undefined' || typeof tableName !== 'string') {
      return;
    }
    
    try {
      setLoading(true);
      const info = await databaseService.getTableInfo(tableName);
      setTableInfo(info);
    } catch (error: any) {
      console.error('Failed to fetch table info:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnTypeColor = (type: string) => {
    if (type.includes('int') || type.includes('serial')) return 'bg-blue-100 text-blue-700';
    if (type.includes('varchar') || type.includes('text') || type.includes('character')) return 'bg-green-100 text-green-700';
    if (type.includes('bool')) return 'bg-purple-100 text-purple-700';
    if (type.includes('date') || type.includes('timestamp')) return 'bg-orange-100 text-orange-700';
    if (type.includes('decimal') || type.includes('numeric')) return 'bg-yellow-100 text-yellow-700';
    if (type.includes('json')) return 'bg-pink-100 text-pink-700';
    if (type.includes('uuid')) return 'bg-indigo-100 text-indigo-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Show error if no valid table name
  if (!tableName || tableName === 'undefined') {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Invalid Table</h3>
          <p className="text-gray-500">No table name provided</p>
          <Button className="mt-4" onClick={() => router.push('/database')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Database
          </Button>
        </Card>
      </div>
    );
  }

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
              <TableIcon className="w-8 h-8 text-blue-600" />
              {tableName}
            </h1>
            <p className="text-gray-600 mt-1">Database table structure and metadata</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/database/viewer?table=${tableName}`)}>
          <Eye className="w-4 h-4 mr-2" />
          View Data
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
      ) : tableInfo ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded">
                  <Hash className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {tableInfo.rowCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded">
                  <Columns className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Columns</p>
                  <p className="text-2xl font-bold text-green-600">
                    {tableInfo.columns.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Primary Keys</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {tableInfo.columns.filter(c => c.isPrimary).length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-orange-500">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded">
                  <LinkIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Foreign Keys</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {tableInfo.foreignKeys.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Columns Table */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Columns ({tableInfo.columns.length})
            </h2>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Constraints</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>References</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableInfo.columns.map((column: TableColumn) => (
                    <TableRow key={column.name}>
                      <TableCell className="font-medium">
                        {column.name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getColumnTypeColor(column.type)}>
                          {column.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {column.isPrimary && (
                            <Badge variant="destructive" className="text-xs">
                              <Key className="w-3 h-3 mr-1" />
                              PK
                            </Badge>
                          )}
                          {column.isForeignKey && (
                            <Badge variant="secondary" className="text-xs">
                              <LinkIcon className="w-3 h-3 mr-1" />
                              FK
                            </Badge>
                          )}
                          {column.isUnique && (
                            <Badge variant="outline" className="text-xs">
                              Unique
                            </Badge>
                          )}
                          {!column.nullable && (
                            <Badge variant="outline" className="text-xs">
                              NOT NULL
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {column.default ? (
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {column.default}
                          </code>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {column.references ? (
                          <Badge variant="outline" className="text-xs">
                            {column.references.table}.{column.references.column}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Foreign Keys */}
          {tableInfo.foreignKeys.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Foreign Key Relationships ({tableInfo.foreignKeys.length})
              </h2>
              <div className="space-y-3">
                {tableInfo.foreignKeys.map((fk, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <Badge variant="outline">{fk.column}</Badge>
                    <span className="text-gray-500">→</span>
                    <Badge 
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => router.push(`/database/tables/${fk.referencedTable}`)}
                    >
                      {fk.referencedTable}.{fk.referencedColumn}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Indexes */}
          {tableInfo.indexes.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Indexes ({tableInfo.indexes.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {tableInfo.indexes.map((index, i) => (
                  <Badge key={i} variant="outline">
                    {index}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Table not found</h3>
          <p className="text-gray-500">The table "{tableName}" does not exist or you don't have access to it.</p>
          <Button className="mt-4" onClick={() => router.push('/database')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Database
          </Button>
        </Card>
      )}
    </div>
  );
}
