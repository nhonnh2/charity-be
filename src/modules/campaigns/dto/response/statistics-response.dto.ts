import { ApiProperty } from '@nestjs/swagger';

export class CampaignStatsResponseDto {
  @ApiProperty({
    description: 'Tổng số chiến dịch',
    example: 150
  })
  totalCampaigns: number;

  @ApiProperty({
    description: 'Số chiến dịch đang hoạt động',
    example: 45
  })
  activeCampaigns: number;

  @ApiProperty({
    description: 'Số chiến dịch đã hoàn thành',
    example: 80
  })
  completedCampaigns: number;

  @ApiProperty({
    description: 'Tổng số tiền đã quyên góp (VND)',
    example: 2500000000
  })
  totalFundsRaised: number;

  @ApiProperty({
    description: 'Số chiến dịch chờ duyệt',
    example: 25
  })
  pendingReview: number;
}
