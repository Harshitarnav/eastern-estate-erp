import { DemandDraftsService } from './demand-drafts.service';
import { AutoDemandDraftService } from '../construction/services/auto-demand-draft.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class DemandDraftsController {
    private readonly demandDraftsService;
    private readonly autoDemandDraftService;
    private readonly notificationsService;
    constructor(demandDraftsService: DemandDraftsService, autoDemandDraftService: AutoDemandDraftService, notificationsService: NotificationsService);
    findAll(query: any, req: any): Promise<import("./entities/demand-draft.entity").DemandDraft[]>;
    findOne(id: string): Promise<import("./entities/demand-draft.entity").DemandDraft>;
    create(createDto: any, req: any): Promise<import("./entities/demand-draft.entity").DemandDraft>;
    update(id: string, updateDto: any, req: any): Promise<import("./entities/demand-draft.entity").DemandDraft>;
    remove(id: string): Promise<{
        message: string;
    }>;
    approve(id: string, req: any): Promise<import("./entities/demand-draft.entity").DemandDraft>;
    send(id: string, req: any): Promise<import("./entities/demand-draft.entity").DemandDraft>;
    preview(id: string): Promise<{
        html: string;
        metadata: any;
    }>;
    export(id: string): Promise<{
        html: string;
        filename: string;
        contentType: string;
    }>;
}
