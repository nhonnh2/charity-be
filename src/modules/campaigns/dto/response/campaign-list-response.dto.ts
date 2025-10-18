import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { CampaignStatus, CampaignCategory } from '../../../../shared/enums';
import { FileDto } from '../../../../shared/dto/common/file.dto';
import { PaginatedResponseDto } from '../../../../shared/dto/common/pagination.dto';

export class CampaignListItemDto {
  @ApiProperty({
    description: 'ID chiến dịch',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({
    description: 'Tiêu đề chiến dịch',
    example: 'Xây dựng trường học cho trẻ em vùng cao'
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Mô tả ngắn gọn chiến dịch',
    example: 'Chiến dịch xây dựng trường học 2 tầng với 8 phòng học cho trẻ em vùng cao'
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Ảnh bìa đại diện cho chiến dịch',
    type: FileDto,
    required: false
  })
  @Expose()
  @Transform(({ obj }) => obj.coverImage ? {
    id: obj.coverImage._id?.toString() || obj.coverImage.id,
    url: obj.coverImage.url,
    name: obj.coverImage.name
  } : undefined)
  coverImage?: FileDto;

  @ApiProperty({
    description: 'Trạng thái chiến dịch',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE
  })
  @Expose()
  status: CampaignStatus;

  @ApiProperty({
    description: 'Danh mục chiến dịch (keyword)',
    enum: CampaignCategory,
    example: CampaignCategory.EDUCATION,
    required: false
  })
  @Expose()
  category?: CampaignCategory;

  @ApiProperty({
    description: 'Số người quan tâm (interested people)',
    example: 45
  })
  @Expose()
  followersCount: number;

  @ApiProperty({
    description: 'Số tiền đã quyên góp (VND)',
    example: 60000000
  })
  @Expose()
  donatedAmount: number;

  @ApiProperty({
    description: 'Số giai đoạn đã hoàn thành',
    example: 2
  })
  @Expose()
  completedMilestones: number;

  @ApiProperty({
    description: 'Tổng số giai đoạn',
    example: 3
  })
  @Expose()
  totalMilestones: number;

  @ApiProperty({
    description: 'Số tiền đã chi tiêu (VND)',
    example: 80000000
  })
  @Expose()
  spentAmount: number;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-15T09:00:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày bắt đầu',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  @Expose()
  startDate?: Date;

  @ApiProperty({
    description: 'Ngày kết thúc',
    example: '2024-12-31T23:59:59.000Z',
    required: false
  })
  @Expose()
  endDate?: Date;

  @ApiProperty({
    description: 'Số lượt xem',
    example: 1250
  })
  @Expose()
  viewCount: number;

  @ApiProperty({
    description: 'Chiến dịch nổi bật',
    example: false
  })
  @Expose()
  isFeatured: boolean;
}

export class CampaignListResponseDto extends PaginatedResponseDto<CampaignListItemDto> {
  @ApiProperty({
    description: 'Danh sách chiến dịch',
    type: [CampaignListItemDto]
  })
  @Expose()
  items: CampaignListItemDto[];
}