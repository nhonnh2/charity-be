import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class FileDto {
  @ApiProperty({ description: 'ID của file' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({ description: 'Tên file' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string;

  @ApiProperty({ description: 'URL của file' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  url: string;

  @ApiProperty({ description: 'Kích thước file (bytes)' })
  @IsOptional()
  @IsNumber()
  @Expose()
  size?: number;

  @ApiProperty({ description: 'Loại MIME của file' })
  @IsOptional()
  @IsString()
  @Expose()
  mimeType?: string;
}