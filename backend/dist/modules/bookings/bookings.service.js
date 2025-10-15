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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const dto_1 = require("./dto");
let BookingsService = class BookingsService {
    constructor(bookingsRepository) {
        this.bookingsRepository = bookingsRepository;
    }
    async create(createBookingDto) {
        const existing = await this.bookingsRepository.findOne({
            where: { bookingNumber: createBookingDto.bookingNumber },
        });
        if (existing) {
            throw new common_1.ConflictException('Booking number already exists');
        }
        const balanceAmount = createBookingDto.totalAmount - (createBookingDto.paidAmount || 0);
        const booking = this.bookingsRepository.create({
            ...createBookingDto,
            balanceAmount,
        });
        const savedBooking = await this.bookingsRepository.save(booking);
        return dto_1.BookingResponseDto.fromEntity(savedBooking);
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
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map