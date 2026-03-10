import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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

/** Which ERP entity this document belongs to */
export enum DocumentEntityType {
  BOOKING = 'BOOKING',
  CUSTOMER = 'CUSTOMER',
  PAYMENT = 'PAYMENT',
  EMPLOYEE = 'EMPLOYEE',
  PROPERTY = 'PROPERTY',
  TOWER = 'TOWER',
  FLAT = 'FLAT',
}

@Entity('documents')
@Index(['entityType', 'entityId'])
@Index(['customerId'])
@Index(['bookingId'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'category', type: 'varchar', length: 50 })
  category: DocumentCategory;

  /** Which entity type this doc belongs to (BOOKING, CUSTOMER, …) */
  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: DocumentEntityType;

  /** UUID of the related entity */
  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  // Denormalised shortcuts for quick filtering
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  // File info
  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string | null;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
