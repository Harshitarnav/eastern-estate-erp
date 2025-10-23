import { IsString, IsOptional, IsEnum, IsUUID, IsBoolean, IsInt, IsObject, MaxLength } from 'class-validator';
import { NotificationType, NotificationCategory } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  targetRoles?: string;

  @IsOptional()
  @IsString()
  targetDepartments?: string;

  @IsString()
  @MaxLength(500)
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionLabel?: string;

  @IsOptional()
  @IsUUID()
  relatedEntityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  relatedEntityType?: string;

  @IsOptional()
  @IsBoolean()
  shouldSendEmail?: boolean;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
