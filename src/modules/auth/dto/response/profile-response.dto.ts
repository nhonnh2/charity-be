import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'ID của người dùng',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'user@example.com'
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A'
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Avatar của người dùng',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  @Expose()
  avatar?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'USER',
    enum: ['USER', 'ADMIN', 'MODERATOR']
  })
  @Expose()
  role: string;

  @ApiProperty({
    description: 'Trạng thái xác thực email',
    example: true
  })
  @Expose()
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Ngày tạo tài khoản',
    example: '2024-01-01T00:00:00.000Z'
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Ngày cập nhật cuối',
    example: '2024-01-01T00:00:00.000Z'
  })
  @Expose()
  updatedAt: Date;
}
