import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmploymentStatus } from './entities/employee.entity';
import { EmployeeFeedback } from './entities/employee-feedback.entity';
import { EmployeeReview } from './entities/employee-review.entity';
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
    @InjectRepository(EmployeeFeedback)
    private feedbackRepository: Repository<EmployeeFeedback>,
    @InjectRepository(EmployeeReview)
    private reviewRepository: Repository<EmployeeReview>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async generateNextCode(): Promise<string> {
    let attempt = 0;
    while (attempt < 100) {
      const count = await this.employeesRepository.count();
      const candidate = `EMP-${String(count + 1 + attempt).padStart(4, '0')}`;
      const exists = await this.employeesRepository.findOne({ where: { employeeCode: candidate } });
      if (!exists) return candidate;
      attempt++;
    }
    return `EMP-${Date.now()}`;
  }

  async create(createEmployeeDto: CreateEmployeeDto, createdBy?: string): Promise<Employee> {
    // Auto-generate employee code if not provided or blank
    if (!createEmployeeDto.employeeCode?.trim()) {
      createEmployeeDto.employeeCode = await this.generateNextCode();
    }

    // Calculate gross and net salary
    const grossSalary =
      (createEmployeeDto.basicSalary || 0) +
      (createEmployeeDto.houseRentAllowance || 0) +
      (createEmployeeDto.transportAllowance || 0) +
      (createEmployeeDto.medicalAllowance || 0) +
      (createEmployeeDto.otherAllowances || 0);

    const pfDeduction = createEmployeeDto.pfDeduction || 0;
    const esiDeduction = createEmployeeDto.esiDeduction || 0;
    const taxDeduction = createEmployeeDto.taxDeduction || 0;
    const otherDeductions = createEmployeeDto.otherDeductions || 0;
    const netSalary = createEmployeeDto.netSalary ?? (grossSalary - pfDeduction - esiDeduction - taxDeduction - otherDeductions);

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
    } catch (err: any) {
      if (err?.code === '23505' && err?.detail?.includes('employee_code')) {
        throw new ConflictException(`Employee code "${employee.employeeCode}" is already in use. Please choose a different code.`);
      }
      throw err;
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
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    employee.isActive = false;
    await this.employeesRepository.save(employee);
  }

  // ─── Feedback ─────────────────────────────────────────────────────────────

  async createFeedback(employeeId: string, data: Partial<EmployeeFeedback>, createdBy?: string): Promise<EmployeeFeedback> {
    await this.findOne(employeeId); // ensure employee exists
    const feedback = this.feedbackRepository.create({ ...data, employeeId, createdBy });
    return this.feedbackRepository.save(feedback);
  }

  async getFeedback(employeeId: string): Promise<EmployeeFeedback[]> {
    await this.findOne(employeeId);
    return this.feedbackRepository.find({
      where: { employeeId, isActive: true },
      order: { feedbackDate: 'DESC' },
    });
  }

  async updateFeedback(employeeId: string, feedbackId: string, data: Partial<EmployeeFeedback>, updatedBy?: string): Promise<EmployeeFeedback> {
    const feedback = await this.feedbackRepository.findOne({ where: { id: feedbackId, employeeId } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    Object.assign(feedback, data, { updatedBy });
    return this.feedbackRepository.save(feedback);
  }

  async deleteFeedback(employeeId: string, feedbackId: string): Promise<void> {
    const feedback = await this.feedbackRepository.findOne({ where: { id: feedbackId, employeeId } });
    if (!feedback) throw new NotFoundException('Feedback not found');
    feedback.isActive = false;
    await this.feedbackRepository.save(feedback);
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  async createReview(employeeId: string, data: Partial<EmployeeReview>, createdBy?: string): Promise<EmployeeReview> {
    await this.findOne(employeeId);
    const review = this.reviewRepository.create({ ...data, employeeId, createdBy });
    const saved = await this.reviewRepository.save(review);
    // Update employee's lastReviewDate
    await this.employeesRepository.update(employeeId, { lastReviewDate: (data.reviewDate as any) || new Date() });
    return saved;
  }

  async getReviews(employeeId: string): Promise<EmployeeReview[]> {
    await this.findOne(employeeId);
    return this.reviewRepository.find({
      where: { employeeId, isActive: true },
      order: { reviewDate: 'DESC' },
    });
  }

  async updateReview(employeeId: string, reviewId: string, data: Partial<EmployeeReview>, updatedBy?: string): Promise<EmployeeReview> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId, employeeId } });
    if (!review) throw new NotFoundException('Review not found');
    Object.assign(review, data, { updatedBy });
    return this.reviewRepository.save(review);
  }

  async deleteReview(employeeId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId, employeeId } });
    if (!review) throw new NotFoundException('Review not found');
    review.isActive = false;
    await this.reviewRepository.save(review);
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
