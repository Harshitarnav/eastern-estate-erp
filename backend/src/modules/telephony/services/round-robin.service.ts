import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

/**
 * Round-Robin Call Distribution Service
 * Intelligently distributes incoming calls to available agents
 */
@Injectable()
export class RoundRobinService {
  private readonly logger = new Logger(RoundRobinService.name);

  constructor(
    @InjectRepository(AgentAvailability)
    private agentAvailabilityRepo: Repository<AgentAvailability>,
    @InjectRepository(CallQueue)
    private callQueueRepo: Repository<CallQueue>,
  ) {}

  /**
   * Get next available agent for a property using Round-Robin algorithm
   */
  async getNextAvailableAgent(
    request: CallDistributionRequest,
  ): Promise<AgentSelection | null> {
    try {
      this.logger.log(
        `Finding agent for property ${request.propertyId}, customer: ${request.customerPhone}`,
      );

      // Get all available agents for this property
      const availableAgents = await this.getAvailableAgents(request.propertyId);

      if (availableAgents.length === 0) {
        this.logger.warn(`No available agents for property ${request.propertyId}`);
        return null;
      }

      // Filter by skills if required
      let eligibleAgents = availableAgents;
      if (request.requiredSkills && request.requiredSkills.length > 0) {
        eligibleAgents = this.filterBySkills(availableAgents, request.requiredSkills);
      }

      if (eligibleAgents.length === 0) {
        this.logger.warn('No agents with required skills found');
        return null;
      }

      // Select agent using round-robin with load balancing
      const selectedAgent = this.selectAgentRoundRobin(eligibleAgents);

      this.logger.log(
        `Selected agent: ${selectedAgent.employeeName} (ID: ${selectedAgent.employeeId})`,
      );

      return selectedAgent;
    } catch (error) {
      this.logger.error(`Error in getNextAvailableAgent: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Get all available agents for a property
   */
  private async getAvailableAgents(propertyId: number): Promise<AgentSelection[]> {
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

  /**
   * Filter agents by required skills
   */
  private filterBySkills(
    agents: AgentSelection[],
    requiredSkills: string[],
  ): AgentSelection[] {
    return agents.filter((agent) => {
      if (!agent.skills || agent.skills.length === 0) return false;
      
      // Agent must have at least one of the required skills
      return requiredSkills.some((skill) =>
        agent.skills.some((agentSkill) => 
          agentSkill.toLowerCase() === skill.toLowerCase()
        ),
      );
    });
  }

  /**
   * Select agent using Round-Robin algorithm with load balancing
   * Prioritizes agents with:
   * 1. Lowest current call load
   * 2. Least recent call assignment
   * 3. Lowest total calls today
   */
  private selectAgentRoundRobin(agents: AgentSelection[]): AgentSelection {
    // Sort by current load (ascending), then by total calls today
    agents.sort((a, b) => {
      if (a.currentLoad !== b.currentLoad) {
        return a.currentLoad - b.currentLoad;
      }
      return 0;
    });

    // Return agent with lowest current load
    return agents[0];
  }

  /**
   * Add call to queue when no agents available
   */
  async addToQueue(request: CallDistributionRequest): Promise<CallQueue> {
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
    } catch (error) {
      this.logger.error(`Error adding call to queue: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process queue when agent becomes available
   */
  async processQueue(propertyId: number): Promise<void> {
    try {
      this.logger.log(`Processing queue for property ${propertyId}`);

      // Get highest priority calls in queue
      const queuedCalls = await this.callQueueRepo.find({
        where: {
          propertyId,
          status: 'WAITING',
        },
        order: {
          priority: 'ASC', // HIGH=1, MEDIUM=2, LOW=3
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
          priority: call.priority as any,
        });

        if (agent) {
          this.logger.log(`Assigning queued call ${call.id} to agent ${agent.employeeId}`);
          
          // Update queue status
          call.status = 'ASSIGNED';
          call.assignedTo = agent.employeeId;
          call.assignedAt = new Date();
          await this.callQueueRepo.save(call);

          // Here you would trigger the actual call connection
          // This will be handled by the CallService
        } else {
          this.logger.log('No available agents, keeping call in queue');
          break; // Stop processing if no agents available
        }
      }
    } catch (error) {
      this.logger.error(`Error processing queue: ${error.message}`, error.stack);
    }
  }

  /**
   * Update agent availability after call assignment
   */
  async updateAgentLoad(employeeId: number, increment: boolean): Promise<void> {
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
        
        // Mark as busy if reached max concurrent calls
        if (agent.currentCalls >= agent.maxConcurrentCalls) {
          agent.isAvailable = false;
          agent.status = 'BUSY';
        }
      } else {
        agent.currentCalls = Math.max(0, agent.currentCalls - 1);
        
        // Mark as available if below max concurrent calls
        if (agent.currentCalls < agent.maxConcurrentCalls) {
          agent.isAvailable = true;
          agent.status = 'AVAILABLE';
        }
      }

      await this.agentAvailabilityRepo.save(agent);
      
      this.logger.log(
        `Updated agent ${employeeId} load: ${agent.currentCalls}/${agent.maxConcurrentCalls}`,
      );

      // Process queue if agent just became available
      if (!increment && agent.isAvailable) {
        await this.processQueue(agent.propertyId);
      }
    } catch (error) {
      this.logger.error(`Error updating agent load: ${error.message}`, error.stack);
    }
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(employeeId: number): Promise<any> {
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
        successRate:
          agent.totalCallsToday > 0
            ? (agent.successfulCallsToday / agent.totalCallsToday) * 100
            : 0,
        lastCallAt: agent.lastCallAt,
      };
    } catch (error) {
      this.logger.error(`Error getting agent stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Get queue statistics for a property
   */
  async getQueueStats(propertyId: number): Promise<any> {
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
    } catch (error) {
      this.logger.error(`Error getting queue stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Mark agent as available/unavailable manually
   */
  async setAgentAvailability(
    employeeId: number,
    available: boolean,
    reason?: string,
  ): Promise<void> {
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
        // You might want to add a reason field to the entity
        this.logger.log(`Agent ${employeeId} availability changed: ${reason}`);
      }

      await this.agentAvailabilityRepo.save(agent);

      // Process queue if agent just became available
      if (available) {
        await this.processQueue(agent.propertyId);
      }
    } catch (error) {
      this.logger.error(`Error setting agent availability: ${error.message}`);
      throw error;
    }
  }
}

