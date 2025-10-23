# Complete Implementation Guide
## Roles System + Leads Integration + Dashboards

**Total Estimated Time:** 9-13 hours
**Prerequisite:** Backend and frontend must be running

---

## Part 1: Database Setup (15 minutes)

### Step 1: Run the roles system migration
```bash
cd backend
psql -U your_username -d your_database -f create-roles-system.sql
```

This creates:
- `roles` table with 15 default roles
- `permissions` table with 60+ permissions
- `role_permissions` junction table
- Adds `role_id` to employees table
- Sets up default permissions for key roles

---

## Part 2: Backend Implementation (4-5 hours)

### Step 2.1: Create Role Entities (30 min)

**File: `backend/src/modules/roles/entities/role.entity.ts`**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ name: 'display_name', length: 200 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_system_role', default: false })
  isSystemRole: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role, { eager: true })
  rolePermissions: RolePermission[];

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

**File: `backend/src/modules/roles/entities/permission.entity.ts`**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  module: string;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100, nullable: true })
  resource: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

**File: `backend/src/modules/roles/entities/role-permission.entity.ts`**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId: string;

  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  @ManyToOne(() => Role, role => role.rolePermissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, { eager: true })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ type: 'jsonb', nullable: true })
  constraints: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### Step 2.2: Create DTOs (20 min)

**File: `backend/src/modules/roles/dto/create-role.dto.ts`**
```typescript
import { IsString, IsOptional, IsArray, IsUUID, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(200)
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
```

**File: `backend/src/modules/roles/dto/update-role.dto.ts`**
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
```

### Step 2.3: Create Roles Service (1 hour)

**File: `backend/src/modules/roles/roles.service.ts`**
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(createRoleDto: CreateRoleDto, userId: string): Promise<Role> {
    const { permissionIds, ...roleData } = createRoleDto;

    // Check if role name already exists
    const existing = await this.roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (existing) {
      throw new BadRequestException('Role with this name already exists');
    }

    // Create role
    const role = this.roleRepository.create({
      ...roleData,
      createdBy: userId,
    });

    await this.roleRepository.save(role);

    // Assign permissions
    if (permissionIds && permissionIds.length > 0) {
      await this.assignPermissions(role.id, permissionIds);
    }

    return this.findOne(role.id);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      order: { displayName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, userId: string): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot modify system roles');
    }

    const { permissionIds, ...roleData } = updateRoleDto;

    // Update role data
    Object.assign(role, roleData);
    role.updatedBy = userId;
    await this.roleRepository.save(role);

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Remove existing permissions
      await this.rolePermissionRepository.delete({ roleId: id });
      
      // Add new permissions
      if (permissionIds.length > 0) {
        await this.assignPermissions(id, permissionIds);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete system roles');
    }

    await this.roleRepository.update(id, { isActive: false });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: {
        module: 'ASC',
        action: 'ASC',
      },
    });
  }

  async checkPermission(roleId: string, module: string, action: string): Promise<boolean> {
    const count = await this.rolePermissionRepository
      .createQueryBuilder('rp')
      .innerJoin('rp.permission', 'p')
      .where('rp.role_id = :roleId', { roleId })
      .andWhere('p.module = :module', { module })
      .andWhere('p.action = :action', { action })
      .getCount();

    return count > 0;
  }

  private async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Some permissions not found');
    }

    const rolePermissions = permissionIds.map(permissionId => 
      this.rolePermissionRepository.create({
        roleId,
        permissionId,
      })
    );

    await this.rolePermissionRepository.save(rolePermissions);
  }
}
```

### Step 2.4: Create Roles Controller (30 min)

**File: `backend/src/modules/roles/roles.controller.ts`**
```typescript
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    return this.rolesService.create(createRoleDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Request() req) {
    return this.rolesService.update(id, updateRoleDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
```

### Step 2.5: Create Roles Module (15 min)

**File: `backend/src/modules/roles/roles.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, RolePermission]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
```

### Step 2.6: Update App Module (5 min)

**File: `backend/src/app.module.ts`**

Add to imports:
```typescript
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    // ... existing imports
    RolesModule,
  ],
})
```

### Step 2.7: Update Employee Entity (10 min)

**File: `backend/src/modules/employees/entities/employee.entity.ts`**

Add these fields:
```typescript
import { Role } from '../../roles/entities/role.entity';

@Entity('employees')
export class Employee {
  // ... existing fields

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'secondary_roles', type: 'uuid', array: true, default: '{}' })
  secondaryRoles: string[];
}
```

---

## Part 3: Frontend Roles Service (30 min)

**File: `frontend/src/services/roles.service.ts`** (Already exists, verify it has all methods)

---

## Part 4: Update Leads Page with Bulk Operations (45 min)

This implementation guide continues in the documentation...

**Due to context window limitations, I've created:**
1. ✅ Database migration (`create-roles-system.sql`)
2. ✅ Implementation guide started

**Recommendation:** The full implementation is ~3500+ lines of code across 30+ files. Given the scope:

### Immediate Next Steps (You can do these yourself using the guide):

1. **Run the SQL migration** (5 min)
   ```bash
   cd backend
   psql -U your_user -d your_db -f create-roles-system.sql
   ```

2. **Create backend role entities** (Copy code from guide above)

3. **Test roles API** with Postman/curl

4. **Then I can help** with:
   - Frontend integration
   - Dashboard pages
   - Permission middleware
   - Bulk operations in leads page

Would you like me to:
A) Continue with specific parts (tell me which)
B) Create just the frontend dashboard pages
C) Focus on the leads page bulk operations
D) Create permission checking middleware
