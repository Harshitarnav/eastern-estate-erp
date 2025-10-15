"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResponseDto = void 0;
class CustomerResponseDto {
    static fromEntity(customer) {
        const dto = new CustomerResponseDto();
        Object.assign(dto, customer);
        return dto;
    }
    static fromEntities(customers) {
        return customers.map((customer) => this.fromEntity(customer));
    }
}
exports.CustomerResponseDto = CustomerResponseDto;
//# sourceMappingURL=customer-response.dto.js.map