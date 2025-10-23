import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  IsObject, 
  IsNumber,
  MaxLength,
  ValidateNested,
  IsUrl
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PostVisibility, PostType } from '../../entities/post.entity';
import { FileDto, LinkPreviewDto } from '../../../../shared/dto/common';



// Sử dụng FileDto từ shared thay vì tạo DTO riêng

// LinkPreviewDto đã được import từ shared

export class PostContentDto {
  @ApiPropertyOptional({ 
    description: 'Post text content', 
    example: 'This is a great campaign! #charity #help',
    maxLength: 2000
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

  @ApiPropertyOptional({ 
    description: 'Images attached to the post',
    type: [FileDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  images?: FileDto[];

  @ApiPropertyOptional({ 
    description: 'Videos attached to the post',
    type: [FileDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  videos?: FileDto[];

  @ApiPropertyOptional({ 
    description: 'Links attached to the post',
    type: [LinkPreviewDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkPreviewDto)
  links?: LinkPreviewDto[];
}

export class CreatePostDto {
  @ApiProperty({ 
    description: 'Post content',
    type: PostContentDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PostContentDto)
  content: PostContentDto;

  @ApiPropertyOptional({ 
    description: 'Campaign ID if post is related to a campaign',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ 
    description: 'Post visibility setting',
    enum: PostVisibility,
    example: PostVisibility.PUBLIC
  })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ 
    description: 'Hashtags in the post',
    example: ['charity', 'help', 'donation']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim().replace('#', ''));
    }
    return value;
  })
  hashtags?: string[];

  @ApiPropertyOptional({ 
    description: 'User mentions in the post',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional({ 
    description: 'Post location',
    example: {
      coordinates: [106.6297, 10.8231],
      address: '123 Main Street, District 1',
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
