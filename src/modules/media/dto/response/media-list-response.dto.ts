import { ApiProperty } from '@nestjs/swagger';
import { MediaDetailResponseDto } from './media-detail-response.dto';

export class MediaListResponseDto {
  @ApiProperty({
    description: 'Danh sách media',
    type: [MediaDetailResponseDto]
  })
  data: MediaDetailResponseDto[];

  @ApiProperty({
    description: 'Tổng số media',
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
