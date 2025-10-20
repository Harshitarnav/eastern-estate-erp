"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BookingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const dto_1 = require("./dto");
const flat_entity_1 = require("../flats/entities/flat.entity");
const property_entity_1 = require("../properties/entities/property.entity");
const tower_entity_1 = require("../towers/entities/tower.entity");
const customer_entity_1 = require("../customers/entities/customer.entity");
const payments_service_1 = require("../payments/payments.service");
const payment_schedule_service_1 = require("../payments/payment-schedule.service");
const email_service_1 = require("../notifications/email.service");
const payment_entity_1 = require("../payments/entities/payment.entity");
let BookingsService = BookingsService_1 = class BookingsService {
    constructor(bookingsRepository, flatsRepository, propertiesRepository, towersRepository, customersRepository, paymentsService, paymentScheduleService, emailService, dataSource) {
        this.bookingsRepository = bookingsRepository;
        this.flatsRepository = flatsRepository;
        this.propertiesRepository = propertiesRepository;
        this.towersRepository = towersRepository;
        this.customersRepository = customersRepository;
        this.paymentsService = paymentsService;
        this.paymentScheduleService = paymentScheduleService;
        this.emailService = emailService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(BookingsService_1.name);
    }
    async create(createBookingDto) {
        this.logger.log(`Creating booking: ${createBookingDto.bookingNumber}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const existing = await queryRunner.manager.findOne(booking_entity_1.Booking, {
                where: { bookingNumber: createBookingDto.bookingNumber },
            });
            if (existing) {
                throw new common_1.ConflictException('Booking number already exists');
            }
            const flat = await queryRunner.manager.findOne(flat_entity_1.Flat, {
                where: { id: createBookingDto.flatId },
            });
            if (!flat) {
                throw new common_1.NotFoundException(`Flat with ID ${createBookingDto.flatId} not found`);
            }
            if (flat.status !== flat_entity_1.FlatStatus.AVAILABLE) {
                throw new common_1.BadRequestException(`Flat ${flat.flatNumber} is not available for booking (Status: ${flat.status})`);
            }
            const property = await queryRunner.manager.findOne(property_entity_1.Property, {
                where: { id: createBookingDto.propertyId },
            });
            if (!property) {
                throw new common_1.NotFoundException(`Property with ID ${createBookingDto.propertyId} not found`);
            }
            const customer = await queryRunner.manager.findOne(customer_entity_1.Customer, {
                where: { id: createBookingDto.customerId },
            });
            if (!customer) {
                throw new common_1.NotFoundException(`Customer with ID ${createBookingDto.customerId} not found`);
            }
            const balanceAmount = createBookingDto.totalAmount - (createBookingDto.tokenAmount || 0);
            const booking = queryRunner.manager.create(booking_entity_1.Booking, {
                ...createBookingDto,
                balanceAmount,
                paidAmount: createBookingDto.tokenAmount || 0,
                status: booking_entity_1.BookingStatus.TOKEN_PAID,
            });
            const savedBooking = await queryRunner.manager.save(booking_entity_1.Booking, booking);
            this.logger.log(`Booking created: ${savedBooking.id}`);
            flat.status = flat_entity_1.FlatStatus.BOOKED;
            flat.isAvailable = false;
            flat.customerId = customer.id;
            flat.bookingDate = savedBooking.bookingDate;
            flat.tokenAmount = savedBooking.tokenAmount;
            await queryRunner.manager.save(flat_entity_1.Flat, flat);
            this.logger.log(`Flat ${flat.flatNumber} status updated to BOOKED`);
            if (createBookingDto.tokenAmount && createBookingDto.tokenAmount > 0) {
                const tokenPayment = {
                    paymentNumber: `PAY-${createBookingDto.bookingNumber}-TOKEN`,
                    receiptNumber: createBookingDto.tokenReceiptNumber || `REC-${createBookingDto.bookingNumber}-TOKEN`,
                    bookingId: savedBooking.id,
                    customerId: customer.id,
                    paymentType: payment_entity_1.PaymentType.TOKEN,
                    amount: createBookingDto.tokenAmount,
                    paymentDate: createBookingDto.tokenPaidDate || createBookingDto.bookingDate,
                    paymentMode: createBookingDto.tokenPaymentMode || payment_entity_1.PaymentMode.CASH,
                    status: 'RECEIVED',
                    remarks: 'Token amount paid at booking',
                };
                await queryRunner.manager.save('Payment', tokenPayment);
                this.logger.log(`Token payment record created: ${tokenPayment.paymentNumber}`);
            }
            const paymentPlan = createBookingDto.paymentPlan || 'TIME_LINKED';
            const schedulePromise = this.paymentScheduleService.generateScheduleForBooking(savedBooking.id, savedBooking.bookingNumber, savedBooking.totalAmount, savedBooking.tokenAmount, paymentPlan, new Date(savedBooking.bookingDate));
            await queryRunner.manager.query(`
        UPDATE properties 
        SET number_of_units = COALESCE(number_of_units, 0) + 1
        WHERE id = $1
      `, [property.id]);
            this.logger.log(`Property ${property.name} unit count updated`);
            if (createBookingDto.towerId) {
                await queryRunner.manager.query(`
          UPDATE towers 
          SET units_defined = COALESCE(units_defined, 0) + 1
          WHERE id = $1
        `, [createBookingDto.towerId]);
                this.logger.log(`Tower unit count updated`);
            }
            customer.lastBookingDate = savedBooking.bookingDate;
            await queryRunner.manager.save(customer_entity_1.Customer, customer);
            this.logger.log(`Customer ${customer.id} last booking date updated`);
            await queryRunner.commitTransaction();
            this.logger.log(`Transaction committed for booking ${savedBooking.bookingNumber}`);
            try {
                await schedulePromise;
                this.logger.log(`Payment schedule generated for booking ${savedBooking.bookingNumber}`);
            }
            catch (error) {
                this.logger.error(`Failed to generate payment schedule:`, error);
            }
            this.sendBookingNotifications(savedBooking, customer, flat, property)
                .catch(error => {
                this.logger.error('Error sending booking notifications:', error);
            });
            const bookingWithRelations = await this.bookingsRepository.findOne({
                where: { id: savedBooking.id },
                relations: ['customer', 'flat', 'property'],
            });
            return dto_1.BookingResponseDto.fromEntity(bookingWithRelations);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Error creating booking, transaction rolled back:`, error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async sendBookingNotifications(booking, customer, flat, property) {
        try {
            await this.emailService.sendBookingConfirmationToCustomer(booking, customer, flat, property);
            this.logger.log(`Booking confirmation email sent to customer: ${customer.email}`);
            await this.emailService.sendBookingNotificationToAdmin(booking, customer, flat, property);
            this.logger.log(`Booking notification email sent to admin`);
        }
        catch (error) {
            this.logger.error('Error in sendBookingNotifications:', error);
        }
    }
    async findAll(query) {
        const { search, status, paymentStatus, customerId, flatId, propertyId, bookingDateFrom, bookingDateTo, isHomeLoan, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', } = query;
        const queryBuilder = this.bookingsRepository
            .createQueryBuilder('booking')
            .leftJoinAndSelect('booking.customer', 'customer')
            .leftJoinAndSelect('booking.flat', 'flat')
            .leftJoinAndSelect('booking.property', 'property');
        if (search) {
            queryBuilder.andWhere('(booking.bookingNumber ILIKE :search OR booking.agreementNumber ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search)', { search: `%${search}%` });
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
            queryBuilder.andWhere('booking.propertyId = :propertyId', { propertyId });
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
        queryBuilder.orderBy(`booking.${sortBy}`, sortOrder);
        const total = await queryBuilder.getCount();
        const bookings = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return {
            data: dto_1.BookingResponseDto.fromEntities(bookings),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const booking = await this.bookingsRepository.findOne({
            where: { id },
            relations: ['customer', 'flat', 'property'],
        });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        return dto_1.BookingResponseDto.fromEntity(booking);
    }
    async update(id, updateBookingDto) {
        const booking = await this.bookingsRepository.findOne({ where: { id } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        if (updateBookingDto.bookingNumber && updateBookingDto.bookingNumber !== booking.bookingNumber) {
            const existing = await this.bookingsRepository.findOne({
                where: { bookingNumber: updateBookingDto.bookingNumber },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException('Booking number already exists');
            }
        }
        const totalAmount = updateBookingDto.totalAmount ?? booking.totalAmount;
        const paidAmount = updateBookingDto.paidAmount ?? booking.paidAmount;
        const balanceAmount = Number(totalAmount) - Number(paidAmount);
        Object.assign(booking, {
            ...updateBookingDto,
            balanceAmount,
        });
        const updatedBooking = await this.bookingsRepository.save(booking);
        return dto_1.BookingResponseDto.fromEntity(updatedBooking);
    }
    async remove(id) {
        const booking = await this.bookingsRepository.findOne({ where: { id } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        booking.isActive = false;
        await this.bookingsRepository.save(booking);
    }
    async cancelBooking(id, reason, refundAmount) {
        const booking = await this.bookingsRepository.findOne({ where: { id } });
        if (!booking) {
            throw new common_1.NotFoundException(`Booking with ID ${id} not found`);
        }
        if (booking.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Booking is already cancelled');
        }
        booking.status = booking_entity_1.BookingStatus.CANCELLED;
        booking.cancellationDate = new Date();
        booking.cancellationReason = reason;
        booking.refundAmount = refundAmount;
        const cancelledBooking = await this.bookingsRepository.save(booking);
        return dto_1.BookingResponseDto.fromEntity(cancelledBooking);
    }
    async getStatistics() {
        const bookings = await this.bookingsRepository.find({ where: { isActive: true } });
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
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = BookingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(flat_entity_1.Flat)),
    __param(2, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __param(3, (0, typeorm_1.InjectRepository)(tower_entity_1.Tower)),
    __param(4, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        payments_service_1.PaymentsService,
        payment_schedule_service_1.PaymentScheduleService,
        email_service_1.EmailService,
        typeorm_2.DataSource])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map