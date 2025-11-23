import { Repository } from 'typeorm';
import { AgentAvailability } from '../entities/agent-availability.entity';
import { CallQueue } from '../entities/call-queue.entity';
export interface AgentSelection {
    employeeId: number;
    employeeName: string;
    phoneNumber: string;
    skills: string[];
    currentLoad: number;
}
export interface CallDistributionRequest {
    propertyId: number;
    customerPhone: string;
    customerName?: string;
    requiredSkills?: string[];
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}
export declare class RoundRobinService {
    private agentAvailabilityRepo;
    private callQueueRepo;
    private readonly logger;
    constructor(agentAvailabilityRepo: Repository<AgentAvailability>, callQueueRepo: Repository<CallQueue>);
    getNextAvailableAgent(request: CallDistributionRequest): Promise<AgentSelection | null>;
    private getAvailableAgents;
    private filterBySkills;
    private selectAgentRoundRobin;
    addToQueue(request: CallDistributionRequest): Promise<CallQueue>;
    processQueue(propertyId: number): Promise<void>;
    updateAgentLoad(employeeId: number, increment: boolean): Promise<void>;
    getAgentStats(employeeId: number): Promise<any>;
    getQueueStats(propertyId: number): Promise<any>;
    setAgentAvailability(employeeId: number, available: boolean, reason?: string): Promise<void>;
}
