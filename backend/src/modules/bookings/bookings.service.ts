import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import {
  CreateBookingDto,
  UpdateBookingDto,
  QueryBookingDto,
  BookingResponseDto,
  PaginatedBookingsResponse,
} from './dto';
import { Flat, FlatStatus } from '../flats/entities/flat.entity';
import { Property } from '../properties/entities/property.entity';
import { Tower } from '../towers/entities/tower.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentsService } from '../payments/payments.service';
import { EmailService } from '../notifications/email.service';
import {
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  Payment,
} from '../payments/entities/payment.entity';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';
import { FlatPaymentPlanService } from '../payment-plans/services/flat-payment-plan.service';
import { FlatPaymentPlan } from '../payment-plans/entities/flat-payment-plan.entity';

/**
 * BookingsService
 * 
 * Enhanced with event-driven architecture:
 * - Automatically updates flat status on booking
 * - Creates token payment record
 * - Generates payment schedule based on plan
 * - Updates property and tower inventory counts
 * - Sends email notifications to customer and admin
 * - Maintains transactional integrity
 */
@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Flat)
    private flatsRepository: Repository<Flat>,
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    @InjectRepository(Tower)
    private towersRepository: Repository<Tower>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private paymentsService: PaymentsService,
    private emailService: EmailService,
    private dataSource: DataSource,
    private readonly accountingIntegrationService: AccountingIntegrationService,
    private readonly flatPaymentPlanService: FlatPaymentPlanService,
    @InjectRepository(FlatPaymentPlan)
    private readonly flatPaymentPlansRepository: Repository<FlatPaymentPlan>,
  ) {}

  /**
   * Create a new booking with full event-driven workflow
   * 
   * This method orchestrates multiple operations in a transaction:
   * 1. Validate flat availability
   * 2. Create booking record
   * 3. Update flat status to BOOKED
   * 4. Create token payment record
   * 5. Generate payment schedule
   * 6. Update property & tower inventory counts
   * 7. Update customer's last booking date
   * 8. Send email notifications (async, non-blocking)
   */
  async create(createBookingDto: CreateBookingDto, userId?: string): Promise<BookingResponseDto> {
    this.logger.log(`Creating booking: ${createBookingDto.bookingNumber}`);

    // Start a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // === VALIDATION PHASE ===

      // Check for duplicate booking number
      const existing = await queryRunner.manager.findOne(Booking, {
        where: { bookingNumber: createBookingDto.bookingNumber },
      });

      if (existing) {
        throw new ConflictException('Booking number already exists');
      }

      // Fetch and validate flat
      const flat = await queryRunner.manager.findOne(Flat, {
        where: { id: createBookingDto.flatId },
      });

      if (!flat) {
        throw new NotFoundException(`Flat with ID ${createBookingDto.flatId} not found`);
      }

      if (flat.status !== FlatStatus.AVAILABLE) {
        throw new BadRequestException(`Flat ${flat.flatNumber} is not available for booking (Status: ${flat.status})`);
      }

      // Fetch property
      const property = await queryRunner.manager.findOne(Property, {
        where: { id: createBookingDto.propertyId },
      });

      if (!property) {
        throw new NotFoundException(`Property with ID ${createBookingDto.propertyId} not found`);
      }

      // Fetch customer
      const customer = await queryRunner.manager.findOne(Customer, {
        where: { id: createBookingDto.customerId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID ${createBookingDto.customerId} not found`);
      }

      // === BOOKING CREATION ===

      // Create booking (strip non-column fields before spreading).
      //
      // IMPORTANT: we intentionally start paidAmount = 0 and
      // balanceAmount = totalAmount here. The token Payment row saved
      // a few lines down is the canonical record of money received,
      // and `PaymentsService.runPostCompletionHooks` (called post-
      // commit) is what bumps booking.paidAmount. Pre-populating it
      // here would double-count the token once the completion hook
      // runs.
      const { paymentPlanPayload: _planPayload, ...bookingFields } = createBookingDto;
      const booking = queryRunner.manager.create(Booking, {
        ...bookingFields,
        balanceAmount: createBookingDto.totalAmount,
        paidAmount: 0,
        status: BookingStatus.TOKEN_PAID,
      });

      const savedBooking = await queryRunner.manager.save(Booking, booking);
      this.logger.log(`Booking created: ${savedBooking.id}`);

      // === FLAT STATUS UPDATE ===

      flat.status = FlatStatus.BOOKED;
      flat.isAvailable = false;
      flat.customerId = customer.id;
      flat.bookingDate = savedBooking.bookingDate;
      flat.tokenAmount = savedBooking.tokenAmount;

      await queryRunner.manager.save(Flat, flat);
      this.logger.log(`Flat ${flat.flatNumber} status updated to BOOKED`);

      // === CREATE TOKEN PAYMENT RECORD ===

      let savedTokenPayment: Payment | null = null;

      if (createBookingDto.tokenAmount && createBookingDto.tokenAmount > 0) {
        const paymentsRepo = queryRunner.manager.getRepository(Payment);
        const paymentCode = `PAY-${createBookingDto.bookingNumber}-TOKEN`;
        const tokenPayment = paymentsRepo.create({
          paymentCode,
          receiptNumber:
            createBookingDto.tokenReceiptNumber || `REC-${createBookingDto.bookingNumber}-TOKEN`,
          bookingId: savedBooking.id,
          customerId: customer.id,
          paymentType: PaymentType.BOOKING,
          paymentMethod:
            (createBookingDto.tokenPaymentMode as PaymentMethod) || PaymentMethod.CASH,
          amount: createBookingDto.tokenAmount,
          paymentDate: new Date(
            createBookingDto.tokenPaidDate || createBookingDto.bookingDate,
          ),
          status: PaymentStatus.COMPLETED,
          bankName: createBookingDto.paymentBank,
          chequeNumber: createBookingDto.chequeNumber,
          chequeDate: createBookingDto.chequeDate
            ? new Date(createBookingDto.chequeDate)
            : undefined,
          transactionReference: createBookingDto.utrNumber || createBookingDto.rtgsNumber,
          upiId: createBookingDto.utrNumber,
        });

        savedTokenPayment = await paymentsRepo.save(tokenPayment);
        this.logger.log(`Token payment record created: ${paymentCode}`);
      }

      // === GENERATE PAYMENT SCHEDULE ===
      // Payment schedules are generated on-demand by
      // AutoDemandDraftService when a milestone triggers - there is
      // no longer a separate PaymentScheduleService. The old orphan
      // service file was deleted as part of the progress/payment
      // pipeline consolidation.

      // === UPDATE PROPERTY & TOWER INVENTORY COUNTS ===

      // Update property counts
      await queryRunner.manager.query(`
        UPDATE properties 
        SET number_of_units = COALESCE(number_of_units, 0) + 1
        WHERE id = $1
      `, [property.id]);
      this.logger.log(`Property ${property.name} unit count updated`);

      // Update tower counts if towerId provided
      if (createBookingDto.towerId) {
        await queryRunner.manager.query(`
          UPDATE towers 
          SET units_defined = COALESCE(units_defined, 0) + 1
          WHERE id = $1
        `, [createBookingDto.towerId]);
        this.logger.log(`Tower unit count updated`);
      }

      // === UPDATE CUSTOMER'S LAST BOOKING DATE ===

      customer.lastBookingDate = savedBooking.bookingDate;
      await queryRunner.manager.save(Customer, customer);
      this.logger.log(`Customer ${customer.id} last booking date updated`);

      // === COMMIT TRANSACTION ===

      await queryRunner.commitTransaction();
      this.logger.log(`Transaction committed for booking ${savedBooking.bookingNumber}`);

      // === POST-TRANSACTION OPERATIONS ===
      //
      // Token payments now route through the same post-completion
      // pipeline as regular verified payments (schedule match, booking
      // totals bump, journal entry, customer notification). This used
      // to be a direct call to AccountingIntegrationService.onPayment-
      // Completed only - which meant token payments silently skipped
      // PaymentCompletionService (so booking.paidAmount had to be
      // pre-set above to stay consistent) and any future side-effect
      // added to the completion pipeline would have missed tokens.
      // See PaymentsService.runPostCompletionHooks for the exact steps.
      //
      // Deferred to just below the payment-plan creation block so the
      // FlatPaymentPlan exists when milestone matching runs. Kept
      // best-effort (fire-and-forget) - the booking is already
      // committed and returning it to the UI must not wait on email.

      // === CREATE PAYMENT PLAN (if provided) ===
      // Runs post-commit, best-effort. If it fails, the booking is still created
      // and the user can attach a plan later via the booking detail page.
      if (createBookingDto.paymentPlanPayload) {
        try {
          await this.flatPaymentPlanService.createForBooking(
            {
              flatId: savedBooking.flatId,
              bookingId: savedBooking.id,
              customerId: savedBooking.customerId,
              totalAmount: Number(savedBooking.totalAmount),
              mode: createBookingDto.paymentPlanPayload.mode,
              templateId: createBookingDto.paymentPlanPayload.templateId,
              milestones: createBookingDto.paymentPlanPayload.milestones,
            },
            userId ?? savedBooking.customerId,
          );
          this.logger.log(`Payment plan created for booking ${savedBooking.bookingNumber}`);
        } catch (planError: any) {
          // Non-fatal: flag it so the UI can show the "plan missing" chip
          this.logger.error(
            `Payment plan creation failed for booking ${savedBooking.bookingNumber}: ${planError.message}`,
          );
        }
      }

      // Fire the unified completion hooks for the token payment now
      // that the FlatPaymentPlan (if any) exists. Intentionally not
      // awaited: all three downstream steps are best-effort and the
      // booking is already committed.
      if (savedTokenPayment) {
        this.paymentsService
          .runPostCompletionHooks(savedTokenPayment.id, userId)
          .catch((err) =>
            this.logger.error(
              `Token post-completion hooks failed for ${savedTokenPayment!.paymentCode}: ${err.message}`,
            ),
          );
      }

      // Send email notifications (async, non-blocking)
      this.sendBookingNotifications(savedBooking, customer, flat, property)
        .catch(error => {
          this.logger.error('Error sending booking notifications:', error);
          // Don't throw - emails are optional
        });

      // Return booking with related data
      const bookingWithRelations = await this.bookingsRepository.findOne({
        where: { id: savedBooking.id },
        relations: ['customer', 'flat', 'property'],
      });

      return BookingResponseDto.fromEntity(bookingWithRelations);

    } catch (error) {
      // Rollback transaction on any error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error creating booking, transaction rolled back:`, error);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Send booking confirmation emails to customer and admin
   * This is called asynchronously after booking creation
   */
  private async sendBookingNotifications(
    booking: Booking,
    customer: Customer,
    flat: Flat,
    property: Property,
  ): Promise<void> {
    try {
      // Send customer confirmation email
      await this.emailService.sendBookingConfirmationToCustomer(
        booking,
        customer,
        flat,
        property,
      );
      this.logger.log(`Booking confirmation email sent to customer: ${customer.email}`);

      // Send admin notification email
      await this.emailService.sendBookingNotificationToAdmin(
        booking,
        customer,
        flat,
        property,
      );
      this.logger.log(`Booking notification email sent to admin`);
    } catch (error) {
      this.logger.error('Error in sendBookingNotifications:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  async findAll(query: QueryBookingDto, accessiblePropertyIds?: string[] | null): Promise<PaginatedBookingsResponse> {
    const {
      search,
      status,
      paymentStatus,
      customerId,
      flatId,
      propertyId,
      bookingDateFrom,
      bookingDateTo,
      isHomeLoan,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.flat', 'flat')
      .leftJoinAndSelect('booking.property', 'property');

    if (search) {
      queryBuilder.andWhere(
        '(booking.bookingNumber ILIKE :search OR booking.agreementNumber ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('booking.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (customerId) {
      queryBuilder.andWhere('booking.customerId = :customerId', { customerId });
    }

    if (flatId) {
      queryBuilder.andWhere('booking.flatId = :flatId', { flatId });
    }

    if (propertyId) {
      if (
        accessiblePropertyIds &&
        accessiblePropertyIds.length > 0 &&
        !accessiblePropertyIds.includes(propertyId)
      ) {
        queryBuilder.andWhere('1 = 0');
      } else {
        queryBuilder.andWhere('booking.propertyId = :propertyId', { propertyId });
      }
    } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
      queryBuilder.andWhere('booking.propertyId IN (:...accessiblePropertyIds)', { accessiblePropertyIds });
    }

    if (bookingDateFrom) {
      queryBuilder.andWhere('booking.bookingDate >= :bookingDateFrom', { bookingDateFrom });
    }

    if (bookingDateTo) {
      queryBuilder.andWhere('booking.bookingDate <= :bookingDateTo', { bookingDateTo });
    }

    if (isHomeLoan !== undefined) {
      queryBuilder.andWhere('booking.isHomeLoan = :isHomeLoan', { isHomeLoan });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('booking.isActive = :isActive', { isActive });
    }

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'bookingDate',
      'status',
      'totalAmount',
      'paidAmount',
      'balanceAmount',
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder.orderBy(`booking.${safeSortBy}`, sortOrder);

    const total = await queryBuilder.getCount();
    const bookings = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const dtos = BookingResponseDto.fromEntities(bookings);

    // Bulk-check which bookings have a payment plan (single query, no N+1)
    if (dtos.length > 0) {
      const bookingIds = dtos.map((b) => b.id);
      const plans = await this.flatPaymentPlansRepository
        .createQueryBuilder('plan')
        .select('plan.bookingId', 'bookingId')
        .where('plan.bookingId IN (:...ids)', { ids: bookingIds })
        .getRawMany<{ bookingId: string }>();
      const withPlan = new Set(plans.map((p) => p.bookingId));
      for (const dto of dtos) {
        dto.hasPaymentPlan = withPlan.has(dto.id);
      }
    }

    return {
      data: dtos,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Enforce property-scope on any single-booking operation. */
  private assertBookingAccessible(
    booking: { propertyId: string },
    accessiblePropertyIds?: string[] | null,
  ): void {
    if (!accessiblePropertyIds || accessiblePropertyIds.length === 0) return;
    if (!accessiblePropertyIds.includes(booking.propertyId)) {
      throw new NotFoundException('Booking not found');
    }
  }

  async findOne(
    id: string,
    accessiblePropertyIds?: string[] | null,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['customer', 'flat', 'property'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    this.assertBookingAccessible(booking, accessiblePropertyIds);

    const dto = BookingResponseDto.fromEntity(booking);
    const planCount = await this.flatPaymentPlansRepository.count({
      where: { bookingId: id },
    });
    dto.hasPaymentPlan = planCount > 0;
    return dto;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    accessiblePropertyIds?: string[] | null,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    this.assertBookingAccessible(booking, accessiblePropertyIds);

    // Check for duplicate booking number if being updated
    if (updateBookingDto.bookingNumber && updateBookingDto.bookingNumber !== booking.bookingNumber) {
      const existing = await this.bookingsRepository.findOne({
        where: { bookingNumber: updateBookingDto.bookingNumber },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Booking number already exists');
      }
    }

    // Recalculate balance if amounts change
    const totalAmount = updateBookingDto.totalAmount ?? booking.totalAmount;
    const paidAmount = updateBookingDto.paidAmount ?? booking.paidAmount;
    const balanceAmount = Number(totalAmount) - Number(paidAmount);

    Object.assign(booking, {
      ...updateBookingDto,
      balanceAmount,
    });

    const updatedBooking = await this.bookingsRepository.save(booking);

    return BookingResponseDto.fromEntity(updatedBooking);
  }

  async remove(
    id: string,
    accessiblePropertyIds?: string[] | null,
  ): Promise<void> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    this.assertBookingAccessible(booking, accessiblePropertyIds);

    // Soft delete by setting isActive to false
    booking.isActive = false;
    await this.bookingsRepository.save(booking);
  }

  async cancelBooking(
    id: string,
    reason: string,
    refundAmount?: number,
    accessiblePropertyIds?: string[] | null,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    this.assertBookingAccessible(booking, accessiblePropertyIds);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationDate = new Date();
    booking.cancellationReason = reason;
    booking.refundAmount = refundAmount;

    const cancelledBooking = await this.bookingsRepository.save(booking);

    return BookingResponseDto.fromEntity(cancelledBooking);
  }

  async getStatistics(
    accessiblePropertyIds?: string[] | null,
    propertyId?: string,
  ) {
    // Build the effective property-ID filter: intersect the selected
    // property (from top bar) with the caller's accessible set, so a
    // user cannot widen scope by passing a propertyId they don't own.
    let effectiveIds: string[] | null = null;
    if (propertyId) {
      if (
        accessiblePropertyIds &&
        accessiblePropertyIds.length > 0 &&
        !accessiblePropertyIds.includes(propertyId)
      ) {
        // User selected a property they don't have access to - return empty.
        return {
          total: 0,
          tokenPaid: 0,
          agreementPending: 0,
          agreementSigned: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          totalRevenue: 0,
          totalPaid: 0,
          totalBalance: 0,
          withHomeLoan: 0,
          totalLoanAmount: 0,
          collectionRate: 0,
        };
      }
      effectiveIds = [propertyId];
    } else if (accessiblePropertyIds && accessiblePropertyIds.length > 0) {
      effectiveIds = accessiblePropertyIds;
    }

    const where: any = { isActive: true };
    const bookings = effectiveIds
      ? await this.bookingsRepository.createQueryBuilder('b')
          .where('b.isActive = true')
          .andWhere('b.propertyId IN (:...ids)', { ids: effectiveIds })
          .getMany()
      : await this.bookingsRepository.find({ where });

    const total = bookings.length;
    const tokenPaid = bookings.filter((b) => b.status === 'TOKEN_PAID').length;
    const agreementPending = bookings.filter((b) => b.status === 'AGREEMENT_PENDING').length;
    const agreementSigned = bookings.filter((b) => b.status === 'AGREEMENT_SIGNED').length;
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;

    const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalPaid = bookings.reduce((sum, b) => sum + Number(b.paidAmount), 0);
    const totalBalance = bookings.reduce((sum, b) => sum + Number(b.balanceAmount), 0);

    const withHomeLoan = bookings.filter((b) => b.isHomeLoan).length;
    const totalLoanAmount = bookings
      .filter((b) => b.isHomeLoan && b.loanAmount)
      .reduce((sum, b) => sum + Number(b.loanAmount), 0);

    return {
      total,
      tokenPaid,
      agreementPending,
      agreementSigned,
      confirmed,
      completed,
      cancelled,
      totalRevenue,
      totalPaid,
      totalBalance,
      withHomeLoan,
      totalLoanAmount,
      collectionRate: totalRevenue > 0 ? (totalPaid / totalRevenue) * 100 : 0,
    };
  }
}
