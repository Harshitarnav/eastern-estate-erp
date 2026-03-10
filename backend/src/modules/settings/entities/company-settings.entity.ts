import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_settings')
export class CompanySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_name', default: 'Eastern Estate' })
  companyName: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  pincode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  // Tax & Legal
  @Column({ nullable: true })
  gstin: string;

  @Column({ name: 'rera_number', nullable: true })
  reraNumber: string;

  // Bank Details
  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'account_name', nullable: true })
  accountName: string;

  @Column({ name: 'account_number', nullable: true })
  accountNumber: string;

  @Column({ name: 'ifsc_code', nullable: true })
  ifscCode: string;

  @Column({ nullable: true })
  branch: string;

  @Column({ name: 'upi_id', nullable: true })
  upiId: string;

  // SMTP / Email config (stored per-company so it's configurable via UI)
  @Column({ name: 'smtp_host', nullable: true })
  smtpHost: string;

  @Column({ name: 'smtp_port', nullable: true, default: 587 })
  smtpPort: number;

  @Column({ name: 'smtp_user', nullable: true })
  smtpUser: string;

  @Column({ name: 'smtp_pass', nullable: true, select: false })
  smtpPass: string;

  @Column({ name: 'smtp_from', nullable: true })
  smtpFrom: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
