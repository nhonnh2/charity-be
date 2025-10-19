import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Reflector } from '@nestjs/core';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

// Metadata key for DTO class
export const RESPONSE_DTO_KEY = 'responseDTO';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    // Get DTO class from metadata
    const dtoClass = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_DTO_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        // Transform data if DTO class is specified
        let transformedData = data;
        if (dtoClass && data) {
          if (Array.isArray(data)) {
            // Handle array of items
            transformedData = data.map(item => 
              plainToInstance(dtoClass, item, { 
                excludeExtraneousValues: true,
                enableImplicitConversion: true 
              })
            );
          } else if (data.items && Array.isArray(data.items)) {
            // Handle pagination response with items array
            transformedData = {
              ...data,
              items: data.items.map(item => 
                plainToInstance(dtoClass, item, { 
                  excludeExtraneousValues: true,
                  enableImplicitConversion: true 
                })
              )
            };
          } else {
            // Handle single object
            transformedData = plainToInstance(dtoClass, data, { 
              excludeExtraneousValues: true,
              enableImplicitConversion: true 
            });
          }
        }

        // Determine appropriate message based on HTTP method and status code
        const message = this.getSuccessMessage(request.method, response.statusCode);
        
        return {
          data: transformedData,
          statusCode: response.statusCode,
          message,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private getSuccessMessage(method: string, statusCode: number): string {
    switch (method) {
      case 'POST':
        switch (statusCode) {
          case 201:
            return 'Tạo thành công';
          default:
            return 'Thành công';
        }
      case 'PUT':
      case 'PATCH':
        return 'Cập nhật thành công';
      case 'DELETE':
        return 'Xóa thành công';
      case 'GET':
      default:
        return 'Lấy dữ liệu thành công';
    }
  }
} 