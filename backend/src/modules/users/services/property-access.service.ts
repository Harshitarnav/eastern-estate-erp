import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserPropertyAccess, PropertyRole } from '../entities/user-property-access.entity';
import { User } from '../entities/user.entity';
import { Property } from '../../properties/entities/property.entity';

export interface GrantAccessDto {
  userId: string;
  propertyId: string;
  role: PropertyRole;
}

export interface BulkGrantAccessDto {
  userId: string;
  propertyIds: string[];
  role: PropertyRole;
}

@Injectable()
export class PropertyAccessService {
  private readonly logger = new Logger(PropertyAccessService.name);

  constructor(
    @InjectRepository(UserPropertyAccess)
    private propertyAccessRepo: Repository<UserPropertyAccess>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
  ) {}

  /**
   * Get all properties a user has access to
   */
  async getUserProperties(userId: string): Promise<UserPropertyAccess[]> {
    return await this.propertyAccessRepo.find({
      where: { userId, isActive: true },
      relations: ['property'],
      order: { assignedAt: 'DESC' },
    });
  }

  /**
   * Get all users who have access to a property
   */
  async getPropertyUsers(propertyId: string): Promise<UserPropertyAccess[]> {
    return await this.propertyAccessRepo.find({
      where: { propertyId, isActive: true },
      relations: ['user'],
      order: { assignedAt: 'DESC' },
    });
  }

  /**
   * Grant property access to a user
   */
  async grantAccess(
    userId: string,
    propertyId: string,
    role: PropertyRole,
    assignedBy: string,
  ): Promise<UserPropertyAccess> {
    // Verify user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify property exists
    const property = await this.propertyRepo.findOne({ where: { id: propertyId } });
    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check if access already exists
    let access = await this.propertyAccessRepo.findOne({
      where: { userId, propertyId, role },
    });

    if (access) {
      // Reactivate if inactive
      if (!access.isActive) {
        access.isActive = true;
        access.assignedBy = assignedBy;
        access.assignedAt = new Date();
        const updated = await this.propertyAccessRepo.save(access);
        this.logger.log(`Reactivated access for user ${userId} to property ${propertyId} with role ${role}`);
        return updated;
      }
      this.logger.warn(`Access already exists for user ${userId} to property ${propertyId} with role ${role}`);
      return access;
    }

    // Create new access
    access = this.propertyAccessRepo.create({
      userId,
      propertyId,
      role,
      assignedBy,
      assignedAt: new Date(),
      isActive: true,
    });

    const saved = await this.propertyAccessRepo.save(access);
    this.logger.log(`Granted access for user ${userId} to property ${propertyId} with role ${role}`);
    
    return saved;
  }

  /**
   * Revoke property access from a user
   */
  async revokeAccess(
    userId: string,
    propertyId: string,
    role?: PropertyRole,
  ): Promise<void> {
    const where: any = { userId, propertyId };
    if (role) {
      where.role = role;
    }

    const result = await this.propertyAccessRepo.update(where, { isActive: false });
    
    if (result.affected > 0) {
      this.logger.log(`Revoked access for user ${userId} from property ${propertyId}${role ? ` with role ${role}` : ''}`);
    } else {
      this.logger.warn(`No access found to revoke for user ${userId} and property ${propertyId}`);
    }
  }

  /**
   * Check if user has access to a property
   */
  async hasAccess(
    userId: string,
    propertyId: string,
    requiredRoles?: PropertyRole[],
  ): Promise<boolean> {
    const where: any = { userId, propertyId, isActive: true };

    const access = await this.propertyAccessRepo.findOne({ where });

    if (!access) {
      return false;
    }

    if (requiredRoles && requiredRoles.length > 0) {
      return requiredRoles.includes(access.role);
    }

    return true;
  }

  /**
   * Get list of property IDs user has access to
   */
  async getUserPropertyIds(userId: string): Promise<string[]> {
    const accesses = await this.propertyAccessRepo.find({
      where: { userId, isActive: true },
      select: ['propertyId'],
    });

    return accesses.map((a) => a.propertyId);
  }

  /**
   * Check if user is a global admin (super_admin or admin role)
   * Global admins have access to ALL properties
   */
  async isGlobalAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!user) {
      return false;
    }

    const roleNames = user.roles.map(r => r.name);
    return roleNames.includes('super_admin') || roleNames.includes('admin');
  }

  /**
   * Apply property-level filtering to query builder
   * Adds WHERE clause to filter by accessible properties
   * 
   * @param userId - User ID to filter for
   * @param queryBuilder - TypeORM query builder
   * @param propertyColumn - Column name for property ID (e.g., 'flat.propertyId', 'property.id')
   */
  async applyPropertyFilter(
    userId: string,
    queryBuilder: any,
    propertyColumn: string = 'propertyId',
  ): Promise<void> {
    // Check if user is global admin
    const isAdmin = await this.isGlobalAdmin(userId);
    
    if (isAdmin) {
      // Admin sees everything - no filter needed
      return;
    }

    // Get accessible properties
    const propertyIds = await this.getUserPropertyIds(userId);
    
    if (propertyIds.length === 0) {
      // User has no property access - add impossible condition
      queryBuilder.andWhere('1 = 0');
      return;
    }

    // Filter by accessible properties
    queryBuilder.andWhere(`${propertyColumn} IN (:...propertyIds)`, { propertyIds });
  }

  /**
   * Bulk grant access to multiple properties
   */
  async bulkGrantAccess(
    userId: string,
    propertyIds: string[],
    role: PropertyRole,
    assignedBy: string,
  ): Promise<UserPropertyAccess[]> {
    const accesses = [];

    for (const propertyId of propertyIds) {
      try {
        const access = await this.grantAccess(userId, propertyId, role, assignedBy);
        accesses.push(access);
      } catch (error) {
        this.logger.error(`Failed to grant access to property ${propertyId}: ${error.message}`);
      }
    }

    return accesses;
  }

  /**
   * Bulk revoke access from multiple properties
   */
  async bulkRevokeAccess(
    userId: string,
    propertyIds: string[],
    role?: PropertyRole,
  ): Promise<void> {
    for (const propertyId of propertyIds) {
      await this.revokeAccess(userId, propertyId, role);
    }
  }

  /**
   * Get user's property access with specific role
   */
  async getUserPropertiesByRole(
    userId: string,
    role: PropertyRole,
  ): Promise<UserPropertyAccess[]> {
    return await this.propertyAccessRepo.find({
      where: { userId, role, isActive: true },
      relations: ['property'],
    });
  }

  /**
   * Get user's accessible property IDs (or all if global admin)
   */
  async getAccessiblePropertyIds(userId: string): Promise<string[] | null> {
    // Check if global admin (null means all properties)
    const isAdmin = await this.isGlobalAdmin(userId);
    if (isAdmin) {
      return null; // null indicates access to all properties
    }

    // Get specific property IDs
    return await this.getUserPropertyIds(userId);
  }

  /**
   * Update user's role for a specific property
   */
  async updateRole(
    userId: string,
    propertyId: string,
    oldRole: PropertyRole,
    newRole: PropertyRole,
    updatedBy: string,
  ): Promise<UserPropertyAccess> {
    const access = await this.propertyAccessRepo.findOne({
      where: { userId, propertyId, role: oldRole },
    });

    if (!access) {
      throw new NotFoundException(
        `Access not found for user ${userId} to property ${propertyId} with role ${oldRole}`,
      );
    }

    // Check if new role already exists
    const existingNewRole = await this.propertyAccessRepo.findOne({
      where: { userId, propertyId, role: newRole },
    });

    if (existingNewRole && existingNewRole.isActive) {
      throw new BadRequestException(
        `User already has ${newRole} access to this property`,
      );
    }

    access.role = newRole;
    access.assignedBy = updatedBy;
    access.assignedAt = new Date();

    const updated = await this.propertyAccessRepo.save(access);
    this.logger.log(`Updated role for user ${userId} on property ${propertyId} from ${oldRole} to ${newRole}`);
    
    return updated;
  }

  /**
   * Get summary of user's property access
   */
  async getUserAccessSummary(userId: string): Promise<{
    totalProperties: number;
    accessByRole: Record<string, number>;
    properties: UserPropertyAccess[];
  }> {
    const accesses = await this.getUserProperties(userId);

    const accessByRole: Record<string, number> = {};
    accesses.forEach((access) => {
      accessByRole[access.role] = (accessByRole[access.role] || 0) + 1;
    });

    return {
      totalProperties: accesses.length,
      accessByRole,
      properties: accesses,
    };
  }
}
