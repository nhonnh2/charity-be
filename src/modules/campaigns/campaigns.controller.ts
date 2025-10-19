import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { 
  CreateCampaignDto, 
  UpdateCampaignDto, 
  QueryCampaignsDto,
  CampaignDetailResponseDto,
  CampaignListResponseDto,
  CampaignListItemDto
} from './dto';
import { TransformResponseDTO } from '../../shared/decorators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignStatus } from '../../shared/enums';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Tạo chiến dịch mới',
    description: 'Tạo một chiến dịch quyên góp mới. Yêu cầu xác thực.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Chiến dịch được tạo thành công',
    type: CampaignDetailResponseDto
  })
  @TransformResponseDTO(CampaignDetailResponseDto)
  async create(
    @Body() createCampaignDto: CreateCampaignDto,
    @Request() req: any
  ){
    return this.campaignsService.create(createCampaignDto, req.user.id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Lấy danh sách chiến dịch',
    description: 'Lấy danh sách tất cả chiến dịch với phân trang và bộ lọc'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách chiến dịch',
    type: CampaignListResponseDto
  })
  @TransformResponseDTO(CampaignListItemDto)
  async findAll(@Query() query: QueryCampaignsDto) {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Lấy thông tin chiến dịch',
    description: 'Lấy thông tin chi tiết của một chiến dịch theo ID'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thông tin chi tiết chiến dịch',
    type: CampaignDetailResponseDto
  })
  @TransformResponseDTO(CampaignDetailResponseDto)
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật chiến dịch',
    description: 'Cập nhật thông tin chiến dịch. Chỉ chủ sở hữu mới có thể cập nhật.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Chiến dịch được cập nhật thành công',
    type: CampaignDetailResponseDto
  })
  @TransformResponseDTO(CampaignDetailResponseDto)
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req: any
  ){
    return this.campaignsService.update(id, updateCampaignDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Xóa chiến dịch',
    description: 'Xóa chiến dịch. Chỉ chủ sở hữu mới có thể xóa.'
  })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<{ message: string }> {
    await this.campaignsService.remove(id, req.user.id);
    return { message: 'Chiến dịch đã được xóa thành công' };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cập nhật trạng thái chiến dịch',
    description: 'Cập nhật trạng thái của chiến dịch (ACTIVE, PAUSED, COMPLETED, CANCELLED)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Trạng thái chiến dịch được cập nhật thành công',
    type: CampaignDetailResponseDto
  })
  @TransformResponseDTO(CampaignDetailResponseDto)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CampaignStatus,
    @Request() req: any
  ){
    return this.campaignsService.update(id, { status } as UpdateCampaignDto, req.user.id);
  }
}
