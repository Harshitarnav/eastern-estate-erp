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
exports.QCService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const qc_checklist_entity_1 = require("./entities/qc-checklist.entity");
const uuid_1 = require("uuid");
const PHASE_TEMPLATES = {
    FOUNDATION: [
        'Soil bearing capacity verified by geotechnical engineer',
        'PCC (Plain Cement Concrete) thickness as per drawing',
        'Footing dimensions match structural drawings',
        'Reinforcement — dia, spacing, cover as per design',
        'Concrete mix design approved and tested',
        'Cube test samples taken (28-day strength)',
        'Anti-termite treatment done before backfilling',
        'Backfilling compacted in layers',
    ],
    STRUCTURE: [
        'Column dimensions and alignment as per drawing',
        'Slab thickness and reinforcement correct',
        'Beam depth and reinforcement verified',
        'Concrete cover maintained (40mm for columns, 25mm for slabs)',
        'Shuttering properly supported — no deflection',
        'Slump test done before pouring',
        'Cube test samples taken',
        'Curing done minimum 14 days',
        'Staircase dimensions and reinforcement correct',
    ],
    MEP: [
        'Electrical conduit routing as per drawing',
        'Plumbing pipe routing and slope correct',
        'Drainage slope minimum 1:80',
        'Water supply pressure test done',
        'Electrical earthing connections verified',
        'Fire fighting pipe layout as per drawing',
        'HVAC duct routing approved',
        'All sleeves and cutouts provided before slab casting',
    ],
    FINISHING: [
        'Plaster thickness uniform (12mm for internal, 15mm for external)',
        'Tile alignment and grout quality checked',
        'Door and window frames plumb and level',
        'Paint finish — no patches, drips or uneven coverage',
        'Flooring level — tolerance ±3mm in 3m',
        'False ceiling level and joints flush',
        'Electrical fixtures and switches installed correctly',
        'Plumbing fixtures — no leaks, proper sealing',
        'Glass glazing — no chips, cracks, proper silicone',
    ],
    HANDOVER: [
        'All snag items from previous inspections resolved',
        'Flat cleaned, no construction debris',
        'All doors and windows open/close smoothly',
        'Electrical — all points tested, MCB working',
        'Plumbing — all taps, WC, basin functional',
        'Water meter and electricity meter connected',
        'Building completion certificate obtained',
        'RERA compliance documents in order',
        'Occupation certificate (OC) received',
    ],
};
let QCService = class QCService {
    constructor(qcRepo) {
        this.qcRepo = qcRepo;
    }
    async create(createDto, userId) {
        let items = createDto.items || [];
        if (items.length === 0 && createDto.phase) {
            const templateItems = PHASE_TEMPLATES[createDto.phase] || [];
            items = templateItems.map(desc => ({
                id: (0, uuid_1.v4)(),
                description: desc,
                status: 'PENDING',
                remarks: '',
            }));
        }
        const checklist = this.qcRepo.create({
            ...createDto,
            items,
            defects: createDto.defects || [],
            overallResult: qc_checklist_entity_1.QCResult.PENDING,
            createdBy: userId || null,
            inspectionDate: createDto.inspectionDate ? new Date(createDto.inspectionDate) : new Date(),
            nextInspectionDate: createDto.nextInspectionDate ? new Date(createDto.nextInspectionDate) : null,
        });
        return (await this.qcRepo.save(checklist));
    }
    async findAll(filters) {
        const qb = this.qcRepo.createQueryBuilder('qc')
            .leftJoinAndSelect('qc.constructionProject', 'project')
            .orderBy('qc.inspectionDate', 'DESC');
        if (filters?.constructionProjectId) {
            qb.andWhere('qc.constructionProjectId = :projectId', { projectId: filters.constructionProjectId });
        }
        if (filters?.phase) {
            qb.andWhere('qc.phase = :phase', { phase: filters.phase });
        }
        if (filters?.result) {
            qb.andWhere('qc.overallResult = :result', { result: filters.result });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const checklist = await this.qcRepo.findOne({
            where: { id },
            relations: ['constructionProject', 'creator'],
        });
        if (!checklist) {
            throw new common_1.NotFoundException(`QC Checklist with ID ${id} not found`);
        }
        return checklist;
    }
    async update(id, updateDto) {
        const checklist = await this.findOne(id);
        Object.assign(checklist, updateDto);
        if (updateDto.inspectionDate)
            checklist.inspectionDate = new Date(updateDto.inspectionDate);
        if (updateDto.nextInspectionDate)
            checklist.nextInspectionDate = new Date(updateDto.nextInspectionDate);
        if (updateDto.items) {
            const items = updateDto.items;
            const failCount = items.filter(i => i.status === 'FAIL').length;
            const passCount = items.filter(i => i.status === 'PASS').length;
            const pendingCount = items.filter(i => i.status === 'PENDING').length;
            if (pendingCount > 0) {
                checklist.overallResult = qc_checklist_entity_1.QCResult.PENDING;
            }
            else if (failCount > 0) {
                checklist.overallResult = failCount === items.length ? qc_checklist_entity_1.QCResult.FAIL : qc_checklist_entity_1.QCResult.PARTIAL;
            }
            else if (passCount > 0) {
                checklist.overallResult = qc_checklist_entity_1.QCResult.PASS;
            }
        }
        return await this.qcRepo.save(checklist);
    }
    async updateDefect(id, defectId, updateData) {
        const checklist = await this.findOne(id);
        const defectIdx = checklist.defects.findIndex(d => d.id === defectId);
        if (defectIdx === -1)
            throw new common_1.NotFoundException(`Defect not found`);
        checklist.defects[defectIdx] = { ...checklist.defects[defectIdx], ...updateData };
        return await this.qcRepo.save(checklist);
    }
    async addDefect(id, defect) {
        const checklist = await this.findOne(id);
        checklist.defects.push({ ...defect, id: (0, uuid_1.v4)() });
        return await this.qcRepo.save(checklist);
    }
    async getTemplate(phase) {
        const items = PHASE_TEMPLATES[phase] || [];
        return items.map(desc => ({
            id: (0, uuid_1.v4)(),
            description: desc,
            status: 'PENDING',
            remarks: '',
        }));
    }
    async getProjectSummary(constructionProjectId) {
        const checklists = await this.findAll({ constructionProjectId });
        return {
            total: checklists.length,
            passed: checklists.filter(c => c.overallResult === qc_checklist_entity_1.QCResult.PASS).length,
            failed: checklists.filter(c => c.overallResult === qc_checklist_entity_1.QCResult.FAIL).length,
            partial: checklists.filter(c => c.overallResult === qc_checklist_entity_1.QCResult.PARTIAL).length,
            pending: checklists.filter(c => c.overallResult === qc_checklist_entity_1.QCResult.PENDING).length,
            openDefects: checklists.reduce((s, c) => s + c.defects.filter(d => d.status === 'OPEN').length, 0),
            checklists,
        };
    }
    async remove(id) {
        const checklist = await this.findOne(id);
        await this.qcRepo.remove(checklist);
    }
};
exports.QCService = QCService;
exports.QCService = QCService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(qc_checklist_entity_1.QCChecklist)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], QCService);
//# sourceMappingURL=qc.service.js.map