import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RABill, RABillStatus } from './entities/ra-bill.entity';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service';

@Injectable()
export class RABillsService {
  constructor(
    @InjectRepository(RABill)
    private readonly raBillRepository: Repository<RABill>,
    private readonly accountingIntegration: AccountingIntegrationService,
  ) {}

  private async generateBillNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.raBillRepository.count();
    return `RA-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(createDto: any, userId?: string): Promise<RABill> {
    const raBillNumber = await this.generateBillNumber();

    // Auto-calculate net payable
    const netThisBill = Number(createDto.grossAmount || 0) - Number(createDto.previousBillsAmount || 0);
    const retentionAmount = Math.round(netThisBill * (Number(createDto.retentionPercentage || 0) / 100) * 100) / 100;
    const netPayable = netThisBill - retentionAmount - Number(createDto.advanceDeduction || 0) - Number(createDto.otherDeductions || 0);

    const bill = this.raBillRepository.create({
      ...createDto,
      raBillNumber,
      netThisBill: Math.max(0, netThisBill),
      retentionAmount,
      netPayable: Math.max(0, netPayable),
      createdBy: userId || null,
      billDate: createDto.billDate ? new Date(createDto.billDate) : new Date(),
      billPeriodStart: createDto.billPeriodStart ? new Date(createDto.billPeriodStart) : null,
      billPeriodEnd: createDto.billPeriodEnd ? new Date(createDto.billPeriodEnd) : null,
    });

    return (await this.raBillRepository.save(bill)) as unknown as RABill;
  }

  async findAll(filters?: {
    constructionProjectId?: string;
    vendorId?: string;
    status?: string;
    propertyId?: string;
  }): Promise<RABill[]> {
    const qb = this.raBillRepository.createQueryBuilder('bill')
      .leftJoinAndSelect('bill.vendor', 'vendor')
      .leftJoinAndSelect('bill.constructionProject', 'project')
      .leftJoinAndSelect('bill.property', 'property')
      .orderBy('bill.billDate', 'DESC');

    if (filters?.constructionProjectId) {
      qb.andWhere('bill.constructionProjectId = :projectId', { projectId: filters.constructionProjectId });
    }
    if (filters?.vendorId) {
      qb.andWhere('bill.vendorId = :vendorId', { vendorId: filters.vendorId });
    }
    if (filters?.status) {
      qb.andWhere('bill.status = :status', { status: filters.status });
    }
    if (filters?.propertyId) {
      qb.andWhere('bill.propertyId = :propertyId', { propertyId: filters.propertyId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<RABill> {
    const bill = await this.raBillRepository.findOne({
      where: { id },
      relations: ['vendor', 'constructionProject', 'property', 'certifier', 'approver', 'creator'],
    });

    if (!bill) {
      throw new NotFoundException(`RA Bill with ID ${id} not found`);
    }

    return bill;
  }

  async update(id: string, updateDto: any): Promise<RABill> {
    const bill = await this.findOne(id);

    if ([RABillStatus.APPROVED, RABillStatus.PAID].includes(bill.status) && !updateDto.status) {
      throw new BadRequestException('Cannot edit an approved or paid RA Bill. Change status first.');
    }

    Object.assign(bill, updateDto);

    // Recalculate if amounts changed
    if (updateDto.grossAmount !== undefined || updateDto.previousBillsAmount !== undefined ||
        updateDto.retentionPercentage !== undefined || updateDto.advanceDeduction !== undefined ||
        updateDto.otherDeductions !== undefined) {
      const netThisBill = Number(bill.grossAmount) - Number(bill.previousBillsAmount);
      const retentionAmount = Math.round(netThisBill * (Number(bill.retentionPercentage) / 100) * 100) / 100;
      bill.netThisBill = Math.max(0, netThisBill);
      bill.retentionAmount = retentionAmount;
      bill.netPayable = Math.max(0, netThisBill - retentionAmount - Number(bill.advanceDeduction) - Number(bill.otherDeductions));
    }

    if (updateDto.billDate) bill.billDate = new Date(updateDto.billDate);
    if (updateDto.billPeriodStart) bill.billPeriodStart = new Date(updateDto.billPeriodStart);
    if (updateDto.billPeriodEnd) bill.billPeriodEnd = new Date(updateDto.billPeriodEnd);

    return await this.raBillRepository.save(bill);
  }

  async submit(id: string): Promise<RABill> {
    const bill = await this.findOne(id);
    if (bill.status !== RABillStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT bills can be submitted');
    }
    bill.status = RABillStatus.SUBMITTED;
    return await this.raBillRepository.save(bill);
  }

  async certify(id: string, userId: string): Promise<RABill> {
    const bill = await this.findOne(id);
    if (bill.status !== RABillStatus.SUBMITTED) {
      throw new BadRequestException('Only SUBMITTED bills can be certified');
    }
    bill.status = RABillStatus.CERTIFIED;
    bill.certifiedBy = userId;
    bill.certifiedAt = new Date();
    return await this.raBillRepository.save(bill);
  }

  async approve(id: string, userId: string): Promise<RABill> {
    const bill = await this.findOne(id);
    if (bill.status !== RABillStatus.CERTIFIED) {
      throw new BadRequestException('Only CERTIFIED bills can be approved');
    }
    bill.status = RABillStatus.APPROVED;
    bill.approvedBy = userId;
    bill.approvedAt = new Date();
    return await this.raBillRepository.save(bill);
  }

  async markPaid(id: string, paymentReference?: string, userId?: string): Promise<RABill> {
    const bill = await this.findOne(id);
    if (bill.status !== RABillStatus.APPROVED) {
      throw new BadRequestException('Only APPROVED bills can be marked as paid');
    }
    bill.status = RABillStatus.PAID;
    bill.paidAt = new Date();
    if (paymentReference) bill.paymentReference = paymentReference;

    const savedBill = await this.raBillRepository.save(bill);

    // ── Auto Journal Entry: Dr Construction Expense / Cr Bank ──────────────
    const je = await this.accountingIntegration.onRABillPaid({
      id: savedBill.id,
      raBillNumber: savedBill.raBillNumber,
      netPayable: Number(savedBill.netPayable),
      paidAt: savedBill.paidAt!,
      vendorName: savedBill.vendor?.vendorName,
      projectName: savedBill.constructionProject?.projectName,
      createdBy: userId,
    });

    // Store JE reference back on the bill (best-effort)
    if (je) {
      await this.raBillRepository.update(savedBill.id, { journalEntryId: je.id });
      savedBill.journalEntryId = je.id;
    }

    return savedBill;
  }

  async reject(id: string, notes?: string): Promise<RABill> {
    const bill = await this.findOne(id);
    if ([RABillStatus.PAID].includes(bill.status)) {
      throw new BadRequestException('Paid bills cannot be rejected');
    }
    bill.status = RABillStatus.REJECTED;
    if (notes) bill.notes = notes;
    return await this.raBillRepository.save(bill);
  }

  async remove(id: string): Promise<void> {
    const bill = await this.findOne(id);
    if (bill.status !== RABillStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT bills can be deleted');
    }
    await this.raBillRepository.remove(bill);
  }

  async getSummaryByProject(constructionProjectId: string) {
    const bills = await this.findAll({ constructionProjectId });
    return {
      total: bills.length,
      totalGrossAmount: bills.reduce((s, b) => s + Number(b.grossAmount), 0),
      totalNetPayable: bills.reduce((s, b) => s + Number(b.netPayable), 0),
      totalRetention: bills.reduce((s, b) => s + Number(b.retentionAmount), 0),
      pendingApproval: bills.filter(b => [RABillStatus.SUBMITTED, RABillStatus.CERTIFIED].includes(b.status)).length,
      totalPaid: bills.filter(b => b.status === RABillStatus.PAID).reduce((s, b) => s + Number(b.netPayable), 0),
      bills,
    };
  }
}
