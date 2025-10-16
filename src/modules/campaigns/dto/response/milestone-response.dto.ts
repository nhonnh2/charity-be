import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { MilestoneStatus } from '../../../../shared/enums';
import { FileDto } from '../../../../shared/dto/common/file.dto';

export class MilestoneResponseDto {
  @ApiProperty({
    description: 'ID giai đoạn',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({
    description: 'Tiêu đề giai đoạn',
    example: 'Giai đoạn 1: Xây dựng cơ sở hạ tầng'
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết giai đoạn',
    example: 'Xây dựng trường học 2 tầng với 8 phòng học'
  })
  @Expose()
  description: string;

  @ApiProperty({
    description: 'Số tiền mục tiêu cho giai đoạn (VND)',
    example: 50000000
  })
  @Expose()
  targetAmount: number;

  @ApiProperty({
    description: 'Số tiền hiện tại đã quyên góp cho giai đoạn (VND)',
    example: 45000000
  })
  @Expose()
  currentAmount: number;

  @ApiProperty({
    description: 'Ngày hoàn thành dự kiến (được set sau khi campaign được approve)',
    example: '2024-12-31T23:59:59.000Z',
    required: false
  })
  @Expose()
  dueDate?: Date;

  @ApiProperty({
    description: 'Thời gian dự kiến (số ngày)',
    example: 30
  })
  @Expose()
  durationDays: number;

  @ApiProperty({
    description: 'Trạng thái giai đoạn',
    enum: MilestoneStatus,
    example: MilestoneStatus.PENDING
  })
  @Expose()
  status: MilestoneStatus;

  @ApiProperty({
    description: 'Giai đoạn đã hoàn thành',
    example: false
  })
  @Expose()
  isCompleted: boolean;

  @ApiProperty({
    description: 'Ngày bắt đầu thực tế',
    example: '2024-01-15T09:00:00.000Z',
    required: false
  })
  @Expose()
  startedAt?: Date;

  @ApiProperty({
    description: 'Ngày hoàn thành thực tế',
    example: '2024-12-25T10:30:00.000Z',
    required: false
  })
  @Expose()
  completedAt?: Date;

  @ApiProperty({
    description: 'Ngày xác minh',
    example: '2024-12-26T14:00:00.000Z',
    required: false
  })
  @Expose()
  verifiedAt?: Date;

  @ApiProperty({
    description: 'Số tiền đã giải ngân',
    example: 45000000,
    required: false
  })
  @Expose()
  disbursedAmount?: number;

  @ApiProperty({
    description: 'Số tiền chi tiêu thực tế',
    example: 45000000,
    required: false
  })
  @Expose()
  actualSpending?: number;

  @ApiProperty({
    description: 'Phần trăm hoàn thành',
    example: 90
  })
  @Expose()
  progressPercentage: number;

  @ApiProperty({
    description: 'Số lần cập nhật tiến độ',
    example: 5
  })
  @Expose()
  progressUpdatesCount: number;

  @ApiProperty({
    description: 'Tài liệu kế hoạch cho giai đoạn',
    type: [FileDto]
  })
  @Expose()
  @Transform(({ obj }) => obj.documents?.map(doc => ({
    id: doc._id?.toString() || doc.id,
    url: doc.url,
    name: doc.name
  })) || [])
  documents: FileDto[];
}