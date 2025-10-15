import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray, IsDateString, Min, Max, MaxLength, ValidateIf, IsUUID } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType, FundingType, CampaignCategory } from '../../../shared/enums';

export class FileObjectDto {
  @ApiProperty({
    description: 'ID của file trong collection media',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'URL của file',
    example: 'https://example.com/files/document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Tên file',
    example: 'document.pdf'
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class MilestoneDto {
  @ApiProperty({
    description: 'Tiêu đề giai đoạn',
    example: 'Giai đoạn 1: Xây dựng cơ sở hạ tầng',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết giai đoạn',
    example: 'Xây dựng trường học 2 tầng với 8 phòng học',
    maxLength: 20000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  description: string;

  @ApiProperty({
    description: 'Số tiền mục tiêu cho giai đoạn (VND)',
    example: 50000000,
    minimum: 1000
  })
  @IsNumber()
  @Min(1000)
  budget: number;


  @ApiProperty({
    description: 'Thời gian dự kiến (số ngày)',
    example: 30,
    minimum: 1,
    maximum: 365
  })
  @IsNumber()
  @Min(1)
  @Max(365)
  durationDays: number;

  @ApiPropertyOptional({
    description: 'Trạng thái giai đoạn',
    enum: ['pending', 'in_progress', 'completed'],
    example: 'pending'
  })
  @IsOptional()
  @IsString()
  status?: 'pending' | 'in_progress' | 'completed';


  @ApiPropertyOptional({
    description: 'Tài liệu kế hoạch cho giai đoạn',
    type: [FileObjectDto]
  })
  @IsOptional()
  @IsArray()
  @Type(() => FileObjectDto)
  documents?: FileObjectDto[];
}

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Tiêu đề chiến dịch',
    example: 'Xây dựng trường học cho trẻ em vùng cao',
    maxLength: 200
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết chiến dịch',
    example: 'Chiến dịch xây dựng trường học 2 tầng với 8 phòng học cho 200 học sinh tại xã vùng cao...',
    maxLength: 5000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    description: 'Loại chiến dịch',
    enum: CampaignType,
    example: CampaignType.NORMAL
  })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiProperty({
    description: 'Loại quyên góp',
    enum: FundingType,
    example: FundingType.FIXED
  })
  @IsEnum(FundingType)
  fundingType: FundingType;

  @ApiProperty({
    description: 'Số tiền mục tiêu (VND)',
    example: 200000000,
    minimum: 1000,
    maximum: 10000000000
  })
  @IsNumber()
  @Min(1000)
  @Max(10000000000) // 10 billion VND max
  targetAmount: number;

  @ApiProperty({
    description: 'Phí duyệt chiến dịch (VND) - để thu hút reviewer',
    example: 50000,
    minimum: 0,
    maximum: 1000000
  })
  @IsNumber()
  @Min(0)
  @Max(1000000) // 1 million VND max review fee
  reviewFee: number;

  @ApiPropertyOptional({
    description: 'Danh mục chiến dịch (keyword)',
    enum: CampaignCategory,
    example: CampaignCategory.EDUCATION
  })
  @IsOptional()
  @IsEnum(CampaignCategory)
  category?: CampaignCategory;

  @ApiPropertyOptional({
    description: 'Tags để phân loại chiến dịch',
    example: ['trẻ em', 'giáo dục', 'vùng cao'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu chiến dịch',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc chiến dịch',
    example: '2024-12-31T23:59:59.000Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Số ngày kêu gọi quyên góp (nếu cung cấp sẽ tính endDate = startDate + số ngày)',
    example: 90,
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  fundraisingDays?: number;

  @ApiPropertyOptional({
    description: 'Các giai đoạn thực hiện chiến dịch',
    type: [MilestoneDto]
  })
  @IsOptional()
  @IsArray()
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @ApiPropertyOptional({
    description: 'Ảnh bìa đại diện cho chiến dịch',
    type: FileObjectDto
  })
  @IsOptional()
  @Type(() => FileObjectDto)
  coverImage?: FileObjectDto;

  @ApiPropertyOptional({
    description: 'Danh sách ảnh của chiến dịch',
    type: [FileObjectDto]
  })
  @IsOptional()
  @IsArray()
  @Type(() => FileObjectDto)
  gallery?: FileObjectDto[];

  // Validation cho emergency campaign - chỉ validate khi type là EMERGENCY
  @ValidateIf(o => o.type === CampaignType.EMERGENCY)
  @IsOptional()
  creatorReputation?: number; // Sẽ được set từ service

  // Transform để clean data
  @Transform(({ value }) => value?.trim())
  @Transform(({ value }) => value)
  title_transformed?: string;

  @Transform(({ value }) => value?.trim())
  description_transformed?: string;
} 