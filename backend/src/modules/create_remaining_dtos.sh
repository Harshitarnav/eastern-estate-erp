#!/bin/bash

# Material Exit DTOs
cat > materials/dto/create-material-exit.dto.ts << 'EOF'
import { IsUUID, IsNumber, IsString, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateMaterialExitDto {
  @IsUUID()
  materialId: string;

  @IsUUID()
  @IsOptional()
  constructionProjectId?: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  purpose: string;

  @IsUUID()
  issuedTo: string;

  @IsUUID()
  @IsOptional()
  approvedBy?: string;

  @IsDateString()
  @IsOptional()
  exitDate?: string;

  @IsBoolean()
  @IsOptional()
  returnExpected?: boolean;

  @IsString()
  @IsOptional()
  remarks?: string;
}
EOF

cat > materials/dto/update-material-exit.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialExitDto } from './create-material-exit.dto';

export class UpdateMaterialExitDto extends PartialType(CreateMaterialExitDto) {}
EOF

# Purchase Order Item DTOs
mkdir -p purchase-orders/dto 2>/dev/null
cat > purchase-orders/dto/create-purchase-order-item.dto.ts << 'EOF'
import { IsUUID, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  purchaseOrderId: string;

  @IsUUID()
  materialId: string;

  @IsNumber()
  @Min(0)
  quantityOrdered: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  gstPercentage?: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsString()
  @IsOptional()
  specifications?: string;
}
EOF

cat > purchase-orders/dto/update-purchase-order-item.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderItemDto } from './create-purchase-order-item.dto';

export class UpdatePurchaseOrderItemDto extends PartialType(CreatePurchaseOrderItemDto) {}
EOF

# Daily Progress Report DTOs
cat > construction/dto/create-daily-progress-report.dto.ts << 'EOF'
import { IsUUID, IsDateString, IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';

export class CreateDailyProgressReportDto {
  @IsUUID()
  constructionProjectId: string;

  @IsUUID()
  reportedBy: string;

  @IsDateString()
  reportDate: string;

  @IsString()
  workCompleted: string;

  @IsString()
  @IsOptional()
  workPlannedForNextDay?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  progressPercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  workersPresent?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  workersAbsent?: number;

  @IsString()
  @IsOptional()
  weatherConditions?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
EOF

cat > construction/dto/update-daily-progress-report.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyProgressReportDto } from './create-daily-progress-report.dto';

export class UpdateDailyProgressReportDto extends PartialType(CreateDailyProgressReportDto) {}
EOF

# Pain Point DTOs
cat > construction/dto/create-pain-point.dto.ts << 'EOF'
import { IsUUID, IsEnum, IsString, IsOptional, IsDateString, Length } from 'class-validator';
import { PainPointType, PainPointSeverity, PainPointStatus } from '../entities/pain-point.entity';

export class CreatePainPointDto {
  @IsUUID()
  constructionProjectId: string;

  @IsUUID()
  reportedBy: string;

  @IsEnum(PainPointType)
  painPointType: PainPointType;

  @IsString()
  @Length(1, 255)
  title: string;

  @IsString()
  description: string;

  @IsEnum(PainPointSeverity)
  severity: PainPointSeverity;

  @IsEnum(PainPointStatus)
  @IsOptional()
  status?: PainPointStatus;

  @IsDateString()
  @IsOptional()
  reportedDate?: string;

  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
EOF

cat > construction/dto/update-pain-point.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreatePainPointDto } from './create-pain-point.dto';

export class UpdatePainPointDto extends PartialType(CreatePainPointDto) {}
EOF

# Material Shortage DTOs
cat > construction/dto/create-material-shortage.dto.ts << 'EOF'
import { IsUUID, IsEnum, IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';
import { MaterialShortageStatus, MaterialShortagePriority } from '../entities/material-shortage.entity';

export class CreateMaterialShortageDto {
  @IsUUID()
  constructionProjectId: string;

  @IsUUID()
  materialId: string;

  @IsNumber()
  @Min(0)
  quantityRequired: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantityAvailable?: number;

  @IsNumber()
  @Min(0)
  shortageQuantity: number;

  @IsDateString()
  requiredByDate: string;

  @IsEnum(MaterialShortageStatus)
  @IsOptional()
  status?: MaterialShortageStatus;

  @IsEnum(MaterialShortagePriority)
  priority: MaterialShortagePriority;

  @IsString()
  @IsOptional()
  impactOnSchedule?: string;
}
EOF

cat > construction/dto/update-material-shortage.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialShortageDto } from './create-material-shortage.dto';

export class UpdateMaterialShortageDto extends PartialType(CreateMaterialShortageDto) {}
EOF

# Work Schedule DTOs
cat > construction/dto/create-work-schedule.dto.ts << 'EOF'
import { IsUUID, IsEnum, IsString, IsNumber, IsArray, IsDateString, IsOptional, Min, Length } from 'class-validator';
import { WorkScheduleStatus } from '../entities/work-schedule.entity';

export class CreateWorkScheduleDto {
  @IsUUID()
  constructionProjectId: string;

  @IsString()
  @Length(1, 255)
  taskName: string;

  @IsString()
  @IsOptional()
  taskDescription?: string;

  @IsUUID()
  assignedTo: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(WorkScheduleStatus)
  @IsOptional()
  status?: WorkScheduleStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependencies?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  progressPercentage?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
EOF

cat > construction/dto/update-work-schedule.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkScheduleDto } from './create-work-schedule.dto';

export class UpdateWorkScheduleDto extends PartialType(CreateWorkScheduleDto) {}
EOF

# Vendor Payment DTOs
cat > vendors/dto/create-vendor-payment.dto.ts << 'EOF'
import { IsUUID, IsEnum, IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';
import { PaymentMode } from '../entities/vendor-payment.entity';

export class CreateVendorPaymentDto {
  @IsUUID()
  vendorId: string;

  @IsUUID()
  @IsOptional()
  purchaseOrderId?: string;

  @IsDateString()
  paymentDate: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
EOF

cat > vendors/dto/update-vendor-payment.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateVendorPaymentDto } from './create-vendor-payment.dto';

export class UpdateVendorPaymentDto extends PartialType(CreateVendorPaymentDto) {}
EOF

echo "All DTOs created successfully!"
