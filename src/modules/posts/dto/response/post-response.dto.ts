import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { CreatorDto, FileDto } from '@/shared/dto/common';
import { PostVisibility, PostType } from '../../entities/post.entity';



export class LinkPreviewResponseDto {
  @ApiProperty()
  @Expose()
  url: string;

  @ApiPropertyOptional()
  @Expose()
  title?: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string;

  @ApiPropertyOptional()
  @Expose()
  thumbnail?: string;

  @ApiPropertyOptional()
  @Expose()
  domain?: string;
}

export class PostContentResponseDto {
  @ApiPropertyOptional()
  @Expose()
  text?: string;

  @ApiPropertyOptional({ type: [FileDto] })
  @Expose()
  @Type(() => FileDto)
  images?: FileDto[];

  @ApiPropertyOptional({ type: [FileDto] })
  @Expose()
  @Type(() => FileDto)
  videos?: FileDto[];

  @ApiPropertyOptional({ type: [LinkPreviewResponseDto] })
  @Expose()
  @Type(() => LinkPreviewResponseDto)
  links?: LinkPreviewResponseDto[];
}

export class PostEngagementResponseDto {
  @ApiProperty()
  @Expose()
  likesCount: number;

  @ApiProperty()
  @Expose()
  commentsCount: number;

  @ApiProperty()
  @Expose()
  sharesCount: number;

  @ApiProperty()
  @Expose()
  viewsCount: number;
}

export class PostLocationResponseDto {
  @ApiProperty()
  @Expose()
  coordinates: [number, number];

  @ApiPropertyOptional()
  @Expose()
  address?: string;

  @ApiPropertyOptional()
  @Expose()
  city?: string;

  @ApiPropertyOptional()
  @Expose()
  country?: string;
}


export class PostCampaignResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiPropertyOptional()
  @Expose()
  thumbnail?: string;

  @ApiPropertyOptional()
  @Expose()
  status?: string;
}

export class PostResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({ type: CreatorDto })
  @Expose()
  @Type(() => CreatorDto)
  creator: CreatorDto;

  @ApiProperty({ type: PostContentResponseDto })
  @Expose()
  @Type(() => PostContentResponseDto)
  content: PostContentResponseDto;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  campaignId: string;

  @ApiProperty({ type: PostEngagementResponseDto })
  @Expose()
  @Type(() => PostEngagementResponseDto)
  engagement: PostEngagementResponseDto;

  @ApiProperty({ enum: PostVisibility })
  @Expose()
  visibility: PostVisibility;

  @ApiProperty()
  @Expose()
  hashtags: string[];

  @ApiPropertyOptional({ type: PostLocationResponseDto })
  @Expose()
  @Type(() => PostLocationResponseDto)
  location?: PostLocationResponseDto;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  isLiked?: boolean;

  @ApiPropertyOptional()
  @Expose()
  isShared?: boolean;
}
