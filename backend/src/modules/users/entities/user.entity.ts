import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { UserPropertyAccess } from './user-property-access.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, length: 100 })
  username: string;

  @Column({ name: 'password_hash', select: false })  // ← ADD THIS MAPPING!
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 20 })
  alternatePhone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true, length: 20 })
  gender: string;

  @Column({ type: 'text', nullable: true })
  profileImage: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date;

  // Email domain fields for access control
  @Column({ name: 'email_domain', nullable: true })
  emailDomain: string;

  @Column({ name: 'allowed_domain', default: 'eecd.in' })
  allowedDomain: string;

  @Column({ name: 'is_domain_verified', default: false })
  isDomainVerified: boolean;

  // Property access relationship
  @OneToMany(() => UserPropertyAccess, (access) => access.user)
  propertyAccess: UserPropertyAccess[];

  // @ManyToMany(() => Role, role => role.users, { eager: true })
  // @JoinTable({ name: 'user_roles' })
  // roles: Role[];

  // ✅ FIX: Add type UUID instead of User
  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',  // Changed from default 'usersId'
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',  // Changed from default 'rolesId'
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}