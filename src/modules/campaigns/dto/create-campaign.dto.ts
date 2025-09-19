import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray, IsDateString, Min, Max, MaxLength, ValidateIf } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CampaignType, FundingType } from '../../../shared/enums';

export class MilestoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @Min(1000)
  targetAmount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  status?: 'pending' | 'in_progress' | 'completed';

  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsEnum(CampaignType)
  type: CampaignType;

  @IsEnum(FundingType)
  fundingType: FundingType;

  @IsNumber()
  @Min(1000)
  @Max(10000000000) // 10 billion VND max
  targetAmount: number;

  @IsNumber()
  @Min(0)
  @Max(1000000) // 1 million VND max review fee
  reviewFee: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @Type(() => MilestoneDto)
  milestones?: MilestoneDto[];

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

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