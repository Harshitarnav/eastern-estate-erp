'use client';

import { useState, useEffect } from 'react';
import { leadsService } from '@/services/leads.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // TODO: Implement getAdminDashboard method in backend
      // const data = await leadsService.getAdminDashboard();
      // setStats(data);
      
      // Placeholder data for now
      setStats({
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        conversionRate: 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sales Overview</h1>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.converted || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.revenue || 0}L</div>
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
            <BarChart data={stats?.agentPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#8884d8" name="Total Leads" />
              <Bar dataKey="converted" fill="#82ca9d" name="Converted" />
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
            {stats?.topPerformers?.map((agent: any, index: number) => (
              <div key={agent.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.conversions} conversions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{agent.conversionRate}%</p>
                  <p className="text-sm text-muted-foreground">conversion rate</p>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No data available</p>}
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
            {stats?.propertyWise?.map((property: any) => (
              <div key={property.id} className="flex items-center justify-between p-3 border rounded">
                <span className="font-medium">{property.name}</span>
                <div className="flex gap-4 text-sm">
                  <span>{property.leads} leads</span>
                  <span className="text-green-600">{property.converted} converted</span>
                  <span className="font-bold">{property.rate}%</span>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No data available</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
