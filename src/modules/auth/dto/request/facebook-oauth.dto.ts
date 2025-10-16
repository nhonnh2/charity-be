import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacebookOAuthDto {
  @ApiProperty({
    description: 'Facebook access token từ frontend',
    example: 'EAABwzLixnjYBO...'
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
