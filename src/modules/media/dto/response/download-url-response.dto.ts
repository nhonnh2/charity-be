import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DownloadUrlResponseDto {
  @ApiProperty({
    description: 'URL để download file',
    example: 'https://storage.example.com/signed-url?token=abc123'
  })
  @Expose()
  downloadUrl: string;
}
