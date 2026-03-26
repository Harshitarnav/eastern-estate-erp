"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const employees_service_1 = require("./employees.service");
const employees_controller_1 = require("./employees.controller");
const employee_entity_1 = require("./entities/employee.entity");
const sales_target_entity_1 = require("./entities/sales-target.entity");
const salary_payment_entity_1 = require("./entities/salary-payment.entity");
const sales_target_service_1 = require("./sales-target.service");
const sales_target_controller_1 = require("./sales-target.controller");
const salary_payments_service_1 = require("./salary-payments.service");
const salary_payments_controller_1 = require("./salary-payments.controller");
const lead_entity_1 = require("../leads/entities/lead.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const users_module_1 = require("../users/users.module");
const notifications_module_1 = require("../notifications/notifications.module");
const accounting_module_1 = require("../accounting/accounting.module");
let EmployeesModule = class EmployeesModule {
};
exports.EmployeesModule = EmployeesModule;
exports.EmployeesModule = EmployeesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([employee_entity_1.Employee, sales_target_entity_1.SalesTarget, salary_payment_entity_1.SalaryPayment, lead_entity_1.Lead, booking_entity_1.Booking]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            notifications_module_1.NotificationsModule,
            accounting_module_1.AccountingModule,
        ],
        controllers: [salary_payments_controller_1.SalaryPaymentsController, sales_target_controller_1.SalesTargetController, employees_controller_1.EmployeesController],
        providers: [employees_service_1.EmployeesService, sales_target_service_1.SalesTargetService, salary_payments_service_1.SalaryPaymentsService],
        exports: [employees_service_1.EmployeesService, sales_target_service_1.SalesTargetService, salary_payments_service_1.SalaryPaymentsService],
    })
], EmployeesModule);
//# sourceMappingURL=employees.module.js.map