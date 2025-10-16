import { ApiProperty } from '@nestjs/swagger';

export class MediaDetailResponseDto {
  @ApiProperty({
    description: 'ID của media',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'Tên file gốc',
    example: 'image.jpg'
  })
  originalName: string;

  @ApiProperty({
    description: 'Tên file đã được xử lý',
    example: '507f1f77bcf86cd799439011_image.jpg'
  })
  filename: string;

  @ApiProperty({
    description: 'MIME type của file',
    example: 'image/jpeg'
  })
  mimetype: string;

  @ApiProperty({
    description: 'Kích thước file (bytes)',
    example: 1024000
  })
  size: number;

  @ApiProperty({
    description: 'Loại media',
    example: 'IMAGE',
    enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT']
  })
  type: string;

  @ApiProperty({
    description: 'Cloud provider',
    example: 'AZURE_BLOB',
    enum: ['GOOGLE_CLOUD', 'AZURE_BLOB']
  })
  provider: string;

  @ApiProperty({
    description: 'URL truy cập file',
    example: 'https://storage.example.com/media/image.jpg'
  })
  url: string;

  @ApiProperty({
    description: 'Đường dẫn trên cloud storage',
    example: 'media/AZURE_BLOB/images/2024/01/01/507f1f77bcf86cd799439011_image.jpg'
  })
  cloudPath: string;

  @ApiProperty({
    description: 'Trạng thái xử lý',
    example: 'READY',
    enum: ['UPLOADING', 'READY', 'FAILED', 'DELETED']
  })
  status: string;

  @ApiProperty({
    description: 'URL thumbnail (nếu có)',
    example: 'https://storage.example.com/media/thumb_image.jpg',
    required: false
  })
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
  tags: string[];

  @ApiProperty({
    description: 'File có public không',
    example: false
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Mô tả media',
    example: 'Ảnh phong cảnh đẹp',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'Alt text cho accessibility',
    example: 'Mô tả hình ảnh',
    required: false
  })
  altText?: string;

  @ApiProperty({
    description: 'Số lần download',
    example: 10
  })
  downloadCount: number;

  @ApiProperty({
    description: 'Số lần xem',
    example: 25
  })
  viewCount: number;

  @ApiProperty({
    description: 'Ngày upload',
    example: '2024-01-01T00:00:00.000Z'
  })
  uploadedAt: Date;

  @ApiProperty({
    description: 'Ngày xử lý xong',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  processedAt?: Date;

  @ApiProperty({
    description: 'Ngày tạo',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}
