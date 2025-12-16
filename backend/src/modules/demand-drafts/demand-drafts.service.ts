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
    // Fill with provided values or placeholders; intended to be user-editable before export.
    const name = (dto as any)?.customerName || 'Mrs. Namita Rout';
    const spouse = (dto as any)?.spouseName || 'Mr. Sisir Kumar Rout';
    const address = (dto as any)?.customerAddress || 'C-28, Banaharapali, Jharsuguda, Odisha,768234';
    const subjectMilestone = dto.milestoneId || 'On Starting of 5th floor';
    const flatLabel = (dto as any)?.flatLabel || 'Block C , Flat No-912, in Diamond City';
    const bhk = (dto as any)?.bhk || '3 BHK';
    const amount = dto.amount
      ? Number(dto.amount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
      : '₹ 0';
    const amountWords =
      (dto as any)?.amountWords ||
      'Four Lakh Eighty Nine Thousand Five Hundred Forty Two Rupees Fifty Paisa Only';
    const demandRef = (dto as any)?.reference || 'EECD/DEMAND/AUG/2025';
    const demandDate = (dto as any)?.date || '06/08/2025';
    const place = (dto as any)?.place || 'Cuttack';
    const bankDetails = (dto as any)?.bankDetails || {
      accountHolder: 'Eastern Estate Construction & Developer’s Pvt. Ltd.',
      accountNumber: '40683619139',
      ifsc: 'SBIN0063835',
    };

    return `To,
${name}
W/O ${spouse}
${address}

Subject: Release of ${subjectMilestone} payment in respect of ${name}.
as per agreement (under construction to the extent of ${subjectMilestone})
i.e ${amount} (${amountWords}).

Dear Sir/Madam,
In respect of the above we would like to mention that construction work in respect of
${flatLabel} allotted to ${name}, is under construction to the extent of ${subjectMilestone}.
In terms of the above mentioned agreement payment upto ${subjectMilestone} fallen due
as per details here under:-
Flat No: ${flatLabel}
BHK Type: ${bhk}
Demand Amount details as per construction mentioned below:-
Demand amount against construction
${subjectMilestone}
Total
${amount}

You are requested to release the above amount to DD/NEFT/RTGS as per our bank details given
below.
Account Holder : ${bankDetails.accountHolder}
Account Number : ${bankDetails.accountNumber}
IFSC : ${bankDetails.ifsc}
Date: - ${demandDate}

Place: - ${place}

Thanking You

Yours Faithfully
Eastern Estate Construction & Developer’s Pvt. Ltd.
www.eecd.in
Ref. ${demandRef}                                                                                            DATE-${demandDate}
`;
  }
}
