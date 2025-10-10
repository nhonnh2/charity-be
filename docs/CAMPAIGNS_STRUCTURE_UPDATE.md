# Campaigns Module - Structure Updates

## Tổng Quan

Đã cập nhật cấu trúc module campaigns để hỗ trợ:

1. **Files lưu dạng object chứa cả id và url**
2. **Mỗi milestone chứa nhiều tài liệu cho kế hoạch**
3. **Mỗi milestone có thời gian dự kiến (số ngày)**

## Những Thay Đổi Đã Thực Hiện

### 1. Entity Updates (`campaign.entity.ts`)

#### FileObject Interface Mới

```typescript
export interface FileObject {
  id: string; // ID của file trong collection media
  url: string; // URL của file
  name: string; // Tên file
}
```

#### Milestone Interface Cập Nhật

```typescript
export interface Milestone {
  // ... existing fields ...
  durationDays: number; // Thời gian dự kiến (số ngày)
  documents: FileObject[]; // Nhiều tài liệu cho kế hoạch
}
```

#### Image và Gallery Fields Cập Nhật

```typescript
// Từ: string (chỉ URL)
// Thành: FileObject (object chứa id, url, name)
image?: FileObject;

// Từ: string[] (chỉ URL)
// Thành: FileObject[] (object chứa id, url, name)
gallery: FileObject[];
```

### 2. DTO Updates

#### FileObjectDto Mới

```typescript
export class FileObjectDto {
  @ApiProperty({ description: 'ID của file trong collection media' })
  id: string;

  @ApiProperty({ description: 'URL của file' })
  url: string;

  @ApiProperty({ description: 'Tên file' })
  name: string;
}
```

#### MilestoneDto Cập Nhật

```typescript
export class MilestoneDto {
  // ... existing fields ...

  @ApiProperty({ description: 'Thời gian dự kiến (số ngày)' })
  @IsNumber()
  @Min(1)
  @Max(365)
  durationDays: number;

  @ApiPropertyOptional({ description: 'Tài liệu kế hoạch cho giai đoạn' })
  @IsArray()
  @Type(() => FileObjectDto)
  documents?: FileObjectDto[];

  // dueDate và completedAt sẽ được set/update sau khi campaign được approve
}
```

#### CreateCampaignDto Cập Nhật

```typescript
export class CreateCampaignDto {
  // ... existing fields ...

  @ApiPropertyOptional({ description: 'Ảnh đại diện chiến dịch' })
  @Type(() => FileObjectDto)
  image?: FileObjectDto;

  @ApiPropertyOptional({ description: 'Thư viện ảnh chiến dịch' })
  @IsArray()
  @Type(() => FileObjectDto)
  gallery?: FileObjectDto[];
}
```

### 3. Response DTOs

#### FileObjectResponseDto

```typescript
export class FileObjectResponseDto {
  id: string; // ID của file trong collection media
  url: string; // URL của file
  name: string; // Tên file
}
```

#### MilestoneResponseDto Cập Nhật

```typescript
export class MilestoneResponseDto {
  // ... existing fields ...

  durationDays: number; // Thời gian dự kiến
  documents: FileObjectResponseDto[]; // Tài liệu kế hoạch
}
```

#### CampaignResponseDto Cập Nhật

```typescript
export class CampaignResponseDto {
  // ... existing fields ...

  image?: FileObjectResponseDto; // Ảnh đại diện với FileObject
  gallery: FileObjectResponseDto[]; // Gallery với FileObject
}
```

### 4. Service Updates

#### Emergency Campaign Milestone

```typescript
// Tự động tạo milestone cho emergency campaign
campaignData.milestones = [
  {
    title: 'Giải ngân toàn bộ',
    description: 'Giải ngân toàn bộ số tiền cho chiến dịch khẩn cấp',
    targetAmount: createCampaignDto.targetAmount,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    durationDays: 30, // 30 ngày cho emergency
    status: 'pending',
    progressPercentage: 0,
    progressUpdatesCount: 0,
    documents: [], // Không có tài liệu cho emergency
  },
];
```

#### Validation Updates

```typescript
// Validate duration days
for (const milestone of dto.milestones) {
  if (milestone.durationDays < 1 || milestone.durationDays > 365) {
    throw new BadRequestException(
      'Thời gian dự kiến của milestone phải từ 1 đến 365 ngày',
    );
  }
}
```

## Lợi Ích Của Cập Nhật

### 1. File Management

- **Truy xuất file dễ dàng**: Có cả ID và URL
- **Đơn giản hóa**: Chỉ cần id, url, name - các thông tin khác có trong collection media
- **Backward compatibility**: Vẫn hỗ trợ Attachment interface cũ

### 2. Milestone Planning

- **Tài liệu kế hoạch**: Mỗi milestone có thể có nhiều tài liệu
- **Thời gian dự kiến**: Rõ ràng số ngày cần thiết cho mỗi giai đoạn
- **Validation**: Đảm bảo thời gian hợp lý (1-365 ngày)

### 3. Gallery Management

- **Đơn giản hóa**: Gallery chỉ cần id, url, name - thông tin chi tiết có trong collection media
- **Consistent structure**: Sử dụng cùng FileObject cho tất cả files

## API Examples

### Tạo Campaign với Milestone Documents

```json
{
  "title": "Xây dựng trường học",
  "description": "Chiến dịch xây dựng trường học...",
  "type": "normal",
  "fundingType": "fixed",
  "targetAmount": 200000000,
  "reviewFee": 50000,
  "milestones": [
    {
      "title": "Giai đoạn 1: Chuẩn bị mặt bằng",
      "description": "Chuẩn bị mặt bằng và thiết kế",
      "targetAmount": 50000000,
      // dueDate sẽ được set sau khi campaign được approve
      "durationDays": 30,
      "documents": [
        {
          "id": "doc1",
          "url": "https://example.com/plan.pdf",
          "name": "plan.pdf"
        }
      ]
    }
  ],
  "image": {
    "id": "main-img",
    "url": "https://example.com/main-image.jpg",
    "name": "main-image.jpg"
  },
  "gallery": [
    {
      "id": "img1",
      "url": "https://example.com/image1.jpg",
      "name": "image1.jpg"
    }
  ]
}
```

## Kết Luận

Cập nhật này mang lại:

- **Cấu trúc file đơn giản hơn** với chỉ id, url, name
- **Milestone planning chi tiết** với tài liệu và thời gian
- **API consistency** với FileObject structure
- **Better performance** vì không duplicate thông tin đã có trong collection media

Tất cả thay đổi đều backward compatible và có validation đầy đủ.
