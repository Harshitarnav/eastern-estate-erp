"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const purchase_order_entity_1 = require("./entities/purchase-order.entity");
const purchase_order_item_entity_1 = require("./entities/purchase-order-item.entity");
const purchase_orders_service_1 = require("./purchase-orders.service");
const purchase_orders_controller_1 = require("./purchase-orders.controller");
const purchase_order_items_service_1 = require("./purchase-order-items.service");
const purchase_order_items_controller_1 = require("./purchase-order-items.controller");
let PurchaseOrdersModule = class PurchaseOrdersModule {
};
exports.PurchaseOrdersModule = PurchaseOrdersModule;
exports.PurchaseOrdersModule = PurchaseOrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([purchase_order_entity_1.PurchaseOrder, purchase_order_item_entity_1.PurchaseOrderItem])],
        controllers: [purchase_orders_controller_1.PurchaseOrdersController, purchase_order_items_controller_1.PurchaseOrderItemsController],
        providers: [purchase_orders_service_1.PurchaseOrdersService, purchase_order_items_service_1.PurchaseOrderItemsService],
        exports: [purchase_orders_service_1.PurchaseOrdersService, purchase_order_items_service_1.PurchaseOrderItemsService],
    })
], PurchaseOrdersModule);
//# sourceMappingURL=purchase-orders.module.js.map