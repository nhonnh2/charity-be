import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType, FundingType, CampaignStatus } from '../../../shared/enums';

export class QueryCampaignsDto {
  @ApiPropertyOptional({
    description: 'Số trang',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo title, description, creator',
    example: 'trường học'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Loại chiến dịch',
    enum: CampaignType,
    example: CampaignType.NORMAL
  })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiPropertyOptional({
    description: 'Loại quyên góp',
    enum: FundingType,
    example: FundingType.FIXED
  })
  @IsOptional()
  @IsEnum(FundingType)
  fundingType?: FundingType;

  @ApiPropertyOptional({
    description: 'Trạng thái chiến dịch',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Danh mục chiến dịch',
    example: 'Giáo dục'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'ID của người tạo chiến dịch',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  creatorId?: string;

  @ApiPropertyOptional({
    description: 'Số tiền mục tiêu tối thiểu (VND)',
    example: 1000000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minTargetAmount?: number;

  @ApiPropertyOptional({
    description: 'Số tiền mục tiêu tối đa (VND)',
    example: 100000000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxTargetAmount?: number;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu từ',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu đến',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Lọc chiến dịch nổi bật',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Trường để sắp xếp',
    example: 'createdAt',
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Tag để lọc',
    example: 'trẻ em'
  })
  @IsOptional()
  @IsString()
  tag?: string;
} 