#!/bin/bash

echo "🏗️  Generating Phase 2B - Additional APIs..."

# ==========================================
# PO ITEMS CONTROLLER
# ==========================================

cat > src/modules/purchase-orders/purchase-order-items.controller.ts << 'EOF'
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { PurchaseOrderItemsService } from './purchase-order-items.service';
import { CreatePurchaseOrderItemDto } from './dto/create-purchase-order-item.dto';
import { UpdatePurchaseOrderItemDto } from './dto/update-purchase-order-item.dto';

@Controller('purchase-order-items')
export class PurchaseOrderItemsController {
  constructor(private readonly purchaseOrderItemsService: PurchaseOrderItemsService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseOrderItemDto) {
    return this.purchaseOrderItemsService.create(createDto);
  }

  @Get('purchase-order/:purchaseOrderId')
  findByPurchaseOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    return this.purchaseOrderItemsService.findByPurchaseOrder(purchaseOrderId);
  }

  @Get('purchase-order/:purchaseOrderId/total')
  getTotalByPurchaseOrder(@Param('purchaseOrderId') purchaseOrderId: string) {
    return this.purchaseOrderItemsService.getTotalByPurchaseOrder(purchaseOrderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdatePurchaseOrderItemDto) {
    return this.purchaseOrderItemsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.purchaseOrderItemsService.remove(id);
  }
}
EOF

# ==========================================
# CONSTRUCTION TEAMS SERVICE
# ==========================================

cat > src/modules/construction/construction-teams.service.ts << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionTeam } from './entities/construction-team.entity';

@Injectable()
export class ConstructionTeamsService {
  constructor(
    @InjectRepository(ConstructionTeam)
    private readonly constructionTeamRepository: Repository<ConstructionTeam>,
  ) {}

  async create(createDto: any) {
    const team = this.constructionTeamRepository.create(createDto);
    return await this.constructionTeamRepository.save(team);
  }

  async findByProject(constructionProjectId: string) {
    return await this.constructionTeamRepository.find({
      where: { constructionProjectId, isActive: true },
      relations: ['employee', 'constructionProject'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const team = await this.constructionTeamRepository.findOne({
      where: { id },
      relations: ['employee', 'constructionProject'],
    });

    if (!team) {
      throw new NotFoundException(`Team member with ID ${id} not found`);
    }

    return team;
  }

  async update(id: string, updateDto: any) {
    const team = await this.findOne(id);
    Object.assign(team, updateDto);
    return await this.constructionTeamRepository.save(team);
  }

  async remove(id: string) {
    const team = await this.findOne(id);
    team.isActive = false;
    await this.constructionTeamRepository.save(team);
  }
}
EOF

# ==========================================
# CONSTRUCTION TEAMS CONTROLLER
# ==========================================

cat > src/modules/construction/construction-teams.controller.ts << 'EOF'
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ConstructionTeamsService } from './construction-teams.service';

@Controller('construction-teams')
export class ConstructionTeamsController {
  constructor(private readonly constructionTeamsService: ConstructionTeamsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.constructionTeamsService.create(createDto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.constructionTeamsService.findByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionTeamsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.constructionTeamsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionTeamsService.remove(id);
  }
}
EOF

# ==========================================
# PROGRESS LOGS SERVICE
# ==========================================

cat > src/modules/construction/construction-progress-logs.service.ts << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProgressLog } from './entities/construction-progress-log.entity';

@Injectable()
export class ConstructionProgressLogsService {
  constructor(
    @InjectRepository(ConstructionProgressLog)
    private readonly constructionProgressLogRepository: Repository<ConstructionProgressLog>,
  ) {}

  async create(createDto: any) {
    const log = this.constructionProgressLogRepository.create({
      ...createDto,
      logDate: createDto.logDate ? new Date(createDto.logDate) : new Date(),
    });
    return await this.constructionProgressLogRepository.save(log);
  }

  async findByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.find({
      where: { constructionProjectId },
      relations: ['constructionProject', 'loggedBy'],
      order: { logDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const log = await this.constructionProgressLogRepository.findOne({
      where: { id },
      relations: ['constructionProject', 'loggedBy'],
    });

    if (!log) {
      throw new NotFoundException(`Progress log with ID ${id} not found`);
    }

    return log;
  }

  async update(id: string, updateDto: any) {
    const log = await this.findOne(id);
    Object.assign(log, updateDto);
    
    if (updateDto.logDate) {
      log.logDate = new Date(updateDto.logDate);
    }
    
    return await this.constructionProgressLogRepository.save(log);
  }

  async remove(id: string) {
    const log = await this.findOne(id);
    await this.constructionProgressLogRepository.remove(log);
  }

  async getLatestByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.findOne({
      where: { constructionProjectId },
      relations: ['loggedBy'],
      order: { logDate: 'DESC' },
    });
  }
}
EOF

# ==========================================
# PROGRESS LOGS CONTROLLER
# ==========================================

cat > src/modules/construction/construction-progress-logs.controller.ts << 'EOF'
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ConstructionProgressLogsService } from './construction-progress-logs.service';

@Controller('construction-progress-logs')
export class ConstructionProgressLogsController {
  constructor(private readonly constructionProgressLogsService: ConstructionProgressLogsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.constructionProgressLogsService.create(createDto);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.constructionProgressLogsService.findByProject(projectId);
  }

  @Get('project/:projectId/latest')
  getLatestByProject(@Param('projectId') projectId: string) {
    return this.constructionProgressLogsService.getLatestByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.constructionProgressLogsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.constructionProgressLogsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.constructionProgressLogsService.remove(id);
  }
}
EOF

echo "✅ All Phase 2B files generated!"
echo ""
echo "Next: Update modules to register new services & controllers"
