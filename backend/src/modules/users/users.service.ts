import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createUserDto: CreateUserDto, createdById?: string) {
    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this email or username');
    }

    // Hash password
    const password = await bcrypt.hash(createUserDto.password, 12);

    // Get roles (only active roles)
    const roles = await this.rolesRepository.find({
      where: { 
        id: In(createUserDto.roleIds || []),
        isActive: true 
      }
    });

    const user = this.usersRepository.create({
      ...createUserDto,
      password,
      roles,
      createdBy: createdById,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(query?: any) {
    const { page = 1, limit = 10, search, role, isActive } = query;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.phone',
        'user.profileImage',
        'user.isActive',
        'user.isVerified',
        'user.lastLoginAt',
        'user.createdAt',
        'roles',
      ]);

    if (search) {
      queryBuilder.where(
        'user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('roles.name = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

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

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async getRoleByName(roleName: string): Promise<Role | null> {
    return await this.rolesRepository.findOne({
      where: { name: roleName, isActive: true },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedById?: string) {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (updateUserDto.password) {
      updateUserDto['password'] = await bcrypt.hash(updateUserDto.password, 12);
      delete updateUserDto.password;
    }

    if (updateUserDto.roleIds) {
      const roles = await this.rolesRepository.find({
        where: { 
          id: In(updateUserDto.roleIds),
          isActive: true 
        }
      });
      user.roles = roles;
      delete updateUserDto.roleIds;
    }

    Object.assign(user, updateUserDto);
    user.updatedBy = updatedById;

    return await this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
    return { message: 'User deleted successfully' };
  }

  async toggleActive(id: string) {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return await this.usersRepository.save(user);
  }

  async findAllRoles() {
    return await this.rolesRepository.find({
      where: { isActive: true },
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  async findOneRole(id: string) {
    const role = await this.rolesRepository.findOne({
      where: { id, isActive: true },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async findAllPermissions() {
    return await this.permissionsRepository.find({
      order: { name: 'ASC' },
    });
  }
}
