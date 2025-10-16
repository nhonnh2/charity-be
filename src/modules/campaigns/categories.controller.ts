import { Controller, Get } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiProperty,
  ApiPropertyOptional
} from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TransformResponseDTO } from '../../shared/decorators';
import { CampaignCategory, CATEGORY_METADATA } from '../../shared/enums';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category keyword',
    example: 'education'
  })
  @Expose()
  keyword: string;

  @ApiProperty({
    description: 'Display name',
    example: 'Giáo dục'
  })
  @Expose()
  displayName: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Các chiến dịch liên quan đến giáo dục và học tập'
  })
  @Expose()
  description: string;

  @ApiPropertyOptional({
    description: 'Category icon',
    example: 'school'
  })
  @Expose()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Category color',
    example: '#4CAF50'
  })
  @Expose()
  color?: string;
}

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  @Get()
  @ApiOperation({ 
    summary: 'Lấy danh sách categories',
    description: 'Lấy danh sách các danh mục chiến dịch có sẵn trong hệ thống với keyword và metadata'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Danh sách categories với metadata',
    type: [CategoryResponseDto]
  })
  @TransformResponseDTO(CategoryResponseDto)
  async getCategories(): Promise<CategoryResponseDto[]> {
    // Return all categories with metadata for client localization
    const categories = Object.values(CampaignCategory).map(keyword => 
      CATEGORY_METADATA[keyword]
    );

    return categories;
  }
}
