"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerPortalModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_portal_controller_1 = require("./customer-portal.controller");
const customer_portal_service_1 = require("./customer-portal.service");
const customer_portal_guard_1 = require("./customer-portal.guard");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../users/entities/role.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const flat_payment_plan_entity_1 = require("../payment-plans/entities/flat-payment-plan.entity");
const demand_draft_entity_1 = require("../demand-drafts/entities/demand-draft.entity");
const construction_progress_log_entity_1 = require("../construction/entities/construction-progress-log.entity");
const construction_project_entity_1 = require("../construction/entities/construction-project.entity");
let CustomerPortalModule = class CustomerPortalModule {
};
exports.CustomerPortalModule = CustomerPortalModule;
exports.CustomerPortalModule = CustomerPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                role_entity_1.Role,
                customer_entity_1.Customer,
                booking_entity_1.Booking,
                payment_entity_1.Payment,
                flat_payment_plan_entity_1.FlatPaymentPlan,
                demand_draft_entity_1.DemandDraft,
                construction_progress_log_entity_1.ConstructionProgressLog,
                construction_project_entity_1.ConstructionProject,
            ]),
        ],
        controllers: [customer_portal_controller_1.CustomerPortalController],
        providers: [customer_portal_service_1.CustomerPortalService, customer_portal_guard_1.CustomerPortalGuard],
    })
], CustomerPortalModule);
//# sourceMappingURL=customer-portal.module.js.map