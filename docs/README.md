# 📚 Documentation

Chào mừng bạn đến với thư mục documentation của dự án Charity Backend!

## 📁 Danh sách tài liệu

### 🏗️ **Kiến trúc & Cấu trúc**

- [**PROJECT_STRUCTURE.md**](PROJECT_STRUCTURE.md) - Cấu trúc thư mục chi tiết
  - Giải thích từng thư mục và mục đích
  - Nguyên tắc thiết kế
  - Guidelines sử dụng
  - Best practices

### 🔐 **Authentication & Security**

- [**AUTH_SYSTEM.md**](AUTH_SYSTEM.md) - Hệ thống xác thực JWT
  - Email registration & login
  - JWT token management
  - Route protection với guards
  - API endpoints documentation

### 🚀 **Bắt đầu**

- [**README.md**](../README.md) - Tổng quan dự án (Root)
  - Hướng dẫn cài đặt
  - API endpoints
  - Scripts và commands
  - Testing guidelines

## 🎯 Tài liệu dành cho Developer

### 📖 **Cần đọc đầu tiên:**

1. [README.md](../README.md) - Tổng quan dự án
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Hiểu cấu trúc code

### 💡 **Quy tắc phát triển:**

- Follow naming conventions trong PROJECT_STRUCTURE.md
- Viết tests cho mọi feature mới
- Document public APIs với JSDoc
- Sử dụng TypeScript types đầy đủ

### 🔧 **Workflow development:**

1. Tạo module mới theo pattern trong `src/modules/users/`
2. Thêm shared utilities vào `src/shared/`
3. Thêm system components vào `src/core/`
4. Viết tests và documentation

## 🤝 Contribution

Khi contribute vào dự án:

1. **Đọc documentation** - Hiểu rõ cấu trúc và quy tắc
2. **Follow patterns** - Sử dụng patterns đã có
3. **Write tests** - Đảm bảo code coverage
4. **Update docs** - Cập nhật documentation nếu cần

## 📝 Thêm tài liệu mới

Khi thêm tài liệu mới:

1. **Tạo file .md** trong thư mục `docs/`
2. **Cập nhật file này** để include link đến tài liệu mới
3. **Sử dụng format markdown** với emojis cho dễ đọc
4. **Include examples** và code samples khi cần thiết

## 🔗 Links hữu ích

### 🛠️ **Framework & Libraries:**

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### 🎨 **Code Style:**

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

### 🧪 **Testing:**

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing NestJS](https://docs.nestjs.com/fundamentals/testing)

---

_Chúc bạn coding vui vẻ! 🎉_
