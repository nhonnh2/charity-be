# 📁 Cấu trúc thư mục dự án Charity Backend

## 🏗️ Tổng quan cấu trúc

```
charity-be/
├── .cursor/                     # Cursor IDE configuration
├── docs/                        # Documentation files
│   └── PROJECT_STRUCTURE.md     # This file
├── src/                         # Source code
│   ├── core/                    # Core system modules
│   ├── shared/                  # Shared utilities and services
│   ├── modules/                 # Business domain modules
│   ├── app.controller.ts        # Root application controller
│   ├── app.service.ts           # Root application service
│   ├── app.module.ts            # Root application module
│   └── main.ts                  # Application entry point
├── test/                        # End-to-end tests
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── nest-cli.json                # NestJS CLI configuration
├── .env                         # Environment variables (not in repo)
├── .gitignore                   # Git ignore rules
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc                  # Prettier configuration
└── README.md                    # Project overview
```

## 📂 Chi tiết từng thư mục

### 🎯 **src/core/** - Module cốt lõi hệ thống

```
src/core/
├── filters/                     # Exception filters
│   └── global-exception.filter.ts
├── interceptors/                # Request/Response interceptors
│   ├── transform.interceptor.ts
│   └── logging.interceptor.ts
└── core.module.ts               # Core module configuration
```

**Mục đích:**

- Chứa các thành phần toàn cục của hệ thống
- Xử lý cross-cutting concerns (logging, error handling, response formatting)
- Tách biệt logic hệ thống khỏi business logic

**Thành phần:**

#### 🛡️ **Filters/**

- `global-exception.filter.ts`: Xử lý lỗi toàn cục
  - Catch tất cả exceptions không được handle
  - Format error response thống nhất
  - Log errors với context đầy đủ

#### 🔄 **Interceptors/**

- `transform.interceptor.ts`: Transform response format
  - Wrap response trong standard format
  - Thêm metadata (timestamp, status code)
  - Consistency trong API responses

- `logging.interceptor.ts`: Request logging
  - Log tất cả HTTP requests
  - Track response time
  - Monitor API usage

#### ⚙️ **Core.module.ts**

- Global module configuration
- Register filters và interceptors
- Provide core services globally

### 🔄 **src/shared/** - Module dùng chung

```
src/shared/
├── services/                    # Shared business services
│   ├── utils.service.ts         # Utility functions
│   └── database.service.ts      # Database utilities
└── shared.module.ts             # Shared module configuration
```

**Mục đích:**

- Chứa utilities và services được sử dụng bởi nhiều modules
- Tránh code duplication giữa các modules
- Tập trung logic chung (pagination, validation, formatting)

**Thành phần:**

#### 🛠️ **Services/**

- `utils.service.ts`: Utility functions
  - Email validation
  - String formatting
  - Date manipulation
  - Data sanitization

- `database.service.ts`: Database utilities
  - Pagination helper
  - Search query builder
  - Common database operations

#### 🔧 **Shared.module.ts**

- Global shared module
- Export common services
- Available trong tất cả modules

### 🏢 **src/modules/** - Business domain modules

```
src/modules/
└── users/                       # User domain module
    ├── dto/                     # Data Transfer Objects
    │   ├── create-user.dto.ts
    │   ├── update-user.dto.ts
    │   └── query-users.dto.ts
    ├── entities/                # Database entities
    │   └── user.entity.ts
    ├── users.controller.ts      # HTTP request handlers
    ├── users.service.ts         # Business logic
    ├── users.service.spec.ts    # Unit tests
    └── users.module.ts          # Module configuration
```

**Mục đích:**

- Tổ chức code theo business domains
- Encapsulation - mỗi module tự quản lý logic riêng
- Scalability - dễ dàng thêm modules mới

**Thành phần:**

#### 📋 **dto/** - Data Transfer Objects

- `create-user.dto.ts`: Validation cho user creation
- `update-user.dto.ts`: Validation cho user updates
- `query-users.dto.ts`: Validation cho queries (pagination, search)

#### 🗄️ **entities/** - Database entities

- `user.entity.ts`: Mongoose schema definition
- Database field definitions
- Indexes và constraints

#### 🎮 **Controllers**

- `users.controller.ts`: HTTP endpoint handlers
- Route definitions
- Request/response handling
- API documentation với Swagger

#### 🧠 **Services**

- `users.service.ts`: Business logic implementation
- Database operations
- Data transformation
- Business rules enforcement

#### 🧪 **Tests**

- `users.service.spec.ts`: Unit tests
- Mock dependencies
- Test business logic
- Code coverage

#### 📦 **Module**

- `users.module.ts`: Module configuration
- Dependency injection setup
- Import/export declarations

### 📁 **src/app.\*** - Root application files

```
src/
├── app.controller.ts            # Root controller
├── app.service.ts               # Root service
├── app.module.ts                # Root module
└── main.ts                      # Application bootstrap
```

**Mục đích:**

- Entry point của ứng dụng
- Global configuration
- Health checks và system info

**Thành phần:**

- `main.ts`: Bootstrap application, configure global pipes, setup Swagger
- `app.module.ts`: Import tất cả modules, database connection
- `app.controller.ts`: Health check endpoints
- `app.service.ts`: System information services

### 🧪 **test/** - End-to-end tests

```
test/
├── app.e2e-spec.ts             # E2E test suite
└── jest-e2e.json               # Jest E2E configuration
```

**Mục đích:**

- Integration testing
- API endpoint testing
- Full application flow testing

## 🎯 Nguyên tắc thiết kế

### 1. **Separation of Concerns**

- **Core**: System-level concerns
- **Shared**: Cross-module utilities
- **Modules**: Business logic domains

### 2. **Dependency Flow**

```
Modules → Shared → Core
```

- Modules có thể depend on Shared và Core
- Shared có thể depend on Core
- Core không depend on gì khác

### 3. **Module Independence**

- Mỗi business module là independent
- Không direct dependency giữa business modules
- Communication qua shared services hoặc events

### 4. **Scalability Pattern**

- Dễ dàng thêm modules mới
- Tách modules thành microservices
- Horizontal scaling friendly

## 📋 Guidelines sử dụng

### ✅ **Khi nào tạo file ở đâu:**

#### 🎯 **Core Module**

- Global exception filters
- Request/response interceptors
- Global guards (authentication)
- System-wide middleware

#### 🔄 **Shared Module**

- Utility functions dùng bởi multiple modules
- Database helpers
- Common validators
- Third-party service integrations

#### 🏢 **Business Modules**

- Domain-specific logic
- API endpoints cho domain
- Database entities cho domain
- Business rules và validations

### ❌ **Tránh những điều này:**

#### 🚫 **Đừng làm:**

- Đặt business logic trong Core
- Đặt system logic trong Modules
- Circular dependencies giữa modules
- Shared state giữa modules

#### ⚠️ **Cần cẩn thận:**

- Không over-engineer Shared module
- Không tạo quá nhiều abstractions
- Đảm bảo test coverage cho Shared services

## 🔧 Workflow thực tế

### 📝 **Thêm feature mới:**

1. **Business feature** → Tạo module mới trong `modules/`
2. **System feature** → Thêm vào `core/`
3. **Utility function** → Thêm vào `shared/`

### 🐛 **Debug lỗi:**

1. **HTTP errors** → Kiểm tra `core/filters/`
2. **Business logic errors** → Kiểm tra `modules/[domain]/`
3. **Utility errors** → Kiểm tra `shared/services/`

### 🔄 **Refactor code:**

- **Extract common logic** → Move vào `shared/`
- **System concerns** → Move vào `core/`
- **Domain logic** → Keep trong `modules/`

## 📊 Ví dụ mở rộng

### 🆕 **Thêm module mới (Products):**

```
src/modules/products/
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── query-products.dto.ts
├── entities/
│   └── product.entity.ts
├── products.controller.ts
├── products.service.ts
├── products.service.spec.ts
└── products.module.ts
```

### 🔧 **Thêm shared service:**

```
src/shared/services/
├── utils.service.ts
├── database.service.ts
├── email.service.ts          # NEW
└── file-upload.service.ts    # NEW
```

### 🛡️ **Thêm core component:**

```
src/core/
├── filters/
├── interceptors/
├── guards/                   # NEW
│   └── auth.guard.ts
└── middleware/              # NEW
    └── cors.middleware.ts
```

## 💡 Best Practices

### 1. **Naming Conventions**

- Files: `kebab-case.ts`
- Classes: `PascalCase`
- Methods: `camelCase`
- Constants: `UPPER_CASE`

### 2. **File Organization**

- One main export per file
- Group related files trong folders
- Use index files khi cần

### 3. **Dependencies**

- Explicit imports
- Avoid circular dependencies
- Use dependency injection

### 4. **Documentation**

- JSDoc cho public methods
- README cho mỗi module
- API documentation với Swagger

---

_Cấu trúc này đảm bảo project **scalable, maintainable, và team-friendly**! 🚀_
