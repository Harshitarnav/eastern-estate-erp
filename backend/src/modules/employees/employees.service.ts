import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, QueryFailedError } from 'typeorm';
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
  private readonly dbFieldLabels: Record<string, string> = {
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
    // Use values from DTO if provided; otherwise apply sensible defaults
    if (createEmployeeDto.casualLeaveBalance === undefined) {
      employee.casualLeaveBalance = 12;
    }
    if (createEmployeeDto.sickLeaveBalance === undefined) {
      employee.sickLeaveBalance = 12;
    }
    if (createEmployeeDto.earnedLeaveBalance === undefined) {
      employee.earnedLeaveBalance = 15;
    }

    let savedEmployee: Employee;
    try {
      savedEmployee = await this.employeesRepository.save(employee);
    } catch (error) {
      this.handlePersistenceError(error);
    }

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
    if (!employee.email?.trim()) {
      this.logger.log(`Skipping user creation for employee ${employee.id} because no email was provided`);
      return;
    }

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

    // Recalculate grossSalary when any salary component changes.
    // netSalary is only auto-set to grossSalary when the caller did NOT explicitly
    // provide it (i.e. the HR team entered a post-deduction value manually).
    if (
      updateEmployeeDto.basicSalary !== undefined ||
      updateEmployeeDto.houseRentAllowance !== undefined ||
      updateEmployeeDto.transportAllowance !== undefined ||
      updateEmployeeDto.medicalAllowance !== undefined ||
      updateEmployeeDto.otherAllowances !== undefined
    ) {
      const grossSalary =
        (updateEmployeeDto.basicSalary ?? employee.basicSalary ?? 0) +
        (updateEmployeeDto.houseRentAllowance ?? employee.houseRentAllowance ?? 0) +
        (updateEmployeeDto.transportAllowance ?? employee.transportAllowance ?? 0) +
        (updateEmployeeDto.medicalAllowance ?? employee.medicalAllowance ?? 0) +
        (updateEmployeeDto.otherAllowances ?? employee.otherAllowances ?? 0);

      updateEmployeeDto['grossSalary'] = grossSalary;

      // Only auto-set netSalary if the caller didn't supply it explicitly
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
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  private handlePersistenceError(error: unknown): never {
    if (this.isUniqueConstraintError(error)) {
      const field = this.extractFieldName(error);
      if (field === 'employeeCode') {
        throw new ConflictException('Employee Code already exists. Please use a different code.');
      }

      if (field === 'email') {
        throw new ConflictException('Email already exists. Please use a different email address.');
      }

      throw new ConflictException(
        `${this.getFieldLabel(field) || 'This value'} already exists. Please use a different value.`,
      );
    }

    if (this.isNotNullConstraintError(error)) {
      const field = this.extractFieldName(error);
      throw new BadRequestException(
        `${this.getFieldLabel(field) || 'This field'} is required. Please fill it in and try again.`,
      );
    }

    if (this.isInvalidValueError(error)) {
      const field = this.extractFieldName(error);
      throw new BadRequestException(
        `${this.getFieldLabel(field) || 'One of the fields'} has an invalid value. Please review the form and try again.`,
      );
    }

    this.logger.error('Unexpected employee persistence error', error instanceof Error ? error.stack : String(error));
    throw new InternalServerErrorException('Unable to save employee right now. Please try again.');
  }

  private isUniqueConstraintError(error: unknown): boolean {
    const dbCode = this.getDbErrorCode(error);
    const message = this.getDbErrorMessage(error).toLowerCase();

    return (
      dbCode === '23505' ||
      dbCode === 'ER_DUP_ENTRY' ||
      dbCode === 'SQLITE_CONSTRAINT' ||
      message.includes('duplicate key') ||
      message.includes('unique constraint') ||
      message.includes('already exists')
    );
  }

  private isNotNullConstraintError(error: unknown): boolean {
    const dbCode = this.getDbErrorCode(error);
    const message = this.getDbErrorMessage(error).toLowerCase();

    return (
      dbCode === '23502' ||
      message.includes('null value in column') ||
      message.includes('not-null constraint')
    );
  }

  private isInvalidValueError(error: unknown): boolean {
    const dbCode = this.getDbErrorCode(error);
    const message = this.getDbErrorMessage(error).toLowerCase();

    return (
      dbCode === '22P02' ||
      message.includes('invalid input syntax') ||
      message.includes('invalid enum value') ||
      message.includes('date/time field value out of range')
    );
  }

  private getDbErrorCode(error: unknown): string | undefined {
    if (error instanceof QueryFailedError) {
      return (error as any)?.driverError?.code;
    }

    return (error as any)?.code ?? (error as any)?.driverError?.code;
  }

  private getDbErrorMessage(error: unknown): string {
    if (error instanceof QueryFailedError) {
      return (
        (error as any)?.driverError?.detail ||
        (error as any)?.driverError?.message ||
        error.message ||
        ''
      );
    }

    return (
      (error as any)?.driverError?.detail ||
      (error as any)?.driverError?.message ||
      (error as any)?.message ||
      ''
    );
  }

  private extractFieldName(error: unknown): string | undefined {
    const directColumn =
      (error as any)?.column ||
      (error as any)?.driverError?.column;

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

  private getFieldLabel(field?: string): string | undefined {
    if (!field) return undefined;
    return this.dbFieldLabels[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
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
