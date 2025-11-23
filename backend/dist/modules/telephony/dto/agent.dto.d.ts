export declare class UpdateAgentAvailabilityDto {
    employeeId: number;
    isAvailable: boolean;
    reason?: string;
}
export declare class UpdateAgentSkillsDto {
    employeeId: number;
    skills: string[];
}
export declare class AgentStatsQueryDto {
    propertyId?: number;
    employeeId?: number;
}
