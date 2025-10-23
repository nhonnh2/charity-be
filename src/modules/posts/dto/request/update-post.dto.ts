import { ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsObject, 
  MaxLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { PostVisibility } from '../../entities/post.entity';
import { FileDto, LinkPreviewDto } from '@/shared';

export class UpdatePostContentDto {
  @ApiPropertyOptional({ 
    description: 'Updated post text content', 
    example: 'Updated campaign information! #charity #help',
    maxLength: 2000
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

  @ApiPropertyOptional({ 
    description: 'Updated images attached to the post',
    type: [FileDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  images?: FileDto[];

  @ApiPropertyOptional({ 
    description: 'Updated videos attached to the post',
    type: [FileDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  videos?: FileDto[];

  @ApiPropertyOptional({ 
    description: 'Updated links attached to the post',
    type: [LinkPreviewDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkPreviewDto)
  links?: LinkPreviewDto[];
}

export class UpdatePostDto {
  @ApiPropertyOptional({ 
    description: 'Updated post content',
    type: UpdatePostContentDto
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdatePostContentDto)
  content?: UpdatePostContentDto;

  @ApiPropertyOptional({ 
    description: 'Updated campaign ID if post is related to a campaign',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ 
    description: 'Updated post visibility setting',
    enum: PostVisibility
  })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ 
    description: 'Updated hashtags in the post',
    example: ['charity', 'help', 'donation', 'update']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ 
    description: 'Updated user mentions in the post',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional({ 
    description: 'Updated post location',
    example: {
      coordinates: [106.6297, 10.8231],
      address: '456 Updated Street, District 2',
      city: 'Ho Chi Minh City',
      country: 'Vietnam'
    }
  })
  @IsOptional()
  @IsObject()
  location?: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    country?: string;
  };
}