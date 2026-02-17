import { PropertyAccessService, GrantAccessDto, BulkGrantAccessDto } from '../services/property-access.service';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class PropertyAccessController {
    private readonly propertyAccessService;
    private readonly notificationsService;
    constructor(propertyAccessService: PropertyAccessService, notificationsService: NotificationsService);
    grantAccess(grantAccessDto: GrantAccessDto, req: any): Promise<import("../entities/user-property-access.entity").UserPropertyAccess>;
    bulkGrantAccess(bulkGrantDto: BulkGrantAccessDto, req: any): Promise<import("../entities/user-property-access.entity").UserPropertyAccess[]>;
    revokeAccess(body: {
        userId: string;
        propertyId: string;
        role?: string;
    }, req: any): Promise<{
        message: string;
    }>;
    getAllPropertyAccess(): Promise<{
        message: string;
    }>;
    getUserPropertyAccess(userId: string): Promise<import("../entities/user-property-access.entity").UserPropertyAccess[]>;
    grantAccessToUser(userId: string, body: {
        propertyId: string;
        role: string;
    }, req: any): Promise<import("../entities/user-property-access.entity").UserPropertyAccess>;
    revokeAccessFromUser(userId: string, propertyId: string, role: string, req: any): Promise<{
        message: string;
    }>;
}
