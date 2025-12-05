'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsService, Lead } from '@/services/leads.service';
import { propertiesService } from '@/services/properties.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, Mail, User } from 'lucide-react';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [lead, setLead] = useState<Lead | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const [l, props] = await Promise.all([
        leadsService.getLead(id),
        propertiesService.getProperties().catch(() => []),
      ]);
      setLead(l);
      setProperties(Array.isArray(props) ? props : props.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const propertyName = lead?.propertyId
    ? properties.find((p: any) => p.id === lead.propertyId)?.name || lead.propertyId
    : null;

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading lead...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">{error}</div>
    );
  }

  if (!lead) {
    return (
      <div className="p-6">Lead not found.</div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lead.firstName} {lead.lastName}</h1>
          <p className="text-sm text-gray-600">Lead Code: {lead.leadCode}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
          <Button asChild>
            <Link href={`/leads/${lead.id}/edit`}>Edit Lead</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{lead.phone}</span>
          </div>
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{lead.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span>Status: {lead.status}</span>
            <Badge variant="secondary">{lead.priority}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scope</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap text-sm">
          {propertyName ? <Badge>Property: {propertyName}</Badge> : <Badge variant="outline">No property</Badge>}
          {lead.towerId && <Badge variant="outline">Tower: {lead.towerId}</Badge>}
          {lead.flatId && <Badge variant="outline">Flat: {lead.flatId}</Badge>}
          <Badge variant="secondary">Source: {lead.source.replace(/_/g, ' ')}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          {Array.isArray(lead.assignmentHistory) && lead.assignmentHistory.length > 0 ? (
            lead.assignmentHistory.slice().reverse().map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <span>
                  {(entry.assignedBy || 'Someone')} → {(entry.assignedTo || 'Unassigned')}
                </span>
                {entry.at && (
                  <span className="text-xs text-gray-500">{new Date(entry.at as any).toLocaleString()}</span>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No assignment history yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 whitespace-pre-wrap">
          {lead.followUpNotes || 'No notes yet.'}
        </CardContent>
      </Card>
    </div>
  );
}
