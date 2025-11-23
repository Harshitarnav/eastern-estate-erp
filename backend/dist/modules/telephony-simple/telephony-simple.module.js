"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonySimpleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const call_log_entity_1 = require("../telephony/entities/call-log.entity");
const call_transcription_entity_1 = require("../telephony/entities/call-transcription.entity");
const ai_insight_entity_1 = require("../telephony/entities/ai-insight.entity");
const agent_availability_entity_1 = require("../telephony/entities/agent-availability.entity");
const telephony_simple_controller_1 = require("./telephony-simple.controller");
let TelephonySimpleModule = class TelephonySimpleModule {
};
exports.TelephonySimpleModule = TelephonySimpleModule;
exports.TelephonySimpleModule = TelephonySimpleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                call_log_entity_1.CallLog,
                call_transcription_entity_1.CallTranscription,
                ai_insight_entity_1.AiInsight,
                agent_availability_entity_1.AgentAvailability,
            ]),
        ],
        controllers: [telephony_simple_controller_1.TelephonySimpleController],
        providers: [],
        exports: [],
    })
], TelephonySimpleModule);
//# sourceMappingURL=telephony-simple.module.js.map