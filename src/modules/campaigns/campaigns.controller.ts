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
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignsDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignType, FundingType, CampaignStatus } from '../../shared/enums';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo chiến dịch từ thiện mới' })
  @ApiResponse({ status: 201, description: 'Chiến dịch đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không đủ uy tín để tạo chiến dịch khẩn cấp' })
  async create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    const campaign = await this.campaignsService.create(createCampaignDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Chiến dịch đã được tạo thành công',
      data: campaign,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách chiến dịch với filter và pagination' })
  @ApiResponse({ status: 200, description: 'Danh sách chiến dịch' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số items per page (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo title, description, creator' })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType })
  @ApiQuery({ name: 'fundingType', required: false, enum: FundingType })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus })
  @ApiQuery({ name: 'category', required: false, description: 'Lọc theo category' })
  @ApiQuery({ name: 'creatorId', required: false, description: 'Lọc theo creator ID' })
  @ApiQuery({ name: 'isFeatured', required: false, description: 'Lọc chiến dịch nổi bật' })
  async findAll(@Query() queryDto: QueryCampaignsDto) {
    const result = await this.campaignsService.findAll(queryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách chiến dịch thành công',
      ...result,
    };
  }

  @Get('for-review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách chiến dịch cần duyệt (dành cho reviewer)' })
  @ApiResponse({ status: 200, description: 'Danh sách chiến dịch cần duyệt' })
  async getCampaignsForReview(@Query('limit') limit?: number) {
    const campaigns = await this.campaignsService.getCampaignsForReview(limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách chiến dịch cần duyệt thành công',
      data: campaigns,
    };
  }

  @Get('my-campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách chiến dịch của tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách chiến dịch của user' })
  async getMyCampaigns(@Request() req, @Query() queryDto: QueryCampaignsDto) {
    const modifiedQuery = { ...queryDto, creatorId: req.user.id };
    const result = await this.campaignsService.findAll(modifiedQuery);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách chiến dịch của bạn thành công',
      ...result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết chiến dịch theo ID' })
  @ApiResponse({ status: 200, description: 'Chi tiết chiến dịch' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chiến dịch' })
  async findOne(@Param('id') id: string) {
    const campaign = await this.campaignsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy chi tiết chiến dịch thành công',
      data: campaign,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật chiến dịch' })
  @ApiResponse({ status: 200, description: 'Chiến dịch đã được cập nhật' })
  @ApiResponse({ status: 403, description: 'Không có quyền chỉnh sửa chiến dịch này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chiến dịch' })
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req,
  ) {
    const campaign = await this.campaignsService.update(id, updateCampaignDto, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật chiến dịch thành công',
      data: campaign,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa chiến dịch' })
  @ApiResponse({ status: 200, description: 'Chiến dịch đã được xóa' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa chiến dịch này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chiến dịch' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.campaignsService.remove(id, req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa chiến dịch thành công',
    };
  }

  // Review Management Endpoints
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duyệt chiến dịch (dành cho reviewer/admin)' })
  @ApiResponse({ status: 200, description: 'Chiến dịch đã được duyệt' })
  @ApiResponse({ status: 403, description: 'Không có quyền duyệt chiến dịch' })
  async approveCampaign(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Request() req,
  ) {
    const campaign = await this.campaignsService.approveCampaign(id, req.user.id, comments);
    return {
      statusCode: HttpStatus.OK,
      message: 'Duyệt chiến dịch thành công',
      data: campaign,
    };
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Từ chối chiến dịch (dành cho reviewer/admin)' })
  @ApiResponse({ status: 200, description: 'Chiến dịch đã bị từ chối' })
  @ApiResponse({ status: 403, description: 'Không có quyền từ chối chiến dịch' })
  async rejectCampaign(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const campaign = await this.campaignsService.rejectCampaign(id, req.user.id, reason);
    return {
      statusCode: HttpStatus.OK,
      message: 'Từ chối chiến dịch thành công',
      data: campaign,
    };
  }

  // Statistics endpoints
  @Get('stats/overview')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thống kê tổng quan các chiến dịch' })
  @ApiResponse({ status: 200, description: 'Thống kê tổng quan' })
  async getOverviewStats() {
    // TODO: Implement campaign statistics
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thống kê thành công',
      data: {
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        totalFundsRaised: 0,
        pendingReview: 0,
      },
    };
  }

  @Get('categories/list')
  @ApiOperation({ summary: 'Lấy danh sách categories' })
  @ApiResponse({ status: 200, description: 'Danh sách categories' })
  async getCategories() {
    // TODO: Implement dynamic categories from database
    const categories = [
      'Giáo dục',
      'Y tế',
      'Thiên tai',
      'Nghèo đói',
      'Môi trường',
      'Trẻ em',
      'Người cao tuổi',
      'Người khuyết tật',
      'Động vật',
      'Khác',
    ];

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách categories thành công',
      data: categories,
    };
  }
} 