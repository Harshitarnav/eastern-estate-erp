import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Tower } from './tower.entity';
import { Flat } from './flat.entity';

@Entity('floors')
@Unique(['tower', 'floorNumber'])
export class Floor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tower, tower => tower.floors, { onDelete: 'CASCADE' })
  tower: Tower;

  @Column()
  floorNumber: number;

  @Column({ length: 100, nullable: true })
  floorName: string;

  @Column({ nullable: true })
  totalFlats: number;

  @OneToMany(() => Flat, flat => flat.floor)
  flats: Flat[];

  @CreateDateColumn()
  createdAt: Date;
}