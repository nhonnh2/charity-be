import { IsOptional, IsString, IsNumber, Min, Max, IsBoolean, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryProgressUpdatesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  milestoneIndex?: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
} 