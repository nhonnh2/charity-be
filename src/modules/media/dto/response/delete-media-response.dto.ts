import { ApiProperty } from '@nestjs/swagger';

export class DeleteMediaResponseDto {
  @ApiProperty({
    description: 'Thông báo xóa media thành công',
    example: 'Media deleted successfully'
  })
  message: string;
}
