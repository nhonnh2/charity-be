import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class CreatorDto {
  @ApiProperty({ description: 'ID của người tạo' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({ description: 'Tên người tạo' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Email người tạo' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Ảnh đại diện' })
  @Expose()
  avatar: string;
}