import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from './vendor.entity';
// import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity'; // Removed - not needed
import { User } from '../../users/entities/user.entity';

export enum PaymentMode {
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  UPI = 'UPI',
}

@Entity('vendor_payments')
export class VendorPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId: string;

  // @ManyToOne(() => PurchaseOrder, { nullable: true })
  // @JoinColumn({ name: 'purchase_order_id' })
  // purchaseOrder: PurchaseOrder;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    name: 'payment_mode',
    type: 'enum',
    enum: PaymentMode,
  })
  paymentMode: PaymentMode;

  @Column({ name: 'transaction_reference', length: 100, nullable: true })
  transactionReference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual property to check if linked to PO
  get isLinkedToPO(): boolean {
    return !!this.purchaseOrderId;
  }

  // Virtual property to check if recent (within last 30 days)
  get isRecent(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(this.paymentDate) >= thirtyDaysAgo;
  }

  // Virtual property to check if digital payment
  get isDigitalPayment(): boolean {
    return [PaymentMode.NEFT, PaymentMode.RTGS, PaymentMode.UPI].includes(this.paymentMode);
  }

  // Virtual property to format payment mode
  get formattedPaymentMode(): string {
    return this.paymentMode.replace('_', ' ');
  }
}
