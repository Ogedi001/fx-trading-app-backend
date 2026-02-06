# Swagger Documentation Updates

## Summary
Comprehensive Swagger/OpenAPI documentation has been added to all modules in the FX Trading App backend. All controllers and DTOs now include proper decorators with descriptions, examples, and response types.

## Files Updated

### Authentication Module
**Location:** `src/modules/auth/`

#### Controllers
- **[auth.controller.ts](src/modules/auth/controllers/auth.controller.ts)**
  - Added `@ApiTags('Authentication')`
  - Added `@ApiOperation` decorators to all endpoints with summary and description
  - Added `@ApiBody` decorators
  - Added `@ApiResponse` decorators with status codes and example responses
  - Endpoints documented:
    - `POST /auth/register` - Register new user
    - `POST /auth/verify-account` - Verify account with OTP
    - `POST /auth/resend-verification` - Resend verification OTP
    - `POST /auth/login` - User login with JWT token response

#### DTOs
- **[register.dto.ts](src/modules/auth/dto/register.dto.ts)**
  - Added `@ApiProperty` decorators with examples and descriptions

- **[login.dto.ts](src/modules/auth/dto/login.dto.ts)**
  - Added `@ApiProperty` decorators with examples and descriptions

- **[verify-otp.dto.ts](src/modules/auth/dto/verify-otp.dto.ts)**
  - Added `@ApiProperty` decorators with examples and descriptions

---

### Users Module
**Location:** `src/modules/users/`

#### Controllers
- **[users.controller.ts](src/modules/users/controllers/users.controller.ts)**
  - Added `@ApiTags('Users')`
  - Added `@ApiBearerAuth('access-token')`
  - Added `@ApiOperation` decorators with summary and description
  - Added `@ApiResponse` decorators with status codes and examples
  - Endpoints documented:
    - `GET /users/me` - Get current user profile
    - `GET /users` - Get all users (Admin & Support only)

---

### Wallets Module
**Location:** `src/modules/wallets/`

#### Controllers
- **[wallets.controller.ts](src/modules/wallets/controllers/wallets.controller.ts)**
  - Added `@ApiTags('Wallets')`
  - Added `@ApiBearerAuth('access-token')`
  - Added `@ApiOperation` decorators to all endpoints
  - Added `@ApiParam` and `@ApiQuery` decorators
  - Added `@ApiResponse` decorators with multiple response scenarios
  - Endpoints documented:
    - `GET /wallets/me` - Get wallet information
    - `GET /wallets/balance/:currency` - Get balance for specific currency
    - `POST /wallets/fund` - Fund wallet
    - `POST /wallets/withdraw` - Withdraw funds
    - `GET /wallets/convert` - Calculate conversion rate
    - `POST /wallets/trade` - Execute currency trade
    - `POST /wallets/transfer` - Transfer to another user

#### DTOs
- **[wallet.dto.ts](src/modules/wallets/dto/wallet.dto.ts)**
  - Added `@ApiProperty` decorators to all DTO classes:
    - `FundWalletDto`
    - `WithdrawWalletDto`
    - `ConvertDto`
    - `TransferDto`
  - Included examples and descriptions for each property
  - Enum documentation for currency fields

---

### Transactions Module
**Location:** `src/modules/transactions/`

#### Controllers
- **[transactions.controller.ts](src/modules/transactions/controllers/transactions.controller.ts)**
  - Added `@ApiTags('Transactions')`
  - Added `@ApiBearerAuth('access-token')`
  - Added `@ApiOperation` decorators with descriptions
  - Added `@ApiParam` decorators
  - Added `@ApiResponse` decorators with status codes and examples
  - Endpoints documented:
    - `GET /transactions` - Get user transactions
    - `GET /transactions/:id` - Get transaction details

---

## Documentation Features

### Standard Decorators Used
- `@ApiTags()` - Groups endpoints by module
- `@ApiBearerAuth()` - Documents JWT authentication requirement
- `@ApiOperation()` - Provides endpoint summary and description
- `@ApiResponse()` - Documents all possible responses with status codes
- `@ApiBody()` - Documents request body
- `@ApiParam()` - Documents path parameters
- `@ApiQuery()` - Documents query parameters
- `@ApiProperty()` - Documents DTO properties with types and examples

### Response Documentation
All endpoints include:
- Success response (200, 201)
- Error responses (400, 401, 403, 404, 409)
- Example payloads for each response
- Detailed descriptions of what each response means

### DTO Documentation
All DTOs include:
- Type information (enum, string, etc.)
- Example values
- Field descriptions
- Validation constraints (minLength, maxLength, format, etc.)

---

## Access Documentation
The API documentation is available at:
- **Swagger UI:** `http://localhost:3000/api/docs`
- **OpenAPI JSON:** `http://localhost:3000/api/docs-json`

## Notes
- All authentication endpoints are marked with `@Public()` decorator (no Bearer token required)
- Protected endpoints automatically include `@ApiBearerAuth('access-token')` decorator
- Role-based access control is documented in operation descriptions
- All transaction amounts are represented as strings to maintain precision
- Idempotency keys are documented for all mutation operations
