import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UnfollowResponseDto {
  @ApiProperty({
    description: 'Thông báo kết quả',
    example: 'Đã bỏ theo dõi chiến dịch thành công'
  })
  @Expose()
  message: string;
}
