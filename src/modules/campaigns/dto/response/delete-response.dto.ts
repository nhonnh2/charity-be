import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeleteResponseDto {
  @ApiProperty({
    description: 'Thông báo kết quả',
    example: 'Chiến dịch đã được xóa thành công'
  })
  @Expose()
  message: string;
}
