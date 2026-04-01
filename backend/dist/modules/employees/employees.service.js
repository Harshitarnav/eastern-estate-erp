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
const employee_feedback_entity_1 = require("./entities/employee-feedback.entity");
const employee_review_entity_1 = require("./entities/employee-review.entity");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/entities/notification.entity");
let EmployeesService = EmployeesService_1 = class EmployeesService {
    constructor(employeesRepository, feedbackRepository, reviewRepository, usersService, notificationsService) {
        this.employeesRepository = employeesRepository;
        this.feedbackRepository = feedbackRepository;
        this.reviewRepository = reviewRepository;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(EmployeesService_1.name);
    }
    async generateNextCode() {
        let attempt = 0;
        while (attempt < 100) {
            const count = await this.employeesRepository.count();
            const candidate = `EMP-${String(count + 1 + attempt).padStart(4, '0')}`;
            const exists = await this.employeesRepository.findOne({ where: { employeeCode: candidate } });
            if (!exists)
                return candidate;
            attempt++;
        }
        return `EMP-${Date.now()}`;
    }
    async create(createEmployeeDto, createdBy) {
        if (!createEmployeeDto.employeeCode?.trim()) {
            createEmployeeDto.employeeCode = await this.generateNextCode();
        }
        const grossSalary = (createEmployeeDto.basicSalary || 0) +
            (createEmployeeDto.houseRentAllowance || 0) +
            (createEmployeeDto.transportAllowance || 0) +
            (createEmployeeDto.medicalAllowance || 0) +
            (createEmployeeDto.otherAllowances || 0);
        const pfDeduction = createEmployeeDto.pfDeduction || 0;
        const esiDeduction = createEmployeeDto.esiDeduction || 0;
        const taxDeduction = createEmployeeDto.taxDeduction || 0;
        const otherDeductions = createEmployeeDto.otherDeductions || 0;
        const netSalary = createEmployeeDto.netSalary ?? (grossSalary - pfDeduction - esiDeduction - taxDeduction - otherDeductions);
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
        catch (err) {
            if (err?.code === '23505' && err?.detail?.includes('employee_code')) {
                throw new common_1.ConflictException(`Employee code "${employee.employeeCode}" is already in use. Please choose a different code.`);
            }
            throw err;
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
        const { search, department, employmentStatus, page = 1, limit = 10 } = query;
        const isActive = query.isActive !== undefined ? query.isActive : true;
        const queryBuilder = this.employeesRepository.createQueryBuilder('employee');
        queryBuilder.andWhere('employee.isActive = :isActive', { isActive });
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
        return this.employeesRepository.save(employee);
    }
    async remove(id) {
        const employee = await this.findOne(id);
        employee.isActive = false;
        await this.employeesRepository.save(employee);
    }
    async createFeedback(employeeId, data, createdBy) {
        await this.findOne(employeeId);
        const feedback = this.feedbackRepository.create({ ...data, employeeId, createdBy });
        return this.feedbackRepository.save(feedback);
    }
    async getFeedback(employeeId) {
        await this.findOne(employeeId);
        return this.feedbackRepository.find({
            where: { employeeId, isActive: true },
            order: { feedbackDate: 'DESC' },
        });
    }
    async updateFeedback(employeeId, feedbackId, data, updatedBy) {
        const feedback = await this.feedbackRepository.findOne({ where: { id: feedbackId, employeeId } });
        if (!feedback)
            throw new common_1.NotFoundException('Feedback not found');
        Object.assign(feedback, data, { updatedBy });
        return this.feedbackRepository.save(feedback);
    }
    async deleteFeedback(employeeId, feedbackId) {
        const feedback = await this.feedbackRepository.findOne({ where: { id: feedbackId, employeeId } });
        if (!feedback)
            throw new common_1.NotFoundException('Feedback not found');
        feedback.isActive = false;
        await this.feedbackRepository.save(feedback);
    }
    async createReview(employeeId, data, createdBy) {
        await this.findOne(employeeId);
        const review = this.reviewRepository.create({ ...data, employeeId, createdBy });
        const saved = await this.reviewRepository.save(review);
        await this.employeesRepository.update(employeeId, { lastReviewDate: data.reviewDate || new Date() });
        return saved;
    }
    async getReviews(employeeId) {
        await this.findOne(employeeId);
        return this.reviewRepository.find({
            where: { employeeId, isActive: true },
            order: { reviewDate: 'DESC' },
        });
    }
    async updateReview(employeeId, reviewId, data, updatedBy) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId, employeeId } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        Object.assign(review, data, { updatedBy });
        return this.reviewRepository.save(review);
    }
    async deleteReview(employeeId, reviewId) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId, employeeId } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        review.isActive = false;
        await this.reviewRepository.save(review);
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
    __param(1, (0, typeorm_1.InjectRepository)(employee_feedback_entity_1.EmployeeFeedback)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_review_entity_1.EmployeeReview)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map