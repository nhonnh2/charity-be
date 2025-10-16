import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsMongoId } from 'class-validator';

export class FollowCampaignDto {
  @ApiProperty({ 
    description: 'ID của chiến dịch',
    example: '64f8b9c123456789abcdef01'
  })
  @IsMongoId({ message: 'ID chiến dịch không hợp lệ' })
  campaignId: string;

  @ApiProperty({ 
    description: 'Lý do quan tâm chiến dịch (optional)',
    example: 'Tôi muốn theo dõi tiến độ của chiến dịch này',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Lý do quan tâm không được quá 500 ký tự' })
  reason?: string;
}

export class UnfollowCampaignDto {
  @ApiProperty({ 
    description: 'Lý do bỏ quan tâm (optional)',
    example: 'Chiến dịch không còn phù hợp với tôi',
    required: false,
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Lý do bỏ quan tâm không được quá 500 ký tự' })
  reason?: string;
}

export class CampaignFollowersQueryDto {
  @ApiProperty({ 
    description: 'Số trang',
    example: 1,
    default: 1,
    minimum: 1,
    required: false
  })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ 
    description: 'Số items per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false
  })
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({ 
    description: 'Sắp xếp theo',
    example: 'followedAt',
    enum: ['followedAt', 'userName'],
    default: 'followedAt',
    required: false
  })
  @IsOptional()
  @IsString()
  sortBy?: 'followedAt' | 'userName' = 'followedAt';

  @ApiProperty({ 
    description: 'Thứ tự sắp xếp',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
