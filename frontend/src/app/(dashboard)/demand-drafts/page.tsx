'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Loader2, Eye, Search, RefreshCw, Trash2 } from 'lucide-react';
import { demandDraftsService, DemandDraft, DemandDraftStatus } from '@/services/demand-drafts.service';
import { toast } from 'sonner';
import { TableRowsSkeleton } from '@/components/Skeletons';

const STATUS_COLORS: Record<DemandDraftStatus, string> = {
  DRAFT: 'bg-gray-400',
  READY: 'bg-blue-500',
  SENT: 'bg-purple-500',
  PAID: 'bg-green-600',
  CANCELLED: 'bg-red-500',
  FAILED: 'bg-red-700',
};

export default function DemandDraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DemandDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const data = await demandDraftsService.getDemandDrafts();
      setDrafts(data);
    } catch (err: any) {
      toast.error('Failed to load demand drafts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await demandDraftsService.delete(id);
      toast.success('Draft deleted');
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete draft');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const getDraftLabel = (d: DemandDraft) => {
    if (d.title) return d.title;
    const m = d.metadata;
    if (!m) return '';
    const unit = [m.flatNumber, m.towerName].filter(Boolean).join(' / ');
    const stage = m.milestoneName || '';
    return unit ? `${unit} – ${stage}` : stage;
  };

  const filtered = drafts.filter(d => {
    const q = search.toLowerCase();
    return (
      !q ||
      getDraftLabel(d).toLowerCase().includes(q) ||
      d.metadata?.customerName?.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.status.toLowerCase().includes(q)
    );
  });

  const totalByStatus = (status: DemandDraftStatus) =>
    drafts.filter(d => d.status === status).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demand Drafts</h1>
          <p className="text-muted-foreground">All demand invoices across all bookings</p>
        </div>
        <Button variant="outline" onClick={loadDrafts} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {(Object.keys(STATUS_COLORS) as DemandDraftStatus[]).map(status => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{status}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalByStatus(status)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Demand Drafts</CardTitle>
            <CardDescription>Click a row to open and manage a draft</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or status…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableRowsSkeleton rows={6} cols={5} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title / Description</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(draft => (
                  <TableRow
                    key={draft.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/demand-drafts/${draft.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <div className="font-medium">
                            {getDraftLabel(draft) || 'Untitled Draft'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {draft.metadata?.customerName
                              ? draft.metadata.customerName
                              : draft.id.slice(0, 8) + '…'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{Number(draft.amount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      {draft.dueDate
                        ? new Date(draft.dueDate).toLocaleDateString('en-IN')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[draft.status]}>
                        {draft.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(draft.createdAt).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View"
                          onClick={() => router.push(`/demand-drafts/${draft.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(draft.status === 'DRAFT' || draft.status === 'FAILED') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={deletingId === draft.id}
                            onClick={() => setConfirmDeleteId(draft.id)}
                          >
                            {deletingId === draft.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      {search
                        ? 'No demand drafts match your search.'
                        : 'No demand drafts yet. Generate one from a Payment Plan milestone.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={open => { if (!open) setConfirmDeleteId(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this demand draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The draft will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
