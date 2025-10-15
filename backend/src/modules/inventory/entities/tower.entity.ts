import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';
import { Floor } from './floor.entity';
import { Flat } from './flat.entity';
import { User } from '../../users/entities/user.entity';

@Entity('towers')
export class Tower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, property => property.towers, { onDelete: 'CASCADE' })
  property: Property;

  @Column({ length: 50 })
  towerCode: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  totalFloors: number;

  @Column({ nullable: true })
  flatsPerFloor: number;

  @Column({ nullable: true })
  totalFlats: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  towerSize: number;

  @Column({ length: 50, nullable: true })
  facing: string;

  @Column({ length: 100, nullable: true })
  position: string;

  @Column({ default: false })
  hasLift: boolean;

  @Column({ default: 0 })
  numberOfLifts: number;

  @Column({ nullable: true })
  liftCapacity: number;

  @Column({ default: true })
  hasStairs: boolean;

  @Column({ default: 1 })
  numberOfStairs: number;

  @Column({ length: 50, nullable: true })
  parkingType: string;

  @Column({ nullable: true })
  parkingCapacity: number;

  @Column({ default: false })
  hasGym: boolean;

  @Column({ default: false })
  hasGarden: boolean;

  @Column({ default: false })
  hasSecurityAlarm: boolean;

  @Column({ default: false })
  hasFireAlarm: boolean;

  @Column({ default: false })
  isVastuCompliant: boolean;

  @Column({ default: false })
  hasCentralAc: boolean;

  @Column({ default: false })
  hasIntercom: boolean;

  @Column({ type: 'jsonb', nullable: true })
  layoutImages: any;

  @Column({ type: 'jsonb', nullable: true })
  arialViewImages: any;

  @Column({ type: 'jsonb', nullable: true })
  amenities: any;

  @Column({ type: 'text', nullable: true })
  surroundingDescription: string;

  @Column({ length: 50, default: 'Active' })
  status: string;

  @OneToMany(() => Floor, floor => floor.tower)
  floors: Floor[];

  @OneToMany(() => Flat, flat => flat.tower)
  flats: Flat[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}