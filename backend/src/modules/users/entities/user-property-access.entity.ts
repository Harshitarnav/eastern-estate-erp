import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from '../../properties/entities/property.entity';

export enum PropertyRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Sees everything
  ADMIN = 'ADMIN', // Sees everything
  PROPERTY_ADMIN = 'PROPERTY_ADMIN', // Full access to specific property
  GM_SALES = 'GM_SALES', // Sales GM for specific property
  GM_MARKETING = 'GM_MARKETING', // Marketing GM for specific property
  GM_CONSTRUCTION = 'GM_CONSTRUCTION', // Construction GM for specific property
  PROPERTY_VIEWER = 'PROPERTY_VIEWER', // Read-only access to specific property
}

@Entity('user_property_access')
@Index(['userId', 'propertyId', 'role'], { unique: true })
export class UserPropertyAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'property_id', type: 'uuid' })
  @Index()
  propertyId: string;

  @ManyToOne(() => Property, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({
    type: 'varchar',
    length: 50,
  })
  @Index()
  role: PropertyRole;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: true })
  assignedBy: string;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
