import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    return next.handle().pipe(
      map((data) => {
        // Determine appropriate message based on HTTP method and status code
        const message = this.getSuccessMessage(request.method, response.statusCode);
        
        return {
          data,
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