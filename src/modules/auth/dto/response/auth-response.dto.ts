import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token để xác thực các request',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token để làm mới access token',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Thời gian hết hạn của access token (giây)',
    example: 7200
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Thông tin người dùng',
    type: 'object',
    properties: {
      id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      email: { type: 'string', example: 'user@example.com' },
      name: { type: 'string', example: 'Nguyễn Văn A' },
      avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
      role: { type: 'string', example: 'USER' },
      isEmailVerified: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  })
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}
