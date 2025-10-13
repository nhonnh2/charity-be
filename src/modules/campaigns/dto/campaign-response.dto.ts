import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType, FundingType, CampaignStatus, ReviewStatus, MilestoneStatus } from '../../../shared/enums';

export class FileObjectResponseDto {
  @ApiProperty({
    description: 'ID của file trong collection media',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'URL của file',
    example: 'https://example.com/files/document.pdf'
  })
  url: string;

  @ApiProperty({
    description: 'Tên file',
    example: 'document.pdf'
  })
  name: string;
}

export class MilestoneResponseDto {
  @ApiProperty({
    description: 'Tiêu đề giai đoạn',
    example: 'Giai đoạn 1: Xây dựng cơ sở hạ tầng'
  })
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết giai đoạn',
    example: 'Xây dựng trường học 2 tầng với 8 phòng học'
  })
  description: string;

  @ApiProperty({
    description: 'Số tiền mục tiêu cho giai đoạn (VND)',
    example: 50000000
  })
  budget: number;

  @ApiPropertyOptional({
    description: 'Ngày hoàn thành dự kiến (được set sau khi campaign được approve)',
    example: '2024-12-31T23:59:59.000Z'
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Thời gian dự kiến (số ngày)',
    example: 30
  })
  durationDays: number;

  @ApiProperty({
    description: 'Trạng thái giai đoạn',
    enum: MilestoneStatus,
    example: MilestoneStatus.PENDING
  })
  status: MilestoneStatus;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu thực tế',
    example: '2024-01-15T09:00:00.000Z'
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'Ngày hoàn thành thực tế',
    example: '2024-12-25T10:30:00.000Z'
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Ngày xác minh',
    example: '2024-12-26T14:00:00.000Z'
  })
  verifiedAt?: Date;

  @ApiPropertyOptional({
    description: 'Số tiền đã giải ngân',
    example: 45000000
  })
  disbursedAmount?: number;

  @ApiPropertyOptional({
    description: 'Số tiền chi tiêu thực tế',
    example: 45000000
  })
  actualSpending?: number;

  @ApiProperty({
    description: 'Phần trăm hoàn thành',
    example: 90
  })
  progressPercentage: number;

  @ApiProperty({
    description: 'Số lần cập nhật tiến độ',
    example: 5
  })
  progressUpdatesCount: number;

  @ApiProperty({
    description: 'Tài liệu kế hoạch cho giai đoạn',
    type: [FileObjectResponseDto]
  })
  documents: FileObjectResponseDto[];
}

export class AttachmentResponseDto {
  @ApiProperty({
    description: 'Tên file',
    example: 'contract.pdf'
  })
  fileName: string;

  @ApiProperty({
    description: 'URL file',
    example: 'https://example.com/files/contract.pdf'
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Loại file',
    example: 'application/pdf'
  })
  fileType: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000
  })
  fileSize: number;

  @ApiProperty({
    description: 'Ngày upload',
    example: '2024-01-15T09:00:00.000Z'
  })
  uploadedAt: Date;
}

export class ReviewResponseDto {
  @ApiProperty({
    description: 'ID người duyệt',
    example: '507f1f77bcf86cd799439011'
  })
  reviewerId: string;

  @ApiProperty({
    description: 'Tên người duyệt',
    example: 'Nguyễn Văn A'
  })
  reviewerName: string;

  @ApiProperty({
    description: 'Trạng thái duyệt',
    enum: ReviewStatus,
    example: ReviewStatus.APPROVED
  })
  status: ReviewStatus;

  @ApiPropertyOptional({
    description: 'Nhận xét của reviewer',
    example: 'Chiến dịch có mục đích rõ ràng và kế hoạch chi tiết'
  })
  comments?: string;

  @ApiPropertyOptional({
    description: 'Ngày duyệt',
    example: '2024-01-20T10:00:00.000Z'
  })
  reviewedAt?: Date;

  @ApiProperty({
    description: 'Độ ưu tiên duyệt',
    example: 3
  })
  priority: number;
}

export class CreatorResponseDto {
  @ApiProperty({
    description: 'ID người tạo',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: 'Tên người tạo',
    example: 'Nguyễn Văn A'
  })
  name: string;

  @ApiProperty({
    description: 'Email',
    example: 'creator@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Điểm uy tín',
    example: 85
  })
  reputation: number;

  @ApiPropertyOptional({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg'
  })
  avatar?: string;
}

export class CampaignResponseDto {
  @ApiProperty({
    description: 'ID chiến dịch',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: 'Tiêu đề chiến dịch',
    example: 'Xây dựng trường học cho trẻ em vùng cao'
  })
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết chiến dịch',
    example: 'Chiến dịch xây dựng trường học 2 tầng với 8 phòng học...'
  })
  description: string;

  @ApiProperty({
    description: 'Loại chiến dịch',
    enum: CampaignType,
    example: CampaignType.NORMAL
  })
  type: CampaignType;

  @ApiProperty({
    description: 'Loại quyên góp',
    enum: FundingType,
    example: FundingType.FIXED
  })
  fundingType: FundingType;

  @ApiProperty({
    description: 'Trạng thái chiến dịch',
    enum: CampaignStatus,
    example: CampaignStatus.ACTIVE
  })
  status: CampaignStatus;

  @ApiProperty({
    description: 'Thông tin người tạo',
    type: CreatorResponseDto
  })
  creatorId: CreatorResponseDto;

  @ApiProperty({
    description: 'Tên người tạo',
    example: 'Nguyễn Văn A'
  })
  creatorName: string;

  @ApiProperty({
    description: 'Số tiền mục tiêu (VND)',
    example: 200000000
  })
  targetAmount: number;

  @ApiProperty({
    description: 'Số tiền hiện tại đã quyên góp (VND)',
    example: 150000000
  })
  currentAmount: number;

  @ApiProperty({
    description: 'Số lượng người quyên góp',
    example: 1250
  })
  donorCount: number;

  @ApiProperty({
    description: 'Phí duyệt chiến dịch (VND)',
    example: 50000
  })
  reviewFee: number;

  @ApiPropertyOptional({
    description: 'Danh mục chiến dịch',
    example: 'Giáo dục'
  })
  category?: string;

  @ApiProperty({
    description: 'Tags phân loại',
    example: ['trẻ em', 'giáo dục', 'vùng cao'],
    type: [String]
  })
  tags: string[];

  @ApiProperty({
    description: 'Các file đính kèm',
    type: [AttachmentResponseDto]
  })
  attachments: AttachmentResponseDto[];

  @ApiProperty({
    description: 'Các giai đoạn thực hiện',
    type: [MilestoneResponseDto]
  })
  milestones: MilestoneResponseDto[];

  @ApiPropertyOptional({
    description: 'Thông tin duyệt',
    type: ReviewResponseDto
  })
  review?: ReviewResponseDto;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu',
    example: '2024-01-01T00:00:00.000Z'
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc',
    example: '2024-12-31T23:59:59.000Z'
  })
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Số ngày kêu gọi quyên góp',
    example: 90
  })
  fundraisingDays?: number;

  @ApiPropertyOptional({
    description: 'Ngày duyệt',
    example: '2024-01-20T10:00:00.000Z'
  })
  approvedAt?: Date;

  @ApiPropertyOptional({
    description: 'Ngày hoàn thành',
    example: '2024-12-25T10:30:00.000Z'
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Lý do từ chối',
    example: 'Thiếu thông tin cần thiết'
  })
  rejectionReason?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Chiến dịch nổi bật',
    example: false
  })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Số lượt xem',
    example: 1250
  })
  viewCount: number;

  @ApiProperty({
    description: 'Số lượt chia sẻ',
    example: 45
  })
  shareCount: number;

  @ApiPropertyOptional({
    description: 'Ảnh bìa đại diện cho chiến dịch',
    type: FileObjectResponseDto
  })
  coverImage?: FileObjectResponseDto;

  @ApiProperty({
    description: 'Danh sách ảnh của chiến dịch',
    type: [FileObjectResponseDto]
  })
  gallery: FileObjectResponseDto[];

  @ApiPropertyOptional({
    description: 'Hash giao dịch blockchain',
    example: '0x1234567890abcdef...'
  })
  blockchainTxHash?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ smart contract',
    example: '0xabcdef1234567890...'
  })
  smartContractAddress?: string;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-15T09:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-20T10:00:00.000Z'
  })
  updatedAt: Date;
}

export class PaginationResponseDto {
  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1
  })
  current: number;

  @ApiProperty({
    description: 'Số items per page',
    example: 10
  })
  pageSize: number;

  @ApiProperty({
    description: 'Tổng số items',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 15
  })
  totalPages: number;
}

export class CampaignListResponseDto {
  @ApiProperty({
    description: 'Danh sách chiến dịch',
    type: [CampaignResponseDto]
  })
  data: CampaignResponseDto[];

  @ApiProperty({
    description: 'Thông tin phân trang',
    type: PaginationResponseDto
  })
  pagination: PaginationResponseDto;
}

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
