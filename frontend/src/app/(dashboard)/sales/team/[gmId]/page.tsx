'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { leadsService } from '@/services/leads.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { propertiesService } from '@/services/properties.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function TeamDashboardPage() {
  const params = useParams();
  const gmId = params.gmId as string;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [towerId, setTowerId] = useState('');
  const [flatId, setFlatId] = useState('');

  useEffect(() => {
    loadDashboard();
    loadProperties();
  }, [gmId]);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, towerId, flatId]);

  const loadDashboard = async () => {
    try {
      const data = await leadsService.getTeamDashboardStats(gmId, {
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
    return <div className="p-6">Loading team dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Team Performance</h1>
        <div className="flex items-center gap-2 flex-wrap">
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
            placeholder="Tower ID"
            className="h-9 w-[160px]"
            value={towerId}
            onChange={(e) => setTowerId(e.target.value)}
          />
          <Input
            placeholder="Flat ID"
            className="h-9 w-[160px]"
            value={flatId}
            onChange={(e) => setFlatId(e.target.value)}
          />
          <Button variant="outline" size="sm" onClick={() => { setPropertyId(''); setTowerId(''); setFlatId(''); }}>
            Clear Filters
          </Button>
          <Button>Quick Assign</Button>
        </div>
      </div>

      {/* Team Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.teamSize || stats?.agentPerformance?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.teamLeads ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Team Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.teamConversions ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Target Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.teamConversionRate?.toFixed(1) ?? 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(stats?.agentPerformance || []).map((member: any) => (
              <div key={member.agentId} className="flex items-center justify-between p-4 border rounded hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                    {(member.agentName || member.agentId || 'U')[0]}
                  </div>
                  <div>
                    <p className="font-medium">{member.agentName || member.agentId}</p>
                    <p className="text-sm text-muted-foreground">Agent</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="font-bold">{member.totalLeads ?? member.leads ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Converted</p>
                    <p className="font-bold text-green-600">{member.conversions ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="font-bold">{member.conversionRate?.toFixed(1) ?? 0}%</p>
                  </div>
                  <div>
                    <Button size="sm" variant="outline">Assign</Button>
                  </div>
                </div>
              </div>
            ))}
            {(!stats?.agentPerformance || stats.agentPerformance.length === 0) && (
              <p className="text-muted-foreground">No team members found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Team Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.taskOverview ? (
              <div className="flex gap-4 text-sm">
                <span>Pending: {stats.taskOverview.pending}</span>
                <span>Completed: {stats.taskOverview.completed}</span>
                <span className="text-red-600">Overdue: {stats.taskOverview.overdue}</span>
              </div>
            ) : (
              <p className="text-muted-foreground">No tasks found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
