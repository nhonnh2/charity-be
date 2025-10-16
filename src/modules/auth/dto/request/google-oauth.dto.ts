import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleOAuthDto {
  @ApiProperty({
    description: 'Google ID token từ frontend',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty({
    description: 'Nonce để verify tính toàn vẹn của request',
    example: 'random-nonce-string-123'
  })
  @IsString()
  @IsNotEmpty()
  nonce: string;
}
