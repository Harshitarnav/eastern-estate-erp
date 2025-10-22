#!/bin/bash

# VendorsService
cat > vendors/vendors.service.ts << 'EOF'
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorsRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const existing = await this.vendorsRepository.findOne({
      where: { vendorCode: createVendorDto.vendorCode },
    });

    if (existing) {
      throw new ConflictException(`Vendor with code ${createVendorDto.vendorCode} already exists`);
    }

    const vendor = this.vendorsRepository.create(createVendorDto);
    return await this.vendorsRepository.save(vendor);
  }

  async findAll(filters?: { isActive?: boolean; rating?: number }): Promise<Vendor[]> {
    const query = this.vendorsRepository.createQueryBuilder('vendor');

    if (filters?.isActive !== undefined) {
      query.andWhere('vendor.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.rating !== undefined) {
      query.andWhere('vendor.rating >= :rating', { rating: filters.rating });
    }

    return await query.orderBy('vendor.vendorName', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorsRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    Object.assign(vendor, updateVendorDto);
    return await this.vendorsRepository.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    vendor.isActive = false;
    await this.vendorsRepository.save(vendor);
  }

  async updateOutstanding(id: string, amount: number, operation: 'add' | 'subtract'): Promise<Vendor> {
    const vendor = await this.findOne(id);
    
    if (operation === 'add') {
      vendor.outstandingAmount = Number(vendor.outstandingAmount) + amount;
    } else {
      vendor.outstandingAmount = Math.max(0, Number(vendor.outstandingAmount) - amount);
    }

    if (vendor.isCreditLimitExceeded) {
      throw new ConflictException('Credit limit exceeded');
    }

    return await this.vendorsRepository.save(vendor);
  }

  async getTopVendors(limit: number = 10): Promise<Vendor[]> {
    return await this.vendorsRepository
      .createQueryBuilder('vendor')
      .where('vendor.isActive = :isActive', { isActive: true })
      .orderBy('vendor.rating', 'DESC')
      .limit(limit)
      .getMany();
  }
}
EOF

# Construction ProjectsService
cat > construction/construction-projects.service.ts << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProject } from './entities/construction-project.entity';
import { CreateConstructionProjectDto } from './dto/create-construction-project.dto';
import { UpdateConstructionProjectDto } from './dto/update-construction-project.dto';

@Injectable()
export class ConstructionProjectsService {
  constructor(
    @InjectRepository(ConstructionProject)
    private projectsRepository: Repository<ConstructionProject>,
  ) {}

  async create(createDto: CreateConstructionProjectDto, userId: string): Promise<ConstructionProject> {
    const project = this.projectsRepository.create({
      ...createDto,
      createdBy: userId,
    });
    return await this.projectsRepository.save(project);
  }

  async findAll(filters?: { status?: string; propertyId?: string }): Promise<ConstructionProject[]> {
    const query = this.projectsRepository.createQueryBuilder('project');

    if (filters?.status) {
      query.andWhere('project.status = :status', { status: filters.status });
    }

    if (filters?.propertyId) {
      query.andWhere('project.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    return await query
      .orderBy('project.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<ConstructionProject> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateDto: UpdateConstructionProjectDto, userId: string): Promise<ConstructionProject> {
    const project = await this.findOne(id);
    Object.assign(project, updateDto);
    project.updatedBy = userId;
    return await this.projectsRepository.save(project);
  }

  async updateProgress(id: string, progress: number): Promise<ConstructionProject> {
    const project = await this.findOne(id);
    project.overallProgress = progress;
    return await this.projectsRepository.save(project);
  }

  async updateBudgetSpent(id: string, amount: number): Promise<ConstructionProject> {
    const project = await this.findOne(id);
    project.budgetSpent = Number(project.budgetSpent) + amount;
    return await this.projectsRepository.save(project);
  }

  async getOverdueProjects(): Promise<ConstructionProject[]> {
    return await this.projectsRepository
      .createQueryBuilder('project')
      .where('project.isOverdue = true')
      .andWhere('project.status != :status', { status: 'COMPLETED' })
      .getMany();
  }

  async getStatistics() {
    const projects = await this.projectsRepository.find();
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.isActive).length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const overdueProjects = projects.filter(p => p.isOverdue).length;
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budgetAllocated), 0);
    const totalSpent = projects.reduce((sum, p) => sum + Number(p.budgetSpent), 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  }
}
EOF

echo "Services 1-3 created (Materials, Vendors, Construction Projects)..."
echo "Creating remaining 9 services..."

# Due to script length, I'll create a summary file
cat > SERVICE_CREATION_SUMMARY.md << 'EOF'
# Construction Module Services - Creation Plan

## Services to Create (Total: 12)

### ✅ Already Created:
1. MaterialsService - Complete CRUD + stock management
2. VendorsService - Complete CRUD + credit management  
3. ConstructionProjectsService - Complete CRUD + progress/budget tracking

### 🔄 Remaining Services (9):

4. **MaterialEntriesService** - Store inward logging
5. **MaterialExitsService** - Store outward logging
6. **VendorPaymentsService** - Payment recording
7. **PurchaseOrdersService** - PO management
8. **PurchaseOrderItemsService** - Line items
9. **DailyProgressReportsService** - Daily reporting
10. **PainPointsService** - Issue tracking
11. **MaterialShortagesService** - Shortage alerts
12. **WorkSchedulesService** - Task scheduling

## Implementation Status:
- Database: ✅ Complete
- Entities: ✅ Complete
- DTOs: ✅ Complete (28 files)
- Services: 🔄 3/12 (25%)
- Controllers: ⏳ Pending
- Frontend: ⏳ Pending

## Next Steps:
Continue creating remaining 9 services with same pattern:
- CRUD operations
- Business logic methods
- Error handling
- Transaction management where needed
EOF

echo "✅ Services created: MaterialsService, VendorsService, ConstructionProjectsService"
echo "📝 Summary file created: SERVICE_CREATION_SUMMARY.md"
echo "⏳ Remaining: 9 services to create"
