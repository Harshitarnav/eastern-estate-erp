"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentPlansModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_plan_template_entity_1 = require("./entities/payment-plan-template.entity");
const flat_payment_plan_entity_1 = require("./entities/flat-payment-plan.entity");
const demand_draft_template_entity_1 = require("./entities/demand-draft-template.entity");
const payment_plan_template_service_1 = require("./services/payment-plan-template.service");
const flat_payment_plan_service_1 = require("./services/flat-payment-plan.service");
const demand_draft_template_service_1 = require("./services/demand-draft-template.service");
const payment_plan_template_controller_1 = require("./controllers/payment-plan-template.controller");
const flat_payment_plan_controller_1 = require("./controllers/flat-payment-plan.controller");
const demand_draft_template_controller_1 = require("./controllers/demand-draft-template.controller");
const flat_entity_1 = require("../flats/entities/flat.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
let PaymentPlansModule = class PaymentPlansModule {
};
exports.PaymentPlansModule = PaymentPlansModule;
exports.PaymentPlansModule = PaymentPlansModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                payment_plan_template_entity_1.PaymentPlanTemplate,
                flat_payment_plan_entity_1.FlatPaymentPlan,
                demand_draft_template_entity_1.DemandDraftTemplate,
                flat_entity_1.Flat,
                booking_entity_1.Booking,
                customer_entity_1.Customer,
            ]),
        ],
        controllers: [
            payment_plan_template_controller_1.PaymentPlanTemplateController,
            flat_payment_plan_controller_1.FlatPaymentPlanController,
            demand_draft_template_controller_1.DemandDraftTemplateController,
        ],
        providers: [
            payment_plan_template_service_1.PaymentPlanTemplateService,
            flat_payment_plan_service_1.FlatPaymentPlanService,
            demand_draft_template_service_1.DemandDraftTemplateService,
        ],
        exports: [
            payment_plan_template_service_1.PaymentPlanTemplateService,
            flat_payment_plan_service_1.FlatPaymentPlanService,
            demand_draft_template_service_1.DemandDraftTemplateService,
        ],
    })
], PaymentPlansModule);
//# sourceMappingURL=payment-plans.module.js.map