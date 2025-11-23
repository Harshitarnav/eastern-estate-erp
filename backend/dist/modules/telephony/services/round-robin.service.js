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
var RoundRobinService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundRobinService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_availability_entity_1 = require("../entities/agent-availability.entity");
const call_queue_entity_1 = require("../entities/call-queue.entity");
let RoundRobinService = RoundRobinService_1 = class RoundRobinService {
    constructor(agentAvailabilityRepo, callQueueRepo) {
        this.agentAvailabilityRepo = agentAvailabilityRepo;
        this.callQueueRepo = callQueueRepo;
        this.logger = new common_1.Logger(RoundRobinService_1.name);
    }
    async getNextAvailableAgent(request) {
        try {
            this.logger.log(`Finding agent for property ${request.propertyId}, customer: ${request.customerPhone}`);
            const availableAgents = await this.getAvailableAgents(request.propertyId);
            if (availableAgents.length === 0) {
                this.logger.warn(`No available agents for property ${request.propertyId}`);
                return null;
            }
            let eligibleAgents = availableAgents;
            if (request.requiredSkills && request.requiredSkills.length > 0) {
                eligibleAgents = this.filterBySkills(availableAgents, request.requiredSkills);
            }
            if (eligibleAgents.length === 0) {
                this.logger.warn('No agents with required skills found');
                return null;
            }
            const selectedAgent = this.selectAgentRoundRobin(eligibleAgents);
            this.logger.log(`Selected agent: ${selectedAgent.employeeName} (ID: ${selectedAgent.employeeId})`);
            return selectedAgent;
        }
        catch (error) {
            this.logger.error(`Error in getNextAvailableAgent: ${error.message}`, error.stack);
            return null;
        }
    }
    async getAvailableAgents(propertyId) {
        const agents = await this.agentAvailabilityRepo
            .createQueryBuilder('aa')
            .innerJoin('employees', 'e', 'e.id = aa.employee_id')
            .where('aa.property_id = :propertyId', { propertyId })
            .andWhere('aa.is_available = true')
            .andWhere('aa.status = :status', { status: 'AVAILABLE' })
            .andWhere('aa.current_calls < aa.max_concurrent_calls')
            .select([
            'aa.employee_id as "employeeId"',
            'e.first_name || \' \' || e.last_name as "employeeName"',
            'e.mobile_number as "phoneNumber"',
            'aa.skills as skills',
            'aa.current_calls as "currentLoad"',
            'aa.total_calls_today as "totalCallsToday"',
            'aa.last_call_at as "lastCallAt"',
        ])
            .getRawMany();
        return agents.map((agent) => ({
            employeeId: agent.employeeId,
            employeeName: agent.employeeName,
            phoneNumber: agent.phoneNumber,
            skills: agent.skills || [],
            currentLoad: agent.currentLoad || 0,
        }));
    }
    filterBySkills(agents, requiredSkills) {
        return agents.filter((agent) => {
            if (!agent.skills || agent.skills.length === 0)
                return false;
            return requiredSkills.some((skill) => agent.skills.some((agentSkill) => agentSkill.toLowerCase() === skill.toLowerCase()));
        });
    }
    selectAgentRoundRobin(agents) {
        agents.sort((a, b) => {
            if (a.currentLoad !== b.currentLoad) {
                return a.currentLoad - b.currentLoad;
            }
            return 0;
        });
        return agents[0];
    }
    async addToQueue(request) {
        try {
            this.logger.log(`Adding call to queue for property ${request.propertyId}`);
            const queueEntry = this.callQueueRepo.create({
                propertyId: request.propertyId,
                customerPhone: request.customerPhone,
                customerName: request.customerName,
                requiredSkills: request.requiredSkills,
                priority: request.priority || 'MEDIUM',
                status: 'WAITING',
                queuedAt: new Date(),
            });
            await this.callQueueRepo.save(queueEntry);
            this.logger.log(`Call queued with ID: ${queueEntry.id}`);
            return queueEntry;
        }
        catch (error) {
            this.logger.error(`Error adding call to queue: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processQueue(propertyId) {
        try {
            this.logger.log(`Processing queue for property ${propertyId}`);
            const queuedCalls = await this.callQueueRepo.find({
                where: {
                    propertyId,
                    status: 'WAITING',
                },
                order: {
                    priority: 'ASC',
                    queuedAt: 'ASC',
                },
                take: 10,
            });
            if (queuedCalls.length === 0) {
                this.logger.log('No calls in queue');
                return;
            }
            for (const call of queuedCalls) {
                const agent = await this.getNextAvailableAgent({
                    propertyId: call.propertyId,
                    customerPhone: call.customerPhone,
                    customerName: call.customerName,
                    requiredSkills: call.requiredSkills,
                    priority: call.priority,
                });
                if (agent) {
                    this.logger.log(`Assigning queued call ${call.id} to agent ${agent.employeeId}`);
                    call.status = 'ASSIGNED';
                    call.assignedTo = agent.employeeId;
                    call.assignedAt = new Date();
                    await this.callQueueRepo.save(call);
                }
                else {
                    this.logger.log('No available agents, keeping call in queue');
                    break;
                }
            }
        }
        catch (error) {
            this.logger.error(`Error processing queue: ${error.message}`, error.stack);
        }
    }
    async updateAgentLoad(employeeId, increment) {
        try {
            const agent = await this.agentAvailabilityRepo.findOne({
                where: { employeeId },
            });
            if (!agent) {
                this.logger.warn(`Agent ${employeeId} not found`);
                return;
            }
            if (increment) {
                agent.currentCalls += 1;
                agent.totalCallsToday += 1;
                agent.lastCallAt = new Date();
                if (agent.currentCalls >= agent.maxConcurrentCalls) {
                    agent.isAvailable = false;
                    agent.status = 'BUSY';
                }
            }
            else {
                agent.currentCalls = Math.max(0, agent.currentCalls - 1);
                if (agent.currentCalls < agent.maxConcurrentCalls) {
                    agent.isAvailable = true;
                    agent.status = 'AVAILABLE';
                }
            }
            await this.agentAvailabilityRepo.save(agent);
            this.logger.log(`Updated agent ${employeeId} load: ${agent.currentCalls}/${agent.maxConcurrentCalls}`);
            if (!increment && agent.isAvailable) {
                await this.processQueue(agent.propertyId);
            }
        }
        catch (error) {
            this.logger.error(`Error updating agent load: ${error.message}`, error.stack);
        }
    }
    async getAgentStats(employeeId) {
        try {
            const agent = await this.agentAvailabilityRepo.findOne({
                where: { employeeId },
            });
            if (!agent) {
                return null;
            }
            return {
                employeeId: agent.employeeId,
                isAvailable: agent.isAvailable,
                status: agent.status,
                currentCalls: agent.currentCalls,
                maxConcurrentCalls: agent.maxConcurrentCalls,
                totalCallsToday: agent.totalCallsToday,
                successfulCallsToday: agent.successfulCallsToday,
                successRate: agent.totalCallsToday > 0
                    ? (agent.successfulCallsToday / agent.totalCallsToday) * 100
                    : 0,
                lastCallAt: agent.lastCallAt,
            };
        }
        catch (error) {
            this.logger.error(`Error getting agent stats: ${error.message}`);
            return null;
        }
    }
    async getQueueStats(propertyId) {
        try {
            const stats = await this.callQueueRepo
                .createQueryBuilder('cq')
                .where('cq.property_id = :propertyId', { propertyId })
                .andWhere('cq.status = :status', { status: 'WAITING' })
                .select([
                'COUNT(*) as total',
                'COUNT(*) FILTER (WHERE priority = \'HIGH\') as high_priority',
                'COUNT(*) FILTER (WHERE priority = \'MEDIUM\') as medium_priority',
                'COUNT(*) FILTER (WHERE priority = \'LOW\') as low_priority',
                'AVG(EXTRACT(EPOCH FROM (NOW() - queued_at))) as avg_wait_seconds',
                'MAX(EXTRACT(EPOCH FROM (NOW() - queued_at))) as max_wait_seconds',
            ])
                .getRawOne();
            return {
                totalWaiting: parseInt(stats.total) || 0,
                highPriority: parseInt(stats.high_priority) || 0,
                mediumPriority: parseInt(stats.medium_priority) || 0,
                lowPriority: parseInt(stats.low_priority) || 0,
                avgWaitSeconds: parseFloat(stats.avg_wait_seconds) || 0,
                maxWaitSeconds: parseFloat(stats.max_wait_seconds) || 0,
            };
        }
        catch (error) {
            this.logger.error(`Error getting queue stats: ${error.message}`);
            return null;
        }
    }
    async setAgentAvailability(employeeId, available, reason) {
        try {
            const agent = await this.agentAvailabilityRepo.findOne({
                where: { employeeId },
            });
            if (!agent) {
                throw new Error(`Agent ${employeeId} not found`);
            }
            agent.isAvailable = available;
            agent.status = available ? 'AVAILABLE' : 'OFFLINE';
            if (reason) {
                this.logger.log(`Agent ${employeeId} availability changed: ${reason}`);
            }
            await this.agentAvailabilityRepo.save(agent);
            if (available) {
                await this.processQueue(agent.propertyId);
            }
        }
        catch (error) {
            this.logger.error(`Error setting agent availability: ${error.message}`);
            throw error;
        }
    }
};
exports.RoundRobinService = RoundRobinService;
exports.RoundRobinService = RoundRobinService = RoundRobinService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_availability_entity_1.AgentAvailability)),
    __param(1, (0, typeorm_1.InjectRepository)(call_queue_entity_1.CallQueue)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RoundRobinService);
//# sourceMappingURL=round-robin.service.js.map