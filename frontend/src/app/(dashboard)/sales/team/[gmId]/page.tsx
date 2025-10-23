'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { leadsService } from '@/services/leads.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TeamDashboardPage() {
  const params = useParams();
  const gmId = params.gmId as string;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [gmId]);

  const loadDashboard = async () => {
    try {
      const data = await leadsService.getTeamDashboard(gmId);
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading team dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Performance</h1>
        <Button>Quick Assign</Button>
      </div>

      {/* Team Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.teamSize || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeLeads || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Team Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.conversions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Target Achievement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.targetAchievement || 0}%</div>
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
            {stats?.teamMembers?.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="font-bold">{member.leads}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Converted</p>
                    <p className="font-bold text-green-600">{member.converted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rate</p>
                    <p className="font-bold">{member.conversionRate}%</p>
                  </div>
                  <div>
                    <Button size="sm" variant="outline">Assign</Button>
                  </div>
                </div>
              </div>
            )) || <p className="text-muted-foreground">No team members found</p>}
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
            {stats?.teamTasks?.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{task.agentName}</p>
                  <p className="text-sm text-muted-foreground">{task.taskCount} pending tasks</p>
                </div>
                <span className="text-sm text-red-600">{task.overdue} overdue</span>
              </div>
            )) || <p className="text-muted-foreground">No tasks found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
