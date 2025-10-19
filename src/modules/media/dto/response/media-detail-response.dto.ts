import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class MediaDetailResponseDto {
  @ApiProperty({
    description: 'ID của media',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({
    description: 'Tên file gốc',
    example: 'image.jpg'
  })
  @Expose()
  originalName: string;

  @ApiProperty({
    description: 'Tên file đã được xử lý',
    example: '507f1f77bcf86cd799439011_image.jpg'
  })
  @Expose()
  filename: string;

  @ApiProperty({
    description: 'MIME type của file',
    example: 'image/jpeg'
  })
  @Expose()
  mimetype: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000
  })
  @Expose()
  size: number;

  @ApiProperty({
    description: 'Loại media',
    example: 'IMAGE',
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT']
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Cloud provider',
    example: 'AZURE_BLOB',
    enum: ['GOOGLE_CLOUD', 'AZURE_BLOB']
  })
  @Expose()
  provider: string;

  @ApiProperty({
    description: 'URL truy cập file',
    example: 'https://storage.example.com/media/image.jpg'
  })
  @Expose()
  url: string;

  @ApiProperty({
    description: 'Đường dẫn trên cloud storage',
    example: 'media/AZURE_BLOB/images/2024/01/01/507f1f77bcf86cd799439011_image.jpg'
  })
  @Expose()
  cloudPath: string;

  @ApiProperty({
    description: 'Trạng thái xử lý',
    example: 'READY',
    enum: ['UPLOADING', 'READY', 'FAILED', 'DELETED']
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'URL thumbnail (nếu có)',
    example: 'https://storage.example.com/media/thumb_image.jpg',
    required: false
  })
  @Expose()
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Metadata của file',
    type: 'object',
    required: false,
    properties: {
      width: { type: 'number', example: 1920 },
      height: { type: 'number', example: 1080 },
      format: { type: 'string', example: 'jpeg' },
      quality: { type: 'string', example: 'original' }
    }
  })
  @Expose()
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    quality?: string;
  };

  @ApiProperty({
    description: 'Tags của media',
    type: [String],
    example: ['nature', 'landscape']
  })
  @Expose()
  tags: string[];

  @ApiProperty({
    description: 'File có public không',
    example: false
  })
  @Expose()
  isPublic: boolean;

  @ApiProperty({
    description: 'Mô tả media',
    example: 'Ảnh phong cảnh đẹp',
    required: false
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Alt text cho accessibility',
    example: 'Mô tả hình ảnh',
    required: false
  })
  @Expose()
  altText?: string;

  @ApiProperty({
    description: 'Số lần download',
    example: 10
  })
  @Expose()
  downloadCount: number;

  @ApiProperty({
    description: 'Số lần xem',
    example: 25
  })
  @Expose()
  viewCount: number;

  @ApiProperty({
    description: 'Ngày upload',
    example: '2024-01-01T00:00:00.000Z'
  })
  @Expose()
  uploadedAt: Date;

  @ApiProperty({
    description: 'Ngày xử lý xong',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  @Expose()
  processedAt?: Date;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-01T00:00:00.000Z'
  })
  @Expose()
  updatedAt: Date;
}
