import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee, EmploymentStatus } from './entities/employee.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  PaginatedEmployeeResponseDto,
} from './dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Calculate gross and net salary
    const grossSalary =
      createEmployeeDto.basicSalary +
      (createEmployeeDto.houseRentAllowance || 0) +
      (createEmployeeDto.transportAllowance || 0) +
      (createEmployeeDto.medicalAllowance || 0);

    const netSalary = grossSalary; // Deductions will be calculated later

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

  async findAll(
    query: QueryEmployeeDto,
  ): Promise<PaginatedEmployeeResponseDto> {
    const { search, department, employmentStatus, isActive, page = 1, limit = 10 } = query;

    const queryBuilder = this.employeesRepository.createQueryBuilder('employee');

    if (search) {
      queryBuilder.andWhere(
        '(employee.fullName LIKE :search OR employee.employeeCode LIKE :search OR employee.phoneNumber LIKE :search OR employee.email LIKE :search)',
        { search: `%${search}%` },
      );
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

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    const employee = await this.findOne(id);

    // Recalculate salary if any salary component changed
    if (
      updateEmployeeDto.basicSalary !== undefined ||
      updateEmployeeDto.houseRentAllowance !== undefined ||
      updateEmployeeDto.transportAllowance !== undefined ||
      updateEmployeeDto.medicalAllowance !== undefined
    ) {
      const grossSalary =
        (updateEmployeeDto.basicSalary ?? employee.basicSalary) +
        (updateEmployeeDto.houseRentAllowance ?? employee.houseRentAllowance) +
        (updateEmployeeDto.transportAllowance ?? employee.transportAllowance) +
        (updateEmployeeDto.medicalAllowance ?? employee.medicalAllowance);

      updateEmployeeDto['grossSalary'] = grossSalary;
      updateEmployeeDto['netSalary'] = grossSalary;
    }

    Object.assign(employee, updateEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    employee.isActive = false;
    await this.employeesRepository.save(employee);
  }

  async getStatistics() {
    const total = await this.employeesRepository.count({
      where: { isActive: true },
    });

    const active = await this.employeesRepository.count({
      where: { isActive: true, employmentStatus: EmploymentStatus.ACTIVE },
    });

    const onLeave = await this.employeesRepository.count({
      where: { isActive: true, employmentStatus: EmploymentStatus.ON_LEAVE },
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
}
