import { Transform } from 'class-transformer';
import { plainToClass } from 'class-transformer';

export function TransformResponseDTO<T>(dtoClass: new () => T) {
  return Transform(({ value }) => {
    if (!value) return value;
    
    // Nếu là array (pagination)
    if (Array.isArray(value)) {
      return value.map(item => plainToClass(dtoClass, item, { excludeExtraneousValues: true }));
    }
    
    // Nếu là single object
    return plainToClass(dtoClass, value, { excludeExtraneousValues: true });
  });
}
