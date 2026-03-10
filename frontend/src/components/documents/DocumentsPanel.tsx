'use client';

/**
 * DocumentsPanel
 * ──────────────
 * Reusable panel for uploading, viewing and deleting documents
 * attached to any ERP entity (Booking, Customer, Payment, Employee).
 *
 * Usage:
 *   <DocumentsPanel
 *     entityType={DocumentEntityType.BOOKING}
 *     entityId={bookingId}
 *     customerId={booking.customerId}      // optional: cross-link
 *     bookingId={bookingId}                // optional: cross-link
 *   />
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload, Trash2, Download, FileText, Image, File, Loader2,
  Plus, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  documentsService,
  ErpDocument,
  DocumentCategory,
  DocumentEntityType,
  CATEGORY_LABELS,
  CATEGORY_GROUPS,
} from '@/services/documents.service';
import { toast } from 'sonner';

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fmtDate = (s: string) => {
  try { return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return s; }
};

const fileIcon = (mime: string | null) => {
  if (!mime) return <File className="h-5 w-5 text-gray-400" />;
  if (mime.startsWith('image/')) return <Image className="h-5 w-5 text-blue-400" />;
  if (mime === 'application/pdf') return <FileText className="h-5 w-5 text-red-400" />;
  return <File className="h-5 w-5 text-gray-400" />;
};

const categoryColor: Record<string, string> = {
  AGREEMENT: 'bg-purple-100 text-purple-700',
  KYC_AADHAR: 'bg-green-100 text-green-700',
  KYC_PAN: 'bg-green-100 text-green-700',
  KYC_PHOTO: 'bg-green-100 text-green-700',
  KYC_OTHER: 'bg-green-100 text-green-700',
  BANK_DOCUMENT: 'bg-blue-100 text-blue-700',
  LOAN_DOCUMENT: 'bg-blue-100 text-blue-700',
  PAYMENT_PROOF: 'bg-yellow-100 text-yellow-700',
  POSSESSION_LETTER: 'bg-purple-100 text-purple-700',
  NOC: 'bg-purple-100 text-purple-700',
  OTHER: 'bg-gray-100 text-gray-600',
};

// ── Props ─────────────────────────────────────────────────────────────────────
/**
 * fetchMode controls which API call is used to load the document list:
 *
 *  "entity"   (default) → GET /documents?entityType=…&entityId=…
 *             Only returns docs uploaded *to this exact entity*.
 *
 *  "booking"  → GET /documents/booking/:bookingId
 *             Returns ALL docs whose booking_id column matches,
 *             regardless of entityType (Booking docs + Customer docs
 *             that were cross-linked to this booking).
 *
 *  "customer" → GET /documents/customer/:customerId
 *             Returns ALL docs whose customer_id column matches,
 *             regardless of entityType — so Booking docs uploaded
 *             with a customerId show up here too.
 */
type FetchMode = 'entity' | 'booking' | 'customer';

interface DocumentsPanelProps {
  entityType: DocumentEntityType;
  entityId: string;
  /** Optional cross-linking shortcuts stored on each document row */
  customerId?: string;
  bookingId?: string;
  /**
   * Controls which API is used to LIST documents.
   * Defaults to "entity" (strict).
   * Use "booking" on Booking pages and "customer" on Customer pages
   * so cross-linked docs from any entity appear together.
   */
  fetchMode?: FetchMode;
  /** Read-only mode (no upload/delete) */
  readOnly?: boolean;
  /** Compact card title */
  title?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DocumentsPanel({
  entityType,
  entityId,
  customerId,
  bookingId,
  fetchMode = 'entity',
  readOnly = false,
  title = 'Documents',
}: DocumentsPanelProps) {
  const [docs, setDocs] = useState<ErpDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.OTHER);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data: ErpDocument[];
      if (fetchMode === 'booking' && bookingId) {
        data = await documentsService.getByBooking(bookingId);
      } else if (fetchMode === 'customer' && customerId) {
        data = await documentsService.getByCustomer(customerId);
      } else {
        data = await documentsService.getByEntity(entityType, entityId);
      }
      setDocs(data);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [fetchMode, bookingId, customerId, entityType, entityId]);

  useEffect(() => { load(); }, [load]);

  // ── upload ────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!docName) setDocName(f.name.replace(/\.[^.]+$/, '')); // strip extension
    }
  };

  const handleUpload = async () => {
    if (!file) { toast.error('Please select a file'); return; }
    if (!docName.trim()) { toast.error('Please enter a document name'); return; }

    setUploading(true);
    try {
      await documentsService.upload(file, {
        name: docName.trim(),
        category,
        entityType,
        entityId,
        customerId,
        bookingId,
        notes: notes.trim() || undefined,
      });
      toast.success('Document uploaded');
      setShowUpload(false);
      setFile(null); setDocName(''); setCategory(DocumentCategory.OTHER); setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      load();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await documentsService.remove(deleteId);
      toast.success('Document deleted');
      setDeleteId(null);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  // ── group docs by category group ──────────────────────────────────────────
  const grouped = CATEGORY_GROUPS.map(g => ({
    ...g,
    docs: docs.filter(d => g.categories.includes(d.category as DocumentCategory)),
  })).filter(g => g.docs.length > 0 || !readOnly);

  // KYC categories to track for badge
  const kycCategories = [
    DocumentCategory.KYC_AADHAR,
    DocumentCategory.KYC_PAN,
    DocumentCategory.KYC_PHOTO,
    DocumentCategory.KYC_OTHER,
  ];
  const kycCount = docs.filter(d => kycCategories.includes(d.category as DocumentCategory)).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {docs.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {docs.length}
            </span>
          )}
          {kycCount > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              KYC: {kycCount}/4
            </span>
          )}
        </div>
        {!readOnly && (
          <Button size="sm" variant="outline"
            className="border-[#A8211B] text-[#A8211B] hover:bg-red-50"
            onClick={() => setShowUpload(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Upload
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading documents…</span>
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-xl border-gray-200">
          <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No documents uploaded yet</p>
          {!readOnly && (
            <button onClick={() => setShowUpload(true)}
              className="mt-2 text-xs text-[#A8211B] hover:underline">
              Upload the first document →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* All docs in a flat list */}
          {docs.map(doc => (
            <div key={doc.id}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50/50 group">
              <div className="mt-0.5 flex-shrink-0">{fileIcon(doc.mimeType)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${categoryColor[doc.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {CATEGORY_LABELS[doc.category as DocumentCategory] ?? doc.category}
                  </span>
                  {doc.fileSize && (
                    <span className="text-xs text-gray-400">{fmtSize(doc.fileSize)}</span>
                  )}
                  <span className="text-xs text-gray-400">{fmtDate(doc.createdAt)}</span>
                </div>
                {doc.notes && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.notes}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                  title="View / Download"
                  className="p-1.5 rounded hover:bg-blue-50 text-blue-600">
                  <Eye className="h-3.5 w-3.5" />
                </a>
                <a href={doc.fileUrl} download={doc.fileName}
                  title="Download"
                  className="p-1.5 rounded hover:bg-green-50 text-green-600">
                  <Download className="h-3.5 w-3.5" />
                </a>
                {!readOnly && (
                  <button onClick={() => setDeleteId(doc.id)}
                    title="Delete"
                    className="p-1.5 rounded hover:bg-red-50 text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Attach a file to this record. Supported: PDF, images, Word, Excel (max 10 MB).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* File picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-[#A8211B] hover:bg-red-50/20'
              }`}>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.zip" />
              {file ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    {fileIcon(file.type)}
                    <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                  </div>
                  <p className="text-xs text-green-500 mt-1">{fmtSize(file.size)}</p>
                </>
              ) : (
                <>
                  <Upload className="h-7 w-7 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Click to choose a file</p>
                </>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="docName">Document Name *</Label>
              <Input id="docName" value={docName} onChange={e => setDocName(e.target.value)}
                placeholder="e.g. Aadhar Card — Front & Back" />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label htmlFor="category">Category *</Label>
              <select id="category" value={category}
                onChange={e => setCategory(e.target.value as DocumentCategory)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8211B]">
                {CATEGORY_GROUPS.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.categories.map(c => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Aadhar both sides, valid till 2030"
                rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !file}
              className="bg-[#A8211B] hover:bg-[#8b1a15] text-white">
              {uploading
                ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Uploading…</>
                : <><Upload className="h-4 w-4 mr-1.5" /> Upload</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Document?</DialogTitle>
            <DialogDescription>
              This will permanently remove the file. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
