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
exports.DemandDraftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const demand_draft_entity_1 = require("./entities/demand-draft.entity");
const demand_draft_response_dto_1 = require("./dto/demand-draft-response.dto");
let DemandDraftsService = class DemandDraftsService {
    constructor(draftsRepo) {
        this.draftsRepo = draftsRepo;
    }
    async create(dto) {
        const draft = this.draftsRepo.create({
            ...dto,
            status: dto.status || demand_draft_entity_1.DemandDraftStatus.DRAFT,
            generatedAt: new Date(),
            content: dto.content || this.buildDefaultContent(dto),
        });
        const saved = await this.draftsRepo.save(draft);
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(saved);
    }
    async findAll(filters) {
        const qb = this.draftsRepo.createQueryBuilder('draft').orderBy('draft.createdAt', 'DESC');
        if (filters.flatId)
            qb.andWhere('draft.flatId = :flatId', { flatId: filters.flatId });
        if (filters.customerId)
            qb.andWhere('draft.customerId = :customerId', { customerId: filters.customerId });
        if (filters.bookingId)
            qb.andWhere('draft.bookingId = :bookingId', { bookingId: filters.bookingId });
        if (filters.milestoneId)
            qb.andWhere('draft.milestoneId = :milestoneId', { milestoneId: filters.milestoneId });
        const drafts = await qb.getMany();
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntities(drafts);
    }
    async findOne(id) {
        const draft = await this.findOneRaw(id);
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(draft);
    }
    async findOneRaw(id) {
        const draft = await this.draftsRepo.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft ${id} not found`);
        }
        return draft;
    }
    buildHtmlTemplate(draft) {
        const md = draft.metadata || {};
        const name = md.customerName || 'Customer';
        const spouse = md.spouseName || '';
        const address = md.customerAddress || '';
        const milestone = draft.milestoneId || md.milestoneId || '';
        const flatLabel = md.flatLabel || '';
        const flatNumber = md.flatNumber || '';
        const bhk = md.bhk || '';
        const amount = Number(draft.amount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
        const amountWords = md.amountWords || '';
        const ref = md.reference || '';
        const date = md.date || '';
        const place = md.place || '';
        const bank = md.bankDetails || {};
        const accountHolder = bank.accountHolder || '';
        const accountNumber = bank.accountNumber || '';
        const ifsc = bank.ifsc || '';
        return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: "Times New Roman", serif; font-size: 13px; color: #000; }
    .bold { font-weight: bold; }
    .mt { margin-top: 10px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table td, .table th { border: 1px solid #999; padding: 6px; }
    .right { text-align: right; }
    .underline { text-decoration: underline; }
  </style>
</head>
<body>
  <div>
    <div class="bold">To,</div>
    <div class="bold">${name}</div>
    ${spouse ? `<div>W/O ${spouse}</div>` : ''}
    <div>${address}</div>

    <div class="mt bold">
      Subject: Release of ${milestone} of payment in respect of ${name}.<br/>
      as per agreement (under construction to the extent of ${milestone})<br/>
      i.e ${amount} (${amountWords}).
    </div>

    <div class="mt">
      Dear Sir/Madam,<br/>
      In respect of the above we would like to mention that construction work in respect of ${flatLabel} allotted to <span class="bold">${name}</span>,<br/>
      is under construction to the extent of <span class="bold">${milestone}</span>. In terms of the above mentioned agreement payment upto <span class="bold">${milestone}</span> fallen due as per details here under:-
      <br/>Flat No: ${flatNumber}, ${flatLabel}
      <br/>BHK Type: ${bhk}
    </div>

    <div class="mt bold">Demand Amount details as per construction mentioned below:-</div>
    <table class="table">
      <tr>
        <th>Demand amount against construction</th>
        <th>${milestone.toUpperCase()}</th>
      </tr>
      <tr>
        <td class="bold">Total</td>
        <td class="right bold">${amount}</td>
      </tr>
    </table>

    <div class="mt">
      You are requested to release the above amount to DD/NEFT/RTGS as per our bank details given below.<br/>
      <span class="bold">Account Holder :</span> ${accountHolder}<br/>
      <span class="bold">Account Number :</span> ${accountNumber}<br/>
      <span class="bold">IFSC :</span> ${ifsc}<br/>
      <span class="bold">Date :</span> ${date}<br/>
      <span class="bold">Place :</span> ${place}
    </div>

    <div class="mt">
      Thanking You<br/><br/>
      Yours Faithfully<br/>
      <span class="bold">Eastern Estate Construction & Developer’s Pvt. Ltd.</span><br/>
      <a href="https://www.eecd.in">www.eecd.in</a>
    </div>

    <div class="mt">
      <span class="bold">Ref.</span> ${ref} &nbsp;&nbsp;&nbsp; DATE- ${date}
    </div>
  </div>
</body>
</html>`;
    }
    async update(id, dto) {
        const draft = await this.draftsRepo.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft ${id} not found`);
        }
        if (dto.status === demand_draft_entity_1.DemandDraftStatus.SENT) {
            draft.sentAt = draft.sentAt || new Date();
        }
        Object.assign(draft, dto);
        const saved = await this.draftsRepo.save(draft);
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(saved);
    }
    async markSent(id, fileUrl) {
        const draft = await this.draftsRepo.findOne({ where: { id } });
        if (!draft) {
            throw new common_1.NotFoundException(`Demand draft ${id} not found`);
        }
        draft.status = demand_draft_entity_1.DemandDraftStatus.SENT;
        draft.sentAt = new Date();
        if (fileUrl) {
            draft.fileUrl = fileUrl;
        }
        const saved = await this.draftsRepo.save(draft);
        return demand_draft_response_dto_1.DemandDraftResponseDto.fromEntity(saved);
    }
    buildDefaultContent(dto) {
        const md = dto?.metadata || {};
        const name = dto?.customerName || md.customerName || 'Mrs. Namita Rout';
        const spouse = dto?.spouseName || md.spouseName || 'Mr. Sisir Kumar Rout';
        const address = dto?.customerAddress || md.customerAddress || 'C-28, Banaharapali, Jharsuguda, Odisha,768234';
        const subjectMilestone = dto.milestoneId || md.milestoneId || 'On Starting of 5th floor';
        const flatLabel = dto?.flatLabel || md.flatLabel || 'Block C , Flat No-912, in Diamond City';
        const flatNumber = dto?.flatNumber || md.flatNumber || '912';
        const bhk = dto?.bhk || md.bhk || '3 BHK';
        const amountNumber = dto.amount ?? md.amount ?? 0;
        const amount = amountNumber
            ? Number(amountNumber).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
            : '₹ 0';
        const amountWords = dto?.amountWords ||
            md.amountWords ||
            'Four Lakh Eighty Nine Thousand Five Hundred Forty Two Rupees Fifty Paisa Only';
        const demandRef = dto?.reference || md.reference || 'EECD/DEMAND/AUG/2025';
        const demandDate = dto?.date || md.date || '06/08/2025';
        const place = dto?.place || md.place || 'Cuttack';
        const bankDetails = dto?.bankDetails ||
            md.bankDetails || {
            accountHolder: 'Eastern Estate Construction & Developer’s Pvt. Ltd.',
            accountNumber: '40683619139',
            ifsc: 'SBIN0063835',
        };
        return `To,
${name}
W/O ${spouse}
${address}

Subject: Release of ${subjectMilestone} of payment in respect of ${name}. 
as per agreement (under construction to the extent of ${subjectMilestone} )
i.e ${amount} (${amountWords}).

Dear Sir/Madam,
In respect of the above we would like to mention that construction work in respect of Block- 
${flatLabel} allotted to ${name},
is under construction to the extent of ${subjectMilestone}. In terms of 
the above mentioned agreement payment upto ${subjectMilestone} fallen due 
as per details here under:-
Flat No: ${flatNumber}, ${flatLabel}
BHK Type: ${bhk}
Demand Amount details as per construction mentioned below:-
Demand amount against construction
${subjectMilestone.toUpperCase()}
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
Ref. ${demandRef}                                                                                            DATE-${demandDate}`;
    }
};
exports.DemandDraftsService = DemandDraftsService;
exports.DemandDraftsService = DemandDraftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(demand_draft_entity_1.DemandDraft)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DemandDraftsService);
//# sourceMappingURL=demand-drafts.service.js.map