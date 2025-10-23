import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsArray,
  IsDateString
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQueryDto } from '../../../../shared/dto/common';
import { PostVisibility, PostType } from '../../entities/post.entity';

export class QueryPostsDto extends BaseQueryDto {
  @ApiPropertyOptional({ 
    description: 'Filter by user ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by post creator ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  creatorId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by campaign ID',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by post type',
    enum: PostType,
    example: PostType.TEXT
  })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional({ 
    description: 'Filter by post visibility',
    enum: PostVisibility,
    example: PostVisibility.PUBLIC
  })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ 
    description: 'Filter by hashtags',
    example: ['charity', 'help']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim());
    }
    return value;
  })
  hashtags?: string[];

  @ApiPropertyOptional({ 
    description: 'Filter by user mentions',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(id => id.trim());
    }
    return value;
  })
  mentions?: string[];

  @ApiPropertyOptional({ 
    description: 'Start date for filtering posts',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    description: 'End date for filtering posts',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
