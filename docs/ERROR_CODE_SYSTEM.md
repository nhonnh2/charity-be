# Error Code System

## Tổng quan

Hệ thống error code được thiết kế để đồng bộ giữa server (Backend) và client (Frontend), hỗ trợ multi-language và UX tốt hơn.

### Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Error Messages Mapping (Multi-language)                     │ │
│  │                                                              │ │
│  │ ERROR_MESSAGES: {                                           │ │
│  │   'CAMPAIGN_NOT_FOUND': {                                   │ │
│  │     vi: 'Không tìm thấy chiến dịch.',                       │ │
│  │     en: 'Campaign not found.'                               │ │
│  │   }                                                          │ │
│  │ }                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▲                                   │
│                              │                                   │
│                         error_code                               │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   HTTP Response     │
                    │  {                  │
                    │    error_code: ..., │
                    │    message: ...     │
                    │  }                  │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                         SERVER (Backend)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Error Codes Enum                                            │ │
│  │                                                              │ │
│  │ export enum CampaignErrorCode {                             │ │
│  │   NOT_FOUND = 'CAMPAIGN_NOT_FOUND'                          │ │
│  │ }                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ BusinessException                                           │ │
│  │                                                              │ │
│  │ throw new BusinessException(                                │ │
│  │   CampaignErrorCode.NOT_FOUND,                              │ │
│  │   'Campaign with ID 123 not found', // For dev debugging    │ │
│  │   HttpStatus.NOT_FOUND                                      │ │
│  │ )                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 404,
  "error_code": "CAMPAIGN_NOT_FOUND",
  "message": "Campaign with ID 123 not found in database",
  "timestamp": "2025-10-10T10:30:00.000Z",
  "path": "/api/campaigns/123",
  "method": "GET"
}
```

### Validation Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "error_code": "COMMON_VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    "title must be longer than or equal to 20 characters",
    "targetAmount must be a positive number"
  ],
  "timestamp": "2025-10-10T10:30:00.000Z",
  "path": "/api/campaigns",
  "method": "POST"
}
```

## Error Code Categories

### 1. Common Errors (COMMON_*)
Các lỗi chung cho toàn hệ thống:

| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `COMMON_INTERNAL_SERVER_ERROR` | 500 | Lỗi máy chủ nội bộ |
| `COMMON_VALIDATION_ERROR` | 400 | Lỗi validation dữ liệu |
| `COMMON_UNAUTHORIZED` | 401 | Chưa đăng nhập |
| `COMMON_FORBIDDEN` | 403 | Không có quyền truy cập |
| `COMMON_NOT_FOUND` | 404 | Không tìm thấy tài nguyên |
| `COMMON_BAD_REQUEST` | 400 | Yêu cầu không hợp lệ |
| `COMMON_NETWORK_ERROR` | - | Lỗi kết nối mạng (client-side) |
| `COMMON_TIMEOUT` | 408 | Timeout |

### 2. Campaign Errors (CAMPAIGN_*)

#### 2.1 Creation Errors
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `CAMPAIGN_CREATE_FAILED` | 400/404 | Tạo chiến dịch thất bại |
| `CAMPAIGN_TITLE_REQUIRED` | 400 | Thiếu tiêu đề |
| `CAMPAIGN_TITLE_TOO_SHORT` | 400 | Tiêu đề quá ngắn (< 20 ký tự) |
| `CAMPAIGN_TITLE_TOO_LONG` | 400 | Tiêu đề quá dài (> 200 ký tự) |
| `CAMPAIGN_DESCRIPTION_REQUIRED` | 400 | Thiếu mô tả |
| `CAMPAIGN_DESCRIPTION_TOO_SHORT` | 400 | Mô tả quá ngắn (< 100 ký tự) |
| `CAMPAIGN_CATEGORY_REQUIRED` | 400 | Thiếu danh mục |
| `CAMPAIGN_TARGET_AMOUNT_INVALID` | 400 | Số tiền mục tiêu không hợp lệ |
| `CAMPAIGN_TARGET_AMOUNT_TOO_LOW` | 400 | Số tiền mục tiêu quá thấp |
| `CAMPAIGN_TARGET_AMOUNT_TOO_HIGH` | 400 | Số tiền mục tiêu quá cao |
| `CAMPAIGN_DATE_INVALID` | 400 | Ngày không hợp lệ |
| `CAMPAIGN_END_DATE_BEFORE_START` | 400 | Ngày kết thúc trước ngày bắt đầu |
| `CAMPAIGN_COVER_IMAGE_REQUIRED` | 400 | Thiếu ảnh bìa |

#### 2.2 Emergency Campaign Errors
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `CAMPAIGN_EMERGENCY_REPUTATION_TOO_LOW` | 403 | Uy tín chưa đủ (< 60) |
| `CAMPAIGN_EMERGENCY_AMOUNT_EXCEEDED` | 400 | Vượt giới hạn số tiền |
| `CAMPAIGN_EMERGENCY_MULTIPLE_MILESTONES` | 400 | Chỉ được 1 milestone |
| `CAMPAIGN_EMERGENCY_DOCUMENTS_REQUIRED` | 400 | Thiếu tài liệu chứng minh |

#### 2.3 Milestone Errors
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `CAMPAIGN_MILESTONE_REQUIRED` | 400 | Phải có ít nhất 1 milestone |
| `CAMPAIGN_MILESTONE_TOO_MANY` | 400 | Quá nhiều milestones (> 10) |
| `CAMPAIGN_MILESTONE_BUDGET_MISMATCH` | 400 | Tổng budget ≠ target amount |
| `CAMPAIGN_MILESTONE_TITLE_REQUIRED` | 400 | Thiếu tiêu đề milestone |
| `CAMPAIGN_MILESTONE_DESCRIPTION_REQUIRED` | 400 | Thiếu mô tả milestone |
| `CAMPAIGN_MILESTONE_BUDGET_INVALID` | 400 | Budget milestone không hợp lệ |
| `CAMPAIGN_MILESTONE_DURATION_INVALID` | 400 | Thời gian không hợp lệ |

#### 2.4 Status/Permission Errors
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `CAMPAIGN_NOT_FOUND` | 404 | Không tìm thấy chiến dịch |
| `CAMPAIGN_ALREADY_EXISTS` | 409 | Chiến dịch đã tồn tại |
| `CAMPAIGN_NOT_OWNER` | 403 | Không phải chủ sở hữu |
| `CAMPAIGN_CANNOT_EDIT` | 400 | Không thể chỉnh sửa |
| `CAMPAIGN_CANNOT_DELETE` | 400 | Không thể xóa |
| `CAMPAIGN_ALREADY_PUBLISHED` | 400 | Đã xuất bản |
| `CAMPAIGN_ALREADY_COMPLETED` | 400 | Đã hoàn thành |
| `CAMPAIGN_ALREADY_CANCELLED` | 400 | Đã bị hủy |

### 3. Media Errors (MEDIA_*)
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `MEDIA_UPLOAD_FAILED` | 500 | Upload thất bại |
| `MEDIA_FILE_TOO_LARGE` | 400 | File quá lớn |
| `MEDIA_INVALID_FILE_TYPE` | 400 | Loại file không hợp lệ |
| `MEDIA_NOT_FOUND` | 404 | Không tìm thấy file |
| `MEDIA_UPLOAD_LIMIT_EXCEEDED` | 400 | Vượt giới hạn số lượng |
| `MEDIA_PROCESSING_FAILED` | 500 | Xử lý file thất bại |

### 4. Auth Errors (AUTH_*)
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Thông tin đăng nhập sai |
| `AUTH_USER_NOT_FOUND` | 404 | Không tìm thấy tài khoản |
| `AUTH_USER_ALREADY_EXISTS` | 409 | Tài khoản đã tồn tại |
| `AUTH_EMAIL_ALREADY_EXISTS` | 409 | Email đã được sử dụng |
| `AUTH_WEAK_PASSWORD` | 400 | Mật khẩu quá yếu |
| `AUTH_INVALID_TOKEN` | 401 | Token không hợp lệ |
| `AUTH_SESSION_EXPIRED` | 401 | Phiên đăng nhập hết hạn |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email chưa xác thực |

### 5. User Errors (USER_*)
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `USER_PROFILE_UPDATE_FAILED` | 400 | Cập nhật thông tin thất bại |
| `USER_INSUFFICIENT_REPUTATION` | 403 | Uy tín không đủ |
| `USER_BANNED` | 403 | Tài khoản bị khóa |
| `USER_NOT_VERIFIED` | 403 | Tài khoản chưa xác thực |

### 6. Payment Errors (PAYMENT_*)
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `PAYMENT_FAILED` | 400 | Thanh toán thất bại |
| `PAYMENT_INSUFFICIENT_BALANCE` | 400 | Số dư không đủ |
| `PAYMENT_INVALID_AMOUNT` | 400 | Số tiền không hợp lệ |
| `PAYMENT_TRANSACTION_NOT_FOUND` | 404 | Không tìm thấy giao dịch |
| `PAYMENT_ALREADY_PROCESSED` | 400 | Giao dịch đã xử lý |

### 7. Donation Errors (DONATION_*)
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `DONATION_FAILED` | 400 | Quyên góp thất bại |
| `DONATION_AMOUNT_TOO_LOW` | 400 | Số tiền quá thấp |
| `DONATION_CAMPAIGN_ENDED` | 400 | Chiến dịch đã kết thúc |
| `DONATION_CAMPAIGN_NOT_ACTIVE` | 400 | Chiến dịch chưa kích hoạt |

### 8. Review Errors (REVIEW_*)
| Error Code | HTTP Status | Mô tả |
|-----------|-------------|-------|
| `REVIEW_FEE_PAYMENT_FAILED` | 400 | Thanh toán phí duyệt thất bại |
| `REVIEW_DOCUMENTS_INCOMPLETE` | 400 | Tài liệu chưa đầy đủ |
| `REVIEW_IDENTITY_VERIFICATION_FAILED` | 400 | Xác thực danh tính thất bại |
| `REVIEW_ALREADY_SUBMITTED` | 400 | Đã gửi duyệt trước đó |
| `REVIEW_REJECTED` | 400 | Không được phê duyệt |

## Backend Implementation

### 1. Error Codes Definition
File: `src/shared/enums/error-codes.enum.ts`

```typescript
export enum CampaignErrorCode {
  NOT_FOUND = 'CAMPAIGN_NOT_FOUND',
  CREATE_FAILED = 'CAMPAIGN_CREATE_FAILED',
  // ... other codes
}

export type ErrorCode =
  | CommonErrorCode
  | CampaignErrorCode
  | MediaErrorCode
  | AuthErrorCode
  | UserErrorCode
  | PaymentErrorCode
  | DonationErrorCode
  | ReviewErrorCode;
```

### 2. Business Exception Class
File: `src/core/exceptions/business.exception.ts`

```typescript
export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        error_code: errorCode,
        message,
      },
      status,
    );
  }
}
```

### 3. Usage in Services

```typescript
// campaigns.service.ts
import { BusinessException } from '../../core/exceptions';
import { CampaignErrorCode } from '../../shared/enums';
import { HttpStatus } from '@nestjs/common';

async findOne(id: string): Promise<Campaign> {
  if (!Types.ObjectId.isValid(id)) {
    throw new BusinessException(
      CampaignErrorCode.NOT_FOUND,
      `Invalid campaign ID format: ${id}`,
      HttpStatus.BAD_REQUEST,
    );
  }

  const campaign = await this.campaignModel.findById(id);
  
  if (!campaign) {
    throw new BusinessException(
      CampaignErrorCode.NOT_FOUND,
      `Campaign with ID ${id} not found in database`,
      HttpStatus.NOT_FOUND,
    );
  }

  return campaign;
}
```

### 4. Global Exception Filter
File: `src/core/filters/global-exception.filter.ts`

Filter này tự động:
- Catch tất cả exceptions
- Format response với error_code
- Handle validation errors từ class-validator
- Log errors cho debugging

## Frontend Implementation

### 1. Error Messages Mapping

```typescript
// error-messages.ts
export type ErrorCode = 
  | 'COMMON_INTERNAL_SERVER_ERROR'
  | 'CAMPAIGN_NOT_FOUND'
  | 'AUTH_INVALID_CREDENTIALS'
  // ... all error codes

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  COMMON_INTERNAL_SERVER_ERROR: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
  CAMPAIGN_NOT_FOUND: 'Không tìm thấy chiến dịch.',
  AUTH_INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng.',
  // ... all error messages in Vietnamese
};

// For multi-language support
export const ERROR_MESSAGES_EN: Record<ErrorCode, string> = {
  COMMON_INTERNAL_SERVER_ERROR: 'Internal server error. Please try again.',
  CAMPAIGN_NOT_FOUND: 'Campaign not found.',
  AUTH_INVALID_CREDENTIALS: 'Invalid username or password.',
  // ... all error messages in English
};
```

### 2. Error Handler Utility

```typescript
// error-handler.ts
import { ERROR_MESSAGES, ERROR_MESSAGES_EN, ErrorCode } from './error-messages';

export interface ApiError {
  success: false;
  statusCode: number;
  error_code: ErrorCode;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
  method: string;
}

export function getErrorMessage(
  error: ApiError,
  language: 'vi' | 'en' = 'vi'
): string {
  const messages = language === 'vi' ? ERROR_MESSAGES : ERROR_MESSAGES_EN;
  
  // Return localized message based on error_code
  return messages[error.error_code] || messages.COMMON_INTERNAL_SERVER_ERROR;
}

// Usage in React/Vue
import { toast } from 'react-toastify';

try {
  await createCampaign(data);
} catch (error) {
  const apiError = error.response.data as ApiError;
  const userMessage = getErrorMessage(apiError, 'vi');
  
  // Show user-friendly message
  toast.error(userMessage);
  
  // Log technical message for debugging
  console.error('API Error:', apiError.message);
}
```

### 3. Axios Interceptor Example

```typescript
// api-client.ts
import axios from 'axios';
import { getErrorMessage } from './error-handler';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      const apiError = error.response.data;
      
      // Attach user-friendly message
      error.userMessage = getErrorMessage(apiError);
      
      // Log for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', {
          code: apiError.error_code,
          message: apiError.message,
          path: apiError.path,
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Best Practices

### 1. Error Code Naming Convention
- Prefix theo module: `CAMPAIGN_`, `AUTH_`, `MEDIA_`, etc.
- Uppercase với underscore: `SNAKE_CASE`
- Descriptive: Mô tả rõ ràng lỗi

### 2. Message Guidelines

**Server Message (message field):**
- Chi tiết kỹ thuật cho developer
- Bao gồm IDs, values để debug
- Tiếng Anh
- Ví dụ: `Campaign with ID 123 not found in database`

**Client Message (từ ERROR_MESSAGES):**
- User-friendly
- Ngôn ngữ địa phương (vi/en)
- Không chứa thông tin kỹ thuật
- Gợi ý hành động tiếp theo
- Ví dụ: `Không tìm thấy chiến dịch.`

### 3. Adding New Error Codes

**Bước 1:** Thêm vào Backend enum
```typescript
// src/shared/enums/error-codes.enum.ts
export enum CampaignErrorCode {
  // ... existing codes
  NEW_ERROR_CODE = 'CAMPAIGN_NEW_ERROR_CODE',
}
```

**Bước 2:** Sử dụng trong service
```typescript
throw new BusinessException(
  CampaignErrorCode.NEW_ERROR_CODE,
  'Detailed technical message for developers',
  HttpStatus.BAD_REQUEST,
);
```

**Bước 3:** Thêm message vào Frontend
```typescript
// Frontend error-messages.ts
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // ... existing messages
  CAMPAIGN_NEW_ERROR_CODE: 'User-friendly message in Vietnamese',
};
```

### 4. Testing

```typescript
// campaigns.service.spec.ts
describe('CampaignsService', () => {
  it('should throw CAMPAIGN_NOT_FOUND when campaign does not exist', async () => {
    try {
      await service.findOne('invalid-id');
      fail('Should have thrown exception');
    } catch (error) {
      expect(error).toBeInstanceOf(BusinessException);
      expect(error.getErrorCode()).toBe(CampaignErrorCode.NOT_FOUND);
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    }
  });
});
```

## Migration Guide

### Từ old error handling sang error code system:

**Before:**
```typescript
throw new NotFoundException('Không tìm thấy chiến dịch');
```

**After:**
```typescript
throw new BusinessException(
  CampaignErrorCode.NOT_FOUND,
  `Campaign with ID ${id} not found in database`,
  HttpStatus.NOT_FOUND,
);
```

## Error Code Sync Checklist

Khi thêm error code mới, đảm bảo:
- [ ] Thêm vào Backend enum (`error-codes.enum.ts`)
- [ ] Sử dụng trong service với `BusinessException`
- [ ] Thêm message vào Frontend (`ERROR_MESSAGES`)
- [ ] Thêm message tiếng Anh (nếu support multi-language)
- [ ] Update documentation
- [ ] Test error handling

## Troubleshooting

### Frontend hiển thị error không đúng?
1. Check `error_code` trong response có đúng format không
2. Verify `ERROR_MESSAGES` có chứa error code đó không
3. Check fallback logic khi error code không tồn tại

### Backend không throw đúng error code?
1. Verify service import đúng `BusinessException` và error code enum
2. Check Global Exception Filter có hoạt động không
3. Xem logs để debug error flow

### Error code mismatch giữa frontend/backend?
1. Sync lại error codes từ backend sang frontend
2. Có thể export error codes từ backend ra file JSON để frontend import
3. Consider tự động hóa sync process

## Future Enhancements

1. **Auto-sync Error Codes**: Script để sync error codes từ backend sang frontend
2. **Error Analytics**: Track error rates by error code
3. **Error Recovery**: Suggest actions based on error code
4. **i18n Integration**: Tích hợp với i18n libraries
5. **Error Code Documentation Generator**: Auto-generate docs từ enums

