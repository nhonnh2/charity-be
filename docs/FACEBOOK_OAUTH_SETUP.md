# Facebook OAuth Setup Guide

## Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## Cấu hình Facebook Developer Console

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới hoặc chọn app hiện có
3. Thêm "Facebook Login" product
4. Vào "Facebook Login" → "Settings"
5. Thêm Valid OAuth Redirect URIs:
   - `http://localhost:3000/auth/facebook/callback` (development)
   - `https://yourdomain.com/auth/facebook/callback` (production)
6. Vào "App Settings" → "Basic"
7. Copy App ID và App Secret vào file `.env`

## API Endpoints

### POST /auth/oauth/facebook

Đăng nhập/đăng ký bằng Facebook OAuth.

**Request Body:**

```json
{
  "accessToken": "EAABwzLixnjYBO..."
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

### 1. Cài đặt Facebook SDK

```bash
npm install react-facebook-login
# hoặc
npm install @facebook/react-facebook-login
```

### 2. Cấu hình Facebook Login

```javascript
// React component example
import FacebookLogin from 'react-facebook-login';

const responseFacebook = response => {
  console.log(response);
  // Gửi accessToken tới backend
  fetch('/api/auth/oauth/facebook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accessToken: response.accessToken,
    }),
  })
    .then(res => res.json())
    .then(data => {
      // Lưu tokens và redirect
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    });
};

<FacebookLogin
  appId="your-facebook-app-id"
  autoLoad={false}
  fields="name,email,picture"
  callback={responseFacebook}
  icon="fa-facebook"
/>;
```

### 3. Vanilla JavaScript

```javascript
// Load Facebook SDK
window.fbAsyncInit = function () {
  FB.init({
    appId: 'your-facebook-app-id',
    cookie: true,
    xfbml: true,
    version: 'v18.0',
  });
};

// Login function
function loginWithFacebook() {
  FB.login(
    function (response) {
      if (response.authResponse) {
        // Gửi accessToken tới backend
        fetch('/api/auth/oauth/facebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: response.authResponse.accessToken,
          }),
        })
          .then(res => res.json())
          .then(data => {
            // Xử lý response
            console.log('Login successful:', data);
          });
      }
    },
    { scope: 'email,public_profile' },
  );
}
```

## Bảo mật

1. **Token Verification**: Access token được verify với Facebook Graph API
2. **App ID Check**: Kiểm tra app_id phải khớp với FACEBOOK_APP_ID
3. **Token Validity**: Kiểm tra token còn hiệu lực
4. **Email Verification**: Chỉ cho phép email từ Facebook
5. **User Status Validation**: Kiểm tra user status trước khi đăng nhập

## User Mapping

- **User đã tồn tại**: Link Facebook provider vào account hiện tại
- **User mới**: Tạo account mới với Facebook provider
- **Email verification**: Tự động set `isVerified = true` cho Facebook users

## So sánh với Google OAuth

| Feature       | Google OAuth        | Facebook OAuth      |
| ------------- | ------------------- | ------------------- |
| Token Type    | ID Token (JWT)      | Access Token        |
| Verification  | Google Certificates | Facebook Graph API  |
| Nonce Support | ✅                  | ❌                  |
| Token Expiry  | Short-lived         | Configurable        |
| User Info     | From JWT payload    | From Graph API call |

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid access token"**: Kiểm tra FACEBOOK_APP_ID và FACEBOOK_APP_SECRET
2. **"Token expired"**: Refresh token hoặc đăng nhập lại
3. **"Email not provided"**: User chưa cấp quyền email cho app
4. **"App not approved"**: App cần review để sử dụng production

### Debug:

```javascript
// Kiểm tra token với Facebook
FB.api('/me', { fields: 'id,name,email' }, function (response) {
  console.log('Facebook user info:', response);
});
```
