import { ApiProperty } from '@nestjs/swagger';

export class DownloadUrlResponseDto {
  @ApiProperty({
    description: 'URL để download file',
    example: 'https://storage.example.com/signed-url?token=abc123'
  })
  downloadUrl: string;
}
