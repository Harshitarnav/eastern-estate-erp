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
var SalesTaskService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesTaskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_task_entity_1 = require("./entities/sales-task.entity");
const date_fns_1 = require("date-fns");
let SalesTaskService = SalesTaskService_1 = class SalesTaskService {
    constructor(salesTaskRepository) {
        this.salesTaskRepository = salesTaskRepository;
        this.logger = new common_1.Logger(SalesTaskService_1.name);
    }
    async create(createTaskDto) {
        this.logger.log(`Creating task: ${createTaskDto.title} for ${createTaskDto.assignedTo}`);
        const task = this.salesTaskRepository.create(createTaskDto);
        return this.salesTaskRepository.save(task);
    }
    async findByUser(userId, status) {
        const where = {
            assignedTo: userId,
            isActive: true,
        };
        if (status) {
            where.status = status;
        }
        return this.salesTaskRepository.find({
            where,
            order: { dueDate: 'ASC', dueTime: 'ASC' },
            relations: ['lead', 'assignedByUser'],
        });
    }
    async getTodayTasks(userId) {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const endToday = (0, date_fns_1.endOfDay)(new Date());
        return this.salesTaskRepository.find({
            where: {
                assignedTo: userId,
                dueDate: (0, typeorm_2.Between)(today, endToday),
                status: (0, typeorm_2.In)([sales_task_entity_1.TaskStatus.PENDING, sales_task_entity_1.TaskStatus.IN_PROGRESS]),
                isActive: true,
            },
            order: { dueTime: 'ASC' },
            relations: ['lead'],
        });
    }
    async getUpcomingTasks(userId, days = 7) {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const futureDate = (0, date_fns_1.endOfDay)((0, date_fns_1.addDays)(today, days));
        return this.salesTaskRepository.find({
            where: {
                assignedTo: userId,
                dueDate: (0, typeorm_2.Between)(today, futureDate),
                status: (0, typeorm_2.In)([sales_task_entity_1.TaskStatus.PENDING, sales_task_entity_1.TaskStatus.IN_PROGRESS]),
                isActive: true,
            },
            order: { dueDate: 'ASC', dueTime: 'ASC' },
            relations: ['lead'],
        });
    }
    async getOverdueTasks(userId) {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const tasks = await this.salesTaskRepository.find({
            where: {
                assignedTo: userId,
                dueDate: (0, typeorm_2.LessThan)(today),
                status: (0, typeorm_2.In)([sales_task_entity_1.TaskStatus.PENDING, sales_task_entity_1.TaskStatus.IN_PROGRESS]),
                isActive: true,
            },
            order: { dueDate: 'ASC' },
            relations: ['lead'],
        });
        const overdueIds = tasks.map(t => t.id);
        if (overdueIds.length > 0) {
            await this.salesTaskRepository.update({ id: (0, typeorm_2.In)(overdueIds) }, { status: sales_task_entity_1.TaskStatus.OVERDUE });
        }
        return tasks;
    }
    async getTasksNeedingReminders() {
        const now = new Date();
        const tasks = await this.salesTaskRepository.find({
            where: {
                sendReminder: true,
                reminderSent: false,
                status: (0, typeorm_2.In)([sales_task_entity_1.TaskStatus.PENDING, sales_task_entity_1.TaskStatus.IN_PROGRESS]),
                isActive: true,
            },
            relations: ['assignedToUser', 'lead'],
        });
        return tasks.filter(task => {
            const reminderTime = new Date(task.dueDate);
            reminderTime.setMinutes(reminderTime.getMinutes() - task.reminderBeforeMinutes);
            return (0, date_fns_1.isBefore)(reminderTime, now) && (0, date_fns_1.isBefore)(now, task.dueDate);
        });
    }
    async markReminderSent(taskId) {
        await this.salesTaskRepository.update(taskId, {
            reminderSent: true,
            reminderSentAt: new Date(),
        });
    }
    async completeTask(taskId, outcome, notes) {
        const updateData = {
            status: sales_task_entity_1.TaskStatus.COMPLETED,
            completedAt: new Date(),
        };
        if (outcome)
            updateData.outcome = outcome;
        if (notes)
            updateData.notes = notes;
        await this.salesTaskRepository.update(taskId, updateData);
        return this.findOne(taskId);
    }
    async updateStatus(taskId, status) {
        const updateData = { status };
        if (status === sales_task_entity_1.TaskStatus.COMPLETED) {
            updateData.completedAt = new Date();
        }
        await this.salesTaskRepository.update(taskId, updateData);
        return this.findOne(taskId);
    }
    async getStatistics(userId, startDate, endDate) {
        const where = {
            assignedTo: userId,
            isActive: true,
        };
        if (startDate && endDate) {
            where.dueDate = (0, typeorm_2.Between)(startDate, endDate);
        }
        const tasks = await this.salesTaskRepository.find({ where });
        return {
            total: tasks.length,
            pending: tasks.filter(t => t.status === sales_task_entity_1.TaskStatus.PENDING).length,
            inProgress: tasks.filter(t => t.status === sales_task_entity_1.TaskStatus.IN_PROGRESS).length,
            completed: tasks.filter(t => t.status === sales_task_entity_1.TaskStatus.COMPLETED).length,
            overdue: tasks.filter(t => t.status === sales_task_entity_1.TaskStatus.OVERDUE).length,
            cancelled: tasks.filter(t => t.status === sales_task_entity_1.TaskStatus.CANCELLED).length,
            byType: this.groupByType(tasks),
            completionRate: this.calculateCompletionRate(tasks),
            avgCompletionTime: this.calculateAvgCompletionTime(tasks),
        };
    }
    async getTasksByDateRange(userId, startDate, endDate) {
        const tasks = await this.salesTaskRepository.find({
            where: {
                assignedTo: userId,
                dueDate: (0, typeorm_2.Between)(startDate, endDate),
                isActive: true,
            },
            order: { dueDate: 'ASC', dueTime: 'ASC' },
            relations: ['lead'],
        });
        const groupedTasks = {};
        tasks.forEach(task => {
            const dateKey = task.dueDate.toISOString().split('T')[0];
            if (!groupedTasks[dateKey]) {
                groupedTasks[dateKey] = [];
            }
            groupedTasks[dateKey].push(task);
        });
        return groupedTasks;
    }
    async findOne(id) {
        const task = await this.salesTaskRepository.findOne({
            where: { id, isActive: true },
            relations: ['lead', 'assignedToUser', 'assignedByUser'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async update(id, updateData) {
        await this.salesTaskRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.salesTaskRepository.update(id, { isActive: false });
    }
    async cancelTask(id, reason) {
        const updateData = {
            status: sales_task_entity_1.TaskStatus.CANCELLED,
        };
        if (reason) {
            updateData.notes = reason;
        }
        await this.salesTaskRepository.update(id, updateData);
        return this.findOne(id);
    }
    groupByType(tasks) {
        const grouped = {};
        tasks.forEach(task => {
            grouped[task.taskType] = (grouped[task.taskType] || 0) + 1;
        });
        return grouped;
    }
    calculateCompletionRate(tasks) {
        if (tasks.length === 0)
            return 0;
        const completed = tasks.filter(t => t.status === sales_task_entity_1.TaskStatus.COMPLETED).length;
        return (completed / tasks.length) * 100;
    }
    calculateAvgCompletionTime(tasks) {
        const completedTasks = tasks.filter(t => t.completedAt);
        if (completedTasks.length === 0)
            return 0;
        const totalTime = completedTasks.reduce((sum, task) => {
            const createdTime = new Date(task.createdAt).getTime();
            const completedTime = new Date(task.completedAt).getTime();
            return sum + (completedTime - createdTime);
        }, 0);
        return totalTime / completedTasks.length / (1000 * 60 * 60);
    }
};
exports.SalesTaskService = SalesTaskService;
exports.SalesTaskService = SalesTaskService = SalesTaskService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_task_entity_1.SalesTask)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SalesTaskService);
//# sourceMappingURL=sales-task.service.js.map