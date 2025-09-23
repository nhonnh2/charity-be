import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray, IsBoolean, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { MediaType, MediaProvider } from '../entities/media.entity';

export class UploadMediaDto {
  @ApiProperty({
    description: 'Type of media file',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'Tags for categorization',
    type: [String],
    required: false,
    example: ['charity', 'campaign', 'profile'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(tag => tag.trim());
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Description of the media',
    required: false,
    maxLength: 500,
    example: 'Campaign banner image for charity event',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    required: false,
    maxLength: 200,
    example: 'Charity event banner showing volunteers helping community',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;

  @ApiProperty({
    description: 'Whether the media is publicly accessible',
    required: false,
    default: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Cloud provider (optional - defaults to azure_blob)',
    enum: MediaProvider,
    required: false,
    example: MediaProvider.AZURE_BLOB,
  })
  @IsOptional()
  @IsEnum(MediaProvider)
  provider?: MediaProvider;
}


