import { Booking } from '../entities/booking.entity';

export class BookingResponseDto {
  id: string;
  bookingNumber: string;
  customerId: string;
  flatId: string;
  propertyId: string;
  status: string;
  bookingDate: string;
  totalAmount: number;
  tokenAmount: number;
  agreementAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  tokenPaidDate?: string;
  tokenReceiptNumber?: string;
  tokenPaymentMode?: string;
  agreementNumber?: string;
  agreementDate?: string;
  agreementSignedDate?: string;
  agreementDocumentUrl?: string;
  expectedPossessionDate?: string;
  actualPossessionDate?: string;
  registrationDate?: string;
  discountAmount: number;
  discountReason?: string;
  stampDuty: number;
  registrationCharges: number;
  gstAmount: number;
  maintenanceDeposit: number;
  parkingCharges: number;
  otherCharges: number;
  isHomeLoan: boolean;
  bankName?: string;
  loanAmount?: number;
  loanApplicationNumber?: string;
  loanApprovalDate?: string;
  loanDisbursementDate?: string;
  nominee1Name?: string;
  nominee1Relation?: string;
  nominee2Name?: string;
  nominee2Relation?: string;
  coApplicantName?: string;
  coApplicantEmail?: string;
  coApplicantPhone?: string;
  coApplicantRelation?: string;
  cancellationDate?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;
  documents?: string[];
  notes?: string;
  specialTerms?: string;
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Populated fields
  customer?: any;
  flat?: any;
  property?: any;

  static fromEntity(booking: Booking): BookingResponseDto {
    const dto = new BookingResponseDto();
    dto.id = booking.id;
    dto.bookingNumber = booking.bookingNumber;
    dto.customerId = booking.customerId;
    dto.flatId = booking.flatId;
    dto.propertyId = booking.propertyId;
    dto.status = booking.status;
    dto.bookingDate = booking.bookingDate?.toString();
    dto.totalAmount = Number(booking.totalAmount);
    dto.tokenAmount = Number(booking.tokenAmount);
    dto.agreementAmount = Number(booking.agreementAmount);
    dto.paidAmount = Number(booking.paidAmount);
    dto.balanceAmount = Number(booking.balanceAmount);
    dto.paymentStatus = booking.paymentStatus;
    dto.tokenPaidDate = booking.tokenPaidDate?.toString();
    dto.tokenReceiptNumber = booking.tokenReceiptNumber;
    dto.tokenPaymentMode = booking.tokenPaymentMode;
    dto.agreementNumber = booking.agreementNumber;
    dto.agreementDate = booking.agreementDate?.toString();
    dto.agreementSignedDate = booking.agreementSignedDate?.toString();
    dto.agreementDocumentUrl = booking.agreementDocumentUrl;
    dto.expectedPossessionDate = booking.expectedPossessionDate?.toString();
    dto.actualPossessionDate = booking.actualPossessionDate?.toString();
    dto.registrationDate = booking.registrationDate?.toString();
    dto.discountAmount = Number(booking.discountAmount);
    dto.discountReason = booking.discountReason;
    dto.stampDuty = Number(booking.stampDuty);
    dto.registrationCharges = Number(booking.registrationCharges);
    dto.gstAmount = Number(booking.gstAmount);
    dto.maintenanceDeposit = Number(booking.maintenanceDeposit);
    dto.parkingCharges = Number(booking.parkingCharges);
    dto.otherCharges = Number(booking.otherCharges);
    dto.isHomeLoan = booking.isHomeLoan;
    dto.bankName = booking.bankName;
    dto.loanAmount = booking.loanAmount ? Number(booking.loanAmount) : undefined;
    dto.loanApplicationNumber = booking.loanApplicationNumber;
    dto.loanApprovalDate = booking.loanApprovalDate?.toString();
    dto.loanDisbursementDate = booking.loanDisbursementDate?.toString();
    dto.nominee1Name = booking.nominee1Name;
    dto.nominee1Relation = booking.nominee1Relation;
    dto.nominee2Name = booking.nominee2Name;
    dto.nominee2Relation = booking.nominee2Relation;
    dto.coApplicantName = booking.coApplicantName;
    dto.coApplicantEmail = booking.coApplicantEmail;
    dto.coApplicantPhone = booking.coApplicantPhone;
    dto.coApplicantRelation = booking.coApplicantRelation;
    dto.cancellationDate = booking.cancellationDate?.toString();
    dto.cancellationReason = booking.cancellationReason;
    dto.refundAmount = booking.refundAmount ? Number(booking.refundAmount) : undefined;
    dto.refundDate = booking.refundDate?.toString();
    dto.documents = booking.documents;
    dto.notes = booking.notes;
    dto.specialTerms = booking.specialTerms;
    dto.tags = booking.tags;
    dto.isActive = booking.isActive;
    dto.createdAt = booking.createdAt?.toString();
    dto.updatedAt = booking.updatedAt?.toString();

    if (booking.customer) {
      dto.customer = booking.customer;
    }
    if (booking.flat) {
      dto.flat = booking.flat;
    }
    if (booking.property) {
      dto.property = booking.property;
    }

    return dto;
  }

  static fromEntities(bookings: Booking[]): BookingResponseDto[] {
    return bookings.map((booking) => this.fromEntity(booking));
  }
}

export interface PaginatedBookingsResponse {
  data: BookingResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
