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
import { Employee } from '../../employees/entities/employee.entity';

@Entity('material_exits')
export class MaterialExit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'material_id', type: 'uuid' })
  materialId: string;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ name: 'construction_project_id', type: 'uuid', nullable: true })
  constructionProjectId: string;

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  quantity: number;

  @Column({ type: 'text' })
  purpose: string;

  @Column({ name: 'issued_to', type: 'uuid' })
  issuedTo: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'issued_to' })
  issuedToEmployee: Employee;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedByEmployee: Employee;

  @Column({ name: 'exit_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  exitDate: Date;

  @Column({ name: 'return_expected', default: false })
  returnExpected: boolean;

  @Column({ name: 'return_date', type: 'timestamp', nullable: true })
  returnDate: Date;

  @Column({ name: 'return_quantity', type: 'decimal', precision: 15, scale: 3, nullable: true })
  returnQuantity: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual property to check if returned
  get isReturned(): boolean {
    return !!this.returnDate;
  }

  // Virtual property to check if overdue for return
  get isOverdueForReturn(): boolean {
    if (!this.returnExpected || this.isReturned) return false;
    // Consider overdue if not returned within 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(this.exitDate) < thirtyDaysAgo;
  }

  // Virtual property to get pending return quantity
  get pendingReturnQuantity(): number {
    if (!this.returnExpected) return 0;
    return Number(this.quantity) - (Number(this.returnQuantity) || 0);
  }
}
