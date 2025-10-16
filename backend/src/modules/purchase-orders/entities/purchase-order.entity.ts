import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum PaymentTerms {
  IMMEDIATE = 'IMMEDIATE',
  NET_7 = 'NET_7',
  NET_15 = 'NET_15',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  ADVANCE_50 = 'ADVANCE_50',
  ADVANCE_100 = 'ADVANCE_100',
}

/**
 * PurchaseOrder Entity
 * 
 * Tracks inventory purchases from suppliers with approval workflow.
 */
@Entity('purchase_orders')
@Index(['supplierId']) // Keep this one - it's not duplicated
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Order Information
  @Column({ length: 100, unique: true })
  @Index()
  orderNumber: string;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  @Index() // Kept column-level index
  orderStatus: OrderStatus;

  // Supplier Information
  @Column({ type: 'uuid' })
  supplierId: string;

  @Column({ length: 200 })
  supplierName: string;

  @Column({ length: 200, nullable: true })
  supplierEmail: string;

  @Column({ length: 50, nullable: true })
  supplierPhone: string;

  @Column({ type: 'text', nullable: true })
  supplierAddress: string;

  @Column({ length: 50, nullable: true })
  supplierGSTIN: string;

  // Order Items
  @Column({ type: 'simple-json' })
  items: {
    itemId: string;
    itemCode: string;
    itemName: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    taxPercent: number;
    taxAmount: number;
    totalAmount: number;
  }[];

  // Pricing
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  shippingCost: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  otherCharges: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  // Payment Information
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  @Index() // Kept column-level index
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentTerms,
    default: PaymentTerms.NET_30,
  })
  paymentTerms: PaymentTerms;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({ type: 'date', nullable: true })
  paymentDueDate: Date;

  // Delivery Information
  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'text', nullable: true })
  deliveryAddress: string;

  @Column({ length: 200, nullable: true })
  deliveryContact: string;

  @Column({ length: 50, nullable: true })
  deliveryPhone: string;

  // Tracking
  @Column({ length: 200, nullable: true })
  trackingNumber: string;

  @Column({ length: 200, nullable: true })
  courierService: string;

  // Approval Workflow
  @Column({ type: 'uuid', nullable: true })
  requestedBy: string;

  @Column({ length: 200, nullable: true })
  requestedByName: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ length: 200, nullable: true })
  approvedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  rejectedBy: string;

  @Column({ length: 200, nullable: true })
  rejectedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Receiving Information
  @Column({ type: 'simple-json', nullable: true })
  receivedItems: {
    itemId: string;
    quantityOrdered: number;
    quantityReceived: number;
    receivedDate: string;
    receivedBy: string;
    condition: string; // GOOD, DAMAGED, PARTIAL
    remarks?: string;
  }[];

  @Column({ type: 'int', default: 0 })
  totalItemsOrdered: number;

  @Column({ type: 'int', default: 0 })
  totalItemsReceived: number;

  // Documents
  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ length: 200, nullable: true })
  invoiceNumber: string;

  @Column({ type: 'date', nullable: true })
  invoiceDate: Date;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ length: 200, nullable: true })
  projectReference: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  // System Fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;
}