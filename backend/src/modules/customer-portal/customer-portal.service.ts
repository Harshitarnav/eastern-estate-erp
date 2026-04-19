import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft } from '../demand-drafts/entities/demand-draft.entity';
import { ConstructionProgressLog } from '../construction/entities/construction-progress-log.entity';
import { ConstructionProject } from '../construction/entities/construction-project.entity';
import { ConstructionFlatProgress } from '../construction/entities/construction-flat-progress.entity';
import {
  ConstructionDevelopmentUpdate,
  UpdateVisibility,
} from '../construction/entities/construction-development-update.entity';

@Injectable()
export class CustomerPortalService {
  constructor(
    @InjectRepository(Customer)
    private customersRepo: Repository<Customer>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
    @InjectRepository(FlatPaymentPlan)
    private paymentPlansRepo: Repository<FlatPaymentPlan>,
    @InjectRepository(DemandDraft)
    private demandDraftsRepo: Repository<DemandDraft>,
    @InjectRepository(ConstructionProgressLog)
    private progressLogsRepo: Repository<ConstructionProgressLog>,
    @InjectRepository(ConstructionProject)
    private constructionProjectsRepo: Repository<ConstructionProject>,
    @InjectRepository(ConstructionFlatProgress)
    private flatProgressRepo: Repository<ConstructionFlatProgress>,
    @InjectRepository(ConstructionDevelopmentUpdate)
    private developmentUpdatesRepo: Repository<ConstructionDevelopmentUpdate>,
  ) {}

  async getProfile(customerId: string) {
    const customer = await this.customersRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) throw new NotFoundException('Customer profile not found');

    const bookingCount = await this.bookingsRepo.count({
      where: { customerId, isActive: true },
    });

    const payments = await this.paymentsRepo.find({
      where: { customerId },
      select: ['amount', 'paymentDate', 'paymentType'],
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      customer,
      stats: {
        bookingCount,
        totalPaid,
        paymentCount: payments.length,
      },
    };
  }

  async getBookings(customerId: string) {
    return this.bookingsRepo.find({
      where: { customerId, isActive: true },
      relations: ['flat', 'flat.tower', 'property'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBookingDetail(customerId: string, bookingId: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId, customerId, isActive: true },
      relations: ['flat', 'flat.tower', 'property'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const paymentPlan = await this.paymentPlansRepo.findOne({
      where: { bookingId, customerId },
    });

    const payments = await this.paymentsRepo.find({
      where: { bookingId, customerId },
      order: { paymentDate: 'DESC' },
    });

    const demandDrafts = await this.demandDraftsRepo.find({
      where: { bookingId, customerId },
      order: { createdAt: 'DESC' },
    });

    // Per-phase construction progress for this flat (new simplified log feed).
    const flatProgress = booking.flatId
      ? await this.flatProgressRepo.find({
          where: { flatId: booking.flatId },
          order: { updatedAt: 'DESC' },
        })
      : [];

    return { booking, paymentPlan, payments, demandDrafts, flatProgress };
  }

  async getPayments(customerId: string) {
    const payments = await this.paymentsRepo.find({
      where: { customerId },
      order: { paymentDate: 'DESC' },
    });

    const plans = await this.paymentPlansRepo.find({
      where: { customerId },
      relations: ['flat', 'booking'],
    });

    const upcomingMilestones = plans.flatMap((plan) =>
      (plan.milestones || [])
        .filter((m) => m.status === 'PENDING' || m.status === 'TRIGGERED')
        .map((m) => ({
          ...m,
          flatNumber: plan.flat?.flatNumber,
          bookingId: plan.bookingId,
          planId: plan.id,
        })),
    );

    return { payments, upcomingMilestones };
  }

  async getConstructionUpdates(customerId: string) {
    const bookings = await this.bookingsRepo.find({
      where: { customerId, isActive: true },
      relations: ['flat', 'flat.tower', 'property'],
    });

    if (!bookings.length) {
      return {
        bookings: [],
        projects: [],
        updates: [],
        flatProgress: [],
        developmentUpdates: [],
      };
    }

    const propertyIds = [...new Set(bookings.map((b) => b.propertyId).filter(Boolean))];
    const towerIds = [
      ...new Set(bookings.map((b) => b.flat?.tower?.id).filter(Boolean) as string[]),
    ];
    const flatIds = [
      ...new Set(bookings.map((b) => b.flatId).filter(Boolean) as string[]),
    ];

    const projects = propertyIds.length
      ? await this.constructionProjectsRepo
          .createQueryBuilder('project')
          .where('project.propertyId IN (:...propertyIds)', { propertyIds })
          .orderBy('project.createdAt', 'DESC')
          .getMany()
      : [];

    // Legacy daily progress logs (kept for backward compatibility).
    const projectIds = projects.map((p) => p.id);
    let updates: ConstructionProgressLog[] = [];
    if (projectIds.length) {
      updates = await this.progressLogsRepo
        .createQueryBuilder('log')
        .where('log.constructionProjectId IN (:...projectIds)', { projectIds })
        .orderBy('log.logDate', 'DESC')
        .limit(20)
        .getMany();
    }

    // New simplified per-flat progress feed (phase, %, notes, photos).
    const flatProgress = flatIds.length
      ? await this.flatProgressRepo.find({
          where: { flatId: In(flatIds) },
          order: { updatedAt: 'DESC' },
        })
      : [];

    // Development updates (beautification, lifts, landscaping, tower-wide, etc.).
    // Only surface customer-visible entries (visibility = ALL).
    const developmentUpdatesQb = this.developmentUpdatesRepo
      .createQueryBuilder('du')
      .where('du.visibility = :visibility', { visibility: UpdateVisibility.ALL })
      .orderBy('du.updateDate', 'DESC')
      .addOrderBy('du.createdAt', 'DESC')
      .limit(30);

    const scopeClauses: string[] = [];
    const scopeParams: Record<string, any> = {};
    if (propertyIds.length) {
      scopeClauses.push('du.propertyId IN (:...devPropertyIds)');
      scopeParams.devPropertyIds = propertyIds;
    }
    if (projectIds.length) {
      scopeClauses.push('du.constructionProjectId IN (:...devProjectIds)');
      scopeParams.devProjectIds = projectIds;
    }
    if (towerIds.length) {
      scopeClauses.push('du.towerId IN (:...devTowerIds)');
      scopeParams.devTowerIds = towerIds;
    }

    let developmentUpdates: ConstructionDevelopmentUpdate[] = [];
    if (scopeClauses.length) {
      developmentUpdates = await developmentUpdatesQb
        .andWhere(`(${scopeClauses.join(' OR ')})`, scopeParams)
        .getMany();
    }

    return {
      bookings,
      projects,
      updates,
      flatProgress,
      developmentUpdates,
    };
  }

  async getDemandDrafts(customerId: string) {
    return this.demandDraftsRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
