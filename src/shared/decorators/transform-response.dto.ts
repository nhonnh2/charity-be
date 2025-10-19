import { SetMetadata } from '@nestjs/common';
import { RESPONSE_DTO_KEY } from '../../core/interceptors/transform.interceptor';

/**
 * Decorator để chỉ định DTO class cho response transformation
 * Được sử dụng cùng với TransformInterceptor để tự động transform response
 * theo DTO class đã chỉ định
 * 
 * @param dtoClass - Class của DTO để transform response
 * 
 * @example
 * ```typescript
 * @Get()
 * @TransformResponseDTO(CampaignDetailResponseDto)
 * async findOne(@Param('id') id: string) {
 *   return this.campaignsService.findOne(id);
 * }
 * ```
 */
export function TransformResponseDTO<T>(dtoClass: new () => T) {
  return SetMetadata(RESPONSE_DTO_KEY, dtoClass);
}
