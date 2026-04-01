import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, QueryEmployeeDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

/**
 * Employees Controller
 * 
 * Access Control:
 * - CREATE: HR, Admin, Super Admin only
 * - READ (List/Single): All authenticated users (employees can view their own profile)
 * - UPDATE: HR, Admin, Super Admin only
 * - DELETE: Admin, Super Admin only
 * 
 * Flow:
 * 1. HR/Admin creates employee record → Employee gets HR profile
 * 2. Admin creates user account → Employee gets login access
 * 3. Admin links employee.userId to user.id → Complete onboarding
 * 4. Admin assigns property access → Employee can access assigned properties
 */
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  /**
   * Create new employee record
   * Requires: HR, Admin, or Super Admin role
   */
  @Post()
  @Roles('hr', 'admin', 'super_admin')
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  /**
   * Get all employees (paginated)
   * Any authenticated user can view employee list
   */
  @Get()
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  /**
   * Get employee statistics
   * Any authenticated user can view statistics
   */
  @Get('statistics')
  getStatistics() {
    return this.employeesService.getStatistics();
  }

  @Get('next-code')
  getNextCode() {
    return this.employeesService.generateNextCode().then(code => ({ code }));
  }

  /**
   * Get single employee by ID
   * Any authenticated user can view employee details
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  /**
   * Update employee record
   * Requires: HR, Admin, or Super Admin role
   */
  @Patch(':id')
  @Roles('hr', 'admin', 'super_admin')
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  /**
   * Update employee record (PUT method)
   * Requires: HR, Admin, or Super Admin role
   */
  @Put(':id')
  @Roles('hr', 'admin', 'super_admin')
  replace(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  /**
   * Delete employee record
   * Requires: Admin or Super Admin role only
   */
  @Delete(':id')
  @Roles('admin', 'super_admin')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  // ─── Feedback routes ──────────────────────────────────────────────────────

  @Get(':id/feedback')
  getFeedback(@Param('id') id: string) {
    return this.employeesService.getFeedback(id);
  }

  @Post(':id/feedback')
  @Roles('hr', 'admin', 'super_admin')
  createFeedback(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.employeesService.createFeedback(id, body, req.user?.id);
  }

  @Patch(':id/feedback/:feedbackId')
  @Roles('hr', 'admin', 'super_admin')
  updateFeedback(@Param('id') id: string, @Param('feedbackId') feedbackId: string, @Body() body: any, @Request() req: any) {
    return this.employeesService.updateFeedback(id, feedbackId, body, req.user?.id);
  }

  @Delete(':id/feedback/:feedbackId')
  @Roles('hr', 'admin', 'super_admin')
  deleteFeedback(@Param('id') id: string, @Param('feedbackId') feedbackId: string) {
    return this.employeesService.deleteFeedback(id, feedbackId);
  }

  // ─── Review routes ────────────────────────────────────────────────────────

  @Get(':id/reviews')
  getReviews(@Param('id') id: string) {
    return this.employeesService.getReviews(id);
  }

  @Post(':id/reviews')
  @Roles('hr', 'admin', 'super_admin')
  createReview(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.employeesService.createReview(id, body, req.user?.id);
  }

  @Patch(':id/reviews/:reviewId')
  @Roles('hr', 'admin', 'super_admin')
  updateReview(@Param('id') id: string, @Param('reviewId') reviewId: string, @Body() body: any, @Request() req: any) {
    return this.employeesService.updateReview(id, reviewId, body, req.user?.id);
  }

  @Delete(':id/reviews/:reviewId')
  @Roles('hr', 'admin', 'super_admin')
  deleteReview(@Param('id') id: string, @Param('reviewId') reviewId: string) {
    return this.employeesService.deleteReview(id, reviewId);
  }
}
