import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
    minimum: 1
  })
  current: number;

  @ApiProperty({
    description: 'Số items per page',
    example: 10,
    minimum: 1
  })
  pageSize: number;

  @ApiProperty({
    description: 'Tổng số items',
    example: 150,
    minimum: 0
  })
  total: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 15,
    minimum: 0
  })
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo',
    example: true
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Có trang trước',
    example: false
  })
  hasPrev: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Danh sách dữ liệu',
    isArray: true
  })
  items: T[];

  @ApiProperty({
    description: 'Thông tin phân trang',
    type: PaginationDto
  })
  pagination: PaginationDto;
}
