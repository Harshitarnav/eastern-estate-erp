"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EmployeesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("./entities/employee.entity");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let EmployeesService = EmployeesService_1 = class EmployeesService {
    constructor(employeesRepository, usersService, notificationsService) {
        this.employeesRepository = employeesRepository;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(EmployeesService_1.name);
        this.dbFieldLabels = {
            employeeCode: 'Employee Code',
            fullName: 'Full Name',
            phoneNumber: 'Phone Number',
            currentAddress: 'Current Address',
            department: 'Department',
            designation: 'Designation',
            employmentType: 'Employment Type',
            employmentStatus: 'Employment Status',
            joiningDate: 'Joining Date',
            basicSalary: 'Basic Salary',
            grossSalary: 'Gross Salary',
            netSalary: 'Net Salary',
            dateOfBirth: 'Date of Birth',
            gender: 'Gender',
        };
    }
    async create(createEmployeeDto, createdBy) {
        const grossSalary = (createEmployeeDto.basicSalary || 0) +
            (createEmployeeDto.houseRentAllowance || 0) +
            (createEmployeeDto.transportAllowance || 0) +
            (createEmployeeDto.medicalAllowance || 0);
        const netSalary = grossSalary;
        const employee = new employee_entity_1.Employee();
        Object.assign(employee, createEmployeeDto);
        employee.grossSalary = grossSalary;
        employee.netSalary = netSalary;
        if (createEmployeeDto.casualLeaveBalance === undefined) {
            employee.casualLeaveBalance = 12;
        }
        if (createEmployeeDto.sickLeaveBalance === undefined) {
            employee.sickLeaveBalance = 12;
        }
        if (createEmployeeDto.earnedLeaveBalance === undefined) {
            employee.earnedLeaveBalance = 15;
        }
        let savedEmployee;
        try {
            savedEmployee = await this.employeesRepository.save(employee);
        }
        catch (error) {
            this.handlePersistenceError(error);
        }
        try {
            await this.createUserForEmployee(savedEmployee, createdBy);
        }
        catch (error) {
            this.logger.error(`Failed to auto-create user for employee ${savedEmployee.id}:`, error);
        }
        return savedEmployee;
    }
    async createUserForEmployee(employee, createdBy) {
        if (!employee.email?.trim()) {
            this.logger.log(`Skipping user creation for employee ${employee.id} because no email was provided`);
            return;
        }
        const username = employee.email.split('@')[0];
        const password = `${username}@easternestate`;
        try {
            const existingUser = await this.usersService.findByEmail(employee.email);
            if (existingUser) {
                this.logger.log(`User already exists for employee ${employee.email}`);
                return;
            }
        }
        catch (error) {
        }
        try {
            const staffRole = await this.usersService.getRoleByName('staff');
            const user = await this.usersService.create({
                email: employee.email,
                username: username,
                password: password,
                firstName: employee.fullName.split(' ')[0] || username,
                lastName: employee.fullName.split(' ').slice(1).join(' ') || '',
                phone: employee.phoneNumber,
                roleIds: staffRole ? [staffRole.id] : [],
            }, createdBy);
            this.logger.log(`Auto-created user account for employee: ${employee.email}`);
            await this.notificationsService.create({
                targetRoles: 'admin,super_admin',
                title: 'New Employee User Account Created',
                message: `User account created for ${employee.fullName} (${employee.email}). Default credentials assigned. Please assign appropriate role and property access.`,
                type: notification_entity_1.NotificationType.INFO,
                category: notification_entity_1.NotificationCategory.EMPLOYEE,
                actionUrl: `/employees/${employee.id}`,
                actionLabel: 'View Employee',
                shouldSendEmail: true,
            }, createdBy);
            employee.userId = user.id;
            await this.employeesRepository.save(employee);
        }
        catch (error) {
            this.logger.error(`Failed to create user for employee ${employee.email}:`, error.message);
            throw error;
        }
    }
    async findAll(query) {
        const { search, department, employmentStatus, isActive, page = 1, limit = 10 } = query;
        const queryBuilder = this.employeesRepository.createQueryBuilder('employee');
        if (search) {
            queryBuilder.andWhere('(employee.fullName LIKE :search OR employee.employeeCode LIKE :search OR employee.phoneNumber LIKE :search OR employee.email LIKE :search)', { search: `%${search}%` });
        }
        if (department) {
            queryBuilder.andWhere('employee.department = :department', { department });
        }
        if (employmentStatus) {
            queryBuilder.andWhere('employee.employmentStatus = :employmentStatus', {
                employmentStatus,
            });
        }
        if (isActive !== undefined) {
            queryBuilder.andWhere('employee.isActive = :isActive', { isActive });
        }
        queryBuilder
            .orderBy('employee.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await queryBuilder.getManyAndCount();
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const employee = await this.employeesRepository.findOne({
            where: { id },
        });
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }
    async update(id, updateEmployeeDto) {
        const employee = await this.findOne(id);
        if (updateEmployeeDto.basicSalary !== undefined ||
            updateEmployeeDto.houseRentAllowance !== undefined ||
            updateEmployeeDto.transportAllowance !== undefined ||
            updateEmployeeDto.medicalAllowance !== undefined ||
            updateEmployeeDto.otherAllowances !== undefined) {
            const grossSalary = (updateEmployeeDto.basicSalary ?? employee.basicSalary ?? 0) +
                (updateEmployeeDto.houseRentAllowance ?? employee.houseRentAllowance ?? 0) +
                (updateEmployeeDto.transportAllowance ?? employee.transportAllowance ?? 0) +
                (updateEmployeeDto.medicalAllowance ?? employee.medicalAllowance ?? 0) +
                (updateEmployeeDto.otherAllowances ?? employee.otherAllowances ?? 0);
            updateEmployeeDto['grossSalary'] = grossSalary;
            if (updateEmployeeDto.netSalary === undefined) {
                const pfDeduction = updateEmployeeDto.pfDeduction ?? employee.pfDeduction ?? 0;
                const esiDeduction = updateEmployeeDto.esiDeduction ?? employee.esiDeduction ?? 0;
                const taxDeduction = updateEmployeeDto.taxDeduction ?? employee.taxDeduction ?? 0;
                const otherDeductions = updateEmployeeDto.otherDeductions ?? employee.otherDeductions ?? 0;
                updateEmployeeDto['netSalary'] = grossSalary - pfDeduction - esiDeduction - taxDeduction - otherDeductions;
            }
        }
        Object.assign(employee, updateEmployeeDto);
        try {
            return await this.employeesRepository.save(employee);
        }
        catch (error) {
            this.handlePersistenceError(error);
        }
    }
    handlePersistenceError(error) {
        if (this.isUniqueConstraintError(error)) {
            const field = this.extractFieldName(error);
            if (field === 'employeeCode') {
                throw new common_1.ConflictException('Employee Code already exists. Please use a different code.');
            }
            if (field === 'email') {
                throw new common_1.ConflictException('Email already exists. Please use a different email address.');
            }
            throw new common_1.ConflictException(`${this.getFieldLabel(field) || 'This value'} already exists. Please use a different value.`);
        }
        if (this.isNotNullConstraintError(error)) {
            const field = this.extractFieldName(error);
            throw new common_1.BadRequestException(`${this.getFieldLabel(field) || 'This field'} is required. Please fill it in and try again.`);
        }
        if (this.isInvalidValueError(error)) {
            const field = this.extractFieldName(error);
            throw new common_1.BadRequestException(`${this.getFieldLabel(field) || 'One of the fields'} has an invalid value. Please review the form and try again.`);
        }
        this.logger.error('Unexpected employee persistence error', error instanceof Error ? error.stack : String(error));
        throw new common_1.InternalServerErrorException('Unable to save employee right now. Please try again.');
    }
    isUniqueConstraintError(error) {
        const dbCode = this.getDbErrorCode(error);
        const message = this.getDbErrorMessage(error).toLowerCase();
        return (dbCode === '23505' ||
            dbCode === 'ER_DUP_ENTRY' ||
            dbCode === 'SQLITE_CONSTRAINT' ||
            message.includes('duplicate key') ||
            message.includes('unique constraint') ||
            message.includes('already exists'));
    }
    isNotNullConstraintError(error) {
        const dbCode = this.getDbErrorCode(error);
        const message = this.getDbErrorMessage(error).toLowerCase();
        return (dbCode === '23502' ||
            message.includes('null value in column') ||
            message.includes('not-null constraint'));
    }
    isInvalidValueError(error) {
        const dbCode = this.getDbErrorCode(error);
        const message = this.getDbErrorMessage(error).toLowerCase();
        return (dbCode === '22P02' ||
            message.includes('invalid input syntax') ||
            message.includes('invalid enum value') ||
            message.includes('date/time field value out of range'));
    }
    getDbErrorCode(error) {
        if (error instanceof typeorm_2.QueryFailedError) {
            return error?.driverError?.code;
        }
        return error?.code ?? error?.driverError?.code;
    }
    getDbErrorMessage(error) {
        if (error instanceof typeorm_2.QueryFailedError) {
            return (error?.driverError?.detail ||
                error?.driverError?.message ||
                error.message ||
                '');
        }
        return (error?.driverError?.detail ||
            error?.driverError?.message ||
            error?.message ||
            '');
    }
    extractFieldName(error) {
        const directColumn = error?.column ||
            error?.driverError?.column;
        if (typeof directColumn === 'string' && directColumn.trim()) {
            return directColumn.trim();
        }
        const message = this.getDbErrorMessage(error);
        const quotedColumnMatch = message.match(/column ["']?([a-zA-Z0-9_]+)["']?/i);
        if (quotedColumnMatch?.[1]) {
            return quotedColumnMatch[1];
        }
        const keyMatch = message.match(/\(([a-zA-Z0-9_]+)\)=/i);
        if (keyMatch?.[1]) {
            return keyMatch[1];
        }
        return undefined;
    }
    getFieldLabel(field) {
        if (!field)
            return undefined;
        return this.dbFieldLabels[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
    }
    async remove(id) {
        const employee = await this.findOne(id);
        employee.isActive = false;
        await this.employeesRepository.save(employee);
    }
    async getStatistics() {
        const total = await this.employeesRepository.count({
            where: { isActive: true },
        });
        const active = await this.employeesRepository.count({
            where: { isActive: true, employmentStatus: employee_entity_1.EmploymentStatus.ACTIVE },
        });
        const onLeave = await this.employeesRepository.count({
            where: { isActive: true, employmentStatus: employee_entity_1.EmploymentStatus.ON_LEAVE },
        });
        const departmentCounts = await this.employeesRepository
            .createQueryBuilder('employee')
            .select('employee.department', 'department')
            .addSelect('COUNT(*)', 'count')
            .where('employee.isActive = :isActive', { isActive: true })
            .groupBy('employee.department')
            .getRawMany();
        return {
            total,
            active,
            onLeave,
            departmentCounts,
        };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = EmployeesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map