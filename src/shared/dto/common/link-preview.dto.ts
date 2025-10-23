import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class LinkPreviewDto {
  @ApiProperty({ description: 'Link URL' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiPropertyOptional({ description: 'Link title' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Link description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Link thumbnail URL' })
  @IsOptional()
  @IsString()
  @IsUrl()
  thumbnail?: string;

  @ApiPropertyOptional({ description: 'Link domain' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  domain?: string;
}
