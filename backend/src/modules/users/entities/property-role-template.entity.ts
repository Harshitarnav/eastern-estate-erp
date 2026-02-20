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
import { Property } from '../../properties/entities/property.entity';
import { PropertyRole } from './user-property-access.entity';

@Entity('property_role_templates')
@Index(['propertyId', 'role', 'emailPattern'], { unique: true })
export class PropertyRoleTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  role: PropertyRole;

  @Column({ name: 'email_pattern', type: 'varchar', length: 255, nullable: true })
  emailPattern: string | null;

  @Column({ name: 'auto_assign', default: false })
  @Index()
  autoAssign: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
