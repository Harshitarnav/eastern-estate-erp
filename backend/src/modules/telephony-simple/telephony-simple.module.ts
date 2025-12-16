import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CallLog } from '../telephony/entities/call-log.entity';
import { CallTranscription } from '../telephony/entities/call-transcription.entity';
import { AiInsight } from '../telephony/entities/ai-insight.entity';
import { AgentAvailability } from '../telephony/entities/agent-availability.entity';
import { TelephonySimpleController } from './telephony-simple.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      CallLog,
      CallTranscription,
      AiInsight,
      AgentAvailability,
    ]),
  ],
  controllers: [TelephonySimpleController],
  providers: [],
  exports: [],
})
export class TelephonySimpleModule {}


