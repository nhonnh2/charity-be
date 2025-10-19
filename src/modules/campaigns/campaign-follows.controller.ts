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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { 
  FollowCampaignDto,
  CampaignFollowResponseDto,
  CampaignFollowersQueryDto,
  FollowStatusResponseDto,
  CampaignFollowersResponseDto,
  UnfollowResponseDto
} from './dto';
import { TransformResponseDTO } from '../../shared/decorators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Campaign Follows')
@ApiBearerAuth()
@Controller('campaign-follows')
export class CampaignFollowsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Theo dõi chiến dịch',
    description: 'Theo dõi một chiến dịch để nhận thông báo cập nhật'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Theo dõi chiến dịch thành công',
    type: CampaignFollowResponseDto
  })
  @TransformResponseDTO(CampaignFollowResponseDto)
  async followCampaign(
    @Body() followCampaignDto: FollowCampaignDto,
    @Request() req: any
  ) {
    return this.campaignsService.followCampaign(followCampaignDto.campaignId, req.user.id);
  }

  @Delete(':campaignId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Bỏ theo dõi chiến dịch',
    description: 'Bỏ theo dõi một chiến dịch'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Đã bỏ theo dõi chiến dịch thành công',
    type: UnfollowResponseDto
  })
  @TransformResponseDTO(UnfollowResponseDto)
  async unfollowCampaign(
    @Param('campaignId') campaignId: string,
    @Request() req: any
  ) {
    return this.campaignsService.unfollowCampaign(campaignId, req.user.id);
  }

  @Get('my-followed')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Lấy danh sách chiến dịch đã theo dõi',
    description: 'Lấy danh sách các chiến dịch mà người dùng hiện tại đang theo dõi'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách chiến dịch đã theo dõi',
    type: CampaignFollowersResponseDto
  })
  @TransformResponseDTO(CampaignFollowersResponseDto)
  async getMyFollowedCampaigns(
    @Query() query: CampaignFollowersQueryDto,
    @Request() req: any
  ) {
    return this.campaignsService.getUserFollowedCampaigns(req.user.id, query);
  }

  @Get(':campaignId/followers')
  @ApiOperation({ 
    summary: 'Lấy danh sách người theo dõi chiến dịch',
    description: 'Lấy danh sách người dùng đang theo dõi một chiến dịch cụ thể'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách người theo dõi chiến dịch',
    type: CampaignFollowersResponseDto
  })
  @TransformResponseDTO(CampaignFollowersResponseDto)
  async getCampaignFollowers(
    @Param('campaignId') campaignId: string,
    @Query() query: CampaignFollowersQueryDto
  ) {
    return this.campaignsService.getCampaignFollowers(campaignId, query);
  }

  @Get(':campaignId/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Kiểm tra trạng thái theo dõi',
    description: 'Kiểm tra xem người dùng hiện tại có đang theo dõi chiến dịch hay không'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Trạng thái theo dõi của người dùng',
    type: FollowStatusResponseDto
  })
  async getFollowStatus(
    @Param('campaignId') campaignId: string,
    @Request() req: any
  ) {
    return this.campaignsService.checkUserFollowStatus(campaignId, req.user.id);
  }

}
