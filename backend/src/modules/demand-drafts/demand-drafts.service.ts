import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandDraft, DemandDraftStatus } from './entities/demand-draft.entity';
import { CreateDemandDraftDto } from './dto/create-demand-draft.dto';
import { UpdateDemandDraftDto } from './dto/update-demand-draft.dto';
import { DemandDraftResponseDto } from './dto/demand-draft-response.dto';

@Injectable()
export class DemandDraftsService {
  constructor(
    @InjectRepository(DemandDraft)
    private readonly draftsRepo: Repository<DemandDraft>,
  ) {}

  async create(dto: CreateDemandDraftDto): Promise<DemandDraftResponseDto> {
    const draft = this.draftsRepo.create({
      ...dto,
      status: dto.status || DemandDraftStatus.DRAFT,
      generatedAt: new Date(),
      content: dto.content || this.buildDefaultContent(dto),
    });
    const saved = await this.draftsRepo.save(draft);
    return DemandDraftResponseDto.fromEntity(saved);
  }

  async findAll(filters: {
    flatId?: string;
    customerId?: string;
    bookingId?: string;
    milestoneId?: string;
  }): Promise<DemandDraftResponseDto[]> {
    const qb = this.draftsRepo.createQueryBuilder('draft').orderBy('draft.createdAt', 'DESC');
    if (filters.flatId) qb.andWhere('draft.flatId = :flatId', { flatId: filters.flatId });
    if (filters.customerId) qb.andWhere('draft.customerId = :customerId', { customerId: filters.customerId });
    if (filters.bookingId) qb.andWhere('draft.bookingId = :bookingId', { bookingId: filters.bookingId });
    if (filters.milestoneId) qb.andWhere('draft.milestoneId = :milestoneId', { milestoneId: filters.milestoneId });

    const drafts = await qb.getMany();
    return DemandDraftResponseDto.fromEntities(drafts);
  }

  async findOne(id: string): Promise<DemandDraftResponseDto> {
    const draft = await this.draftsRepo.findOne({ where: { id } });
    if (!draft) {
      throw new NotFoundException(`Demand draft ${id} not found`);
    }
    return DemandDraftResponseDto.fromEntity(draft);
  }

  async update(id: string, dto: UpdateDemandDraftDto): Promise<DemandDraftResponseDto> {
    const draft = await this.draftsRepo.findOne({ where: { id } });
    if (!draft) {
      throw new NotFoundException(`Demand draft ${id} not found`);
    }

    if (dto.status === DemandDraftStatus.SENT) {
      draft.sentAt = draft.sentAt || new Date();
    }

    Object.assign(draft, dto);
    const saved = await this.draftsRepo.save(draft);
    return DemandDraftResponseDto.fromEntity(saved);
  }

  async markSent(id: string, fileUrl?: string): Promise<DemandDraftResponseDto> {
    const draft = await this.draftsRepo.findOne({ where: { id } });
    if (!draft) {
      throw new NotFoundException(`Demand draft ${id} not found`);
    }
    draft.status = DemandDraftStatus.SENT;
    draft.sentAt = new Date();
    if (fileUrl) {
      draft.fileUrl = fileUrl;
    }
    const saved = await this.draftsRepo.save(draft);
    return DemandDraftResponseDto.fromEntity(saved);
  }

  /**
   * Build a default draft content using provided metadata.
   * This is editable by calling update() before export.
   */
  buildDefaultContent(dto: Partial<CreateDemandDraftDto>): string {
    const name = (dto as any)?.customerName || 'Customer';
    const address = (dto as any)?.customerAddress || '—';
    const subjectMilestone = dto.milestoneId || 'construction milestone';
    const amount = dto.amount ? Number(dto.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '₹0';
    const flatInfo = (dto as any)?.flatInfo || 'Flat';
    const bankDetails = (dto as any)?.bankDetails || {
      accountHolder: 'Eastern Estate Construction & Developer’s Pvt. Ltd.',
      accountNumber: 'XXXXXXXXXXXX',
      ifsc: 'SBINXXXXXXX',
    };

    return `To,
${name}
${address}

Subject: Release of payment for ${subjectMilestone}.

Dear Sir/Madam,

In respect of the above we would like to mention that construction work for ${flatInfo} is under construction and has reached ${subjectMilestone}. As per the agreement, payment up to this stage has fallen due as detailed below:

Amount Due: ${amount}

You are requested to release the above amount via DD/NEFT/RTGS as per our bank details given below.
Account Holder : ${bankDetails.accountHolder}
Account Number : ${bankDetails.accountNumber}
IFSC : ${bankDetails.ifsc}

Thanking You

Yours Faithfully
Eastern Estate Construction & Developer’s Pvt. Ltd.
www.eecd.in
`;
  }
}
