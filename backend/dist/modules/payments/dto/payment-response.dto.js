"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentResponseDto = void 0;
class PaymentResponseDto {
    static fromEntity(payment) {
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
    static fromEntities(payments) {
        return payments.map((payment) => this.fromEntity(payment));
    }
}
exports.PaymentResponseDto = PaymentResponseDto;
//# sourceMappingURL=payment-response.dto.js.map