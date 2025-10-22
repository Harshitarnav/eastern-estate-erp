"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVendorPaymentDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_vendor_payment_dto_1 = require("./create-vendor-payment.dto");
class UpdateVendorPaymentDto extends (0, mapped_types_1.PartialType)(create_vendor_payment_dto_1.CreateVendorPaymentDto) {
}
exports.UpdateVendorPaymentDto = UpdateVendorPaymentDto;
//# sourceMappingURL=update-vendor-payment.dto.js.map