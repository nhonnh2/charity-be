import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class FileDto {
  @ApiProperty({ description: 'Tên file' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL của file' })
  @Expose()
  url: string;

  @ApiProperty({ description: 'Kích thước file (bytes)' })
  @Expose()
  size: number;

  @ApiProperty({ description: 'Loại MIME của file' })
  @Expose()
  mimeType: string;
}

export class AttachmentDto {
  @ApiProperty({ description: 'ID của attachment' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({ description: 'Tên file' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL của file' })
  @Expose()
  url: string;

  @ApiProperty({ description: 'Kích thước file (bytes)' })
  @Expose()
  size: number;

  @ApiProperty({ description: 'Loại MIME của file' })
  @Expose()
  mimeType: string;

  @ApiProperty({ description: 'Mô tả file' })
  @Expose()
  description: string;
}