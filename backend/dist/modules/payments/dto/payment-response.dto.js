"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentResponseDto = void 0;
class PaymentResponseDto {
    static fromEntity(payment) {
        const dto = new PaymentResponseDto();
        dto.id = payment.id || '';
        dto.paymentCode = payment.paymentCode || '';
        dto.bookingId = payment.bookingId || '';
        dto.customerId = payment.customerId || '';
        dto.paymentType = payment.paymentType || '';
        dto.paymentMethod = payment.paymentMethod || '';
        dto.amount = Number(payment.amount) || 0;
        if (payment.paymentDate) {
            try {
                const date = new Date(payment.paymentDate);
                dto.paymentDate = date.toISOString().split('T')[0];
            }
            catch {
                dto.paymentDate = new Date().toISOString().split('T')[0];
            }
        }
        else {
            dto.paymentDate = new Date().toISOString().split('T')[0];
        }
        dto.bankName = payment.bankName || '';
        dto.transactionReference = payment.transactionReference || '';
        dto.chequeNumber = payment.chequeNumber || '';
        if (payment.chequeDate) {
            try {
                const date = new Date(payment.chequeDate);
                dto.chequeDate = date.toISOString().split('T')[0];
            }
            catch {
                dto.chequeDate = '';
            }
        }
        else {
            dto.chequeDate = '';
        }
        dto.upiId = payment.upiId || '';
        dto.status = payment.status || 'PENDING';
        dto.receiptNumber = payment.receiptNumber || '';
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