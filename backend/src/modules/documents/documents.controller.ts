import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentCategory, DocumentEntityType } from './entities/document.entity';
import { multerConfig } from '../../common/upload/multer.config';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly svc: DocumentsService) {}

  /**
   * POST /documents/upload
   * Multipart: field "file" + body fields matching CreateDocumentDto
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const dto: CreateDocumentDto = {
      name: body.name || file.originalname,
      category: body.category as DocumentCategory,
      entityType: body.entityType as DocumentEntityType,
      entityId: body.entityId,
      customerId: body.customerId || undefined,
      bookingId: body.bookingId || undefined,
      fileUrl: '', // will be set in service
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      notes: body.notes || undefined,
    };

    return this.svc.create(file, dto, req.user?.id);
  }

  /**
   * GET /documents?entityType=BOOKING&entityId=<uuid>
   * OR  ?entityType=CUSTOMER&entityId=<uuid>
   */
  @Get()
  async findByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }
    return this.svc.findByEntity(entityType as DocumentEntityType, entityId);
  }

  /** GET /documents/booking/:bookingId */
  @Get('booking/:bookingId')
  async findByBooking(@Param('bookingId') bookingId: string) {
    return this.svc.findByBooking(bookingId);
  }

  /** GET /documents/customer/:customerId */
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.svc.findByCustomer(customerId);
  }

  /** GET /documents/:id */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  /** PATCH /documents/:id  — update name / notes */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; notes?: string },
  ) {
    return this.svc.update(id, body);
  }

  /** DELETE /documents/:id */
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.svc.remove(id, req.user?.id);
    return { success: true };
  }
}
