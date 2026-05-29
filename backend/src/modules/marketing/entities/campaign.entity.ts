import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

const decimalTransformer = {
  to: (value?: number | null) => (value ?? null),
  from: (value: string | null) =>
    value === null || value === undefined ? null : Number(value),
};

@Entity('marketing_campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  type: string;

  @Column()
  status: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: decimalTransformer })
  budget: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', default: [] })
  attachments?: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
