"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePurchaseOrderItemDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_purchase_order_item_dto_1 = require("./create-purchase-order-item.dto");
class UpdatePurchaseOrderItemDto extends (0, mapped_types_1.PartialType)(create_purchase_order_item_dto_1.CreatePurchaseOrderItemDto) {
}
exports.UpdatePurchaseOrderItemDto = UpdatePurchaseOrderItemDto;
//# sourceMappingURL=update-purchase-order-item.dto.js.map