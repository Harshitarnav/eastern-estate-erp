import { apiService } from './api';

export enum DocumentCategory {
  AGREEMENT = 'AGREEMENT',
  KYC_AADHAR = 'KYC_AADHAR',
  KYC_PAN = 'KYC_PAN',
  KYC_PHOTO = 'KYC_PHOTO',
  KYC_OTHER = 'KYC_OTHER',
  BANK_DOCUMENT = 'BANK_DOCUMENT',
  LOAN_DOCUMENT = 'LOAN_DOCUMENT',
  PAYMENT_PROOF = 'PAYMENT_PROOF',
  POSSESSION_LETTER = 'POSSESSION_LETTER',
  NOC = 'NOC',
  OTHER = 'OTHER',
}

export enum DocumentEntityType {
  BOOKING = 'BOOKING',
  CUSTOMER = 'CUSTOMER',
  PAYMENT = 'PAYMENT',
  EMPLOYEE = 'EMPLOYEE',
  PROPERTY = 'PROPERTY',
  TOWER = 'TOWER',
  FLAT = 'FLAT',
}

export interface ErpDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  entityType: DocumentEntityType;
  entityId: string;
  customerId: string | null;
  bookingId: string | null;
  fileUrl: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  notes: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.AGREEMENT]: 'Agreement Copy',
  [DocumentCategory.KYC_AADHAR]: 'Aadhar Card',
  [DocumentCategory.KYC_PAN]: 'PAN Card',
  [DocumentCategory.KYC_PHOTO]: 'Photograph',
  [DocumentCategory.KYC_OTHER]: 'KYC - Other',
  [DocumentCategory.BANK_DOCUMENT]: 'Bank Document',
  [DocumentCategory.LOAN_DOCUMENT]: 'Loan Document',
  [DocumentCategory.PAYMENT_PROOF]: 'Payment Proof',
  [DocumentCategory.POSSESSION_LETTER]: 'Possession Letter',
  [DocumentCategory.NOC]: 'NOC',
  [DocumentCategory.OTHER]: 'Other',
};

export const CATEGORY_GROUPS: { label: string; categories: DocumentCategory[] }[] = [
  {
    label: 'Agreement',
    categories: [DocumentCategory.AGREEMENT, DocumentCategory.POSSESSION_LETTER, DocumentCategory.NOC],
  },
  {
    label: 'KYC Documents',
    categories: [
      DocumentCategory.KYC_AADHAR,
      DocumentCategory.KYC_PAN,
      DocumentCategory.KYC_PHOTO,
      DocumentCategory.KYC_OTHER,
    ],
  },
  {
    label: 'Financial',
    categories: [
      DocumentCategory.BANK_DOCUMENT,
      DocumentCategory.LOAN_DOCUMENT,
      DocumentCategory.PAYMENT_PROOF,
    ],
  },
  { label: 'Other', categories: [DocumentCategory.OTHER] },
];

class DocumentsService {
  /** Upload a new document (multipart form) */
  async upload(
    file: File,
    meta: {
      name: string;
      category: DocumentCategory;
      entityType: DocumentEntityType;
      entityId: string;
      customerId?: string;
      bookingId?: string;
      notes?: string;
    },
  ): Promise<ErpDocument> {
    const form = new FormData();
    form.append('file', file);
    form.append('name', meta.name);
    form.append('category', meta.category);
    form.append('entityType', meta.entityType);
    form.append('entityId', meta.entityId);
    if (meta.customerId) form.append('customerId', meta.customerId);
    if (meta.bookingId) form.append('bookingId', meta.bookingId);
    if (meta.notes) form.append('notes', meta.notes);

    return apiService.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getByBooking(bookingId: string): Promise<ErpDocument[]> {
    return apiService.get(`/documents/booking/${bookingId}`);
  }

  async getByCustomer(customerId: string): Promise<ErpDocument[]> {
    return apiService.get(`/documents/customer/${customerId}`);
  }

  async getByEntity(
    entityType: DocumentEntityType,
    entityId: string,
  ): Promise<ErpDocument[]> {
    return apiService.get('/documents', {
      params: { entityType, entityId },
    });
  }

  async update(id: string, updates: { name?: string; notes?: string }): Promise<ErpDocument> {
    return apiService.patch(`/documents/${id}`, updates);
  }

  async remove(id: string): Promise<void> {
    return apiService.delete(`/documents/${id}`);
  }
}

export const documentsService = new DocumentsService();
