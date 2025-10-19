import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { MediaDetailResponseDto } from './media-detail-response.dto';

export class MediaListResponseDto {
  @ApiProperty({
    description: 'Danh sách media',
    type: [MediaDetailResponseDto]
  })
  @Expose()
  @Type(() => MediaDetailResponseDto)
  data: MediaDetailResponseDto[];

  @ApiProperty({
    description: 'Tổng số media',
    example: 100
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 20
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 5
  })
  @Expose()
  totalPages: number;
}
