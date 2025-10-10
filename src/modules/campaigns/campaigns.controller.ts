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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { 
  CreateCampaignDto, 
  UpdateCampaignDto, 
  QueryCampaignsDto,
  CampaignResponseDto,
  CampaignListResponseDto,
  CampaignStatsResponseDto
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignType, FundingType, CampaignStatus } from '../../shared/enums';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Tạo chiến dịch từ thiện mới',
    description: 'Tạo một chiến dịch từ thiện mới. Chiến dịch khẩn cấp yêu cầu uy tín tối thiểu 60 điểm.'
  })
  @ApiBody({ type: CreateCampaignDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Chiến dịch đã được tạo thành công',
    type: CampaignResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dữ liệu không hợp lệ',
    schema: {
      example: {
        statusCode: 400,
        message: 'Dữ liệu không hợp lệ',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không đủ uy tín để tạo chiến dịch khẩn cấp',
    schema: {
      example: {
        statusCode: 403,
        message: 'Tạo chiến dịch khẩn cấp yêu cầu uy tín tối thiểu 60 điểm. Uy tín hiện tại của bạn: 45',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    }
  })
  async create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    const campaign = await this.campaignsService.create(createCampaignDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Chiến dịch đã được tạo thành công',
      data: campaign,
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Lấy danh sách chiến dịch với filter và pagination',
    description: 'Lấy danh sách chiến dịch với các bộ lọc và phân trang. Hỗ trợ tìm kiếm, lọc theo loại, trạng thái, danh mục và sắp xếp.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách chiến dịch',
    type: CampaignListResponseDto
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Số items per page (mặc định: 10)', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo title, description, creator', example: 'trường học' })
  @ApiQuery({ name: 'type', required: false, enum: CampaignType, description: 'Loại chiến dịch' })
  @ApiQuery({ name: 'fundingType', required: false, enum: FundingType, description: 'Loại quyên góp' })
  @ApiQuery({ name: 'status', required: false, enum: CampaignStatus, description: 'Trạng thái chiến dịch' })
  @ApiQuery({ name: 'category', required: false, description: 'Lọc theo category', example: 'Giáo dục' })
  @ApiQuery({ name: 'creatorId', required: false, description: 'Lọc theo creator ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'isFeatured', required: false, description: 'Lọc chiến dịch nổi bật', example: true })
  @ApiQuery({ name: 'minTargetAmount', required: false, description: 'Số tiền mục tiêu tối thiểu (VND)', example: 1000000 })
  @ApiQuery({ name: 'maxTargetAmount', required: false, description: 'Số tiền mục tiêu tối đa (VND)', example: 100000000 })
  @ApiQuery({ name: 'startDateFrom', required: false, description: 'Ngày bắt đầu từ', example: '2024-01-01T00:00:00.000Z' })
  @ApiQuery({ name: 'startDateTo', required: false, description: 'Ngày bắt đầu đến', example: '2024-12-31T23:59:59.000Z' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Trường để sắp xếp', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Thứ tự sắp xếp', enum: ['asc', 'desc'], example: 'desc' })
  @ApiQuery({ name: 'tag', required: false, description: 'Tag để lọc', example: 'trẻ em' })
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
  @ApiOperation({ 
    summary: 'Lấy danh sách chiến dịch cần duyệt (dành cho reviewer)',
    description: 'Lấy danh sách chiến dịch đang chờ duyệt, được sắp xếp theo độ ưu tiên (phí duyệt cao nhất trước)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách chiến dịch cần duyệt',
    type: [CampaignResponseDto]
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng chiến dịch tối đa (mặc định: 20)', example: 20 })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
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
  @ApiOperation({ 
    summary: 'Lấy danh sách chiến dịch của tôi',
    description: 'Lấy danh sách tất cả chiến dịch do user hiện tại tạo, với các bộ lọc và phân trang'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách chiến dịch của user',
    type: CampaignListResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
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
  @ApiOperation({ 
    summary: 'Lấy chi tiết chiến dịch theo ID',
    description: 'Lấy thông tin chi tiết của một chiến dịch cụ thể. Tự động tăng view count.'
  })
  @ApiParam({ name: 'id', description: 'ID của chiến dịch', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chi tiết chiến dịch',
    type: CampaignResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy chiến dịch',
    schema: {
      example: {
        statusCode: 404,
        message: 'Không tìm thấy chiến dịch',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'ID không hợp lệ',
    schema: {
      example: {
        statusCode: 400,
        message: 'ID chiến dịch không hợp lệ',
        error: 'Bad Request'
      }
    }
  })
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
  @ApiOperation({ 
    summary: 'Cập nhật chiến dịch',
    description: 'Cập nhật thông tin chiến dịch. Chỉ creator hoặc admin mới có quyền cập nhật. Không thể cập nhật chiến dịch đã active hoặc completed.'
  })
  @ApiParam({ name: 'id', description: 'ID của chiến dịch', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateCampaignDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Chiến dịch đã được cập nhật',
    type: CampaignResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không có quyền chỉnh sửa chiến dịch này',
    schema: {
      example: {
        statusCode: 403,
        message: 'Bạn không có quyền chỉnh sửa chiến dịch này',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy chiến dịch',
    schema: {
      example: {
        statusCode: 404,
        message: 'Không tìm thấy chiến dịch',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Không thể chỉnh sửa chiến dịch đã kích hoạt',
    schema: {
      example: {
        statusCode: 400,
        message: 'Không thể chỉnh sửa chiến dịch đã kích hoạt hoặc hoàn thành',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
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
  @ApiOperation({ 
    summary: 'Xóa chiến dịch',
    description: 'Xóa chiến dịch. Chỉ creator hoặc admin mới có quyền xóa. Không thể xóa chiến dịch đã có quyên góp.'
  })
  @ApiParam({ name: 'id', description: 'ID của chiến dịch', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chiến dịch đã được xóa',
    schema: {
      example: {
        statusCode: 200,
        message: 'Xóa chiến dịch thành công'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không có quyền xóa chiến dịch này',
    schema: {
      example: {
        statusCode: 403,
        message: 'Bạn không có quyền xóa chiến dịch này',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy chiến dịch',
    schema: {
      example: {
        statusCode: 404,
        message: 'Không tìm thấy chiến dịch',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Không thể xóa chiến dịch đã có quyên góp',
    schema: {
      example: {
        statusCode: 400,
        message: 'Không thể xóa chiến dịch đã có quyên góp',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
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
  @ApiOperation({ 
    summary: 'Duyệt chiến dịch (dành cho reviewer/admin)',
    description: 'Duyệt chiến dịch đang chờ duyệt. Chỉ reviewer hoặc admin mới có quyền duyệt.'
  })
  @ApiParam({ name: 'id', description: 'ID của chiến dịch', example: '507f1f77bcf86cd799439011' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: {
          type: 'string',
          description: 'Nhận xét của reviewer',
          example: 'Chiến dịch có mục đích rõ ràng và kế hoạch chi tiết'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Chiến dịch đã được duyệt',
    type: CampaignResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không có quyền duyệt chiến dịch',
    schema: {
      example: {
        statusCode: 403,
        message: 'Không có quyền duyệt chiến dịch',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Chỉ có thể duyệt chiến dịch đang chờ duyệt',
    schema: {
      example: {
        statusCode: 400,
        message: 'Chỉ có thể duyệt chiến dịch đang chờ duyệt',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy chiến dịch'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
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
  @ApiOperation({ 
    summary: 'Từ chối chiến dịch (dành cho reviewer/admin)',
    description: 'Từ chối chiến dịch đang chờ duyệt. Chỉ reviewer hoặc admin mới có quyền từ chối.'
  })
  @ApiParam({ name: 'id', description: 'ID của chiến dịch', example: '507f1f77bcf86cd799439011' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Lý do từ chối',
          example: 'Thiếu thông tin cần thiết hoặc không đáp ứng tiêu chí'
        }
      },
      required: ['reason']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Chiến dịch đã bị từ chối',
    type: CampaignResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không có quyền từ chối chiến dịch',
    schema: {
      example: {
        statusCode: 403,
        message: 'Không có quyền từ chối chiến dịch',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Chỉ có thể từ chối chiến dịch đang chờ duyệt',
    schema: {
      example: {
        statusCode: 400,
        message: 'Chỉ có thể từ chối chiến dịch đang chờ duyệt',
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Không tìm thấy chiến dịch'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
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
  @ApiOperation({ 
    summary: 'Thống kê tổng quan các chiến dịch',
    description: 'Lấy thống kê tổng quan về các chiến dịch trong hệ thống. Yêu cầu quyền admin hoặc reviewer.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê tổng quan',
    type: CampaignStatsResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Token không hợp lệ'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Không có quyền truy cập thống kê'
  })
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
  @ApiOperation({ 
    summary: 'Lấy danh sách categories',
    description: 'Lấy danh sách các danh mục chiến dịch có sẵn trong hệ thống'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách categories',
    schema: {
      example: {
        statusCode: 200,
        message: 'Lấy danh sách categories thành công',
        data: [
          'Giáo dục',
          'Y tế',
          'Thiên tai',
          'Nghèo đói',
          'Môi trường',
          'Trẻ em',
          'Người cao tuổi',
          'Người khuyết tật',
          'Động vật',
          'Khác'
        ]
      }
    }
  })
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