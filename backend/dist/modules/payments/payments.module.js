"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const payment_installment_entity_1 = require("./entities/payment-installment.entity");
const payment_refund_entity_1 = require("./entities/payment-refund.entity");
const payments_service_1 = require("./payments.service");
const installments_service_1 = require("./installments.service");
const refunds_service_1 = require("./refunds.service");
const payments_controller_1 = require("./payments.controller");
const installments_controller_1 = require("./installments.controller");
const refunds_controller_1 = require("./refunds.controller");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                payment_entity_1.Payment,
                payment_installment_entity_1.PaymentInstallment,
                payment_refund_entity_1.PaymentRefund,
            ]),
        ],
        controllers: [
            payments_controller_1.PaymentsController,
            installments_controller_1.InstallmentsController,
            refunds_controller_1.RefundsController,
        ],
        providers: [
            payments_service_1.PaymentsService,
            installments_service_1.InstallmentsService,
            refunds_service_1.RefundsService,
        ],
        exports: [
            payments_service_1.PaymentsService,
            installments_service_1.InstallmentsService,
            refunds_service_1.RefundsService,
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map