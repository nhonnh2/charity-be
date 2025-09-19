# Charity Backend API

API backend cho hệ thống quản lý từ thiện được xây dựng với NestJS và MongoDB.

## Công nghệ sử dụng

- **NestJS**: Framework Node.js progressive
- **MongoDB**: Database NoSQL
- **Mongoose**: ODM cho MongoDB
- **TypeScript**: Ngôn ngữ lập trình chính
- **Swagger**: API documentation
- **Jest**: Testing framework

## Cấu trúc thư mục

```
src/
├── core/                   # Core module - Global components
│   ├── filters/            # Exception filters
│   ├── interceptors/       # Request/Response interceptors
│   └── core.module.ts      # Core module configuration
├── shared/                 # Shared module - Common utilities
│   ├── services/           # Shared services
│   └── shared.module.ts    # Shared module configuration
├── modules/                # Business modules
│   └── users/              # Users module example
│       ├── dto/            # Data Transfer Objects
│       ├── entities/       # Database entities
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
├── app.controller.ts       # Main application controller
├── app.service.ts          # Main application service
├── app.module.ts           # Main application module
└── main.ts                 # Application entry point
```

📋 **Để hiểu chi tiết về cấu trúc thư mục, vui lòng xem: [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment variables

Tạo file `.env` trong thư mục root:

```env
# Database Configuration
DB_URI=mongodb+srv://huunhon099:huunhon989@cluster0.uwbprnu.mongodb.net
DB_NAME=charity-base

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# API Configuration
API_PREFIX=api
API_VERSION=v1
```

### 3. Chạy ứng dụng

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Health Check

- `GET /` - Thông tin ứng dụng
- `GET /health` - Kiểm tra trạng thái

### 🔐 Authentication

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile (cần JWT token)

### 👥 Users

- `GET /api/users` - Danh sách users (có pagination)
- `GET /api/users/:id` - Lấy user theo ID
- `POST /api/users` - Tạo user mới
- `PATCH /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user
- `GET /api/users/admin/test` - Test endpoint

## API Documentation

Swagger UI có thể truy cập tại: `http://localhost:3000/api/docs`

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Scripts

```bash
# Development
npm run start:dev          # Chạy ở chế độ development với watch
npm run start:debug        # Chạy ở chế độ debug

# Build
npm run build              # Build production

# Code quality
npm run lint               # Chạy ESLint
npm run format             # Format code với Prettier

# Testing
npm run test               # Chạy unit tests
npm run test:watch         # Chạy tests với watch mode
npm run test:cov           # Chạy tests với coverage
npm run test:e2e           # Chạy E2E tests
```

## Best Practices

### 1. Cấu trúc Module

- Mỗi module có controller, service, entity, và DTOs riêng
- Sử dụng dependency injection
- Export services cần thiết để sử dụng ở modules khác

### 2. DTOs và Validation

- Sử dụng class-validator để validate input
- Tạo DTOs riêng cho Create, Update, và Query operations
- Sử dụng Swagger decorators để document APIs

### 3. Database

- Sử dụng Mongoose schemas với decorators
- Implement pagination cho các list endpoints
- Sử dụng transactions khi cần thiết

### 4. Error Handling

- Sử dụng global exception filter
- Throw appropriate HTTP exceptions
- Log errors với proper context

### 5. Security

- Remove sensitive data từ responses
- Validate all inputs
- Implement proper authentication/authorization

## Development Guidelines

### Naming Conventions

- Files: kebab-case (user-service.ts)
- Classes: PascalCase (UserService)
- Variables/Methods: camelCase (getUserById)
- Constants: UPPER_CASE (API_VERSION)

### Code Organization

- Một file một export chính
- Nhóm imports theo thứ tự: external, internal, relative
- Sử dụng TypeScript types cho tất cả

### Testing

- Viết unit tests cho mỗi service method
- Viết integration tests cho controllers
- Sử dụng test doubles để mock dependencies

## Contribution

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

[MIT](LICENSE)
