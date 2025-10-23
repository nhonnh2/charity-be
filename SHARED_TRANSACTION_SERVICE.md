# 🔄 SHARED DATABASE TRANSACTION SERVICE

## 📋 **TỔNG QUAN**

Đã tạo **DatabaseTransactionService** trong `shared/services` để centralize việc quản lý database transactions, tránh duplicate code và đảm bảo consistency across toàn bộ application.

---

## 🏗️ **CẤU TRÚC MỚI**

### **1. DatabaseTransactionService**

```typescript
// src/shared/services/database-transaction.service.ts
@Injectable()
export class DatabaseTransactionService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // Main transaction method
  async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T>;

  // Advanced transaction with options
  async withTransactionWithOptions<T>(operation, options): Promise<T>;

  // Manual session management
  async getSession(): Promise<ClientSession>;
}
```

### **2. Shared Module Export**

```typescript
// src/shared/shared.module.ts
@Global()
@Module({
  providers: [
    // ... other services
    DatabaseTransactionService,
  ],
  exports: [
    // ... other services
    DatabaseTransactionService,
  ],
})
export class SharedModule {}
```

---

## ✅ **CÁC SERVICES ĐÃ CẬP NHẬT**

### **1. PostsService** ✅

```typescript
// TRƯỚC: Custom withTransaction method
private async withTransaction<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await this.connection.startSession();
  // ... manual session management
}

// SAU: Sử dụng shared service
constructor(
  // ... other dependencies
  private databaseTransactionService: DatabaseTransactionService,
) {}

// Usage
await this.databaseTransactionService.withTransaction(async (session) => {
  // Your operations here
});
```

### **2. CampaignsService** ✅

```typescript
// TRƯỚC: Manual session management
const session = await this.connection.startSession();
try {
  await session.withTransaction(async () => {
    // operations
  });
} finally {
  await session.endSession();
}

// SAU: Sử dụng shared service
return await this.databaseTransactionService.withTransaction(async session => {
  // operations
});
```

---

## 🎯 **LỢI ÍCH CỦA SHARED SERVICE**

### **1. DRY Principle (Don't Repeat Yourself)**

```typescript
// ❌ TRƯỚC: Duplicate code trong mỗi service
private async withTransaction<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
  const session = await this.connection.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result!;
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
}

// ✅ SAU: Centralized trong shared service
await this.databaseTransactionService.withTransaction(async (session) => {
  // Your operations
});
```

### **2. Consistent Error Handling**

```typescript
// ✅ Tất cả services đều có cùng error handling logic
// ✅ Automatic rollback on error
// ✅ Proper resource cleanup
```

### **3. Type Safety**

```typescript
// ✅ Generic type support
async withTransaction<T>(operation: (session: ClientSession) => Promise<T>): Promise<T>

// ✅ TypeScript sẽ infer đúng return type
const result = await this.databaseTransactionService.withTransaction(async (session) => {
  return { user, campaign }; // TypeScript knows this is { user: User, campaign: Campaign }
});
```

### **4. Advanced Features**

```typescript
// ✅ Transaction options support
await this.databaseTransactionService.withTransactionWithOptions(
  async session => {
    /* operations */
  },
  {
    readConcern: { level: 'majority' },
    writeConcern: { w: 'majority' },
    maxTimeMS: 30000,
  },
);

// ✅ Manual session management khi cần
const session = await this.databaseTransactionService.getSession();
```

### **5. Easy Testing**

```typescript
// ✅ Mock shared service thay vì mock connection
const mockTransactionService = {
  withTransaction: jest.fn().mockImplementation(async operation => {
    return await operation(mockSession);
  }),
};
```

---

## 📊 **SO SÁNH TRƯỚC VÀ SAU**

| Aspect                  | TRƯỚC                          | SAU                         |
| ----------------------- | ------------------------------ | --------------------------- |
| **Code Duplication**    | ❌ Duplicate trong mỗi service | ✅ Centralized trong shared |
| **Error Handling**      | ❌ Inconsistent                | ✅ Consistent across all    |
| **Resource Management** | ❌ Manual trong mỗi service    | ✅ Automatic cleanup        |
| **Type Safety**         | ❌ Basic                       | ✅ Advanced with generics   |
| **Testing**             | ❌ Complex mocking             | ✅ Simple service mock      |
| **Maintenance**         | ❌ Update nhiều nơi            | ✅ Update 1 chỗ duy nhất    |
| **Features**            | ❌ Basic transaction           | ✅ Advanced options         |

---

## 🚀 **CÁCH SỬ DỤNG**

### **1. Import Service**

```typescript
import { DatabaseTransactionService } from '@/shared/services/database-transaction.service';

@Injectable()
export class YourService {
  constructor(private databaseTransactionService: DatabaseTransactionService) {}
}
```

### **2. Basic Transaction**

```typescript
async createUserWithProfile(userData: any, profileData: any) {
  return await this.databaseTransactionService.withTransaction(async (session) => {
    const user = await this.userModel.create([userData], { session });
    const profile = await this.profileModel.create([profileData], { session });
    return { user: user[0], profile: profile[0] };
  });
}
```

### **3. Advanced Transaction**

```typescript
async complexOperation() {
  return await this.databaseTransactionService.withTransactionWithOptions(
    async (session) => {
      // Your complex operations
    },
    {
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority' },
      maxTimeMS: 30000
    }
  );
}
```

### **4. Manual Session Management**

```typescript
async customTransaction() {
  const session = await this.databaseTransactionService.getSession();
  try {
    await session.withTransaction(async () => {
      // Your operations
    });
  } finally {
    await session.endSession();
  }
}
```

---

## 🔧 **MIGRATION GUIDE**

### **Bước 1: Import Service**

```typescript
// Thêm vào constructor
constructor(
  // ... existing dependencies
  private databaseTransactionService: DatabaseTransactionService,
) {}
```

### **Bước 2: Replace Custom Methods**

```typescript
// ❌ Xóa custom withTransaction method
private async withTransaction<T>(operation: (session: ClientSession) => Promise<T>): Promise<T> {
  // ... delete this
}

// ✅ Sử dụng shared service
await this.databaseTransactionService.withTransaction(async (session) => {
  // Your operations
});
```

### **Bước 3: Update Manual Sessions**

```typescript
// ❌ TRƯỚC
const session = await this.connection.startSession();
try {
  await session.withTransaction(async () => {
    // operations
  });
} finally {
  await session.endSession();
}

// ✅ SAU
await this.databaseTransactionService.withTransaction(async session => {
  // operations
});
```

---

## 📝 **BEST PRACTICES**

### **1. Chỉ dùng cho Multi-Document Operations**

```typescript
// ✅ CẦN transaction - Multiple documents
await this.databaseTransactionService.withTransaction(async session => {
  await this.userModel.create([userData], { session });
  await this.profileModel.create([profileData], { session });
});

// ❌ KHÔNG cần transaction - Single document
await this.userModel.findByIdAndUpdate(id, updateData);
```

### **2. Validate Data Trước Khi Vào Transaction**

```typescript
// ✅ Validate trước
if (!userData.email) {
  throw new BusinessException('Email is required');
}

await this.databaseTransactionService.withTransaction(async session => {
  // Safe operations
});
```

### **3. Handle Errors Properly**

```typescript
// ✅ Transaction tự động rollback khi có error
try {
  await this.databaseTransactionService.withTransaction(async session => {
    // operations
  });
} catch (error) {
  // Handle business logic errors
  if (error instanceof BusinessException) {
    throw error;
  }
  // Log unexpected errors
  this.logger.error('Transaction failed', error);
  throw new InternalServerErrorException('Operation failed');
}
```

---

## 🎉 **KẾT QUẢ**

### **✅ Đã hoàn thành:**

1. ✅ Tạo `DatabaseTransactionService` trong shared
2. ✅ Cập nhật `PostsService` để sử dụng shared service
3. ✅ Cập nhật `CampaignsService` để sử dụng shared service
4. ✅ Xóa duplicate code trong các services
5. ✅ Đảm bảo type safety và error handling consistency
6. ✅ Thêm advanced features (options, manual session)

### **🎯 Lợi ích:**

- **Maintainability**: Dễ maintain và update
- **Consistency**: Consistent error handling across all services
- **Reusability**: Tái sử dụng code hiệu quả
- **Type Safety**: Better TypeScript support
- **Testing**: Dễ test hơn với service mocking
- **Performance**: Optimized resource management

---

**🚀 Giờ đây toàn bộ application có centralized transaction management - clean, maintainable và production-ready!**
