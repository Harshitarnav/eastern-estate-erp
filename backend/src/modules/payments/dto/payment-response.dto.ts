import { Payment } from '../entities/payment.entity';

export class PaymentResponseDto {
  id: string;
  paymentNumber: string;
  receiptNumber?: string;
  bookingId: string;
  customerId: string;
  paymentType: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  status: string;
  bankName?: string;
  branchName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  transactionId?: string;
  clearanceDate?: string;
  upiId?: string;
  onlinePaymentId?: string;
  installmentNumber?: number;
  dueDate?: string;
  lateFee?: number;
  tdsAmount: number;
  tdsPercentage: number;
  gstAmount: number;
  gstPercentage: number;
  netAmount: number;
  receiptUrl?: string;
  receiptGenerated: boolean;
  receiptDate?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  documents?: string[];
  notes?: string;
  internalNotes?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  booking?: any;
  customer?: any;

  static fromEntity(payment: Payment): PaymentResponseDto {
    const dto = new PaymentResponseDto();
    dto.id = payment.id;
    dto.paymentNumber = payment.paymentNumber;
    dto.receiptNumber = payment.receiptNumber;
    dto.bookingId = payment.bookingId;
    dto.customerId = payment.customerId;
    dto.paymentType = payment.paymentType;
    dto.amount = Number(payment.amount);
    dto.paymentDate = payment.paymentDate?.toString();
    dto.paymentMode = payment.paymentMode;
    dto.status = payment.status;
    dto.bankName = payment.bankName;
    dto.branchName = payment.branchName;
    dto.chequeNumber = payment.chequeNumber;
    dto.chequeDate = payment.chequeDate?.toString();
    dto.transactionId = payment.transactionId;
    dto.clearanceDate = payment.clearanceDate?.toString();
    dto.upiId = payment.upiId;
    dto.onlinePaymentId = payment.onlinePaymentId;
    dto.installmentNumber = payment.installmentNumber;
    dto.dueDate = payment.dueDate?.toString();
    dto.lateFee = payment.lateFee ? Number(payment.lateFee) : undefined;
    dto.tdsAmount = Number(payment.tdsAmount);
    dto.tdsPercentage = Number(payment.tdsPercentage);
    dto.gstAmount = Number(payment.gstAmount);
    dto.gstPercentage = Number(payment.gstPercentage);
    dto.netAmount = Number(payment.netAmount);
    dto.receiptUrl = payment.receiptUrl;
    dto.receiptGenerated = payment.receiptGenerated;
    dto.receiptDate = payment.receiptDate?.toString();
    dto.isVerified = payment.isVerified;
    dto.verifiedBy = payment.verifiedBy;
    dto.verifiedAt = payment.verifiedAt?.toString();
    dto.documents = payment.documents;
    dto.notes = payment.notes;
    dto.internalNotes = payment.internalNotes;
    dto.tags = payment.tags;
    dto.isActive = payment.isActive;
    dto.createdAt = payment.createdAt?.toString();
    dto.updatedAt = payment.updatedAt?.toString();

    if (payment.booking) {
      dto.booking = payment.booking;
    }
    if (payment.customer) {
      dto.customer = payment.customer;
    }

    return dto;
  }

  static fromEntities(payments: Payment[]): PaymentResponseDto[] {
    return payments.map((payment) => this.fromEntity(payment));
  }
}

export interface PaginatedPaymentsResponse {
  data: PaymentResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
