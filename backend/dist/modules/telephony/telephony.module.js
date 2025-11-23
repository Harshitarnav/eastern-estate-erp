"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const call_log_entity_1 = require("./entities/call-log.entity");
const call_transcription_entity_1 = require("./entities/call-transcription.entity");
const ai_insight_entity_1 = require("./entities/ai-insight.entity");
const agent_availability_entity_1 = require("./entities/agent-availability.entity");
const call_queue_entity_1 = require("./entities/call-queue.entity");
const number_masking_entity_1 = require("./entities/number-masking.entity");
const exotel_service_1 = require("./services/provider/exotel.service");
const round_robin_service_1 = require("./services/round-robin.service");
const transcription_service_1 = require("./services/transcription.service");
const ai_analysis_service_1 = require("./services/ai-analysis.service");
const storage_service_1 = require("./services/storage.service");
const call_service_1 = require("./services/call.service");
const webhook_controller_1 = require("./controllers/webhook.controller");
const calls_controller_1 = require("./controllers/calls.controller");
const agents_controller_1 = require("./controllers/agents.controller");
let TelephonyModule = class TelephonyModule {
};
exports.TelephonyModule = TelephonyModule;
exports.TelephonyModule = TelephonyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                call_log_entity_1.CallLog,
                call_transcription_entity_1.CallTranscription,
                ai_insight_entity_1.AIInsight,
                agent_availability_entity_1.AgentAvailability,
                call_queue_entity_1.CallQueue,
                number_masking_entity_1.NumberMasking,
            ]),
        ],
        controllers: [
            webhook_controller_1.WebhookController,
            calls_controller_1.CallsController,
            agents_controller_1.AgentsController,
        ],
        providers: [
            exotel_service_1.ExotelService,
            call_service_1.CallService,
            round_robin_service_1.RoundRobinService,
            transcription_service_1.TranscriptionService,
            ai_analysis_service_1.AIAnalysisService,
            storage_service_1.StorageService,
        ],
        exports: [
            call_service_1.CallService,
            round_robin_service_1.RoundRobinService,
            transcription_service_1.TranscriptionService,
            ai_analysis_service_1.AIAnalysisService,
            storage_service_1.StorageService,
            exotel_service_1.ExotelService,
        ],
    })
], TelephonyModule);
//# sourceMappingURL=telephony.module.js.map