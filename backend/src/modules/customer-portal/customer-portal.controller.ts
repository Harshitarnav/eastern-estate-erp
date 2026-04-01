import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CustomerPortalService } from './customer-portal.service';
import { CustomerPortalGuard } from './customer-portal.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Customer } from '../customers/entities/customer.entity';
import * as bcrypt from 'bcrypt';

@Controller('customer-portal')
export class CustomerPortalController {
  constructor(
    private readonly portalService: CustomerPortalService,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Customer) private customersRepo: Repository<Customer>,
  ) {}

  // ── Customer portal routes (requires CustomerPortalGuard) ─────────────────

  @UseGuards(JwtAuthGuard, CustomerPortalGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return this.portalService.getProfile(req.customerId);
  }

  @UseGuards(JwtAuthGuard, CustomerPortalGuard)
  @Get('bookings')
  getBookings(@Req() req: any) {
    return this.portalService.getBookings(req.customerId);
  }

  @UseGuards(JwtAuthGuard, CustomerPortalGuard)
  @Get('bookings/:id')
  getBookingDetail(@Req() req: any, @Param('id') id: string) {
    return this.portalService.getBookingDetail(req.customerId, id);
  }

  @UseGuards(JwtAuthGuard, CustomerPortalGuard)
  @Get('payments')
  getPayments(@Req() req: any) {
    return this.portalService.getPayments(req.customerId);
  }

  @UseGuards(JwtAuthGuard, CustomerPortalGuard)
  @Get('construction')
  getConstructionUpdates(@Req() req: any) {
    return this.portalService.getConstructionUpdates(req.customerId);
  }

  @UseGuards(JwtAuthGuard, CustomerPortalGuard)
  @Get('demand-drafts')
  getDemandDrafts(@Req() req: any) {
    return this.portalService.getDemandDrafts(req.customerId);
  }

  // ── ERP admin route: invite a customer to the portal ─────────────────────
  // Called by HR/Admin from the ERP Customer detail page.
  // Creates a User account linked to the customer.

  @UseGuards(JwtAuthGuard)
  @Post('invite/:customerId')
  async inviteCustomer(
    @Param('customerId') customerId: string,
    @Body() body: { password: string },
    @Req() req: any,
  ) {
    const adminRoles: string[] = (req.user?.roles || []).map((r: any) =>
      typeof r === 'string' ? r : r.name,
    );
    const isAdmin = adminRoles.some((r) =>
      ['admin', 'super_admin', 'hr'].includes(r),
    );
    if (!isAdmin) throw new BadRequestException('Insufficient permissions');

    const customer = await this.customersRepo.findOne({
      where: { id: customerId },
    });
    if (!customer) throw new BadRequestException('Customer not found');
    if (!customer.email)
      throw new BadRequestException(
        'Customer must have an email address to create a portal account',
      );

    // Check if a user already exists for this customer or email
    const existing = await this.usersRepo
      .createQueryBuilder('u')
      .where('u.email = :email OR u.customerId = :cid', {
        email: customer.email,
        cid: customerId,
      })
      .getOne();

    if (existing) {
      throw new BadRequestException(
        'A portal account already exists for this customer',
      );
    }

    const customerRole = await this.rolesRepo.findOne({
      where: { name: 'customer' },
    });
    if (!customerRole)
      throw new BadRequestException(
        'Customer role not found — run the v009 migration first',
      );

    const password = await bcrypt.hash(
      body.password || Math.random().toString(36).slice(-10),
      12,
    );

    const nameParts = (customer.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = this.usersRepo.create({
      email: customer.email,
      username: customer.email.split('@')[0] + '_' + customer.customerCode,
      password,
      firstName,
      lastName,
      phone: customer.phoneNumber,
      customerId: customer.id,
      roles: [customerRole],
      createdBy: req.user?.id,
    });

    const saved = await this.usersRepo.save(user);

    return {
      message: 'Portal account created successfully',
      userId: saved.id,
      email: saved.email,
    };
  }

  // Check if a customer already has a portal account
  @UseGuards(JwtAuthGuard)
  @Get('check/:customerId')
  async checkPortalAccount(@Param('customerId') customerId: string) {
    const user = await this.usersRepo.findOne({
      where: { customerId },
      select: ['id', 'email', 'isActive', 'lastLoginAt'],
    });
    return { hasAccount: !!user, user: user || null };
  }
}
