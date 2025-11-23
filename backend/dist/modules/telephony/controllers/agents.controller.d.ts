import { RoundRobinService } from '../services/round-robin.service';
import { UpdateAgentAvailabilityDto } from '../dto/agent.dto';
export declare class AgentsController {
    private roundRobinService;
    private readonly logger;
    constructor(roundRobinService: RoundRobinService);
    getAgentStats(employeeId: number): Promise<{
        success: boolean;
        data: any;
    }>;
    updateAvailability(dto: UpdateAgentAvailabilityDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getQueueStats(propertyId: number): Promise<{
        success: boolean;
        data: any;
    }>;
    processQueue(propertyId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
