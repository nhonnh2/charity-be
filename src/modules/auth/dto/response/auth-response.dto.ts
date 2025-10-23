import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UserInfoDto {
  @ApiProperty({ description: 'ID người dùng', example: '507f1f77bcf86cd799439011' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Email người dùng', example: 'user@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Avatar người dùng', example: 'https://example.com/avatar.jpg', required: false })
  @Expose()
  avatar?: string;

  @ApiProperty({ description: 'Vai trò người dùng', example: 'USER' })
  @Expose()
  role: string;

  @ApiProperty({ description: 'Trạng thái xác thực email', example: true })
  @Expose()
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Thời gian tạo', example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Thời gian cập nhật', example: '2023-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token để xác thực các request',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token để làm mới access token',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
  })
  @Expose()
  refreshToken: string;
  
  @ApiProperty({
    description: 'csrfToken token',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'
  })
  @Expose()
  csrfToken: string;

  @ApiProperty({
    description: 'Thông tin người dùng',
    type: UserInfoDto
  })
  @Expose()
  @Type(() => UserInfoDto)
  user: UserInfoDto;
}
