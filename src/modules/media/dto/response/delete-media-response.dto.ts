import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeleteMediaResponseDto {
  @ApiProperty({
    description: 'Thông báo xóa media thành công',
    example: 'Media deleted successfully'
  })
  @Expose()
  message: string;
}
