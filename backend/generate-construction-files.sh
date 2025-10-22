#!/bin/bash

# Auto-generate all Construction Module files
# Run from backend directory: bash generate-construction-files.sh

echo "🏗️  Generating Construction Module Files..."

# Create directories
mkdir -p src/modules/purchase-orders/dto
mkdir -p src/modules/construction/dto

# ==========================================
# PURCHASE ORDER DTOs
# ==========================================

# PO Response DTO
cat > src/modules/purchase-orders/dto/purchase-order-response.dto.ts << 'EOF'
export class PurchaseOrderResponseDto {
  id: string;
  poNumber: string;
  poDate: string;
  vendorId: string;
  vendorName?: string;
  propertyId: string | null;
  propertyName?: string | null;
  status: string;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
EOF

# PO Item Create DTO
cat > src/modules/purchase-orders/dto/create-purchase-order-item.dto.ts << 'EOF'
import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @IsUUID()
  purchaseOrderId: string;

  @IsUUID()
  materialId: string;

  @IsNumber()
  @Min(0.001)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  taxPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountPercentage?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
EOF

# PO Item Update DTO
cat > src/modules/purchase-orders/dto/update-purchase-order-item.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderItemDto } from './create-purchase-order-item.dto';

export class UpdatePurchaseOrderItemDto extends PartialType(CreatePurchaseOrderItemDto) {}
EOF

# Index file
cat > src/modules/purchase-orders/dto/index.ts << 'EOF'
export * from './create-purchase-order.dto';
export * from './update-purchase-order.dto';
export * from './query-purchase-order.dto';
export * from './purchase-order-response.dto';
export * from './create-purchase-order-item.dto';
export * from './update-purchase-order-item.dto';
EOF

# ==========================================
# CONSTRUCTION PROJECT DTOs
# ==========================================

cat > src/modules/construction/dto/create-construction-project.dto.ts << 'EOF'
import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsDateString, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ConstructionProjectPhase, ConstructionProjectStatus } from '../entities/construction-project.entity';

export class CreateConstructionProjectDto {
  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsUUID()
  towerId?: string;

  @IsOptional()
  @IsString()
  projectCode?: string;

  @IsString()
  projectName: string;

  @IsOptional()
  @IsEnum(ConstructionProjectPhase)
  projectPhase?: ConstructionProjectPhase;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expectedCompletionDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  overallProgress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  structureProgress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interiorProgress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  finishingProgress?: number;

  @IsOptional()
  @IsUUID()
  siteEngineerId?: string;

  @IsOptional()
  @IsString()
  contractorName?: string;

  @IsOptional()
  @IsString()
  contractorContact?: string;

  @IsOptional()
  @IsEnum(ConstructionProjectStatus)
  status?: ConstructionProjectStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  budgetAllocated?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
EOF

cat > src/modules/construction/dto/update-construction-project.dto.ts << 'EOF'
import { PartialType } from '@nestjs/mapped-types';
import { CreateConstructionProjectDto } from './create-construction-project.dto';

export class UpdateConstructionProjectDto extends PartialType(CreateConstructionProjectDto) {}
EOF

cat > src/modules/construction/dto/index.ts << 'EOF'
export * from './create-construction-project.dto';
export * from './update-construction-project.dto';
EOF

echo "✅ All DTOs created!"

# ==========================================
# MODULES
# ==========================================

cat > src/modules/purchase-orders/purchase-orders.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderItem])],
  controllers: [],
  providers: [],
  exports: [],
})
export class PurchaseOrdersModule {}
EOF

cat > src/modules/construction/construction.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { ConstructionTeam } from './entities/construction-team.entity';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConstructionProject, ConstructionTeam, ConstructionProgressLog])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ConstructionModule {}
EOF

echo "✅ Modules created!"
echo "🎉 Construction Module files generated successfully!"
echo ""
echo "Next steps:"
echo "1. Update app.module.ts to import these modules"
echo "2. Create services and controllers as needed"
echo "3. Test with: npm run start:dev"
