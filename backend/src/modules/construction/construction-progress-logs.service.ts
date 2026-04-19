import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConstructionProgressLog, ShiftType } from './entities/construction-progress-log.entity';
import { ConstructionProject } from './entities/construction-project.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationCategory, NotificationType } from '../notifications/entities/notification.entity';
import { FlatPaymentPlan, FlatPaymentPlanStatus } from '../payment-plans/entities/flat-payment-plan.entity';
import {
  ConstructionWorkflowService,
  GeneratedDemandDraftSummary,
} from './services/construction-workflow.service';

export interface ProgressLogWorkflowResult {
  flatsProcessed: number;
  milestonesTriggered: number;
  generatedDemandDrafts: GeneratedDemandDraftSummary[];
  errors: Array<{ flatId: string; message: string }>;
}

/**
 * Shape returned by `create()`. The saved log fields are spread at the top
 * level so existing frontend code (e.g. `const log = await api.post(...); log.id`)
 * keeps working. The new `workflow` field is additive.
 */
export type CreateProgressLogResult = ConstructionProgressLog & {
  workflow?: ProgressLogWorkflowResult;
};

@Injectable()
export class ConstructionProgressLogsService {
  private readonly logger = new Logger(ConstructionProgressLogsService.name);

  constructor(
    @InjectRepository(ConstructionProgressLog)
    private readonly constructionProgressLogRepository: Repository<ConstructionProgressLog>,
    @InjectRepository(ConstructionProject)
    private readonly constructionProjectRepository: Repository<ConstructionProject>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FlatPaymentPlan)
    private readonly flatPaymentPlanRepository: Repository<FlatPaymentPlan>,
    private readonly notificationsService: NotificationsService,
    private readonly workflowService: ConstructionWorkflowService,
  ) {}

  async create(createDto: any): Promise<CreateProgressLogResult> {
    let propertyId = createDto.propertyId || null;

    // Auto-derive propertyId from the linked construction project
    if (!propertyId && createDto.constructionProjectId) {
      const project = await this.constructionProjectRepository.findOne({
        where: { id: createDto.constructionProjectId },
        select: ['id', 'propertyId'],
      });
      if (project?.propertyId) {
        propertyId = project.propertyId;
      }
    }

    // Map frontend field names to entity field names
    const log = this.constructionProgressLogRepository.create({
      constructionProjectId: createDto.constructionProjectId || null,
      propertyId,
      towerId: createDto.towerId || null,
      logDate: createDto.logDate ? new Date(createDto.logDate) : new Date(),
      progressType: createDto.progressType || null,
      // Map workCompleted -> description (new modal field name)
      description: createDto.description || createDto.workCompleted || null,
      progressPercentage: createDto.progressPercentage ?? null,
      weatherCondition: createDto.weatherCondition || null,
      temperature: createDto.temperature ?? null,
      loggedBy: createDto.loggedBy || null,
      photos: createDto.photos || [],
      // New project-based daily log fields
      shift: (createDto.shift as ShiftType) || null,
      workersPresent: createDto.workersPresent != null ? Number(createDto.workersPresent) : null,
      workersAbsent: createDto.workersAbsent != null ? Number(createDto.workersAbsent) : null,
      materialsUsed: createDto.materialsUsed || null,
      issuesDelays: createDto.issuesDelays || null,
      supervisorName: createDto.supervisorName || null,
      nextDayPlan: createDto.nextDayPlan || null,
      remarks: createDto.remarks || null,
    });

    const saved = await this.constructionProgressLogRepository.save(log);

    // Notify customers whose bookings are for this property (best-effort)
    if (propertyId) {
      this.notifyCustomersOnProgressLog(saved, propertyId).catch(e =>
        this.logger.warn(`Failed to send construction notification: ${e.message}`),
      );
    }

    // Optionally run the DD workflow for a single flat or all sold flats in the project.
    // This is what bridges the "Daily Log" UI to demand draft generation.
    const workflow = await this.maybeRunWorkflow(createDto, propertyId);

    // Spread saved fields at top level so existing callers relying on `response.id`
    // keep working. `workflow` is an additive field.
    const result = Object.assign({}, saved) as CreateProgressLogResult;
    if (workflow) {
      result.workflow = workflow;
    }
    return result;
  }

  /**
   * Returns workflow result ONLY when the caller explicitly asked for it by
   * providing a `phase` + `phaseProgress` along with either a `flatId` or
   * `applyToAllSoldFlats: true` + `propertyId`. Returns undefined otherwise so
   * existing callers that don't opt in get the same behaviour as before.
   */
  private async maybeRunWorkflow(
    createDto: any,
    propertyId: string | null,
  ): Promise<ProgressLogWorkflowResult | undefined> {
    const phase: string | undefined = createDto.phase;
    const phaseProgress: number | undefined =
      createDto.phaseProgress != null ? Number(createDto.phaseProgress) : undefined;
    const overallProgress: number = Number(
      createDto.overallProgress ?? createDto.progressPercentage ?? 0,
    ) || 0;

    // Workflow requires both a phase and a phase-level progress value.
    if (!phase || !Number.isFinite(phaseProgress)) {
      return undefined;
    }

    const flatId: string | undefined = createDto.flatId || undefined;
    const applyToAllSoldFlats: boolean = Boolean(createDto.applyToAllSoldFlats);

    // Resolve the list of flats to run the workflow on.
    let flatIds: string[] = [];

    if (flatId) {
      flatIds = [flatId];
    } else if (applyToAllSoldFlats && propertyId) {
      const plans = await this.flatPaymentPlanRepository
        .createQueryBuilder('plan')
        .innerJoin('plan.flat', 'flat')
        .where('plan.status = :status', { status: FlatPaymentPlanStatus.ACTIVE })
        .andWhere('flat.propertyId = :propertyId', { propertyId })
        .select(['plan.id', 'plan.flatId'])
        .getMany();
      flatIds = plans.map(p => p.flatId).filter(Boolean);
    }

    if (flatIds.length === 0) {
      return undefined;
    }

    const result: ProgressLogWorkflowResult = {
      flatsProcessed: 0,
      milestonesTriggered: 0,
      generatedDemandDrafts: [],
      errors: [],
    };

    for (const id of flatIds) {
      try {
        const r = await this.workflowService.processConstructionUpdate(
          id,
          phase,
          phaseProgress!,
          overallProgress,
        );
        result.flatsProcessed += 1;
        result.milestonesTriggered += r.milestonesTriggered;
        result.generatedDemandDrafts.push(...r.generatedDemandDrafts);
      } catch (err: any) {
        this.logger.error(
          `Workflow failed for flat ${id} during daily log save: ${err?.message}`,
        );
        result.errors.push({ flatId: id, message: err?.message ?? 'Unknown error' });
      }
    }

    return result;
  }

  private async notifyCustomersOnProgressLog(
    log: ConstructionProgressLog,
    propertyId: string,
  ): Promise<void> {
    // Find all unique customerIds with bookings for this property
    const bookings = await this.bookingRepository
      .createQueryBuilder('b')
      .select('DISTINCT b.customerId', 'customerId')
      .where('b.propertyId = :propertyId', { propertyId })
      .andWhere('b.customerId IS NOT NULL')
      .getRawMany();

    if (!bookings.length) return;

    const customerIds = bookings.map((b: any) => b.customerId).filter(Boolean);
    if (!customerIds.length) return;

    // Find portal user accounts linked to these customers
    const users = await this.userRepository
      .createQueryBuilder('u')
      .where('u.customerId IN (:...customerIds)', { customerIds })
      .select(['u.id', 'u.customerId'])
      .getMany();

    if (!users.length) return;

    const logDate = log.logDate
      ? new Date(log.logDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : 'today';

    const workType = (log as any).progressType || (log as any).workType || 'Construction';
    const pct = (log as any).progressPercentage;

    for (const user of users) {
      await this.notificationsService.create({
        userId: user.id,
        title: 'Construction Update',
        message: `New site update logged on ${logDate}${workType ? ` for ${workType.replace(/_/g, ' ')}` : ''}${pct != null ? ` - ${Math.round(Number(pct))}% progress` : ''}.`,
        type: NotificationType.INFO,
        category: NotificationCategory.CONSTRUCTION,
        actionUrl: '/portal/construction',
        actionLabel: 'View Updates',
        relatedEntityId: log.id,
        relatedEntityType: 'construction_log',
      });
    }
  }

  async findAll(filters?: { constructionProjectId?: string; propertyId?: string }) {
    const where: any = {};
    if (filters?.constructionProjectId) where.constructionProjectId = filters.constructionProjectId;
    if (filters?.propertyId) where.propertyId = filters.propertyId;

    return await this.constructionProgressLogRepository.find({
      where: Object.keys(where).length ? where : undefined,
      order: { logDate: 'DESC', createdAt: 'DESC' },
      take: 200,
    });
  }

  async findByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.find({
      where: { constructionProjectId },
      order: { logDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const log = await this.constructionProgressLogRepository.findOne({
      where: { id },
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
    return { success: true };
  }

  async getLatestByProject(constructionProjectId: string) {
    return await this.constructionProgressLogRepository.findOne({
      where: { constructionProjectId },
      order: { logDate: 'DESC' },
    });
  }

  /** Append new photo URLs to a log's photos JSONB array */
  async addPhotos(id: string, urls: string[]): Promise<ConstructionProgressLog> {
    const log = await this.findOne(id);
    const existing: string[] = Array.isArray(log.photos) ? log.photos : [];
    log.photos = [...existing, ...urls];
    return await this.constructionProgressLogRepository.save(log);
  }

  /** Remove a single photo URL from a log's photos array */
  async removePhoto(id: string, photoUrl: string): Promise<ConstructionProgressLog> {
    const log = await this.findOne(id);
    const existing: string[] = Array.isArray(log.photos) ? log.photos : [];
    log.photos = existing.filter(u => u !== photoUrl);
    return await this.constructionProgressLogRepository.save(log);
  }
}
