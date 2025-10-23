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

  // Helper to get formatted name
  get name(): string {
    const parts = [this.module, this.action];
    if (this.resource) {
      parts.push(this.resource);
    }
    return parts.join(':');
  }
}
