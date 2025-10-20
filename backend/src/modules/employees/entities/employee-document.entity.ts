import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';

export enum DocumentType {
  AADHAR_CARD = 'AADHAR_CARD',
  PAN_CARD = 'PAN_CARD',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  VOTER_ID = 'VOTER_ID',
  EDUCATION_CERTIFICATE = 'EDUCATION_CERTIFICATE',
  EXPERIENCE_LETTER = 'EXPERIENCE_LETTER',
  RELIEVING_LETTER = 'RELIEVING_LETTER',
  SALARY_SLIP = 'SALARY_SLIP',
  BANK_STATEMENT = 'BANK_STATEMENT',
  APPOINTMENT_LETTER = 'APPOINTMENT_LETTER',
  RESIGNATION_LETTER = 'RESIGNATION_LETTER',
  NOC = 'NOC',
  MEDICAL_CERTIFICATE = 'MEDICAL_CERTIFICATE',
  POLICE_VERIFICATION = 'POLICE_VERIFICATION',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

/**
 * Employee Document Entity
 * 
 * Manages employee paperwork and documents
 */
@Entity('employee_documents')
@Index(['employeeId'])
@Index(['documentType'])
@Index(['documentStatus'])
export class EmployeeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Employee Reference
  @Column('uuid')
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // Document Details
  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({ length: 200 })
  documentName: string;

  @Column({ length: 100, nullable: true })
  documentNumber: string;

  @Column({ type: 'text', nullable: true })
  documentDescription: string;

  // File Information
  @Column({ length: 500 })
  documentUrl: string;

  @Column({ length: 100, nullable: true })
  fileName: string;

  @Column({ length: 50, nullable: true })
  fileType: string;

  @Column({ type: 'int', nullable: true })
  fileSize: number; // in bytes

  // Status & Validity
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  documentStatus: DocumentStatus;

  @Column({ type: 'date', nullable: true })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'boolean', default: false })
  isExpirable: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  // Verification Details
  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ length: 200, nullable: true })
  verifiedByName: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  verificationRemarks: string;

  @Column({ type: 'uuid', nullable: true })
  rejectedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Submission Details
  @Column({ type: 'date', nullable: true })
  submittedDate: Date;

  @Column({ type: 'text', nullable: true })
  submissionRemarks: string;

  // Reminder Settings
  @Column({ type: 'boolean', default: false })
  sendExpiryReminder: boolean;

  @Column({ type: 'int', nullable: true })
  reminderDaysBefore: number; // Days before expiry to send reminder

  @Column({ type: 'timestamp', nullable: true })
  lastReminderSent: Date;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'boolean', default: true })
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
