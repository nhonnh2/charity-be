import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Thông báo đăng xuất thành công',
    example: 'Đăng xuất thành công'
  })
  @Expose()
  message: string;
}
