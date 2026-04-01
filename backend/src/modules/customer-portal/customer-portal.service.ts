import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';
import { DemandDraft } from '../demand-drafts/entities/demand-draft.entity';
import { ConstructionProgressLog } from '../construction/entities/construction-progress-log.entity';
import { ConstructionProject } from '../construction/entities/construction-project.entity';

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

    // Get payment plan
    const paymentPlan = await this.paymentPlansRepo.findOne({
      where: { bookingId, customerId },
    });

    // Get payments made
    const payments = await this.paymentsRepo.find({
      where: { bookingId, customerId },
      order: { paymentDate: 'DESC' },
    });

    // Get demand drafts
    const demandDrafts = await this.demandDraftsRepo.find({
      where: { bookingId, customerId },
      order: { createdAt: 'DESC' },
    });

    return { booking, paymentPlan, payments, demandDrafts };
  }

  async getPayments(customerId: string) {
    const payments = await this.paymentsRepo.find({
      where: { customerId },
      order: { paymentDate: 'DESC' },
    });

    // Upcoming milestones from all payment plans
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
    // Get all bookings to find their property IDs
    const bookings = await this.bookingsRepo.find({
      where: { customerId, isActive: true },
      relations: ['flat', 'flat.tower', 'property'],
    });

    if (!bookings.length) return { bookings: [], updates: [], projects: [] };

    const propertyIds = [...new Set(bookings.map((b) => b.propertyId))];

    // Get construction projects for these properties
    const projects = await this.constructionProjectsRepo
      .createQueryBuilder('project')
      .where('project.propertyId IN (:...propertyIds)', { propertyIds })
      .orderBy('project.createdAt', 'DESC')
      .getMany();

    // Get recent progress logs (last 20)
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

    return { bookings, updates, projects };
  }

  async getDemandDrafts(customerId: string) {
    return this.demandDraftsRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
