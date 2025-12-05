'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { leadsService } from '@/services/leads.service';
import { propertiesService } from '@/services/properties.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Clock, Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AgentDashboardPage() {
  const params = useParams();
  const agentId = params.id as string;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState('');
  const [towerId, setTowerId] = useState('');
  const [flatId, setFlatId] = useState('');

  useEffect(() => {
    loadDashboard();
    loadProperties();
  }, [agentId]);

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, towerId, flatId]);

  const loadDashboard = async () => {
    try {
      const data = await leadsService.getAgentDashboardStats(agentId, {
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
        <h1 className="text-3xl font-bold">My Dashboard</h1>
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leads Assigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.newThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.converted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.conversionRate || 0}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.inProgress || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active follow-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Target</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.targetProgress || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly target progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.tasks?.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">{task.leadName}</p>
                </div>
                <span className="text-sm text-muted-foreground">{task.time}</span>
              </div>
            )) || <p className="text-muted-foreground">No tasks for today</p>}
          </div>
        </CardContent>
      </Card>

      {/* Personal Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-32 p-3 border rounded"
            placeholder="Add your notes here..."
            defaultValue={stats?.notes || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
