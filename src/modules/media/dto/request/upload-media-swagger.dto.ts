import { ApiProperty } from '@nestjs/swagger';
import { MediaType, MediaProvider } from '../../entities/media.entity';

export class UploadMediaSwaggerDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Media file to upload',
  })
  file: any;

  @ApiProperty({
    description: 'Type of media file',
    enum: MediaType,
    example: MediaType.IMAGE,
  })
  type: MediaType;

  @ApiProperty({
    description: 'Tags for categorization (JSON string array)',
    required: false,
    example: '["profile", "avatar"]',
  })
  tags?: string;

  @ApiProperty({
    description: 'Description of the media',
    required: false,
    maxLength: 500,
    example: 'Profile picture for user account',
  })
  description?: string;

  @ApiProperty({
    description: 'Alt text for accessibility',
    required: false,
    maxLength: 200,
    example: 'User profile picture',
  })
  altText?: string;

  @ApiProperty({
    description: 'Whether the media is publicly accessible',
    required: false,
    example: false,
  })
  isPublic?: boolean;

  @ApiProperty({
    description: 'Cloud provider (optional - defaults to azure_blob)',
    enum: MediaProvider,
    required: false,
    example: MediaProvider.AZURE_BLOB,
  })
  provider?: MediaProvider;
}
