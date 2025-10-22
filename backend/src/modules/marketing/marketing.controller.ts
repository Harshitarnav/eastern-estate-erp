import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('campaigns')
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '12') {
    return this.marketingService.findAll(+page, +limit);
  }

  @Get('campaigns/:id')
  findOne(@Param('id') id: string) {
    return this.marketingService.findOne(id);
  }

  @Post('campaigns')
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.marketingService.create(createCampaignDto);
  }

  @Put('campaigns/:id')
  update(@Param('id') id: string, @Body() updateData: Partial<CreateCampaignDto>) {
    return this.marketingService.update(id, updateData);
  }

  @Patch('campaigns/:id')
  partialUpdate(@Param('id') id: string, @Body() updateData: Partial<CreateCampaignDto>) {
    return this.marketingService.update(id, updateData);
  }

  @Delete('campaigns/:id')
  remove(@Param('id') id: string) {
    return this.marketingService.remove(id);
  }
}
