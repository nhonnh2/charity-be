# Refresh Token System

## Tổng Quan

Hệ thống refresh token đã được implement để cải thiện bảo mật và trải nghiệm người dùng. Thay vì sử dụng access token có thời hạn dài (24h), giờ đây chúng ta sử dụng:

- **Access Token**: Thời hạn ngắn (15 phút) cho API calls
- **Refresh Token**: Thời hạn dài (7 ngày) để renew access token

## Cấu Trúc

### User Entity Updates

```typescript
// Thêm vào User entity
@Prop({ required: false })
refreshToken?: string;

@Prop({ required: false })
refreshTokenExpiresAt?: Date;
```

### Auth Response

```typescript
export class AuthResponseDto {
  accessToken: string; // JWT token (15 phút)
  refreshToken: string; // Random token (7 ngày)
  user: UserInfo;
}
```

## API Endpoints

### 1. Register

```
POST /auth/register
```

**Response**: Trả về cả access token và refresh token

### 2. Login

```
POST /auth/login
```

**Response**: Trả về cả access token và refresh token

### 3. Refresh Token

```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**Response**: Trả về access token và refresh token mới (token rotation)

### 4. Logout

```
POST /auth/logout
Authorization: Bearer your-access-token
```

**Response**: Vô hiệu hóa refresh token

### 5. Profile

```
GET /auth/profile
Authorization: Bearer your-access-token
```

**Response**: Thông tin user hiện tại

## Bảo Mật

### Token Rotation

- Mỗi lần refresh, cả access token và refresh token đều được tạo mới
- Refresh token cũ bị vô hiệu hóa ngay lập tức

### Token Storage

- Refresh token được lưu trong database với thời hạn 7 ngày
- Access token không được lưu trữ, chỉ được validate qua JWT

### Validation

- Refresh token được kiểm tra tính hợp lệ và thời hạn
- User status được kiểm tra trước khi tạo token mới

## Workflow

1. **Login/Register**: User nhận được access token (15 phút) và refresh token (7 ngày)
2. **API Calls**: Sử dụng access token cho các API calls
3. **Token Expired**: Khi access token hết hạn, sử dụng refresh token để lấy token mới
4. **Token Rotation**: Mỗi lần refresh, nhận được cả access token và refresh token mới
5. **Logout**: Refresh token bị vô hiệu hóa

## Lợi Ích

1. **Bảo mật cao hơn**: Access token có thời hạn ngắn, giảm rủi ro nếu bị lộ
2. **Trải nghiệm tốt**: User không cần đăng nhập lại thường xuyên
3. **Token rotation**: Refresh token được thay đổi mỗi lần sử dụng
4. **Logout an toàn**: Có thể vô hiệu hóa token từ xa

## Testing

Sử dụng file `test-refresh-token.http` để test các scenarios:

- Register/Login
- Refresh token
- Profile access
- Logout
- Invalid refresh token

## Environment Variables

```env
JWT_SECRET=your-secret-key
```

## Lưu Ý

- Refresh token được tạo bằng crypto.randomBytes(64) để đảm bảo tính ngẫu nhiên
- Access token sử dụng JWT với payload chứa user info
- Tất cả token operations đều được log và validate
