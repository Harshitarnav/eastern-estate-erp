import { Repository } from 'typeorm';
import { QCChecklist, QCDefect } from './entities/qc-checklist.entity';
export declare class QCService {
    private readonly qcRepo;
    constructor(qcRepo: Repository<QCChecklist>);
    create(createDto: any, userId?: string): Promise<QCChecklist>;
    findAll(filters?: {
        constructionProjectId?: string;
        phase?: string;
        result?: string;
    }): Promise<QCChecklist[]>;
    findOne(id: string): Promise<QCChecklist>;
    update(id: string, updateDto: any): Promise<QCChecklist>;
    updateDefect(id: string, defectId: string, updateData: Partial<QCDefect>): Promise<QCChecklist>;
    addDefect(id: string, defect: Omit<QCDefect, 'id'>): Promise<QCChecklist>;
    getTemplate(phase: string): Promise<{
        id: string;
        description: string;
        status: string;
        remarks: string;
    }[]>;
    getProjectSummary(constructionProjectId: string): Promise<{
        total: number;
        passed: number;
        failed: number;
        partial: number;
        pending: number;
        openDefects: number;
        checklists: QCChecklist[];
    }>;
    remove(id: string): Promise<void>;
}
