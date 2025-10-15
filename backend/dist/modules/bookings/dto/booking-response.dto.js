"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingResponseDto = void 0;
class BookingResponseDto {
    static fromEntity(booking) {
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
    static fromEntities(bookings) {
        return bookings.map((booking) => this.fromEntity(booking));
    }
}
exports.BookingResponseDto = BookingResponseDto;
//# sourceMappingURL=booking-response.dto.js.map