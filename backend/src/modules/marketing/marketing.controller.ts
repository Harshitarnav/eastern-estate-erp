import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignDto } from './dto';

@Controller('marketing/campaigns')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.marketingService.create(createCampaignDto);
  }

  @Get()
  findAll(@Query() query: QueryCampaignDto) {
    return this.marketingService.findAll(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.marketingService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marketingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampaignDto: UpdateCampaignDto) {
    return this.marketingService.update(id, updateCampaignDto);
  }

  @Patch(':id/metrics')
  updateMetrics(@Param('id') id: string, @Body() metrics: any) {
    return this.marketingService.updateMetrics(id, metrics);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marketingService.remove(id);
  }
}
