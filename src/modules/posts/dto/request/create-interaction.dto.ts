import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsArray,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ 
    description: 'Comment content',
    example: 'This is a great campaign! Keep up the good work!',
    maxLength: 1000
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({ 
    description: 'Parent comment ID for replies',
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  parentCommentId?: string;

  @ApiPropertyOptional({ 
    description: 'User mentions in the comment',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}

export class CreateShareDto {
  @ApiPropertyOptional({ 
    description: 'Share text',
    example: 'Check out this amazing campaign!',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shareText?: string;

  @ApiProperty({ 
    description: 'Share type',
    enum: ['repost', 'quote'],
    example: 'quote'
  })
  @IsEnum(['repost', 'quote'])
  shareType: 'repost' | 'quote';
}

