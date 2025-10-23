import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginatedResponseDto } from '../../../../shared/dto/common/pagination.dto';
import { PostResponseDto } from './post-response.dto';

export class PostListResponseDto extends PaginatedResponseDto<PostResponseDto> {
  @ApiProperty({ 
    description: 'Danh sách bài viết',
    type: [PostResponseDto] })
  @Expose()
  items: PostResponseDto[];
}
