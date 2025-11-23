import { Property } from '../../properties/entities/property.entity';
export declare class RoundRobinConfig {
    id: string;
    propertyId: string;
    property: Property;
    name: string;
    department: string;
    algorithm: 'ROUND_ROBIN' | 'LEAST_BUSY' | 'SKILL_BASED' | 'PRIORITY';
    maxQueueSize: number;
    maxWaitTime: number;
    maxRingTime: number;
    overflowAction: 'VOICEMAIL' | 'CALLBACK' | 'TRANSFER' | 'HANGUP';
    overflowNumber: string;
    overflowMessage: string;
    businessHours: any;
    timezone: string;
    priorityRules: any;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
