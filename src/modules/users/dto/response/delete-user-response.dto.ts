import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserResponseDto {
  @ApiProperty({
    description: 'Thông báo xóa người dùng thành công',
    example: 'Người dùng đã được xóa thành công'
  })
  message: string;
}
