# Google OAuth 2 Setup Guide

## Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Cấu hình Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Kích hoạt Google+ API
4. Vào "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Chọn "Web application"
6. Thêm Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Thêm Authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
8. Copy Client ID và thêm vào file `.env`

## API Endpoints

### POST /auth/google

Đăng nhập/đăng ký bằng Google OAuth.

**Request Body:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nonce": "random-nonce-string-123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123...",
  "csrfToken": "def456...",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## Cách sử dụng từ Frontend

### 1. Cài đặt Google Sign-In

```bash
npm install @google-cloud/oauth2
```

### 2. Cấu hình Google Sign-In

```javascript
// Frontend code example
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth({
  clientId: 'your-google-client-id.apps.googleusercontent.com',
});

// Generate nonce
const nonce = crypto.randomBytes(16).toString('hex');

// Sign in with Google
const response = await auth.signIn({
  scopes: ['openid', 'email', 'profile'],
  nonce: nonce,
});

// Send to backend
const backendResponse = await fetch('/api/auth/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: response.credential,
    nonce: nonce,
  }),
});
```

## Bảo mật

1. **Nonce Verification**: Mỗi request phải có nonce để tránh replay attacks
2. **Token Validation**: ID token được verify với Google certificates
3. **Audience Check**: Kiểm tra audience phải khớp với GOOGLE_CLIENT_ID
4. **Issuer Check**: Kiểm tra issuer phải là Google
5. **Email Verification**: Chỉ cho phép email đã được Google verify

## User Mapping

- **User đã tồn tại**: Link Google provider vào account hiện tại
- **User mới**: Tạo account mới với Google provider
- **Email verification**: Tự động set `isVerified = true` cho Google users
