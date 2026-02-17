import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropertyAccessService, GrantAccessDto, BulkGrantAccessDto } from '../services/property-access.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.constant';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType, NotificationCategory } from '../../notifications/entities/notification.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PropertyAccessController {
  constructor(
    private readonly propertyAccessService: PropertyAccessService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Grant property access to a user
   * Admin/Super Admin only
   */
  @Post('property-access/grant')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async grantAccess(
    @Body() grantAccessDto: GrantAccessDto,
    @Request() req: any,
  ) {
    const access = await this.propertyAccessService.grantAccess(
      grantAccessDto.userId,
      grantAccessDto.propertyId,
      grantAccessDto.role,
      req.user.id,
    );

    // Send notification to user
    await this.notificationsService.create({
      userId: grantAccessDto.userId,
      title: 'Property Access Granted',
      message: `You have been granted ${grantAccessDto.role} access to a property.`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.SYSTEM,
      actionUrl: '/properties',
      actionLabel: 'View Properties',
    }, req.user.id);

    return access;
  }

  /**
   * Bulk grant property access
   * Admin/Super Admin only
   */
  @Post('property-access/bulk-grant')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async bulkGrantAccess(
    @Body() bulkGrantDto: BulkGrantAccessDto,
    @Request() req: any,
  ) {
    const accesses = await this.propertyAccessService.bulkGrantAccess(
      bulkGrantDto.userId,
      bulkGrantDto.propertyIds,
      bulkGrantDto.role,
      req.user.id,
    );

    // Send notification to user
    await this.notificationsService.create({
      userId: bulkGrantDto.userId,
      title: 'Property Access Updated',
      message: `You have been granted access to ${bulkGrantDto.propertyIds.length} properties.`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.SYSTEM,
      actionUrl: '/properties',
      actionLabel: 'View Properties',
    }, req.user.id);

    return accesses;
  }

  /**
   * Revoke property access from a user
   * Admin/Super Admin only
   */
  @Post('property-access/revoke')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async revokeAccess(
    @Body() body: { userId: string; propertyId: string; role?: string },
    @Request() req: any,
  ) {
    await this.propertyAccessService.revokeAccess(
      body.userId,
      body.propertyId,
      body.role as any,
    );

    // Send notification to user
    await this.notificationsService.create({
      userId: body.userId,
      title: 'Property Access Revoked',
      message: 'Your access to a property has been revoked.',
      type: NotificationType.INFO,
      category: NotificationCategory.SYSTEM,
    }, req.user.id);

    return { message: 'Access revoked successfully' };
  }

  /**
   * Get all users with their property access
   * Admin/Super Admin only
   */
  @Get('property-access/all')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllPropertyAccess() {
    // This would need to be implemented in the service
    return { message: 'Endpoint for listing all property access' };
  }

  /**
   * Get property access for a specific user
   * Admin/Super Admin only
   */
  @Get(':userId/property-access')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getUserPropertyAccess(@Param('userId') userId: string) {
    return this.propertyAccessService.getUserProperties(userId);
  }

  /**
   * Grant property access to a specific user (alternative endpoint)
   * Admin/Super Admin only
   */
  @Post(':userId/property-access')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async grantAccessToUser(
    @Param('userId') userId: string,
    @Body() body: { propertyId: string; role: string },
    @Request() req: any,
  ) {
    const access = await this.propertyAccessService.grantAccess(
      userId,
      body.propertyId,
      body.role as any,
      req.user.id,
    );

    // Send notification to user
    await this.notificationsService.create({
      userId: userId,
      title: 'Property Access Granted',
      message: `You have been granted ${body.role} access to a property.`,
      type: NotificationType.SUCCESS,
      category: NotificationCategory.SYSTEM,
      actionUrl: '/properties',
      actionLabel: 'View Properties',
    }, req.user.id);

    return access;
  }

  /**
   * Revoke property access from a specific user (alternative endpoint)
   * Admin/Super Admin only
   * IMPORTANT: This must be LAST because :userId and :propertyId are params that match everything
   */
  @Delete(':userId/property-access/:propertyId')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async revokeAccessFromUser(
    @Param('userId') userId: string,
    @Param('propertyId') propertyId: string,
    @Query('role') role: string,
    @Request() req: any,
  ) {
    await this.propertyAccessService.revokeAccess(
      userId,
      propertyId,
      role as any,
    );

    // Send notification to user
    await this.notificationsService.create({
      userId: userId,
      title: 'Property Access Revoked',
      message: `Your ${role} access to a property has been revoked.`,
      type: NotificationType.INFO,
      category: NotificationCategory.SYSTEM,
    }, req.user.id);

    return { message: 'Access revoked successfully' };
  }
}
