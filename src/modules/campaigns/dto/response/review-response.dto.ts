import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { ReviewStatus } from '../../../../shared/enums';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'ID review',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({
    description: 'Trạng thái duyệt',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED
  })
  @Expose()
  status: ReviewStatus;

  @ApiProperty({
    description: 'Nhận xét của reviewer',
    example: 'Chiến dịch có mục đích rõ ràng và kế hoạch chi tiết',
    required: false
  })
  @Expose()
  comment?: string;

  @ApiProperty({
    description: 'Ngày duyệt',
    example: '2024-01-20T10:00:00.000Z',
    required: false
  })
  @Expose()
  reviewedAt?: Date;

  @ApiProperty({
    description: 'Thông tin người duyệt',
    type: 'object'
  })
  @Expose()
  @Transform(({ obj }) => ({
    id: obj.reviewerId?._id?.toString() || obj.reviewerId?.id || obj.reviewerId,
    name: obj.reviewerName || obj.reviewerId?.name,
    email: obj.reviewerId?.email
  }))
  reviewer: {
    id: string;
    name: string;
    email?: string;
  };

  @ApiProperty({
    description: 'Độ ưu tiên duyệt',
    example: 3
  })
  @Expose()
  priority: number;
}