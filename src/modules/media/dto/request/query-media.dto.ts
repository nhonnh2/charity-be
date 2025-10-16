import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MediaType, MediaProvider, MediaStatus } from '../../entities/media.entity';

export class QueryMediaDto {
  @ApiProperty({
    description: 'Page number',
    required: false,
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Media type filter',
    enum: MediaType,
    required: false,
    example: MediaType.IMAGE,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiProperty({
    description: 'Cloud provider filter',
    enum: MediaProvider,
    required: false,
    example: MediaProvider.GOOGLE_CLOUD,
  })
  @IsOptional()
  @IsEnum(MediaProvider)
  provider?: MediaProvider;

  @ApiProperty({
    description: 'Status filter',
    enum: MediaStatus,
    required: false,
    example: MediaStatus.READY,
  })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @ApiProperty({
    description: 'Search query for filename or description',
    required: false,
    example: 'profile picture',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Tags filter (comma-separated)',
    required: false,
    example: 'charity,campaign',
  })
  @IsOptional()
  @Transform(({ value }) => value.split(',').map(tag => tag.trim()).filter(tag => tag))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Public media filter',
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isPublic?: boolean;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    enum: ['createdAt', 'updatedAt', 'size', 'downloadCount', 'viewCount'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}


