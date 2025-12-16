import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { CallLog } from './entities/call-log.entity';
import { CallTranscription } from './entities/call-transcription.entity';
import { AIInsight } from './entities/ai-insight.entity';
import { AgentAvailability } from './entities/agent-availability.entity';
import { CallQueue } from './entities/call-queue.entity';
import { NumberMasking } from './entities/number-masking.entity';

// Services
import { ExotelService } from './services/provider/exotel.service';
import { RoundRobinService } from './services/round-robin.service';
import { TranscriptionService } from './services/transcription.service';
import { AIAnalysisService } from './services/ai-analysis.service';
import { StorageService } from './services/storage.service';
import { CallService } from './services/call.service';

// Controllers
import { WebhookController } from './controllers/webhook.controller';
import { CallsController } from './controllers/calls.controller';
import { AgentsController } from './controllers/agents.controller';

/**
 * Telephony Module - Complete IVR, Call Management, AI Analysis System
 * 
 * Features:
 * - Exotel integration for calls
 * - Round-robin call distribution
 * - Number masking for privacy
 * - Call recording storage (S3/local)
 * - OpenAI Whisper transcription
 * - GPT-4 AI analysis
 * - Automatic lead creation
 * - Real-time webhooks
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      CallLog,
      CallTranscription,
      AIInsight,
      AgentAvailability,
      CallQueue,
      NumberMasking,
    ]),
  ],
  controllers: [
    WebhookController,
    CallsController,
    AgentsController,
  ],
  providers: [
    // Provider services
    ExotelService,
    
    // Core services
    CallService,
    RoundRobinService,
    TranscriptionService,
    AIAnalysisService,
    StorageService,
  ],
  exports: [
    CallService,
    RoundRobinService,
    TranscriptionService,
    AIAnalysisService,
    StorageService,
    ExotelService,
  ],
})
export class TelephonyModule {}


