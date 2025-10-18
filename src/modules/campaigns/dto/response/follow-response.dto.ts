import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class CampaignFollowResponseDto {
  @ApiProperty({ 
    description: 'ID của follow',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @ApiProperty({ 
    description: 'ID của campaign',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  campaignId: string;

  @ApiProperty({ 
    description: 'Tên campaign',
    example: 'Xây dựng trường học cho trẻ em vùng cao'
  })
  @Expose()
  campaignTitle: string;

  @ApiProperty({ 
    description: 'ID của user',
    example: '507f1f77bcf86cd799439011'
  })
  @Expose()
  userId: string;

  @ApiProperty({ 
    description: 'Tên user',
    example: 'Nguyễn Văn A'
  })
  @Expose()
  userName: string;

  @ApiProperty({ 
    description: 'Thời gian follow',
    example: '2024-01-15T09:00:00.000Z'
  })
  @Expose()
  followedAt: Date;

  @ApiProperty({ 
    description: 'Số người quan tâm hiện tại',
    example: 125
  })
  @Expose()
  followersCount: number;

  @ApiProperty({ 
    description: 'Trạng thái follow',
    example: true
  })
  @Expose()
  isFollowing: boolean;
}

export class FollowStatusResponseDto {
  @ApiProperty({
    description: 'Trạng thái follow',
    example: true
  })
  @Expose()
  isFollowing: boolean;

  @ApiProperty({
    description: 'Thời gian follow',
    example: '2024-01-15T09:00:00.000Z',
    required: false
  })
  @Expose()
  followedAt?: Date;
}

export class CampaignFollowersResponseDto {
  @ApiProperty({
    description: 'Danh sách người follow',
    isArray: true
  })
  @Expose()
  data: any[];

  @ApiProperty({
    description: 'Thông tin phân trang',
    type: Object
  })
  @Expose()
  pagination: any;
}