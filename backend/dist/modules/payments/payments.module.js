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
const payment_refund_entity_1 = require("./entities/payment-refund.entity");
const payment_schedule_entity_1 = require("./entities/payment-schedule.entity");
const payments_service_1 = require("./payments.service");
const refunds_service_1 = require("./refunds.service");
const payment_completion_service_1 = require("./services/payment-completion.service");
const overdue_scanner_service_1 = require("./services/overdue-scanner.service");
const legacy_import_service_1 = require("./services/legacy-import.service");
const collections_service_1 = require("./services/collections.service");
const payments_controller_1 = require("./payments.controller");
const refunds_controller_1 = require("./refunds.controller");
const legacy_import_controller_1 = require("./controllers/legacy-import.controller");
const collections_controller_1 = require("./controllers/collections.controller");
const payment_plans_module_1 = require("../payment-plans/payment-plans.module");
const accounting_module_1 = require("../accounting/accounting.module");
const notifications_module_1 = require("../notifications/notifications.module");
const settings_module_1 = require("../settings/settings.module");
const mail_module_1 = require("../../common/mail/mail.module");
const construction_module_1 = require("../construction/construction.module");
const demand_drafts_module_1 = require("../demand-drafts/demand-drafts.module");
const flat_entity_1 = require("../flats/entities/flat.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const flat_payment_plan_entity_1 = require("../payment-plans/entities/flat-payment-plan.entity");
const demand_draft_entity_1 = require("../demand-drafts/entities/demand-draft.entity");
const user_entity_1 = require("../users/entities/user.entity");
let PaymentsModule = class PaymentsModule {
};
exports.PaymentsModule = PaymentsModule;
exports.PaymentsModule = PaymentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                payment_entity_1.Payment,
                payment_refund_entity_1.PaymentRefund,
                payment_schedule_entity_1.PaymentSchedule,
                flat_entity_1.Flat,
                booking_entity_1.Booking,
                customer_entity_1.Customer,
                flat_payment_plan_entity_1.FlatPaymentPlan,
                demand_draft_entity_1.DemandDraft,
                user_entity_1.User,
            ]),
            payment_plans_module_1.PaymentPlansModule,
            accounting_module_1.AccountingModule,
            notifications_module_1.NotificationsModule,
            settings_module_1.SettingsModule,
            mail_module_1.MailModule,
            construction_module_1.ConstructionModule,
            demand_drafts_module_1.DemandDraftsModule,
        ],
        controllers: [
            payments_controller_1.PaymentsController,
            refunds_controller_1.RefundsController,
            legacy_import_controller_1.LegacyImportController,
            collections_controller_1.CollectionsController,
        ],
        providers: [
            payments_service_1.PaymentsService,
            refunds_service_1.RefundsService,
            payment_completion_service_1.PaymentCompletionService,
            overdue_scanner_service_1.OverdueScannerService,
            legacy_import_service_1.LegacyImportService,
            collections_service_1.CollectionsService,
        ],
        exports: [
            payments_service_1.PaymentsService,
            refunds_service_1.RefundsService,
            payment_completion_service_1.PaymentCompletionService,
            overdue_scanner_service_1.OverdueScannerService,
            legacy_import_service_1.LegacyImportService,
            collections_service_1.CollectionsService,
        ],
    })
], PaymentsModule);
//# sourceMappingURL=payments.module.js.map