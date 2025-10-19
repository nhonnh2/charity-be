import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { CampaignStatus } from '@shared/enums';
import { CreatorDto } from '@shared/dto/common/creator.dto';
import { AttachmentDto,FileDto } from '@shared/dto/common/file.dto';
import { MilestoneResponseDto } from './milestone-response.dto';
import { ReviewResponseDto } from './review-response.dto';

export class CampaignDetailResponseDto {
  @ApiProperty({ description: 'ID của chiến dịch' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({ description: 'Tiêu đề chiến dịch' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Mô tả ngắn gọn' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Nội dung chi tiết' })
  @Expose()
  content: string;

  @ApiProperty({ description: 'Mục tiêu quyên góp' })
  @Expose()
  targetAmount: number;

  @ApiProperty({ description: 'Số tiền đã quyên góp' })
  @Expose()
  currentAmount: number;

  @ApiProperty({ description: 'Phần trăm hoàn thành' })
  @Expose()
  @Transform(({ obj }) => {
    if (obj.targetAmount && obj.targetAmount > 0) {
      return Math.round((obj.currentAmount / obj.targetAmount) * 100);
    }
    return 0;
  })
  progressPercentage: number;

  @ApiProperty({ description: 'Ngày bắt đầu' })
  @Expose()
  startDate: Date;

  @ApiProperty({ description: 'Ngày kết thúc' })
  @Expose()
  endDate: Date;

  @ApiProperty({ description: 'Trạng thái chiến dịch', enum: CampaignStatus })
  @Expose()
  status: CampaignStatus;

  @ApiProperty({ description: 'Danh mục' })
  @Expose()
  category: string;

  @ApiProperty({ description: 'Từ khóa' })
  @Expose()
  tags: string[];

  @ApiProperty({ description: 'Hình ảnh chính' })
  @Expose()
  @Transform(({ obj }) => obj.coverImage ? {
    id: obj.coverImage._id?.toString() || obj.coverImage.id,
    url: obj.coverImage.url,
    name: obj.coverImage.name
  } : undefined)
  coverImage: FileDto;

  @ApiProperty({ description: 'Hình ảnh bổ sung', type: [FileDto] })
  @Expose()
  @Transform(({ obj }) => obj.gallery?.map(item => ({
    id: item._id?.toString() || item.id,
    url: item.url,
    name: item.name
  })))
  gallery: FileDto[];

  @ApiProperty({ description: 'Thông tin người tạo', type: CreatorDto })
  @Expose()
  @Type(() => CreatorDto)
  creator: CreatorDto;

  @ApiProperty({ description: 'Số lượt xem' })
  @Expose()
  viewCount: number;

  @ApiProperty({ description: 'Số lượt quan tâm' })
  @Expose()
  followersCount: number;

  @ApiProperty({ description: 'Số lượt chia sẻ' })
  @Expose()
  shareCount: number;

  @ApiProperty({ description: 'Số lượt đánh giá' })
  @Expose()
  reviewCount: number;

  @ApiProperty({ description: 'Điểm đánh giá trung bình' })
  @Expose()
  @Transform(({ obj }) => obj.averageRating || 0)
  averageRating: number;

  @ApiProperty({ description: 'Các mốc quan trọng', type: [MilestoneResponseDto] })
  @Expose()
  @Type(() => MilestoneResponseDto)
  milestones: MilestoneResponseDto[];

  @ApiProperty({ description: 'Các đánh giá gần đây', type: [ReviewResponseDto] })
  @Expose()
  @Type(() => ReviewResponseDto)
  reviews: ReviewResponseDto[];

  @ApiProperty({ description: 'Ngày tạo' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Ngày cập nhật' })
  @Expose()
  updatedAt: Date;
}
