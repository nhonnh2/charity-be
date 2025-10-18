# 🎯 Campaign Follow API - API Quan Tâm Chiến Dịch

## 📋 Tổng quan

API này cho phép người dùng quan tâm (follow) và bỏ quan tâm (unfollow) các chiến dịch từ thiện. Hệ thống sẽ tự động cập nhật số lượng người quan tâm cho mỗi chiến dịch.

## 🏗️ Cấu trúc Database

### CampaignFollow Entity

```typescript
interface CampaignFollow {
  _id: ObjectId;
  campaignId: ObjectId; // Reference to Campaign
  userId: ObjectId; // Reference to User
  userName: string; // Denormalized for performance
  campaignTitle: string; // Denormalized for performance
  isFollowing: boolean; // Soft delete flag
  followedAt: Date; // When user started following
  createdAt: Date;
  updatedAt: Date;
}
```

### Campaign Entity Updates

```typescript
interface Campaign {
  // ... existing fields ...
  followersCount: number; // Số người quan tâm/follow chiến dịch
}
```

## 🔗 API Endpoints

### 1. **POST /campaigns/:id/follow** - Follow Chiến Dịch

**Authentication:** Required (JWT Bearer Token)

**Description:** Người dùng quan tâm theo dõi một chiến dịch

**Request Body:**

```json
{
  "reason": "Tôi muốn theo dõi tiến độ của chiến dịch này" // Optional
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Follow chiến dịch thành công",
  "data": {
    "campaignId": "64f8b9c123456789abcdef01",
    "campaignTitle": "Hỗ trợ học bổng cho trẻ em vùng sâu",
    "userId": "64f8b9c123456789abcdef02",
    "userName": "Nguyễn Văn A",
    "followedAt": "2024-01-15T10:00:00Z",
    "followersCount": 126,
    "isFollowing": true
  }
}
```

**Error Responses:**

- `400`: User đã follow chiến dịch này rồi
- `404`: Không tìm thấy chiến dịch hoặc người dùng

### 2. **DELETE /campaigns/:id/follow** - Unfollow Chiến Dịch

**Authentication:** Required (JWT Bearer Token)

**Description:** Người dùng bỏ quan tâm theo dõi một chiến dịch

**Request Body:**

```json
{
  "reason": "Chiến dịch không còn phù hợp với tôi" // Optional
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Unfollow chiến dịch thành công",
  "data": {
    "campaignId": "64f8b9c123456789abcdef01",
    "campaignTitle": "Hỗ trợ học bổng cho trẻ em vùng sâu",
    "userId": "64f8b9c123456789abcdef02",
    "userName": "Nguyễn Văn A",
    "followedAt": "2024-01-15T10:00:00Z",
    "followersCount": 125,
    "isFollowing": false
  }
}
```

**Error Responses:**

- `400`: User chưa follow chiến dịch này
- `404`: Không tìm thấy chiến dịch hoặc người dùng

### 3. **GET /campaigns/:id/followers** - Lấy Danh Sách Followers

**Authentication:** Not Required

**Description:** Lấy danh sách những người đã follow/quan tâm chiến dịch

**Query Parameters:**

- `page`: Số trang (default: 1)
- `limit`: Số items per page (default: 20, max: 100)
- `sortBy`: Sắp xếp theo `followedAt` hoặc `userName` (default: `followedAt`)
- `sortOrder`: Thứ tự sắp xếp `asc` hoặc `desc` (default: `desc`)

**Response:**

```json
{
  "statusCode": 200,
  "message": "Lấy danh sách followers thành công",
  "data": [
    {
      "campaignId": "64f8b9c123456789abcdef01",
      "userId": "64f8b9c123456789abcdef02",
      "userName": "Nguyễn Văn A",
      "campaignTitle": "Hỗ trợ học bổng cho trẻ em vùng sâu",
      "followedAt": "2024-01-15T10:00:00Z",
      "isFollowing": true
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 4. **GET /campaigns/my-followed** - Lấy Chiến Dịch Đã Quan Tâm

**Authentication:** Required (JWT Bearer Token)

**Description:** Lấy danh sách các chiến dịch mà người dùng đã follow/quan tâm

**Query Parameters:** (Same as followers endpoint)

**Response:**

```json
{
  "statusCode": 200,
  "message": "Lấy danh sách chiến dịch đã quan tâm thành công",
  "data": [
    {
      "campaignId": "64f8b9c123456789abcdef01",
      "userId": "64f8b9c123456789abcdef02",
      "userName": "Nguyễn Văn A",
      "campaignTitle": "Hỗ trợ học bổng cho trẻ em vùng sâu",
      "followedAt": "2024-01-15T10:00:00Z",
      "isFollowing": true
    }
  ],
  "pagination": {
    "current": 1,
    "pageSize": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### 5. **GET /campaigns/:id/follow-status** - Kiểm Tra Trạng Thái Follow

**Authentication:** Required (JWT Bearer Token)

**Description:** Kiểm tra xem người dùng có đang follow chiến dịch này không

**Response:**

```json
{
  "statusCode": 200,
  "message": "Kiểm tra trạng thái follow thành công",
  "data": {
    "isFollowing": true,
    "followedAt": "2024-01-15T10:00:00Z"
  }
}
```

## 🔧 Business Logic

### Follow/Unfollow Rules

1. **Unique Constraint**: Mỗi user chỉ có thể follow một campaign một lần
2. **Soft Delete**: Khi unfollow, record được đánh dấu `isFollowing: false` thay vì xóa
3. **Auto Count Update**: `followersCount` trong Campaign được tự động cập nhật
4. **Denormalized Data**: Lưu `userName` và `campaignTitle` để tránh populate

### Performance Optimizations

1. **Compound Index**: `{ campaignId: 1, userId: 1 }` với unique constraint
2. **Denormalization**: Lưu tên user và campaign để tránh join
3. **Pagination**: Tất cả list endpoints đều có pagination
4. **Soft Delete**: Sử dụng `isFollowing` flag thay vì hard delete

## 📊 Database Indexes

```javascript
// MongoDB indexes for performance
db.campaignfollows.createIndex({ campaignId: 1, userId: 1 }, { unique: true });
db.campaignfollows.createIndex({ campaignId: 1, isFollowing: 1 });
db.campaignfollows.createIndex({ userId: 1, isFollowing: 1 });
db.campaignfollows.createIndex({ followedAt: -1 });
```

## 🚀 Usage Examples

### Frontend Integration

```typescript
// Follow a campaign
const followCampaign = async (campaignId: string) => {
  const response = await fetch(`/api/campaigns/${campaignId}/follow`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: 'Tôi muốn theo dõi tiến độ của chiến dịch này',
    }),
  });

  const result = await response.json();
  console.log('Followed campaign:', result.data);
};

// Check follow status
const checkFollowStatus = async (campaignId: string) => {
  const response = await fetch(`/api/campaigns/${campaignId}/follow-status`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  return result.data.isFollowing;
};

// Get my followed campaigns
const getMyFollowedCampaigns = async (page = 1) => {
  const response = await fetch(
    `/api/campaigns/my-followed?page=${page}&limit=20`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const result = await response.json();
  return result.data;
};
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const CampaignFollowButton = ({ campaignId, initialFollowStatus }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowCampaign(campaignId);
        setIsFollowing(false);
      } else {
        await followCampaign(campaignId);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`follow-btn ${isFollowing ? 'following' : 'not-following'}`}
    >
      {isLoading ? 'Đang xử lý...' : isFollowing ? 'Đã quan tâm' : 'Quan tâm'}
    </button>
  );
};
```

## 🔄 Integration với Campaign List

Khi hiển thị danh sách campaigns, có thể include thông tin follow:

```typescript
// Campaign list response now includes followersCount
interface CampaignListItem {
  _id: string;
  title: string;
  description: string;
  followersCount: number; // Số người quan tâm
  currentAmount: number;
  donorCount: number;
  // ... other fields
}
```

## 🎯 Future Enhancements

1. **Notifications**: Gửi thông báo khi campaign có update
2. **Follow Analytics**: Thống kê về followers
3. **Bulk Operations**: Follow/unfollow nhiều campaigns cùng lúc
4. **Follow Categories**: Phân loại follow theo mục đích
5. **Social Features**: Hiển thị friends đã follow campaign

---

## 📝 Notes

- Tất cả endpoints đều có Swagger documentation đầy đủ
- Error handling sử dụng BusinessException với error codes
- API responses được format bởi TransformInterceptor
- Authentication sử dụng JWT Bearer token
- Pagination được implement cho tất cả list endpoints

_Feature này giúp tăng engagement và tạo community xung quanh các chiến dịch từ thiện! 🎉_
