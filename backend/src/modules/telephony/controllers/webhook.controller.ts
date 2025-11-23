import { Controller, Post, Body, Logger, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CallService } from '../services/call.service';
import { IncomingCallDto, CallStatusDto, RecordingStatusDto } from '../dto/incoming-call.dto';

/**
 * Webhook Controller for Exotel Callbacks
 * Handles all incoming webhooks from Exotel
 */
@Controller('api/telephony/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private callService: CallService) {}

  /**
   * Handle incoming call webhook
   * URL: POST /api/telephony/webhook/incoming-call
   */
  @Post('incoming-call')
  async handleIncomingCall(
    @Body() callData: IncomingCallDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.log(`Incoming call webhook: ${JSON.stringify(callData)}`);

      // Extract property ID from virtual number or use default
      // You'll need to map virtual numbers to property IDs
      const propertyId = callData.propertyId || this.extractPropertyId(callData.To);

      // Handle the incoming call
      const result = await this.callService.handleIncomingCall({
        callSid: callData.CallSid,
        from: callData.From,
        to: callData.To,
        propertyId,
        direction: 'INBOUND',
      });

      // Generate TwiML response for call routing
      const twiml = this.generateTwiML(result);

      res.set('Content-Type', 'text/xml');
      res.status(HttpStatus.OK).send(twiml);
    } catch (error) {
      this.logger.error(`Error handling incoming call: ${error.message}`, error.stack);
      
      // Return error TwiML
      const errorTwiml = this.generateErrorTwiML();
      res.set('Content-Type', 'text/xml');
      res.status(HttpStatus.OK).send(errorTwiml);
    }
  }

  /**
   * Handle call status updates
   * URL: POST /api/telephony/webhook/call-status
   */
  @Post('call-status')
  async handleCallStatus(
    @Body() statusData: CallStatusDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.log(`Call status webhook: ${JSON.stringify(statusData)}`);

      // Handle different call statuses
      switch (statusData.CallStatus.toLowerCase()) {
        case 'completed':
          await this.callService.handleCallComplete(statusData.CallSid);
          break;
        case 'busy':
        case 'no-answer':
        case 'canceled':
        case 'failed':
          // Update call log with failure status
          this.logger.log(`Call ${statusData.CallSid} ${statusData.CallStatus}`);
          break;
      }

      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      this.logger.error(`Error handling call status: ${error.message}`, error.stack);
      res.status(HttpStatus.OK).json({ success: false, error: error.message });
    }
  }

  /**
   * Handle recording status updates
   * URL: POST /api/telephony/webhook/recording-status
   */
  @Post('recording-status')
  async handleRecordingStatus(
    @Body() recordingData: RecordingStatusDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.log(`Recording status webhook: ${JSON.stringify(recordingData)}`);

      // Recording is ready - trigger async processing
      if (recordingData.RecordingStatus?.toLowerCase() === 'completed') {
        this.logger.log(`Recording completed for call ${recordingData.CallSid}`);
        // The CallService.handleCallComplete will handle the rest
      }

      res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      this.logger.error(`Error handling recording status: ${error.message}`, error.stack);
      res.status(HttpStatus.OK).json({ success: false, error: error.message });
    }
  }

  /**
   * Handle IVR response (DTMF input)
   * URL: POST /api/telephony/webhook/ivr-response
   */
  @Post('ivr-response')
  async handleIVRResponse(@Body() body: any, @Res() res: Response): Promise<any> {
    try {
      this.logger.log(`IVR response: ${JSON.stringify(body)}`);

      const digits = body.Digits;
      let twiml = '';

      switch (digits) {
        case '1':
          twiml = this.generateTwiML({ status: 'SALES', agentAssigned: 'Sales Team' });
          break;
        case '2':
          twiml = this.generateTwiML({ status: 'SUPPORT', agentAssigned: 'Support Team' });
          break;
        case '3':
          twiml = this.generateTwiML({ status: 'INFO', agentAssigned: 'Info Team' });
          break;
        default:
          twiml = this.generateErrorTwiML('Invalid option selected');
      }

      res.set('Content-Type', 'text/xml');
      res.status(HttpStatus.OK).send(twiml);
    } catch (error) {
      this.logger.error(`Error handling IVR response: ${error.message}`);
      
      const errorTwiml = this.generateErrorTwiML();
      res.set('Content-Type', 'text/xml');
      res.status(HttpStatus.OK).send(errorTwiml);
    }
  }

  /**
   * Generate TwiML response for call routing
   */
  private generateTwiML(result: any): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?>';
    twiml += '<Response>';

    if (result.status === 'CONNECTED' && result.agentAssigned) {
      // Agent available - connect
      twiml += '<Say voice="woman" language="en-IN">Please hold while we connect you to our agent.</Say>';
      // The actual agent connection will be handled by Exotel's connect API
    } else if (result.status === 'QUEUED') {
      // No agent available - queue
      twiml += '<Say voice="woman" language="en-IN">All our agents are currently busy. Please stay on the line.</Say>';
      twiml += '<Play>https://your-domain.com/hold-music.mp3</Play>';
    } else {
      // Unknown status
      twiml += '<Say voice="woman" language="en-IN">Thank you for calling Eastern Estate.</Say>';
    }

    twiml += '</Response>';
    return twiml;
  }

  /**
   * Generate error TwiML
   */
  private generateErrorTwiML(message?: string): string {
    let twiml = '<?xml version="1.0" encoding="UTF-8"?>';
    twiml += '<Response>';
    twiml += `<Say voice="woman" language="en-IN">${
      message || 'We apologize, but we are unable to process your call at this time. Please try again later.'
    }</Say>`;
    twiml += '<Hangup/>';
    twiml += '</Response>';
    return twiml;
  }

  /**
   * Extract property ID from virtual number
   * You'll need to maintain a mapping of virtual numbers to property IDs
   */
  private extractPropertyId(virtualNumber: string): number {
    // For now, return a default property ID
    // TODO: Implement proper mapping from your database
    // Example: SELECT property_id FROM property_phone_numbers WHERE phone_number = virtualNumber
    return 1; // Default property ID
  }

  /**
   * Health check endpoint
   */
  @Post('health')
  healthCheck(@Res() res: Response): any {
    res.status(HttpStatus.OK).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
}

