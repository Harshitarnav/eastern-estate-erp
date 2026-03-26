import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QCChecklist, QCResult, QCCheckItem, QCDefect } from './entities/qc-checklist.entity';
import { v4 as uuidv4 } from 'uuid';

// Default checklist templates per phase
const PHASE_TEMPLATES: Record<string, string[]> = {
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

@Injectable()
export class QCService {
  constructor(
    @InjectRepository(QCChecklist)
    private readonly qcRepo: Repository<QCChecklist>,
  ) {}

  async create(createDto: any, userId?: string): Promise<QCChecklist> {
    // Auto-populate items from template if not provided
    let items: QCCheckItem[] = createDto.items || [];
    if (items.length === 0 && createDto.phase) {
      const templateItems = PHASE_TEMPLATES[createDto.phase] || [];
      items = templateItems.map(desc => ({
        id: uuidv4(),
        description: desc,
        status: 'PENDING' as const,
        remarks: '',
      }));
    }

    const checklist = this.qcRepo.create({
      ...createDto,
      items,
      defects: createDto.defects || [],
      overallResult: QCResult.PENDING,
      createdBy: userId || null,
      inspectionDate: createDto.inspectionDate ? new Date(createDto.inspectionDate) : new Date(),
      nextInspectionDate: createDto.nextInspectionDate ? new Date(createDto.nextInspectionDate) : null,
    });

    return (await this.qcRepo.save(checklist)) as unknown as QCChecklist;
  }

  async findAll(filters?: { constructionProjectId?: string; phase?: string; result?: string }) {
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

  async findOne(id: string): Promise<QCChecklist> {
    const checklist = await this.qcRepo.findOne({
      where: { id },
      relations: ['constructionProject', 'creator'],
    });

    if (!checklist) {
      throw new NotFoundException(`QC Checklist with ID ${id} not found`);
    }

    return checklist;
  }

  async update(id: string, updateDto: any): Promise<QCChecklist> {
    const checklist = await this.findOne(id);
    Object.assign(checklist, updateDto);

    if (updateDto.inspectionDate) checklist.inspectionDate = new Date(updateDto.inspectionDate);
    if (updateDto.nextInspectionDate) checklist.nextInspectionDate = new Date(updateDto.nextInspectionDate);

    // Auto-calculate overall result from items
    if (updateDto.items) {
      const items: QCCheckItem[] = updateDto.items;
      const failCount = items.filter(i => i.status === 'FAIL').length;
      const passCount = items.filter(i => i.status === 'PASS').length;
      const pendingCount = items.filter(i => i.status === 'PENDING').length;

      if (pendingCount > 0) {
        checklist.overallResult = QCResult.PENDING;
      } else if (failCount > 0) {
        checklist.overallResult = failCount === items.length ? QCResult.FAIL : QCResult.PARTIAL;
      } else if (passCount > 0) {
        checklist.overallResult = QCResult.PASS;
      }
    }

    return await this.qcRepo.save(checklist);
  }

  async updateDefect(id: string, defectId: string, updateData: Partial<QCDefect>): Promise<QCChecklist> {
    const checklist = await this.findOne(id);
    const defectIdx = checklist.defects.findIndex(d => d.id === defectId);

    if (defectIdx === -1) throw new NotFoundException(`Defect not found`);

    checklist.defects[defectIdx] = { ...checklist.defects[defectIdx], ...updateData };

    return await this.qcRepo.save(checklist);
  }

  async addDefect(id: string, defect: Omit<QCDefect, 'id'>): Promise<QCChecklist> {
    const checklist = await this.findOne(id);
    checklist.defects.push({ ...defect, id: uuidv4() });
    return await this.qcRepo.save(checklist);
  }

  async getTemplate(phase: string) {
    const items = PHASE_TEMPLATES[phase] || [];
    return items.map(desc => ({
      id: uuidv4(),
      description: desc,
      status: 'PENDING',
      remarks: '',
    }));
  }

  async getProjectSummary(constructionProjectId: string) {
    const checklists = await this.findAll({ constructionProjectId });
    return {
      total: checklists.length,
      passed: checklists.filter(c => c.overallResult === QCResult.PASS).length,
      failed: checklists.filter(c => c.overallResult === QCResult.FAIL).length,
      partial: checklists.filter(c => c.overallResult === QCResult.PARTIAL).length,
      pending: checklists.filter(c => c.overallResult === QCResult.PENDING).length,
      openDefects: checklists.reduce((s, c) => s + c.defects.filter(d => d.status === 'OPEN').length, 0),
      checklists,
    };
  }

  async remove(id: string): Promise<void> {
    const checklist = await this.findOne(id);
    await this.qcRepo.remove(checklist);
  }
}
