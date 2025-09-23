# 📚 Charity Backend Documentation

## 🎯 Overview

Charity Backend là một RESTful API được xây dựng với **NestJS** và **MongoDB** để phục vụ cho ứng dụng mạng xã hội từ thiện. Hệ thống được thiết kế theo kiến trúc modular, scalable và tuân thủ best practices.

## 🏗️ Architecture

### Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT + OAuth (Google, Facebook)
- **File Storage**: Google Cloud Storage, Azure Blob Storage
- **Image Processing**: Sharp
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### Module Structure

```
charity-be/
├── src/
│   ├── core/           # System-level components
│   ├── shared/         # Shared utilities & services
│   ├── modules/        # Business domain modules
│   │   ├── auth/       # Authentication & Authorization
│   │   ├── users/      # User Management
│   │   ├── campaigns/  # Campaign Management
│   │   ├── media/      # Media File Management
│   │   ├── progress/   # Progress Tracking
│   │   ├── donations/  # Donation Management
│   │   ├── disbursement/ # Disbursement Management
│   │   └── expense/    # Expense Management
│   ├── app.module.ts   # Root module
│   └── main.ts         # Application entry point
├── docs/               # Documentation
└── test/              # End-to-end tests
```

## 📖 Documentation Index

### 🏗️ **System Architecture**

- [📁 Project Structure](PROJECT_STRUCTURE.md) - Chi tiết cấu trúc thư mục và nguyên tắc thiết kế
- [🔧 Environment Variables](ENVIRONMENT_VARIABLES.md) - Cấu hình môi trường và cloud setup

### 🔐 **Authentication System**

- [🔑 Auth System](AUTH_SYSTEM.md) - JWT authentication, refresh tokens
- [🔗 Google OAuth Setup](GOOGLE_OAUTH_SETUP.md) - Google Sign-in integration
- [🔗 Facebook OAuth Setup](FACEBOOK_OAUTH_SETUP.md) - Facebook Login integration
- [🔄 Refresh Token System](REFRESH_TOKEN_SYSTEM.md) - Token rotation và security

### 📊 **Business Modules**

- [📸 Media Module](MEDIA_MODULE.md) - File upload, cloud storage, image processing
- [🎯 Campaigns Module](CAMPAIGNS_MODULE.md) - Campaign management và tracking

### 📋 **Development**

- [📝 Documentation Plan](DOCS_PLAN.md) - Kế hoạch phát triển documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5+
- Google Cloud Project (for media storage)
- Azure Storage Account (optional)

### Installation

1. **Clone repository**

```bash
git clone <repository-url>
cd charity-be
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**

```bash
cp docs/ENVIRONMENT_VARIABLES.md .env
# Edit .env with your configuration
```

4. **Start development server**

```bash
npm run start:dev
```

5. **Access API documentation**

```
http://localhost:3000/api/docs
```

## 🔧 Configuration

### Required Environment Variables

```bash
# Database
DB_URI=mongodb://localhost:27017
DB_NAME=charity_db

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id

# Cloud Storage
DEFAULT_CLOUD_PROVIDER=google_cloud
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket-name
```

Xem [Environment Variables](ENVIRONMENT_VARIABLES.md) để biết chi tiết cấu hình.

## 📡 API Endpoints

### 🔐 Authentication

```
POST /auth/register          # User registration
POST /auth/login             # User login
POST /auth/refresh           # Refresh token
POST /auth/logout            # User logout
POST /auth/google            # Google OAuth
POST /auth/facebook          # Facebook OAuth
```

### 👥 Users

```
GET    /users                # Get users list
GET    /users/:id            # Get user by ID
PUT    /users/:id            # Update user
DELETE /users/:id            # Delete user
```

### 📸 Media

```
POST   /media/upload         # Upload media file
GET    /media                # Get media list
GET    /media/:id            # Get media by ID
PUT    /media/:id            # Update media
DELETE /media/:id            # Delete media
GET    /media/:id/download   # Download media
GET    /media/:id/view       # View media (redirect)
```

### 🎯 Campaigns

```
POST   /campaigns            # Create campaign
GET    /campaigns            # Get campaigns list
GET    /campaigns/:id        # Get campaign by ID
PUT    /campaigns/:id        # Update campaign
DELETE /campaigns/:id        # Delete campaign
```

### 📈 Progress

```
POST   /progress             # Create progress update
GET    /progress             # Get progress list
GET    /progress/:id         # Get progress by ID
PUT    /progress/:id         # Update progress
DELETE /progress/:id         # Delete progress
```

## 🛡️ Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure access tokens với expiration
- **Refresh Tokens**: Token rotation cho security
- **OAuth Integration**: Google & Facebook login
- **Role-based Access**: User roles và permissions

### Data Protection

- **Input Validation**: Class-validator cho DTOs
- **File Validation**: MIME type và size validation
- **Rate Limiting**: API rate limiting (configurable)
- **CORS**: Cross-origin resource sharing

### Cloud Security

- **Signed URLs**: Temporary access cho cloud storage
- **Private Storage**: User-based file access control
- **Encryption**: Data encryption in transit và at rest

## 📊 Key Features

### 🎯 **Core Features**

- **User Management**: Registration, authentication, profiles
- **Campaign Management**: Create, manage charity campaigns
- **Media Management**: Upload, process, store files
- **Progress Tracking**: Campaign progress updates
- **Donation System**: Track donations và disbursements

### 📸 **Media Features**

- **Multi-Cloud Support**: Google Cloud Storage, Azure Blob
- **Image Processing**: Thumbnails, resizing, optimization
- **File Types**: Images, videos, audio, documents
- **Public/Private**: Flexible access control
- **Metadata Tracking**: File information, usage stats

### 🔄 **System Features**

- **Modular Architecture**: Scalable, maintainable code
- **Global Error Handling**: Consistent error responses
- **Request Logging**: Comprehensive request/response logging
- **Response Transformation**: Standardized API responses
- **Swagger Documentation**: Auto-generated API docs

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:cov
```

## 🚀 Deployment

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

### Docker (Optional)

```bash
docker build -t charity-be .
docker run -p 3000:3000 charity-be
```

## 📈 Performance

### Optimization Features

- **Database Indexing**: Optimized queries với proper indexes
- **Image Processing**: Efficient image compression và thumbnails
- **Caching**: Response caching cho frequently accessed data
- **Lazy Loading**: Efficient data loading strategies

### Monitoring

- **Request Logging**: Detailed request/response logging
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time tracking
- **Health Checks**: System health monitoring

## 🔧 Development Guidelines

### Code Standards

- **TypeScript**: Strict typing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Conventional Commits**: Standard commit messages

### Architecture Principles

- **SOLID Principles**: Clean, maintainable code
- **DRY**: Don't Repeat Yourself
- **Separation of Concerns**: Clear module boundaries
- **Dependency Injection**: Loose coupling

### Best Practices

- **Error Handling**: Comprehensive error management
- **Validation**: Input validation với class-validator
- **Documentation**: JSDoc comments cho all public methods
- **Testing**: Unit tests cho business logic

## 🤝 Contributing

### Development Workflow

1. **Fork repository**
2. **Create feature branch**
3. **Write tests**
4. **Implement feature**
5. **Update documentation**
6. **Submit pull request**

### Code Review Process

- **Automated Tests**: All tests must pass
- **Code Quality**: ESLint và Prettier checks
- **Documentation**: Update relevant docs
- **Security Review**: Security implications review

## 📞 Support

### Documentation

- **API Docs**: Swagger UI tại `/api/docs`
- **Module Docs**: Detailed module documentation
- **Setup Guides**: Step-by-step setup instructions

### Issues & Questions

- **GitHub Issues**: Bug reports và feature requests
- **Documentation**: Check existing documentation first
- **Code Comments**: Inline code documentation

## 🎯 Roadmap

### Short Term

- [ ] Video processing capabilities
- [ ] Advanced search functionality
- [ ] Real-time notifications
- [ ] Mobile app API optimization

### Long Term

- [ ] Microservices architecture
- [ ] Advanced analytics dashboard
- [ ] AI-powered content moderation
- [ ] Multi-language support

---

**Charity Backend** - Xây dựng để phục vụ cộng đồng! 🤝

_Được phát triển với ❤️ để hỗ trợ các hoạt động từ thiện và tạo tác động tích cực trong cộng đồng._
