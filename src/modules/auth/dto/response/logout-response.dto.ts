import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Thông báo đăng xuất thành công',
    example: 'Đăng xuất thành công'
  })
  message: string;
}
