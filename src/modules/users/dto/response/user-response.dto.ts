import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
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
    description: 'Số điện thoại',
    example: '+84987654321',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'Địa chỉ',
    example: '123 Main St, City',
    required: false
  })
  address?: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: 'user',
    enum: ['user', 'admin', 'donor', 'organization']
  })
  role: string;

  @ApiProperty({
    description: 'Trạng thái tài khoản',
    example: 'active',
    enum: ['active', 'inactive', 'suspended']
  })
  status: string;

  @ApiProperty({
    description: 'Avatar của người dùng',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  avatar?: string;

  @ApiProperty({
    description: 'Ngày sinh',
    example: '1990-01-01T00:00:00.000Z',
    required: false
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Tiểu sử',
    example: 'User bio information',
    required: false
  })
  bio?: string;

  @ApiProperty({
    description: 'Trạng thái xác thực',
    example: true
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Lần đăng nhập cuối',
    example: '2024-01-01T00:00:00.000Z',
    required: false
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Điểm uy tín',
    example: 85
  })
  reputation: number;

  @ApiProperty({
    description: 'Tổng số tiền đã quyên góp',
    example: 1000000
  })
  totalDonated: number;

  @ApiProperty({
    description: 'Tổng số chiến dịch đã tạo',
    example: 5
  })
  totalCampaignsCreated: number;

  @ApiProperty({
    description: 'Số chiến dịch thành công',
    example: 3
  })
  successfulCampaigns: number;

  @ApiProperty({
    description: 'Địa chỉ ví',
    example: '0x1234567890abcdef',
    required: false
  })
  walletAddress?: string;

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
