import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  CollectionsListFilter,
  CollectionsService,
  CollectionTier,
} from '../services/collections.service';
import { OverdueScannerService } from '../services/overdue-scanner.service';
import { DemandDraftsService } from '../../demand-drafts/demand-drafts.service';
import { AutoDemandDraftService } from '../../construction/services/auto-demand-draft.service';
import {
  DemandDraftStatus,
  DemandDraftTone,
} from '../../demand-drafts/entities/demand-draft.entity';
import { PaymentsService } from '../payments.service';

/**
 * Collections workstation API.
 *
 * Read endpoints power the `/collections` inbox UI. Write endpoints are
 * thin wrappers around existing DD / scanner operations so the UI has
 * one consistent namespace for collection actions.
 */
@Controller('collections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CollectionsController {
  constructor(
    private readonly collections: CollectionsService,
    private readonly scanner: OverdueScannerService,
    private readonly demandDrafts: DemandDraftsService,
    private readonly autoDemandDrafts: AutoDemandDraftService,
    private readonly payments: PaymentsService,
  ) {}

  // ───────── Read ─────────

  @Get()
  async list(@Query() query: any, @Req() req: Request) {
    const userId = (req as any).user?.id ?? null;
    // `mine=true` is a convenience: the service translates it to the
    // current user's id without the client having to send it.
    const mineUserId = query.mine === 'true' && userId ? userId : undefined;
    const filter: CollectionsListFilter = {
      tier: query.tier as CollectionTier | undefined,
      customerId: query.customerId,
      bookingId: query.bookingId,
      flatId: query.flatId,
      propertyId: query.propertyId,
      status: query.status as DemandDraftStatus | undefined,
      tone: query.tone as DemandDraftTone | undefined,
      includeLegacyOnly: query.includeLegacyOnly === 'true',
      search: query.search,
      limit: query.limit ? Math.min(Number(query.limit), 200) : 50,
      offset: query.offset ? Number(query.offset) : 0,
      assigneeId:
        query.assigneeId && query.assigneeId !== 'unassigned'
          ? query.assigneeId
          : undefined,
      unassignedOnly: query.assigneeId === 'unassigned',
      mineUserId,
    };
    return this.collections.list(filter);
  }

  @Get('stats')
  async stats(@Query('propertyId') propertyId?: string) {
    return this.collections.stats({ propertyId });
  }

  /**
   * List every collector who currently has at least one open DD,
   * alongside their queue size. Drives the assignee filter dropdown
   * and an optional side-rail widget.
   */
  @Get('assignees')
  async assignees(@Query('propertyId') propertyId?: string) {
    return this.collections.listAssignees({ propertyId });
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.collections.detail(id);
  }

  // ───────── Write ─────────

  @Post(':id/pause')
  @Roles('admin', 'super_admin', 'finance')
  @HttpCode(HttpStatus.OK)
  async pause(
    @Param('id') id: string,
    @Body()
    body: { days?: number; scope?: 'plan' | 'customer'; note?: string },
  ) {
    const days = Number(body?.days) || 14;
    if (days < 1 || days > 365) {
      throw new BadRequestException('days must be between 1 and 365');
    }
    return this.collections.pauseReminders(
      id,
      days,
      body?.scope ?? 'plan',
      body?.note,
    );
  }

  /**
   * One-click "customer paid this DD" action. Creates a PENDING payment
   * row (so audit trails line up with the rest of the system), then
   * immediately verifies it - which triggers the standard
   * post-completion pipeline: milestone → PAID, booking totals updated,
   * linked DDs auto-closed (including any reminder / warning children),
   * and a journal entry posted. The amount defaults to the DD amount,
   * but callers can override it to handle partial payments.
   */
  @Post(':id/record-payment')
  @Roles('admin', 'super_admin', 'finance')
  @HttpCode(HttpStatus.OK)
  async recordPayment(
    @Param('id') id: string,
    @Body()
    body: {
      amount?: number;
      paymentMethod?: string;
      paymentDate?: string;
      transactionReference?: string;
      chequeNumber?: string;
      bankName?: string;
      notes?: string;
    } = {},
    @Req() req: Request,
  ) {
    const dd = await this.demandDrafts.findOne(id);
    if (dd.status === DemandDraftStatus.PAID) {
      throw new BadRequestException('This DD is already marked paid');
    }

    const amount =
      Number.isFinite(Number(body.amount)) && Number(body.amount) > 0
        ? Number(body.amount)
        : Number(dd.amount) || 0;
    if (amount <= 0) {
      throw new BadRequestException(
        'Cannot record a zero-amount payment. Pass an explicit amount.',
      );
    }

    const userId = (req as any).user?.id ?? null;
    const paymentDate = body.paymentDate ? new Date(body.paymentDate) : new Date();
    if (Number.isNaN(paymentDate.getTime())) {
      throw new BadRequestException('Invalid paymentDate');
    }

    if (!dd.bookingId) {
      throw new BadRequestException(
        'DD is not linked to a booking. Record the payment from the payments module instead.',
      );
    }

    const payment = await this.payments.create(
      {
        bookingId: dd.bookingId,
        customerId: dd.customerId ?? undefined,
        paymentType: 'INSTALLMENT',
        paymentMethod: body.paymentMethod || 'OTHER',
        amount,
        paymentDate,
        transactionReference: body.transactionReference,
        chequeNumber: body.chequeNumber,
        bankName: body.bankName,
        notes: [
          body.notes,
          `Recorded from Collections for DD ${dd.title ?? dd.id}`,
        ]
          .filter(Boolean)
          .join(' | '),
      } as any,
      userId ?? 'SYSTEM',
    );

    // Verify immediately so the post-completion pipeline runs - that's
    // what closes the DD, posts the JE, and updates the milestone.
    // We use verifyWithReport so the UI can warn when the auto-JE was
    // skipped (e.g. Chart of Accounts still missing a default Bank or
    // Sales account) instead of a misleading silent success.
    const { payment: verified, journalEntryId, journalEntrySkipReason } =
      await this.payments.verifyWithReport(payment.id, userId ?? 'SYSTEM');

    return {
      ok: true,
      paymentId: verified.id,
      paymentCode: verified.paymentCode,
      amount: Number(verified.amount) || 0,
      status: verified.status,
      demandDraftId: dd.id,
      journalEntryId,
      // When the JE is skipped we return a human-readable explanation
      // the frontend can show in a warning toast. null on success.
      journalEntrySkipReason,
    };
  }

  @Post(':id/contact')
  @HttpCode(HttpStatus.OK)
  async contact(
    @Param('id') id: string,
    @Body() body: { channel: 'phone' | 'email' | 'sms' | 'visit' | 'other'; note: string },
    @Req() req: Request,
  ) {
    if (!body?.channel || !body?.note) {
      throw new BadRequestException('channel and note are required');
    }
    const userId = (req as any).user?.id ?? null;
    await this.collections.recordContact(id, { ...body, by: userId });
    return { ok: true };
  }

  /**
   * Approve and send a DRAFT cancellation-warning letter. Two-step
   * (approve then send) via the existing DD endpoints so audit fields
   * are preserved.
   */
  @Post(':id/send-warning')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async sendWarning(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.id;
    const dd = await this.demandDrafts.findOne(id);
    if (dd.tone !== DemandDraftTone.CANCELLATION_WARNING) {
      throw new BadRequestException(
        'This endpoint is only valid for CANCELLATION_WARNING DDs',
      );
    }
    if (dd.status !== DemandDraftStatus.DRAFT) {
      throw new BadRequestException(
        'Warning is already in a non-DRAFT state',
      );
    }
    await this.autoDemandDrafts.approveDemandDraft(id, userId);
    return this.autoDemandDrafts.sendDemandDraft(id, userId);
  }

  /**
   * Manually kick the daily scanner now (useful for ops / "send the
   * reminder today instead of tomorrow"). Idempotent.
   */
  @Post('scan-now')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async scanNow() {
    return this.scanner.runScan();
  }

  // ───────── Bulk write ─────────

  /**
   * Pause reminders on many DDs at once (plan- or customer-level).
   * Best-effort: each id is processed independently and the response
   * reports per-row success/failure so the UI can surface partial
   * results instead of an all-or-nothing toast.
   */
  @Post('bulk/pause')
  @Roles('admin', 'super_admin', 'finance')
  @HttpCode(HttpStatus.OK)
  async bulkPause(
    @Body()
    body: {
      ids: string[];
      days?: number;
      scope?: 'plan' | 'customer';
      note?: string;
    },
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) throw new BadRequestException('ids[] is required');
    if (ids.length > 500) {
      throw new BadRequestException('max 500 rows per bulk pause');
    }
    const days = Number(body?.days) || 14;
    if (days < 1 || days > 365) {
      throw new BadRequestException('days must be between 1 and 365');
    }
    return this.collections.bulkPause(ids, days, body?.scope ?? 'plan', body?.note);
  }

  /**
   * Pause reminders for every open DD of a single customer in one shot
   * (e.g. from the customer detail page). Also sets
   * `customer.pause_reminders_until` so freshly generated DDs during the
   * window respect the pause.
   */
  @Post('customer/:customerId/pause')
  @Roles('admin', 'super_admin', 'finance')
  @HttpCode(HttpStatus.OK)
  async pauseCustomer(
    @Param('customerId') customerId: string,
    @Body() body: { days?: number; note?: string },
  ) {
    const days = Number(body?.days) || 14;
    if (days < 1 || days > 365) {
      throw new BadRequestException('days must be between 1 and 365');
    }
    return this.collections.pauseCustomer(customerId, days, body?.note);
  }

  /**
   * Assign (or unassign) a batch of DDs to a collector. Pass
   * `assigneeId: null` to clear the owner. Idempotent and safe to retry.
   */
  @Post('bulk/assign')
  @Roles('admin', 'super_admin', 'finance')
  @HttpCode(HttpStatus.OK)
  async bulkAssign(
    @Body() body: { ids: string[]; assigneeId: string | null },
    @Req() req: Request,
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) throw new BadRequestException('ids[] is required');
    if (ids.length > 500) {
      throw new BadRequestException('max 500 rows per bulk assign');
    }
    // Normalise "" / undefined to null for unassignment.
    const assigneeId =
      body?.assigneeId && String(body.assigneeId).trim()
        ? String(body.assigneeId)
        : null;
    const assignedBy = (req as any).user?.id ?? null;
    return this.collections.assignRows(ids, assigneeId, assignedBy);
  }

  /**
   * Record the same contact attempt on many DDs at once. Typical use is
   * "called the customer about all 3 overdue drafts in one conversation"
   * so finance only has to log it once. The note is duplicated to each
   * DD's metadata so the per-DD timeline stays accurate.
   */
  @Post('bulk/contact')
  @Roles('admin', 'super_admin', 'finance')
  @HttpCode(HttpStatus.OK)
  async bulkContact(
    @Body()
    body: {
      ids: string[];
      channel: 'phone' | 'email' | 'sms' | 'visit' | 'other';
      note: string;
    },
    @Req() req: Request,
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) throw new BadRequestException('ids[] is required');
    if (ids.length > 500) {
      throw new BadRequestException('max 500 rows per bulk contact');
    }
    if (!body?.channel || !body?.note) {
      throw new BadRequestException('channel and note are required');
    }
    const userId = (req as any).user?.id ?? null;
    return this.collections.bulkRecordContact(ids, {
      channel: body.channel,
      note: body.note,
      by: userId,
    });
  }

  /**
   * Approve (if needed) and send a set of DDs immediately. Warning
   * letters are explicitly excluded here to force review through the
   * single-row `:id/send-warning` path for auditability. READY rows are
   * sent as-is; DRAFT non-warning rows are approved first.
   */
  @Post('bulk/send')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async bulkSend(
    @Body() body: { ids: string[] },
    @Req() req: Request,
  ) {
    const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) throw new BadRequestException('ids[] is required');
    if (ids.length > 200) {
      throw new BadRequestException('max 200 rows per bulk send');
    }
    const userId = (req as any).user?.id;
    const sent: string[] = [];
    const skipped: Array<{ id: string; reason: string }> = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      try {
        const dd = await this.demandDrafts.findOne(id);
        if (dd.tone === DemandDraftTone.CANCELLATION_WARNING) {
          skipped.push({ id, reason: 'Warnings must be sent individually' });
          continue;
        }
        if (dd.status === DemandDraftStatus.SENT) {
          skipped.push({ id, reason: 'Already sent' });
          continue;
        }
        if (
          dd.status !== DemandDraftStatus.READY &&
          dd.status !== DemandDraftStatus.DRAFT
        ) {
          skipped.push({ id, reason: `Not sendable from ${dd.status}` });
          continue;
        }
        if (dd.status === DemandDraftStatus.DRAFT) {
          await this.autoDemandDrafts.approveDemandDraft(id, userId);
        }
        await this.autoDemandDrafts.sendDemandDraft(id, userId);
        sent.push(id);
      } catch (err: any) {
        failed.push({ id, reason: err?.message || 'Send failed' });
      }
    }

    return { sent, skipped, failed };
  }
}
