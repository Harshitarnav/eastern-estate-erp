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

  // ── Collections / overdue-reminder settings ─────────────────────────────
  // Days between automated reminders (default 7).
  @Column({ name: 'overdue_reminder_interval_days', type: 'int', default: 7 })
  overdueReminderIntervalDays: number;

  // Days overdue after which the cancellation-warning letter is prepared
  // (default 30). Prepared in DRAFT status and requires human send.
  @Column({ name: 'cancellation_warning_threshold_days', type: 'int', default: 30 })
  cancellationWarningThresholdDays: number;

  // Legacy plans with unpaid milestones older than this (days) will NOT
  // be auto-reminded until a human manually enables remindersEnabled on
  // the plan. Default 180 (6 months).
  @Column({ name: 'legacy_auto_remind_max_age_days', type: 'int', default: 180 })
  legacyAutoRemindMaxAgeDays: number;

  // Max number of reminder emails/SMS sent per cron tick - prevents a
  // single sweep from blowing through provider rate limits.
  @Column({ name: 'overdue_reminder_daily_cap', type: 'int', default: 50 })
  overdueReminderDailyCap: number;

  // Feature flag: when false, SmsService stays Noop regardless of provider.
  @Column({ name: 'enable_sms_reminders', type: 'boolean', default: false })
  enableSmsReminders: boolean;

  // Company-wide default for milestone-triggered demand drafts.
  //   false (default): every newly-generated DD is created as DRAFT and
  //     needs a human to click Send Now.
  //   true: DD is created as SENT, email (+ SMS if enabled) fires
  //     immediately, no review step.
  // Can be overridden per-property (nullable) and per-customer (nullable).
  // Precedence at send time is: customer > property > company.
  @Column({
    name: 'auto_send_milestone_demand_drafts',
    type: 'boolean',
    default: false,
  })
  autoSendMilestoneDemandDrafts: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
