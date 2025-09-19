import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateProgressUpdateDto, QueryProgressUpdatesDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('updates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo cập nhật tiến độ milestone' })
  @ApiResponse({ status: 201, description: 'Cập nhật tiến độ thành công' })
  @ApiResponse({ status: 403, description: 'Chỉ creator mới được cập nhật tiến độ' })
  async createUpdate(@Body() createDto: CreateProgressUpdateDto, @Request() req) {
    const update = await this.progressService.create(createDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo cập nhật tiến độ thành công',
      data: update,
    };
  }

  @Get('updates')
  @ApiOperation({ summary: 'Lấy danh sách cập nhật tiến độ với filter' })
  @ApiResponse({ status: 200, description: 'Danh sách cập nhật tiến độ' })
  async findAllUpdates(@Query() queryDto: QueryProgressUpdatesDto) {
    const result = await this.progressService.findAll(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách cập nhật tiến độ thành công',
      ...result,
    };
  }

  @Get('campaigns/:campaignId/updates')
  @ApiOperation({ summary: 'Lấy tất cả cập nhật tiến độ của campaign' })
  @ApiResponse({ status: 200, description: 'Danh sách cập nhật tiến độ của campaign' })
  async getCampaignUpdates(
    @Param('campaignId') campaignId: string,
    @Query('milestoneIndex') milestoneIndex?: number,
  ) {
    const updates = await this.progressService.findByCampaign(campaignId, milestoneIndex);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy cập nhật tiến độ campaign thành công',
      data: updates,
    };
  }

  @Get('campaigns/:campaignId/milestones/:milestoneIndex/summary')
  @ApiOperation({ summary: 'Lấy tổng quan tiến độ milestone' })
  @ApiResponse({ status: 200, description: 'Tổng quan tiến độ milestone' })
  async getMilestoneSummary(
    @Param('campaignId') campaignId: string,
    @Param('milestoneIndex') milestoneIndex: number,
  ) {
    const summary = await this.progressService.getMilestoneProgressSummary(campaignId, milestoneIndex);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy tổng quan milestone thành công',
      data: summary,
    };
  }

  @Get('updates/:id')
  @ApiOperation({ summary: 'Lấy chi tiết cập nhật tiến độ' })
  @ApiResponse({ status: 200, description: 'Chi tiết cập nhật tiến độ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cập nhật tiến độ' })
  async findOneUpdate(@Param('id') id: string) {
    const update = await this.progressService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy chi tiết cập nhật tiến độ thành công',
      data: update,
    };
  }

  @Delete('updates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa cập nhật tiến độ' })
  @ApiResponse({ status: 200, description: 'Xóa cập nhật tiến độ thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa cập nhật này' })
  async removeUpdate(@Param('id') id: string, @Request() req) {
    await this.progressService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa cập nhật tiến độ thành công',
    };
  }
} 