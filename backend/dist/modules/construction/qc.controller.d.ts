import { QCService } from './qc.service';
export declare class QCController {
    private readonly qcService;
    constructor(qcService: QCService);
    getTemplate(phase: string): Promise<{
        id: string;
        description: string;
        status: string;
        remarks: string;
    }[]>;
    getProjectSummary(projectId: string): Promise<{
        total: number;
        passed: number;
        failed: number;
        partial: number;
        pending: number;
        openDefects: number;
        checklists: import("./entities/qc-checklist.entity").QCChecklist[];
    }>;
    findAll(constructionProjectId?: string, phase?: string, result?: string): Promise<import("./entities/qc-checklist.entity").QCChecklist[]>;
    create(createDto: any, req: any): Promise<import("./entities/qc-checklist.entity").QCChecklist>;
    findOne(id: string): Promise<import("./entities/qc-checklist.entity").QCChecklist>;
    update(id: string, updateDto: any): Promise<import("./entities/qc-checklist.entity").QCChecklist>;
    addDefect(id: string, defect: any): Promise<import("./entities/qc-checklist.entity").QCChecklist>;
    updateDefect(id: string, defectId: string, updateData: any): Promise<import("./entities/qc-checklist.entity").QCChecklist>;
    remove(id: string): Promise<void>;
}
