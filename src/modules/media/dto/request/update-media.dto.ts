import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray, IsBoolean, MaxLength } from 'class-validator';
import { MediaType } from '../../entities/media.entity';

export class UpdateMediaDto {
  @ApiProperty({
    description: 'Tags for categorization',
    type: [String],
    required: false,
    example: ['charity', 'campaign', 'updated'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Description of the media',
    required: false,
    maxLength: 500,
    example: 'Updated campaign banner image for charity event',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    required: false,
    maxLength: 200,
    example: 'Updated charity event banner showing volunteers helping community',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;

  @ApiProperty({
    description: 'Whether the media is publicly accessible',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}


