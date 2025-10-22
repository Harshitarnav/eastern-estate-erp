import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Material } from './material.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
// import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity'; // Removed - not needed
import { User } from '../../users/entities/user.entity';

export enum EntryType {
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('material_entries')
export class MaterialEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'material_id', type: 'uuid' })
  materialId: string;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({
    name: 'entry_type',
    type: 'enum',
    enum: EntryType,
  })
  entryType: EntryType;

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_value', type: 'decimal', precision: 15, scale: 2 })
  totalValue: number;

  @Column({ name: 'vendor_id', type: 'uuid', nullable: true })
  vendorId: string;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @Column({ name: 'purchase_order_id', type: 'uuid', nullable: true })
  purchaseOrderId: string;

  // @ManyToOne(() => PurchaseOrder, { nullable: true })
  // @JoinColumn({ name: 'purchase_order_id' })
  // purchaseOrder: PurchaseOrder;

  @Column({ name: 'entry_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  entryDate: Date;

  @Column({ name: 'entered_by', type: 'uuid' })
  enteredBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'entered_by' })
  enteredByUser: User;

  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual property to check if linked to PO
  get isLinkedToPO(): boolean {
    return !!this.purchaseOrderId;
  }

  // Virtual property to format entry type
  get formattedEntryType(): string {
    return this.entryType.replace('_', ' ');
  }
}
