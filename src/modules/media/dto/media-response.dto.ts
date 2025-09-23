import { ApiProperty } from '@nestjs/swagger';
import { MediaType, MediaProvider, MediaStatus } from '../entities/media.entity';

export class MediaResponseDto {
  @ApiProperty({
    description: 'Media ID',
    example: '64f8b1234567890abcdef123',
  })
  id: string;

  @ApiProperty({
    description: 'Original filename',
    example: 'profile-picture.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'Generated filename',
    example: '64f8b1234567890abcdef123_profile-picture.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'image/jpeg',
  })
  mimetype: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'Media type',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  type: MediaType;

  @ApiProperty({
    description: 'Cloud provider',
    enum: MediaProvider,
    example: MediaProvider.GOOGLE_CLOUD,
  })
  provider: MediaProvider;

  @ApiProperty({
    description: 'Public URL to access the media',
    example: 'https://storage.googleapis.com/bucket/64f8b1234567890abcdef123_profile-picture.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'Cloud storage path',
    example: 'media/images/2024/01/64f8b1234567890abcdef123_profile-picture.jpg',
  })
  cloudPath: string;

  @ApiProperty({
    description: 'Processing status',
    enum: MediaStatus,
    example: MediaStatus.READY,
  })
  status: MediaStatus;

  @ApiProperty({
    description: 'Thumbnail URL (for images/videos)',
    required: false,
    example: 'https://storage.googleapis.com/bucket/thumbnails/64f8b1234567890abcdef123_thumb.jpg',
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Media metadata',
    required: false,
    example: {
      width: 1920,
      height: 1080,
      format: 'JPEG',
      quality: 'high',
    },
  })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    quality?: string;
  };

  @ApiProperty({
    description: 'Tags for categorization',
    type: [String],
    required: false,
    example: ['charity', 'campaign'],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Whether the media is publicly accessible',
    example: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Description of the media',
    required: false,
    example: 'Campaign banner image',
  })
  description?: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    required: false,
    example: 'Charity event banner',
  })
  altText?: string;

  @ApiProperty({
    description: 'Download count',
    example: 25,
  })
  downloadCount: number;

  @ApiProperty({
    description: 'View count',
    example: 150,
  })
  viewCount: number;

  @ApiProperty({
    description: 'Upload timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  uploadedAt: Date;

  @ApiProperty({
    description: 'Processing completion timestamp',
    required: false,
    example: '2024-01-15T10:31:00.000Z',
  })
  processedAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:31:00.000Z',
  })
  updatedAt: Date;
}

export class MediaListResponseDto {
  @ApiProperty({
    description: 'List of media items',
    type: [MediaResponseDto],
  })
  data: MediaResponseDto[];

  @ApiProperty({
    description: 'Total count of media items',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages: number;
}


