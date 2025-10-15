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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("./entities/employee.entity");
let EmployeesService = class EmployeesService {
    constructor(employeesRepository) {
        this.employeesRepository = employeesRepository;
    }
    async create(createEmployeeDto) {
        const grossSalary = createEmployeeDto.basicSalary +
            (createEmployeeDto.houseRentAllowance || 0) +
            (createEmployeeDto.transportAllowance || 0) +
            (createEmployeeDto.medicalAllowance || 0);
        const netSalary = grossSalary;
        const employee = this.employeesRepository.create({
            ...createEmployeeDto,
            grossSalary,
            netSalary,
            casualLeaveBalance: 12,
            sickLeaveBalance: 12,
            earnedLeaveBalance: 15,
        });
        return this.employeesRepository.save(employee);
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
            updateEmployeeDto.medicalAllowance !== undefined) {
            const grossSalary = (updateEmployeeDto.basicSalary ?? employee.basicSalary) +
                (updateEmployeeDto.houseRentAllowance ?? employee.houseRentAllowance) +
                (updateEmployeeDto.transportAllowance ?? employee.transportAllowance) +
                (updateEmployeeDto.medicalAllowance ?? employee.medicalAllowance);
            updateEmployeeDto['grossSalary'] = grossSalary;
            updateEmployeeDto['netSalary'] = grossSalary;
        }
        Object.assign(employee, updateEmployeeDto);
        return this.employeesRepository.save(employee);
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
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map