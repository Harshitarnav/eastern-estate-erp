import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee, EmploymentStatus } from './entities/employee.entity';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  QueryEmployeeDto,
  PaginatedEmployeeResponseDto,
} from './dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, createdBy?: string): Promise<Employee> {
    // Calculate gross and net salary
    const grossSalary =
      (createEmployeeDto.basicSalary || 0) +
      (createEmployeeDto.houseRentAllowance || 0) +
      (createEmployeeDto.transportAllowance || 0) +
      (createEmployeeDto.medicalAllowance || 0);

    const netSalary = grossSalary; // Deductions will be calculated later

    // Create employee entity
    const employee = new Employee();
    Object.assign(employee, createEmployeeDto);
    employee.grossSalary = grossSalary;
    employee.netSalary = netSalary;
    employee.casualLeaveBalance = 12;
    employee.sickLeaveBalance = 12;
    employee.earnedLeaveBalance = 15;

    const savedEmployee = await this.employeesRepository.save(employee);

    // Auto-create user account for employee
    try {
      await this.createUserForEmployee(savedEmployee, createdBy);
    } catch (error) {
      this.logger.error(`Failed to auto-create user for employee ${savedEmployee.id}:`, error);
      // Don't fail employee creation if user creation fails
      // Admin will need to create user manually
    }

    return savedEmployee;
  }

  /**
   * Auto-create user account for employee
   * Username: extracted from email (e.g., arnav@eecd.in -> arnav)
   * Password: {username}@easternestate (e.g., arnav@easternestate)
   * Default role: staff (minimal access)
   */
  private async createUserForEmployee(employee: Employee, createdBy?: string): Promise<void> {
    // Extract username from email
    const username = employee.email.split('@')[0];
    const password = `${username}@easternestate`;

    // Check if user already exists
    try {
      const existingUser = await this.usersService.findByEmail(employee.email);
      if (existingUser) {
        this.logger.log(`User already exists for employee ${employee.email}`);
        return;
      }
    } catch (error) {
      // User doesn't exist, continue with creation
    }

    try {
      // Get the 'staff' role ID
      const staffRole = await this.usersService.getRoleByName('staff');
      
      // Create user with staff role
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

      // Send notification to admins
      await this.notificationsService.create({
        targetRoles: 'admin,super_admin',
        title: 'New Employee User Account Created',
        message: `User account created for ${employee.fullName} (${employee.email}). Default credentials assigned. Please assign appropriate role and property access.`,
        type: NotificationType.INFO,
        category: NotificationCategory.EMPLOYEE,
        actionUrl: `/employees/${employee.id}`,
        actionLabel: 'View Employee',
        shouldSendEmail: true,
      }, createdBy);

      // Update employee with userId
      employee.userId = user.id;
      await this.employeesRepository.save(employee);

    } catch (error) {
      this.logger.error(`Failed to create user for employee ${employee.email}:`, error.message);
      throw error;
    }
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
