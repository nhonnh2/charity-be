import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UserListResponseDto {
  @ApiProperty({
    description: 'Danh sách người dùng',
    type: [UserResponseDto]
  })
  data: UserResponseDto[];

  @ApiProperty({
    description: 'Tổng số người dùng',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 20
  })
  limit: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 5
  })
  totalPages: number;
}
