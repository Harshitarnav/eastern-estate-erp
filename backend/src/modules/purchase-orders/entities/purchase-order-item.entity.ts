import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};
import { PurchaseOrder } from './purchase-order.entity';
import { Material } from '../../materials/entities/material.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder)
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column({ name: 'material_id', type: 'uuid' })
  materialId: string;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ name: 'quantity', type: 'decimal', precision: 15, scale: 3, transformer: decimalTransformer })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  unitPrice: number;

  @Column({ name: 'subtotal', type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  subtotal: number;

  @Column({ name: 'tax_percentage', type: 'decimal', precision: 5, scale: 2, default: 0, transformer: decimalTransformer })
  taxPercentage: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  taxAmount: number;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0, transformer: decimalTransformer })
  discountPercentage: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, transformer: decimalTransformer })
  totalAmount: number;

  @Column({ name: 'quantity_received', type: 'decimal', precision: 15, scale: 3, default: 0, transformer: decimalTransformer })
  quantityReceived: number;

  @Column({ name: 'quantity_pending', type: 'decimal', precision: 15, scale: 3, default: 0, transformer: decimalTransformer })
  quantityPending: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
