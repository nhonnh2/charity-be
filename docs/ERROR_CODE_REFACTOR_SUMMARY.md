# Error Code Refactor Summary

## 🎯 Mục tiêu

1. **Tách error codes chung chung** thành các error codes cụ thể cho từng trường hợp
2. **Xóa error codes dư thừa** (validation nên xử lý bởi DTO/class-validator)
3. **Giữ lại chỉ business logic errors** mà client cần hiển thị message khác nhau

---

## 📊 Thống kê thay đổi

| Category     | Before | After  | Removed           | Added  |
| ------------ | ------ | ------ | ----------------- | ------ |
| **Common**   | 8      | 7      | 1 (NETWORK_ERROR) | 0      |
| **Campaign** | 26     | 14     | 17                | 5      |
| **Media**    | 6      | 6      | 0                 | 0      |
| **Auth**     | 8      | 4      | 5                 | 1      |
| **User**     | 4      | 3      | 1                 | 0      |
| **Payment**  | 5      | 5      | 0                 | 0      |
| **Donation** | 4      | 4      | 0                 | 0      |
| **Review**   | 5      | 4      | 1                 | 0      |
| **TOTAL**    | **66** | **47** | **-25**           | **+6** |

**Net reduction: 19 error codes (-29%)**

---

## ✅ Campaign Errors - Chi tiết thay đổi

### ❌ XÓA (17 codes - validation đơn giản)

**Field Validation (nên xử lý bởi class-validator):**

- `CAMPAIGN_TITLE_REQUIRED`
- `CAMPAIGN_TITLE_TOO_SHORT`
- `CAMPAIGN_TITLE_TOO_LONG`
- `CAMPAIGN_DESCRIPTION_REQUIRED`
- `CAMPAIGN_DESCRIPTION_TOO_SHORT`
- `CAMPAIGN_CATEGORY_REQUIRED`
- `CAMPAIGN_TARGET_AMOUNT_INVALID`
- `CAMPAIGN_TARGET_AMOUNT_TOO_LOW`
- `CAMPAIGN_TARGET_AMOUNT_TOO_HIGH`
- `CAMPAIGN_DATE_INVALID`
- `CAMPAIGN_COVER_IMAGE_REQUIRED`

**Milestone Validation (nên xử lý bởi class-validator):**

- `CAMPAIGN_MILESTONE_REQUIRED`
- `CAMPAIGN_MILESTONE_TOO_MANY`
- `CAMPAIGN_MILESTONE_TITLE_REQUIRED`
- `CAMPAIGN_MILESTONE_DESCRIPTION_REQUIRED`
- `CAMPAIGN_MILESTONE_BUDGET_INVALID`

**Status (chưa implement, có thể dùng sau):**

- `CAMPAIGN_ALREADY_EXISTS`
- `CAMPAIGN_ALREADY_PUBLISHED`
- `CAMPAIGN_ALREADY_COMPLETED`
- `CAMPAIGN_ALREADY_CANCELLED`

**Emergency (chưa implement):**

- `CAMPAIGN_EMERGENCY_AMOUNT_EXCEEDED`
- `CAMPAIGN_EMERGENCY_DOCUMENTS_REQUIRED`

### ➕ THÊM MỚI (5 codes - tách từ chung chung)

```typescript
// Before: CAMPAIGN_CREATE_FAILED dùng cho 4 trường hợp khác nhau ❌
// After: Tách thành 4 error codes riêng ✅

CREATOR_NOT_FOUND = 'CAMPAIGN_CREATOR_NOT_FOUND';
// Dùng khi: Không tìm thấy user tạo campaign
// Message: "Không tìm thấy thông tin người tạo chiến dịch"

REVIEWER_NOT_FOUND = 'CAMPAIGN_REVIEWER_NOT_FOUND';
// Dùng khi: Không tìm thấy reviewer để approve/reject
// Message: "Không tìm thấy thông tin người duyệt"

ACTIVE_LIMIT_EXCEEDED = 'CAMPAIGN_ACTIVE_LIMIT_EXCEEDED';
// Dùng khi: Đã đạt giới hạn chiến dịch đang hoạt động
// Message: "Bạn đã đạt giới hạn {max} chiến dịch đang hoạt động"

HAS_DONATIONS = 'CAMPAIGN_HAS_DONATIONS';
// Dùng khi: Không thể xóa campaign có donation
// Message: "Không thể xóa chiến dịch đã có quyên góp"

INVALID_STATUS_TRANSITION = 'CAMPAIGN_INVALID_STATUS_TRANSITION';
// Dùng khi: Chuyển status không hợp lệ
// Message: "Không thể thay đổi trạng thái chiến dịch"
```

### ✏️ GIỮ LẠI (9 codes - business logic quan trọng)

```typescript
NOT_FOUND = 'CAMPAIGN_NOT_FOUND';
NOT_OWNER = 'CAMPAIGN_NOT_OWNER';
CANNOT_EDIT = 'CAMPAIGN_CANNOT_EDIT';
CANNOT_DELETE = 'CAMPAIGN_CANNOT_DELETE';
EMERGENCY_REPUTATION_TOO_LOW = 'CAMPAIGN_EMERGENCY_REPUTATION_TOO_LOW';
EMERGENCY_MULTIPLE_MILESTONES = 'CAMPAIGN_EMERGENCY_MULTIPLE_MILESTONES';
MILESTONE_BUDGET_MISMATCH = 'CAMPAIGN_MILESTONE_BUDGET_MISMATCH';
MILESTONE_DURATION_INVALID = 'CAMPAIGN_MILESTONE_DURATION_INVALID';
END_DATE_BEFORE_START = 'CAMPAIGN_END_DATE_BEFORE_START';
```

---

## ✅ Auth Errors - Chi tiết thay đổi

### ❌ XÓA (5 codes)

```typescript
// Duplicate hoặc chưa dùng
USER_NOT_FOUND; // Duplicate với INVALID_CREDENTIALS
USER_ALREADY_EXISTS; // Duplicate với EMAIL_ALREADY_EXISTS
WEAK_PASSWORD; // Validation nên xử lý bởi DTO
SESSION_EXPIRED; // Có thể merge với INVALID_TOKEN
EMAIL_NOT_VERIFIED; // Chưa implement email verification
```

### ➕ THÊM MỚI (1 code)

```typescript
OAUTH_FAILED = 'AUTH_OAUTH_FAILED';
// Dùng khi: Google/Facebook OAuth thất bại
// Message: "Đăng nhập bằng {provider} thất bại. Vui lòng thử lại"
```

### ✏️ GIỮ LẠI (3 codes)

```typescript
INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS';
EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS';
INVALID_TOKEN = 'AUTH_INVALID_TOKEN';
```

---

## ✅ User Errors - Chi tiết thay đổi

### ❌ XÓA (1 code)

```typescript
PROFILE_UPDATE_FAILED; // Quá chung chung, dùng validation hoặc error cụ thể hơn
```

### ➕ THÊM MỚI

```typescript
NOT_FOUND = 'USER_NOT_FOUND';
// Dùng khi: Không tìm thấy user trong các trường hợp cụ thể
// Message: "Không tìm thấy người dùng"
```

### ✏️ GIỮ LẠI (2 codes)

```typescript
BANNED = 'USER_BANNED';
INSUFFICIENT_REPUTATION = 'USER_INSUFFICIENT_REPUTATION';
```

---

## ✅ Common Errors - Chi tiết thay đổi

### ❌ XÓA (1 code)

```typescript
NETWORK_ERROR; // Client-side error, không cần server trả về
```

---

## 📝 Code Changes - Các thay đổi trong code

### 1. campaigns.service.ts

#### Before → After

```typescript
// ❌ BEFORE: Dùng CREATE_FAILED cho creator not found
throw new BusinessException(
  CampaignErrorCode.CREATE_FAILED,
  `Creator with ID ${userId} not found`,
  HttpStatus.NOT_FOUND,
);

// ✅ AFTER: Error code cụ thể
throw new BusinessException(
  CampaignErrorCode.CREATOR_NOT_FOUND,
  `Creator with ID ${userId} not found in database`,
  HttpStatus.NOT_FOUND,
);
```

```typescript
// ❌ BEFORE: Dùng CREATE_FAILED cho campaign limit
throw new BusinessException(
  CampaignErrorCode.CREATE_FAILED,
  `User has reached maximum of ${maxActiveCampaigns} active campaigns`,
  HttpStatus.FORBIDDEN,
);

// ✅ AFTER: Error code cụ thể với thêm thông tin reputation
throw new BusinessException(
  CampaignErrorCode.ACTIVE_LIMIT_EXCEEDED,
  `User has reached maximum of ${maxActiveCampaigns} active campaigns. Current active: ${activeCampaignsCount}. User reputation: ${creator.reputation}`,
  HttpStatus.FORBIDDEN,
);
```

```typescript
// ❌ BEFORE: Dùng CREATE_FAILED cho reviewer not found
throw new BusinessException(
  CampaignErrorCode.CREATE_FAILED,
  `Reviewer with ID ${reviewerId} not found`,
  HttpStatus.NOT_FOUND,
);

// ✅ AFTER: Error code cụ thể
throw new BusinessException(
  CampaignErrorCode.REVIEWER_NOT_FOUND,
  `Reviewer with ID ${reviewerId} not found in database`,
  HttpStatus.NOT_FOUND,
);
```

```typescript
// ❌ BEFORE: Dùng CANNOT_DELETE cho campaign có donation
throw new BusinessException(
  CampaignErrorCode.CANNOT_DELETE,
  `Cannot delete campaign with donations`,
  HttpStatus.BAD_REQUEST,
);

// ✅ AFTER: Error code cụ thể hơn
throw new BusinessException(
  CampaignErrorCode.HAS_DONATIONS,
  `Cannot delete campaign ${id} with existing donations (amount: ${campaign.currentAmount})`,
  HttpStatus.BAD_REQUEST,
);
```

### 2. auth.service.ts

```typescript
// ❌ BEFORE: Dùng INVALID_CREDENTIALS cho OAuth failed
throw new BusinessException(
  AuthErrorCode.INVALID_CREDENTIALS,
  `Google OAuth authentication failed`,
  HttpStatus.UNAUTHORIZED,
);

// ✅ AFTER: Error code riêng cho OAuth
throw new BusinessException(
  AuthErrorCode.OAUTH_FAILED,
  `Google OAuth authentication failed: ${error.message}`,
  HttpStatus.UNAUTHORIZED,
);
```

---

## 🎨 Client Implementation Example

### Error Messages Mapping (Updated)

```typescript
// error-messages.ts
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Common
  COMMON_INTERNAL_SERVER_ERROR: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
  COMMON_VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  COMMON_UNAUTHORIZED: 'Bạn cần đăng nhập để thực hiện thao tác này.',
  COMMON_FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  COMMON_NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  COMMON_BAD_REQUEST: 'Yêu cầu không hợp lệ.',
  COMMON_TIMEOUT: 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.',

  // Campaign - Cleaner and more specific!
  CAMPAIGN_NOT_FOUND: 'Không tìm thấy chiến dịch.',
  CAMPAIGN_NOT_OWNER: 'Bạn không phải là chủ sở hữu chiến dịch này.',
  CAMPAIGN_CANNOT_EDIT: 'Không thể chỉnh sửa chiến dịch này.',
  CAMPAIGN_CANNOT_DELETE: 'Không thể xóa chiến dịch này.',
  CAMPAIGN_INVALID_STATUS_TRANSITION:
    'Không thể thay đổi trạng thái chiến dịch.',

  // NEW: Specific errors
  CAMPAIGN_CREATOR_NOT_FOUND: 'Không tìm thấy thông tin người tạo chiến dịch.',
  CAMPAIGN_REVIEWER_NOT_FOUND: 'Không tìm thấy thông tin người duyệt.',
  CAMPAIGN_ACTIVE_LIMIT_EXCEEDED:
    'Bạn đã đạt giới hạn chiến dịch đang hoạt động. Hãy hoàn thành các chiến dịch hiện tại trước khi tạo mới.',
  CAMPAIGN_HAS_DONATIONS: 'Không thể xóa chiến dịch đã có quyên góp.',

  CAMPAIGN_EMERGENCY_REPUTATION_TOO_LOW:
    'Uy tín của bạn chưa đủ để tạo chiến dịch khẩn cấp. Cần tối thiểu 60 điểm.',
  CAMPAIGN_EMERGENCY_MULTIPLE_MILESTONES:
    'Chiến dịch khẩn cấp chỉ được có 1 giai đoạn.',
  CAMPAIGN_MILESTONE_BUDGET_MISMATCH:
    'Tổng ngân sách các giai đoạn phải bằng mục tiêu quyên góp.',
  CAMPAIGN_MILESTONE_DURATION_INVALID:
    'Thời gian thực hiện giai đoạn không hợp lệ.',
  CAMPAIGN_END_DATE_BEFORE_START: 'Ngày kết thúc phải sau ngày bắt đầu.',

  // Media
  MEDIA_NOT_FOUND: 'Không tìm thấy file.',
  MEDIA_UPLOAD_FAILED: 'Không thể tải lên file. Vui lòng thử lại.',
  MEDIA_FILE_TOO_LARGE: 'Kích thước file vượt quá giới hạn cho phép.',
  MEDIA_INVALID_FILE_TYPE: 'Loại file không được hỗ trợ.',
  MEDIA_PROCESSING_FAILED: 'Xử lý file thất bại.',
  MEDIA_UPLOAD_LIMIT_EXCEEDED: 'Vượt quá số lượng file cho phép tải lên.',

  // Auth - Cleaner!
  AUTH_INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng.',
  AUTH_EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng.',
  AUTH_INVALID_TOKEN: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  AUTH_OAUTH_FAILED: 'Đăng nhập thất bại. Vui lòng thử lại.',

  // User
  USER_NOT_FOUND: 'Không tìm thấy người dùng.',
  USER_BANNED: 'Tài khoản của bạn đã bị khóa.',
  USER_INSUFFICIENT_REPUTATION:
    'Uy tín của bạn chưa đủ để thực hiện thao tác này.',

  // Payment
  PAYMENT_FAILED: 'Thanh toán thất bại. Vui lòng thử lại.',
  PAYMENT_INSUFFICIENT_BALANCE: 'Số dư không đủ để thực hiện giao dịch.',
  PAYMENT_INVALID_AMOUNT: 'Số tiền thanh toán không hợp lệ.',
  PAYMENT_TRANSACTION_NOT_FOUND: 'Không tìm thấy giao dịch.',
  PAYMENT_ALREADY_PROCESSED: 'Giao dịch đã được xử lý trước đó.',

  // Donation
  DONATION_FAILED: 'Không thể thực hiện quyên góp. Vui lòng thử lại.',
  DONATION_AMOUNT_TOO_LOW: 'Số tiền quyên góp quá thấp.',
  DONATION_CAMPAIGN_ENDED: 'Chiến dịch đã kết thúc, không thể quyên góp.',
  DONATION_CAMPAIGN_NOT_ACTIVE: 'Chiến dịch chưa sẵn sàng để nhận quyên góp.',

  // Review
  REVIEW_ALREADY_SUBMITTED: 'Chiến dịch đã được gửi duyệt trước đó.',
  REVIEW_DOCUMENTS_INCOMPLETE: 'Tài liệu xác minh chưa đầy đủ.',
  REVIEW_IDENTITY_VERIFICATION_FAILED: 'Xác thực danh tính thất bại.',
  REVIEW_FEE_PAYMENT_FAILED: 'Không thể thanh toán phí duyệt.',
};
```

### Enhanced Error Display with Additional Context

```typescript
// For CAMPAIGN_ACTIVE_LIMIT_EXCEEDED, you can extract info from server message
const displayCampaignLimitError = (error: ApiError) => {
  const baseMessage = ERROR_MESSAGES[error.error_code];

  // Parse additional info from technical message if needed
  // "User has reached maximum of 2 active campaigns. Current active: 2. User reputation: 45"

  // Could show additional help based on reputation
  const helpText = error.message.includes('reputation: 45')
    ? '\n\n💡 Tip: Nâng uy tín lên 60+ để tạo được 3 chiến dịch, hoặc 80+ để tạo được 5 chiến dịch.'
    : '';

  toast.error(baseMessage + helpText);
};
```

---

## 🎯 Benefits of This Refactor

### 1. **Clearer Client Messages**

- Client có thể hiển thị message cụ thể cho từng lỗi
- Không còn message chung chung "Tạo chiến dịch thất bại"

### 2. **Easier Debugging**

- Developer message vẫn chi tiết cho debugging
- Error code giúp track lỗi dễ hơn

### 3. **Better UX**

```
❌ Before: "Tạo chiến dịch thất bại"
   → User không biết lỗi gì

✅ After: "Bạn đã đạt giới hạn 2 chiến dịch đang hoạt động.
          Hãy hoàn thành các chiến dịch hiện tại trước khi tạo mới."
   → User biết chính xác vấn đề và cách giải quyết
```

### 4. **Cleaner Codebase**

- Giảm 29% số lượng error codes (66 → 47)
- Mỗi error code có mục đích rõ ràng
- Validation đơn giản được xử lý bởi DTO

### 5. **Future-proof**

- Dễ thêm error code mới khi cần
- Convention rõ ràng: Business logic errors only
- Không bị bloat với validation errors

---

## 🔄 Migration Checklist

### Backend

- [x] Update error codes enum
- [x] Update campaigns.service.ts
- [x] Update auth.service.ts
- [x] Media service đã OK (không cần thay đổi)
- [ ] Update documentation
- [ ] Update tests

### Frontend

- [ ] Update ERROR_MESSAGES mapping
- [ ] Remove unused error codes
- [ ] Add new error codes:
  - `CAMPAIGN_CREATOR_NOT_FOUND`
  - `CAMPAIGN_REVIEWER_NOT_FOUND`
  - `CAMPAIGN_ACTIVE_LIMIT_EXCEEDED`
  - `CAMPAIGN_HAS_DONATIONS`
  - `CAMPAIGN_INVALID_STATUS_TRANSITION`
  - `AUTH_OAUTH_FAILED`
  - `USER_NOT_FOUND`
- [ ] Test error displays

---

## 📚 Related Documentation

- [ERROR_CODE_SYSTEM.md](./ERROR_CODE_SYSTEM.md) - Complete error code system guide
- [CAMPAIGNS_MODULE.md](./CAMPAIGNS_MODULE.md) - Campaign module documentation

---

**Last Updated:** 2025-10-10
**Version:** 2.0 (Refactored)
