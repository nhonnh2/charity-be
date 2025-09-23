import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token để lấy access token mới',
  })
  refreshToken: string;
  csrfToken:string;

  @ApiProperty({
    example: {
      id: '64f8b9c123456789abcdef01',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      createdAt: '2023-09-07T10:30:00Z',
    },
    description: 'Thông tin người dùng',
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    avatar?: string;
  };
} 