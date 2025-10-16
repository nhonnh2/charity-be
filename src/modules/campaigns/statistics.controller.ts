import { Controller, Get, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { TransformResponseDTO } from '../../shared/decorators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignStatsResponseDto } from './dto';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  @Get('campaigns')
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
  @TransformResponseDTO(CampaignStatsResponseDto)
  async getCampaignStats(): Promise<CampaignStatsResponseDto> {
    // TODO: Implement campaign statistics
    const stats: CampaignStatsResponseDto = {
      totalCampaigns: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      totalFundsRaised: 0,
      pendingReview: 0,
    };
    
    return stats;
  }
}
