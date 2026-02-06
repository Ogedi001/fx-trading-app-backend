# FX Trading App - Backend API

A production-grade backend system for an FX (Foreign Exchange) trading application enabling secure currency trading, wallet management, and comprehensive transaction tracking. Built with **NestJS**, **TypeORM**, **PostgreSQL**, and **Redis**.

## 🎯 Overview

The FX Trading App backend provides a robust API for:

- **User Authentication & Authorization** - JWT-based authentication with email verification and role-based access control
- **Wallet Management** - Multi-currency wallets with precise balance tracking
- **Currency Exchange** - Real-time FX rate integration with fallback providers
- **Transaction Handling** - Secure transfer, conversion, and withdrawal operations with idempotency
- **Rate Limiting & Security** - Built-in rate limiting, input validation, and comprehensive error handling

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Architecture Overview](#architecture-overview)
- [Key Architectural Decisions](#key-architectural-decisions)
- [Database Design](#database-design)
- [Security Features](#security-features)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Additional Documentation](#additional-documentation)
- [Documentation Map](#documentation-map)

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start:dev

# Access API
# http://localhost:3000/api
# Swagger UI: http://localhost:3000/api/docs
```

---

## 📦 Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v9 or higher
- **PostgreSQL**: v14 or higher
- **Redis**: v7 or higher (optional but recommended for caching)

---

## 🔧 Installation & Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd fx-trading-app-backend
pnpm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fx_trading
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fx_trading
DB_SSL=false

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=1d

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Email (Brevo/Sendinblue)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=FX Trading App

# Frontend URLs
FRONTEND_URL_DEV=http://localhost:3000
FRONTEND_URL_PROD=https://yourdomain.com
```

### 3. Database Setup

```bash
# Run migrations
pnpm run typeorm migration:run

# Generate a new migration (after schema changes)
pnpm run typeorm migration:generate src/database/migrations/YourMigration
```

### 4. Start the Application

```bash
# Development (with hot-reload)
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod

# Debug mode
pnpm run start:debug
```

The API will be available at `http://localhost:3000/api`

---

## 📚 API Documentation

### Interactive API Documentation

**Swagger UI**: http://localhost:3000/api/docs

All endpoints are documented with:

- Request/response schemas
- Authentication requirements
- Error responses
- Example payloads

### API Endpoints Summary

#### Authentication Endpoints

| Method | Endpoint                        | Description             | Auth |
| ------ | ------------------------------- | ----------------------- | ---- |
| POST   | `/api/auth/register`            | Register new user       | No   |
| POST   | `/api/auth/verify-account`      | Verify account with OTP | No   |
| POST   | `/api/auth/resend-verification` | Resend verification OTP | No   |
| POST   | `/api/auth/login`               | User login              | No   |

#### User Endpoints

| Method | Endpoint        | Description                        | Auth |
| ------ | --------------- | ---------------------------------- | ---- |
| GET    | `/api/users/me` | Get current user profile           | JWT  |
| GET    | `/api/users`    | Get all users (Admin/Support only) | JWT  |

#### Wallet Endpoints

| Method | Endpoint                         | Description                       | Auth |
| ------ | -------------------------------- | --------------------------------- | ---- |
| GET    | `/api/wallets/me`                | Get user wallet info              | JWT  |
| GET    | `/api/wallets/balance/:currency` | Get balance for specific currency | JWT  |
| GET    | `/api/wallets/convert`           | Calculate conversion rate         | JWT  |
| POST   | `/api/wallets/fund`              | Fund wallet                       | JWT  |
| POST   | `/api/wallets/withdraw`          | Withdraw funds                    | JWT  |
| POST   | `/api/wallets/trade`             | Execute currency trade            | JWT  |
| POST   | `/api/wallets/transfer`          | Transfer to another user          | JWT  |

#### FX Endpoints

| Method | Endpoint        | Description        | Auth |
| ------ | --------------- | ------------------ | ---- |
| GET    | `/api/fx/rates` | Get exchange rates | No   |

#### Transaction Endpoints

| Method | Endpoint                | Description             | Auth |
| ------ | ----------------------- | ----------------------- | ---- |
| GET    | `/api/transactions`     | Get user transactions   | JWT  |
| GET    | `/api/transactions/:id` | Get transaction details | JWT  |

#### Health Endpoints

| Method | Endpoint  | Description            |
| ------ | --------- | ---------------------- |
| GET    | `/`       | Health check           |
| GET    | `/health` | Detailed health status |

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/api/wallets/me
```

**Token Structure:**

- Access Token: Expires in 1 day (configurable via `JWT_EXPIRES_IN`)
- Issued on successful login after email verification

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              Client Layer                        │
│         (Mobile/Web Apps, APIs)                  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│            API Gateway Layer                     │
│  Auth | Wallet | FX | Transactions | Users      │
│  Guards | Interceptors | Pipes | Filters        │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│         Application Layer (Services)             │
│  - Domain Services (Business Logic)              │
│  - Use Cases & Commands                          │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│          Domain Layer (Entities)                 │
│  - Domain Entities & Validation                  │
│  - Repository Interfaces                         │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│      Infrastructure Layer (Adapters)             │
│  - TypeORM Repositories | Redis Cache            │
│  - Mail Service | External APIs | Logging        │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           Data Layer                             │
│   PostgreSQL | Redis | External APIs             │
└─────────────────────────────────────────────────┘
```

### Module Structure

```
src/
├── modules/
│   ├── auth/              # Authentication & Authorization
│   ├── users/             # User profiles & management
│   ├── wallets/           # Wallet operations
│   ├── transactions/      # Transaction tracking
│   ├── fx/                # FX rate handling
│   ├── notifications/     # Email & OTP services
│   └── health/            # Health checks
├── common/                # Shared utilities
│   ├── decorators/        # @CurrentUser, @Roles, @Public, @RateLimit, @Idempotent
│   ├── guards/            # JWT, Email Verified, Roles, Rate Limit
│   ├── interceptors/      # Response transformation, logging, caching
│   ├── pipes/             # Zod validation
│   ├── filters/           # Exception handling
│   ├── exceptions/        # Custom exceptions
│   ├── enums/             # Currency, Role, Transaction Status
│   ├── interfaces/        # API response format
│   └── utils/             # Crypto, decimal operations
├── config/                # Configuration management
├── database/              # TypeORM setup & migrations
└── infrastructure/        # External services (Redis, Mail, FX APIs)
```

---

## 🏛️ Key Architectural Decisions

### 1. **Database Choice: PostgreSQL**

- **ACID Compliance**: Essential for financial transactions
- **JSON Support**: Flexible metadata storage
- **Performance**: Optimized for complex queries
- **Reliability**: Strong consistency guarantees

### 2. **ORM: TypeORM**

- Native TypeScript support
- Excellent repository pattern implementation
- Comprehensive migration system
- Type-safe query builder

### 3. **Caching: Redis**

- In-memory performance for FX rates
- Distributed locks for pessimistic locking
- Pub/Sub for event handling
- Session storage

### 4. **Authentication: JWT**

- Stateless design for scalability
- Email verification via OTP before login
- Role-based access control (RBAC)
- Token expiration management

### 5. **Decimal Handling**

- Uses `decimal.js` to prevent floating-point errors
- Critical for accurate financial calculations

### 6. **Idempotency**

- Transaction deduplication using idempotency keys
- Redis-backed for performance
- Prevents duplicate charges on retries

### 7. **FX Rate Management**

- Multi-provider strategy (primary + fallback)
- Redis caching with TTL

---

## 📊 Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password        │
│ isVerified      │
│ role            │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │ 1:1
         │
┌────────▼────────┐          ┌──────────────────┐
│     Wallet      │──────┐   │   FxRate         │
├─────────────────┤ 1:N  │   ├──────────────────┤
│ id (PK)         │      │   │ id (PK)          │
│ userId (FK)     │      │   │ baseCurrency     │
│ status          │      │   │ targetCurrency   │
│ createdAt       │      │   │ rate             │
│ updatedAt       │      │   │ source           │
└─────────────────┘      │   │ validUntil       │
                         │   │ createdAt        │
                         │   └──────────────────┘
         ┌───────────────┘
         │
┌────────▼──────────┐
│  WalletBalance    │
├───────────────────┤
│ id (PK)           │
│ walletId (FK)     │
│ currency          │
│ balance (DECIMAL) │
│ lockedBalance     │
│ createdAt         │
│ updatedAt         │
└────────┬──────────┘
         │ 1:N
         │
┌────────▼──────────┐
│   Transaction     │
├───────────────────┤
│ id (PK)           │
│ walletId (FK)     │
│ userId (FK)       │
│ type              │
│ fromCurrency      │
│ toCurrency        │
│ fromAmount        │
│ toAmount          │
│ rate              │
│ fee               │
│ status            │
│ idempotencyKey    │
│ metadata (JSON)   │
│ createdAt         │
│ completedAt       │
└───────────────────┘
```

### Supported Currencies

- NGN (Nigerian Naira) - Base currency
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- And more via ExchangeRate API integration

### Key Indexes

```sql
-- Optimized for user lookups
CREATE INDEX idx_user_email ON users(email);

-- Fast wallet access
CREATE INDEX idx_wallet_user_id ON wallets(user_id);

-- Transaction queries
CREATE INDEX idx_transaction_user_id ON transactions(user_id);
CREATE INDEX idx_transaction_idempotency ON transactions(idempotency_key)
  WHERE status = 'COMPLETED';

-- FX rate lookups
CREATE INDEX idx_fx_rate_pair ON fx_rates(base_currency, target_currency);
```

---

## 🔐 Security Features

### Authentication & Authorization

1. **Email Verification**
   - OTP sent to email on registration
   - Email must be verified before trading operations
   - Resend functionality with expiration

2. **JWT Tokens**
   - Access tokens with 1-day expiration
   - Refresh token support (7 days)
   - Secure token validation on every request

3. **Role-Based Access Control (RBAC)**
   - **USER**: Standard trading operations
   - **ADMIN**: Full system access & user management
   - **SUPPORT**: User support & transaction investigation

4. **Guards**
   - **JwtAuthGuard**: Validates JWT tokens
   - **EmailVerifiedGuard**: Ensures email is verified
   - **RolesGuard**: Enforces role-based access
   - **RateLimitGuard**: Prevents API abuse

### Input Validation

- **Zod Schemas**: All DTOs validated with Zod
- **Type Safety**: TypeScript for compile-time checking
- **Custom Validators**: Business logic validation (balance checks, currency rules)

### Data Protection

- **Password Hashing**: bcryptjs with salting
- **JSON Metadata**: Encrypted when sensitive
- **Audit Fields**: createdAt, updatedAt timestamps
- **Soft Deletes**: Logical deletion for audit trails

### Rate Limiting

```typescript
// Global: 100 requests per 60 seconds
@RateLimit({ ttl: 60, limit: 100 })

// Per-endpoint: Configurable limits
@RateLimit({ ttl: 60, limit: 10 })
async fundWallet() { ... }
```

### Idempotency

All state-changing operations are idempotent:

- Duplicate requests with same `idempotencyKey` return cached result
- Prevents double-charging or duplicate transfers
- 24-hour idempotency key TTL

---

## 🧪 Running Tests

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# E2E tests
pnpm run test:e2e

# Coverage report
pnpm run test:cov
```

### Key Test Areas

The application includes tests for:

- Authentication flows (registration, login, verification)
- Wallet operations (funding, withdrawals, transfers)
- Currency conversions with rate calculations
- Idempotency handling
- Input validation
- Error scenarios

---

## 📁 Project Structure

### Core Modules

#### **auth/** - Authentication

- Register, login, email verification
- OTP generation and validation
- JWT token management
- Password hashing and validation

#### **users/** - User Management

- User profile endpoints
- Admin user listing
- User preferences

#### **wallets/** - Wallet Management

- Multi-currency wallet support
- Balance tracking
- Fund/withdraw operations
- Currency conversion
- Inter-user transfers

#### **transactions/** - Transaction History

- Transaction logging
- Status tracking (PENDING, COMPLETED, FAILED)
- User transaction queries
- Transaction details retrieval

#### **fx/** - Foreign Exchange

- Real-time exchange rates
- Rate provider integration
- Rate caching
- Fallback provider support

#### **notifications/** - Notifications

- Email service integration (Brevo/Sendinblue)
- OTP delivery
- Transaction confirmations

#### **health/** - Health Checks

- Service availability checks
- Database connectivity
- Redis connectivity
- Dependency health status

### Common Utilities

#### **decorators/**

- `@CurrentUser()` - Extract authenticated user
- `@Roles()` - Specify required roles
- `@Public()` - Mark endpoint as public
- `@RateLimit()` - Set rate limits
- `@Idempotent()` - Mark as idempotent operation

#### **guards/**

- JWT validation and token extraction
- Email verification checks
- Role-based authorization
- Rate limit enforcement

#### **interceptors/**

- Response transformation
- Request logging
- Response caching
- Error handling

#### **pipes/**

- Zod schema validation
- Custom validation pipes
- Type transformation

#### **exceptions/**

- Custom exception classes
- Standardized error responses
- HTTP status mapping

#### **enums/**

- Currency codes
- User roles
- Transaction types & statuses
- Wallet statuses

#### **utils/**

- Cryptographic utilities
- Decimal precision operations
- Idempotency utilities
- Retry logic helpers

---

## 🚀 Running the Application

### Development

```bash
# Terminal 1: Start PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:14

# Terminal 2: Start Redis
docker run --name redis -p 6379:6379 redis:7

# Terminal 3: Run migrations & start dev server
pnpm run start:dev
```

### Production

```bash
# Build
pnpm run build

# Start
NODE_ENV=production pnpm run start:prod
```

---

## 📖 Additional Documentation

For detailed architectural information, design patterns, and implementation details, see:

- **[Swagger Documentation](SWAGGER_DOCUMENTATION_UPDATES.md)** - Detailed API endpoint documentation

- **[Architecture Diagrams](ARCHITECTURE_DIAGRAMS.md)** - Visual flow diagrams for trading, authentication, and system components

---

## 📚 Documentation Map

### For Getting Started

1. **Start here**: [README.md](README.md) ← You are here
2. **Try the API**: Swagger UI at http://localhost:3000/api/docs

### For Understanding the System

1. **Architecture overview**: [README.md - Architecture Overview](#architecture-overview)

2. **Visual diagrams**: [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)

### For Integration & Development

1. **API reference**: [SWAGGER_DOCUMENTATION_UPDATES.md](SWAGGER_DOCUMENTATION_UPDATES.md)
2. **Code structure**: [README.md - Project Structure](#project-structure)
3. **Security details**: [README.md - Security Features](#security-features)

### For Deployment

1. **Quick setup**: [SETUP_GUIDE.md - Local Development Setup](SETUP_GUIDE.md#local-development-setup)
2. **Docker setup**: [SETUP_GUIDE.md - Docker Setup](SETUP_GUIDE.md#docker-setup-recommended)
3. **Production deployment**: [SETUP_GUIDE.md - Production Deployment](SETUP_GUIDE.md#production-deployment)

### For Troubleshooting

1. **Common issues**: [SETUP_GUIDE.md - Troubleshooting](SETUP_GUIDE.md#troubleshooting)
2. **Error handling**: [ARCHITECTURE_DIAGRAMS.md - Error Handling Flow](ARCHITECTURE_DIAGRAMS.md#error-handling-flow)

---

## 🔄 Development Workflow

### Making Changes

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following the code structure
3. Run tests: `pnpm run test`
4. Lint code: `pnpm run lint`
5. Format code: `pnpm run format`
6. Commit with descriptive message
7. Create pull request

### Code Quality

```bash
# Format code
pnpm run format

# Lint and fix
pnpm run lint

# Run all tests
pnpm run test && pnpm run test:e2e
```

---

## ⚙️ Configuration Management

All configuration is environment-based:

| Variable       | Description           | Default     |
| -------------- | --------------------- | ----------- |
| PORT           | Server port           | 3000        |
| NODE_ENV       | Environment           | development |
| DATABASE_URL   | PostgreSQL connection | Required    |
| JWT_SECRET     | JWT signing key       | Required    |
| JWT_EXPIRES_IN | Token expiration      | 1d          |
| REDIS_URL      | Redis connection      | Optional    |
| BREVO_API_KEY  | Email service API key | Required    |

---

## 📝 License

This project is private and proprietary.

---

## 🤝 Support

For issues, feature requests, or questions:

1. Check existing documentation
2. Review architecture document for design decisions
3. Check error logs and API responses
4. Contact development team

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing (`pnpm run test:e2e`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Redis connection verified
- [ ] SSL certificates configured
- [ ] Rate limits tuned for production
- [ ] JWT secrets strong and unique
- [ ] Logging and monitoring configured
- [ ] Error tracking (Sentry, etc.) enabled
- [ ] Backup strategy implemented
