'use client';

import { useState, useEffect } from 'react';
import { leadsService } from '@/services/leads.service';
import { propertiesService } from '@/services/properties.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [towerId, setTowerId] = useState('');
  const [flatId, setFlatId] = useState('');

  useEffect(() => {
    loadDashboard();
    loadProperties();
  }, []);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, towerId, flatId]);

  const loadDashboard = async () => {
    try {
      const data = await leadsService.getAdminDashboardStats({
        propertyId: propertyId || undefined,
        towerId: towerId || undefined,
        flatId: flatId || undefined,
      });
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const data = await propertiesService.getProperties();
      setProperties(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">Sales Overview</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={propertyId || 'all'}
            onValueChange={(v) => setPropertyId(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue placeholder="Property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>🏢 {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Tower ID (optional)"
            className="h-9 w-[180px]"
            value={towerId}
            onChange={(e) => setTowerId(e.target.value)}
          />
          <Input
            placeholder="Flat ID (optional)"
            className="h-9 w-[180px]"
            value={flatId}
            onChange={(e) => setFlatId(e.target.value)}
          />
          <Button variant="outline" size="sm" onClick={() => {
            setPropertyId(''); setTowerId(''); setFlatId('');
          }}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.converted ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageConversionRate ?? 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalRevenue || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.topPerformers || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agentName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalLeads" fill="#8884d8" name="Total Leads" />
              <Bar dataKey="conversions" fill="#82ca9d" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(stats?.topPerformers || []).map((agent: any, index: number) => (
              <div key={agent.agentId} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                  <div>
                    <p className="font-medium">{agent.agentName || agent.agentId}</p>
                    <p className="text-sm text-muted-foreground">{agent.conversions} conversions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{agent.conversionRate?.toFixed(1) ?? 0}%</p>
                  <p className="text-sm text-muted-foreground">conversion rate</p>
                </div>
              </div>
            ))}
            {(!stats?.topPerformers || stats.topPerformers.length === 0) && (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Property-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Property-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(stats?.propertyWiseBreakdown || []).map((property: any) => (
              <div key={property.propertyId} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{property.propertyName || property.propertyId}</span>
                <div className="flex gap-4 text-sm">
                  <span>{property.leads} leads</span>
                  <span className="text-green-600">{property.conversions} converted</span>
                  <span className="font-bold">{property.conversionRate?.toFixed(1) ?? 0}%</span>
                </div>
              </div>
            ))}
            {(!stats?.propertyWiseBreakdown || stats.propertyWiseBreakdown.length === 0) && (
              <p className="text-muted-foreground">No data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
