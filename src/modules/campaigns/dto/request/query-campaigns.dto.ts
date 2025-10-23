import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType, FundingType, CampaignStatus, CampaignCategory } from '../../../../shared/enums';

export class QueryCampaignsDto {
  @ApiPropertyOptional({
    description: 'Số trang',
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
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Loại chiến dịch',
    enum: CampaignType,
  })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @ApiPropertyOptional({
    description: 'Loại quyên góp',
    enum: FundingType,
  })
  @IsOptional()
  @IsEnum(FundingType)
  fundingType?: FundingType;

  @ApiPropertyOptional({
    description: 'Trạng thái chiến dịch',
    enum: CampaignStatus,
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiPropertyOptional({
    description: 'Danh mục chiến dịch (keyword)',
    enum: CampaignCategory,
  })
  @IsOptional()
  @IsEnum(CampaignCategory)
  category?: CampaignCategory;

  @ApiPropertyOptional({
    description: 'ID của người tạo chiến dịch',
  })
  @IsOptional()
  @IsString()
  creatorId?: string;

  @ApiPropertyOptional({
    description: 'Số tiền mục tiêu tối thiểu (VND)',
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minTargetAmount?: number;

  @ApiPropertyOptional({
    description: 'Số tiền mục tiêu tối đa (VND)',
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxTargetAmount?: number;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu từ',
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu đến',
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Lọc chiến dịch nổi bật',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Trường để sắp xếp',
    default: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Tag để lọc',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Lọc chiến dịch chờ duyệt (dành cho reviewer)',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  pendingReview?: boolean;

  @ApiPropertyOptional({
    description: 'Lọc chiến dịch đã follow bởi user hiện tại',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  followedBy?: boolean;
}
