import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: '507f1f77bcf86cd799439011'
  })
  id: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A'
  })
  name: string;

  @ApiProperty({
    description: 'Avatar của người dùng',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  avatar?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'USER',
    enum: ['USER', 'ADMIN', 'MODERATOR']
  })
  role: string;

  @ApiProperty({
    description: 'Trạng thái xác thực email',
    example: true
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Ngày tạo tài khoản',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật cuối',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}
