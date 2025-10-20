"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const leads_controller_1 = require("./leads.controller");
const leads_service_1 = require("./leads.service");
const lead_entity_1 = require("./entities/lead.entity");
const followup_entity_1 = require("./entities/followup.entity");
const sales_task_entity_1 = require("./entities/sales-task.entity");
const followup_service_1 = require("./followup.service");
const sales_task_service_1 = require("./sales-task.service");
const followup_controller_1 = require("./followup.controller");
const sales_task_controller_1 = require("./sales-task.controller");
const sales_dashboard_service_1 = require("./sales-dashboard.service");
const sales_dashboard_controller_1 = require("./sales-dashboard.controller");
const sales_target_entity_1 = require("../employees/entities/sales-target.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([lead_entity_1.Lead, followup_entity_1.FollowUp, sales_task_entity_1.SalesTask, sales_target_entity_1.SalesTarget, booking_entity_1.Booking])],
        controllers: [leads_controller_1.LeadsController, followup_controller_1.FollowUpController, sales_task_controller_1.SalesTaskController, sales_dashboard_controller_1.SalesDashboardController],
        providers: [leads_service_1.LeadsService, followup_service_1.FollowUpService, sales_task_service_1.SalesTaskService, sales_dashboard_service_1.SalesDashboardService],
        exports: [leads_service_1.LeadsService, followup_service_1.FollowUpService, sales_task_service_1.SalesTaskService, sales_dashboard_service_1.SalesDashboardService],
    })
], LeadsModule);
//# sourceMappingURL=leads.module.js.map