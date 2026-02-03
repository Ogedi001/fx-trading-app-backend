# FX Trading App - Software Architecture Document

## 1. System Overview

### 1.1 Purpose
A production-grade backend system for an FX trading application enabling users to trade currencies (NGN and international currencies) with real-time rates, secure wallet management, and comprehensive transaction tracking.

### 1.2 Key Principles
- **Domain-Driven Design (DDD)**: Clear separation of business domains
- **SOLID Principles**: Object-oriented design for maintainability
- **Hexagonal Architecture**: Infrastructure independence through adapters
- **CQRS Pattern**: Separation of read/write operations where beneficial
- **Fail-Safe Mechanisms**: Graceful degradation and comprehensive error handling

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│                    (Mobile/Web Apps, APIs)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     API Gateway Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │  Wallet  │  │    FX    │  │  Trans.  │       │
│  │Controller│  │Controller│  │Controller│  │Controller│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  Guards | Interceptors | Pipes | Filters                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Application Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Domain Services                              │  │
│  │  • AuthService  • WalletService  • FxService              │  │
│  │  • TransactionService  • OtpService                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Use Cases / Commands                         │  │
│  │  • RegisterUser  • FundWallet  • ConvertCurrency          │  │
│  │  • ExecuteTrade  • VerifyEmail                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Domain Layer                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Domain Entities                              │  │
│  │  • User  • Wallet  • WalletBalance  • Transaction         │  │
│  │  • FxRate  • OtpToken                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Domain Logic                                 │  │
│  │  • Balance calculation  • Rate conversion                 │  │
│  │  • Transaction validation  • Currency rules               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Repository Interfaces                        │  │
│  │  • IUserRepository  • IWalletRepository                   │  │
│  │  • ITransactionRepository  • IFxRateRepository            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  Infrastructure Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  TypeORM     │  │   Redis      │  │  External    │         │
│  │ Repositories │  │   Cache      │  │   APIs       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Mail        │  │  Queue       │  │  Logging     │         │
│  │  Adapter     │  │  (BullMQ)    │  │  (Winston)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Data Layer                                    │
│            PostgreSQL (Primary Database)                         │
│            Redis (Cache & Session Store)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Architecture Components

### 3.1 Module Structure (Enhanced)

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
│
├── common/                          # Shared utilities
│   ├── base/
│   │   ├── base.entity.ts           # Base entity with audit fields
│   │   ├── base.repository.ts       # Generic repository pattern
│   │   └── base.service.ts          # Base service with common methods
│   ├── constants/
│   │   ├── app.constants.ts         # Application-wide constants
│   │   ├── error-codes.ts           # Standardized error codes
│   │   └── rate-limits.ts           # Rate limiting configurations
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   ├── idempotent.decorator.ts
│   │   └── rate-limit.decorator.ts
│   ├── enums/
│   │   ├── currency.enum.ts
│   │   ├── transaction-status.enum.ts
│   │   ├── transaction-type.enum.ts
│   │   ├── user-role.enum.ts
│   │   └── wallet-status.enum.ts
│   ├── exceptions/
│   │   ├── business.exception.ts
│   │   ├── insufficient-balance.exception.ts
│   │   ├── invalid-rate.exception.ts
│   │   └── wallet-locked.exception.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   ├── business-exception.filter.ts
│   │   └── all-exceptions.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── email-verified.guard.ts
│   │   └── rate-limit.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   ├── transform.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── cache.interceptor.ts
│   ├── pipes/
│   │   ├── zod-validation.pipe.ts
│   │   └── parse-currency.pipe.ts
│   └── utils/
│       ├── currency.util.ts         # Currency formatting/parsing
│       ├── decimal.util.ts          # Precise decimal operations
│       ├── idempotency.util.ts
│       └── retry.util.ts
│
├── config/                          # Configuration management
│   ├── app.config.ts
│   ├── db.config.ts
│   ├── fx.config.ts
│   ├── mail.config.ts
│   ├── redis.config.ts
│   ├── queue.config.ts
│   ├── jwt.config.ts
│   └── validation.schema.ts         # Joi/Zod schemas for env validation
│
├── database/
│   ├── data-source.ts
│   ├── migrations/
│   ├── seeds/                       # Database seeders
│   └── factories/                   # Test data factories
│
├── infrastructure/                  # External integrations
│   ├── fx-api/
│   │   ├── interfaces/
│   │   │   └── fx-api.interface.ts
│   │   ├── fx-api.adapter.ts        # Primary adapter
│   │   ├── exchangerate-api.provider.ts
│   │   ├── currencyapi.provider.ts  # Fallback provider
│   │   └── fx-api.module.ts
│   ├── mail/
│   │   ├── interfaces/
│   │   │   └── mail.interface.ts
│   │   ├── mail.adapter.ts
│   │   ├── smtp.provider.ts
│   │   ├── templates/               # Email templates
│   │   │   ├── otp-verification.hbs
│   │   │   ├── welcome.hbs
│   │   │   └── transaction-alert.hbs
│   │   └── mail.module.ts
│   ├── redis/
│   │   ├── redis.service.ts
│   │   └── redis.module.ts
│   ├── queue/
│   │   ├── queue.module.ts
│   │   ├── processors/
│   │   │   ├── email.processor.ts
│   │   │   ├── fx-rate-sync.processor.ts
│   │   │   └── transaction-reconciliation.processor.ts
│   │   └── producers/
│   │       ├── email.producer.ts
│   │       └── fx-rate.producer.ts
│   └── logging/
│       ├── logger.service.ts
│       └── logger.module.ts
│
└── modules/                         # Business modules
    │
    ├── auth/
    │   ├── auth.module.ts
    │   ├── controllers/
    │   │   └── auth.controller.ts
    │   ├── dto/
    │   │   ├── register.dto.ts
    │   │   ├── verify-otp.dto.ts
    │   │   ├── login.dto.ts
    │   │   └── refresh-token.dto.ts
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts
    │   │   └── local-auth.guard.ts
    │   ├── strategies/
    │   │   ├── jwt.strategy.ts
    │   │   └── local.strategy.ts
    │   ├── services/
    │   │   ├── auth.service.ts
    │   │   └── token.service.ts
    │   └── interfaces/
    │       ├── jwt-payload.interface.ts
    │       └── authenticated-request.interface.ts
    │
    ├── users/
    │   ├── users.module.ts
    │   ├── controllers/
    │   │   └── users.controller.ts
    │   ├── entities/
    │   │   └── user.entity.ts
    │   ├── dto/
    │   │   ├── create-user.dto.ts
    │   │   ├── update-user.dto.ts
    │   │   └── user-response.dto.ts
    │   ├── repositories/
    │   │   ├── user.repository.interface.ts
    │   │   └── user.repository.ts
    │   ├── services/
    │   │   ├── users.service.ts
    │   │   └── user-validation.service.ts
    │   └── domain/
    │       └── user.domain.ts         # Business logic
    │
    ├── wallets/
    │   ├── wallets.module.ts
    │   ├── controllers/
    │   │   └── wallets.controller.ts
    │   ├── entities/
    │   │   ├── wallet.entity.ts
    │   │   └── wallet-balance.entity.ts
    │   ├── dto/
    │   │   ├── fund-wallet.dto.ts
    │   │   ├── convert-currency.dto.ts
    │   │   ├── trade-currency.dto.ts
    │   │   └── wallet-balance-response.dto.ts
    │   ├── repositories/
    │   │   ├── wallet.repository.interface.ts
    │   │   ├── wallet.repository.ts
    │   │   └── wallet-balance.repository.ts
    │   ├── services/
    │   │   ├── wallets.service.ts
    │   │   ├── balance.service.ts
    │   │   ├── conversion.service.ts
    │   │   └── wallet-lock.service.ts  # Distributed locking
    │   ├── domain/
    │   │   ├── wallet.domain.ts
    │   │   └── balance-calculator.ts
    │   └── events/
    │       ├── wallet-funded.event.ts
    │       ├── conversion-completed.event.ts
    │       └── balance-updated.event.ts
    │
    ├── transactions/
    │   ├── transactions.module.ts
    │   ├── controllers/
    │   │   └── transactions.controller.ts
    │   ├── entities/
    │   │   └── transaction.entity.ts
    │   ├── dto/
    │   │   ├── transaction-query.dto.ts
    │   │   └── transaction-response.dto.ts
    │   ├── repositories/
    │   │   ├── transaction.repository.interface.ts
    │   │   └── transaction.repository.ts
    │   ├── services/
    │   │   ├── transactions.service.ts
    │   │   ├── transaction-recorder.service.ts
    │   │   └── idempotency.service.ts
    │   ├── domain/
    │   │   └── transaction.domain.ts
    │   └── strategies/
    │       ├── funding-strategy.ts
    │       ├── conversion-strategy.ts
    │       └── trade-strategy.ts
    │
    ├── fx/
    │   ├── fx.module.ts
    │   ├── controllers/
    │   │   └── fx.controller.ts
    │   ├── entities/
    │   │   └── fx-rate.entity.ts
    │   ├── dto/
    │   │   ├── fx-rate-query.dto.ts
    │   │   └── fx-rate-response.dto.ts
    │   ├── repositories/
    │   │   ├── fx-rate.repository.interface.ts
    │   │   └── fx-rate.repository.ts
    │   ├── services/
    │   │   ├── fx.service.ts
    │   │   ├── fx-rate-sync.service.ts    # Background sync
    │   │   ├── fx-rate-cache.service.ts
    │   │   └── fx-calculation.service.ts
    │   ├── domain/
    │   │   ├── fx-rate.domain.ts
    │   │   └── rate-validator.ts
    │   └── jobs/
    │       └── sync-fx-rates.job.ts
    │
    ├── notifications/
    │   ├── notifications.module.ts
    │   ├── services/
    │   │   ├── mail.service.ts
    │   │   ├── otp.service.ts
    │   │   ├── notification.service.ts
    │   │   └── notification-queue.service.ts
    │   ├── dto/
    │   │   ├── send-otp.dto.ts
    │   │   └── verify-otp.dto.ts
    │   ├── entities/
    │   │   └── otp-token.entity.ts
    │   └── repositories/
    │       └── otp-token.repository.ts
    │
    └── analytics/ (BONUS)
        ├── analytics.module.ts
        ├── controllers/
        │   └── analytics.controller.ts
        ├── services/
        │   ├── analytics.service.ts
        │   ├── trade-metrics.service.ts
        │   └── user-activity.service.ts
        └── dto/
            ├── analytics-query.dto.ts
            └── analytics-response.dto.ts
```

---

## 4. Core Design Patterns & Principles

### 4.1 Repository Pattern
```typescript
// Interface (Domain Layer)
export interface IWalletRepository {
  findByUserId(userId: string): Promise<Wallet>;
  save(wallet: Wallet): Promise<Wallet>;
  lockForUpdate(walletId: string): Promise<Wallet>;
}

// Implementation (Infrastructure Layer)
@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repository: Repository<Wallet>,
  ) {}
  
  async lockForUpdate(walletId: string): Promise<Wallet> {
    return this.repository
      .createQueryBuilder('wallet')
      .where('wallet.id = :walletId', { walletId })
      .setLock('pessimistic_write')
      .getOne();
  }
}
```

### 4.2 Service Layer Pattern (Separation of Concerns)
```typescript
// Domain Service (Business Logic)
@Injectable()
export class ConversionService {
  async calculateConversion(
    amount: Decimal,
    fromCurrency: Currency,
    toCurrency: Currency,
    rate: Decimal
  ): ConversionResult {
    // Pure business logic
  }
}

// Application Service (Orchestration)
@Injectable()
export class WalletsService {
  constructor(
    private readonly walletRepository: IWalletRepository,
    private readonly conversionService: ConversionService,
    private readonly fxService: FxService,
    private readonly transactionService: TransactionsService,
    private readonly lockService: WalletLockService,
  ) {}

  async convertCurrency(dto: ConvertCurrencyDto): Promise<Transaction> {
    // Orchestrates the conversion process
  }
}
```

### 4.3 Strategy Pattern (Transaction Types)
```typescript
export interface TransactionStrategy {
  execute(context: TransactionContext): Promise<Transaction>;
  validate(context: TransactionContext): Promise<void>;
}

@Injectable()
export class ConversionStrategy implements TransactionStrategy {
  async execute(context: TransactionContext): Promise<Transaction> {
    // Conversion-specific logic
  }
}

@Injectable()
export class FundingStrategy implements TransactionStrategy {
  async execute(context: TransactionContext): Promise<Transaction> {
    // Funding-specific logic
  }
}
```

### 4.4 Adapter Pattern (External Services)
```typescript
export interface IFxApiAdapter {
  getRate(from: Currency, to: Currency): Promise<FxRate>;
  getRates(base: Currency): Promise<Map<Currency, FxRate>>;
}

@Injectable()
export class FxApiAdapter implements IFxApiAdapter {
  constructor(
    private readonly primaryProvider: ExchangeRateApiProvider,
    private readonly fallbackProvider: CurrencyApiProvider,
  ) {}

  async getRate(from: Currency, to: Currency): Promise<FxRate> {
    try {
      return await this.primaryProvider.getRate(from, to);
    } catch (error) {
      // Fallback to secondary provider
      return await this.fallbackProvider.getRate(from, to);
    }
  }
}
```

### 4.5 Event-Driven Architecture
```typescript
// Event
export class WalletFundedEvent {
  constructor(
    public readonly walletId: string,
    public readonly amount: Decimal,
    public readonly currency: Currency,
    public readonly timestamp: Date,
  ) {}
}

// Event Emitter
@Injectable()
export class WalletsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async fundWallet(dto: FundWalletDto): Promise<Wallet> {
    // ... funding logic
    
    this.eventEmitter.emit(
      'wallet.funded',
      new WalletFundedEvent(wallet.id, dto.amount, dto.currency, new Date())
    );
  }
}

// Event Handler
@Injectable()
export class WalletEventHandler {
  @OnEvent('wallet.funded')
  async handleWalletFunded(event: WalletFundedEvent) {
    // Send notification, update analytics, etc.
  }
}
```

---

## 5. Data Model Design

### 5.1 Entity Relationship Diagram

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

### 5.2 Key Database Considerations

**Decimal Precision:**
```typescript
@Column('decimal', { precision: 20, scale: 8 })
balance: number; // Store as string/Decimal in code
```

**Indexes:**
```typescript
@Index(['userId', 'currency'])
@Index(['status', 'createdAt'])
@Index(['idempotencyKey'], { unique: true })
```

**Constraints:**
```typescript
@Check(`balance >= 0`)
@Check(`locked_balance >= 0`)
@Check(`balance >= locked_balance`)
```

---

## 6. Critical Business Logic

### 6.1 Currency Conversion Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Conversion Request                         │
└───────────────────────────┬──────────────────────────────────┘
                            │
                ┌───────────▼──────────┐
                │  Validate Request    │
                │  - Amount > 0        │
                │  - Valid currencies  │
                │  - User verified     │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Check Idempotency   │
                │  - Duplicate check   │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Acquire Lock        │
                │  (Redis distributed) │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Get FX Rate         │
                │  - From cache/DB     │
                │  - Validate freshness│
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Begin Transaction   │
                │  (DB Transaction)    │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Lock Wallet         │
                │  (SELECT FOR UPDATE) │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Check Balance       │
                │  - Sufficient funds  │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Calculate Amounts   │
                │  - Apply rate        │
                │  - Calculate fees    │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Update Balances     │
                │  - Deduct source     │
                │  - Credit target     │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Record Transaction  │
                │  - All details       │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Commit Transaction  │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Release Lock        │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Emit Events         │
                │  - Notifications     │
                │  - Analytics         │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Return Response     │
                └──────────────────────┘
```

### 6.2 Race Condition Prevention

**Multi-Layer Locking Strategy:**

1. **Application Level (Redis):**
```typescript
async convertCurrency(dto: ConvertCurrencyDto): Promise<Transaction> {
  const lockKey = `wallet:lock:${dto.userId}`;
  const lock = await this.lockService.acquireLock(lockKey, 5000);
  
  try {
    // Process conversion
  } finally {
    await lock.release();
  }
}
```

2. **Database Level (Pessimistic Locking):**
```typescript
async lockWalletForUpdate(walletId: string): Promise<Wallet> {
  return this.walletRepository
    .createQueryBuilder('wallet')
    .setLock('pessimistic_write')
    .where('id = :walletId', { walletId })
    .getOne();
}
```

3. **Transaction Isolation:**
```typescript
await this.dataSource.transaction(
  'SERIALIZABLE',
  async (manager) => {
    // All operations here
  }
);
```

### 6.3 Idempotency Implementation

```typescript
@Injectable()
export class IdempotencyService {
  async processWithIdempotency<T>(
    key: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    // Check if operation already completed
    const cached = await this.redis.get(`idempotency:${key}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Execute operation
    const result = await operation();

    // Cache result
    await this.redis.setex(
      `idempotency:${key}`,
      86400, // 24 hours
      JSON.stringify(result),
    );

    return result;
  }
}
```

---

## 7. External Service Integration

### 7.1 FX Rate Management

**Multi-Provider Strategy with Fallback:**

```typescript
@Injectable()
export class FxRateSyncService {
  private providers: IFxProvider[] = [
    new ExchangeRateApiProvider(),
    new CurrencyApiProvider(),
    new FixerApiProvider(),
  ];

  async syncRates(): Promise<void> {
    for (const provider of this.providers) {
      try {
        const rates = await provider.getAllRates('NGN');
        await this.cacheRates(rates);
        await this.persistRates(rates);
        return; // Success
      } catch (error) {
        this.logger.warn(`Provider ${provider.name} failed`, error);
        continue; // Try next provider
      }
    }
    
    throw new Error('All FX providers failed');
  }

  private async cacheRates(rates: FxRate[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    rates.forEach(rate => {
      pipeline.setex(
        `fx:${rate.from}:${rate.to}`,
        300, // 5 minutes
        JSON.stringify(rate),
      );
    });
    await pipeline.exec();
  }
}
```

**Rate Staleness Detection:**

```typescript
async getRateWithFreshness(
  from: Currency,
  to: Currency,
): Promise<FxRate> {
  const rate = await this.getFxRate(from, to);
  
  const age = Date.now() - rate.fetchedAt.getTime();
  const maxAge = 300000; // 5 minutes
  
  if (age > maxAge) {
    // Trigger background refresh
    this.eventEmitter.emit('fx.rate.stale', { from, to });
    
    // Still return cached rate for performance
    // but warn about staleness
    this.logger.warn(`Using stale rate: ${from}/${to}`);
  }
  
  return rate;
}
```

### 7.2 Email Service with Queue

```typescript
@Injectable()
export class EmailProducer {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
  ) {}

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    await this.emailQueue.add(
      'send-otp',
      { email, otp },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
      },
    );
  }
}

@Processor('email')
export class EmailProcessor {
  @Process('send-otp')
  async handleOtpEmail(job: Job<{ email: string; otp: string }>) {
    const { email, otp } = job.data;
    await this.mailAdapter.send({
      to: email,
      subject: 'Verify Your Email',
      template: 'otp-verification',
      context: { otp },
    });
  }
}
```

---

## 8. Security Architecture

### 8.1 Authentication Flow

```
┌──────────────┐
│   Register   │
└──────┬───────┘
       │
┌──────▼───────┐
│  Send OTP    │
└──────┬───────┘
       │
┌──────▼───────┐
│  Verify OTP  │
└──────┬───────┘
       │
┌──────▼───────┐
│    Login     │
└──────┬───────┘
       │
┌──────▼────────────────┐
│  Issue JWT Tokens     │
│  - Access Token (15m) │
│  - Refresh Token (7d) │
└──────┬────────────────┘
       │
┌──────▼───────┐
│ Access API   │
└──────────────┘
```

### 8.2 Authorization Layers

```typescript
// 1. JWT Guard
@UseGuards(JwtAuthGuard)

// 2. Email Verification Guard
@UseGuards(EmailVerifiedGuard)

// 3. Role Guard
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)

// 4. Rate Limiting
@RateLimit({ ttl: 60, limit: 10 })
```

### 8.3 Input Validation (Zod)

```typescript
export const ConvertCurrencySchema = z.object({
  fromCurrency: z.nativeEnum(Currency),
  toCurrency: z.nativeEnum(Currency),
  amount: z
    .number()
    .positive()
    .max(1000000)
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val.toString())),
  idempotencyKey: z.string().uuid(),
});

@Post('convert')
@UsePipes(new ZodValidationPipe(ConvertCurrencySchema))
async convert(@Body() dto: ConvertCurrencyDto) {
  // Validated data
}
```

---

## 9. Performance Optimization

### 9.1 Caching Strategy

**Multi-Level Cache:**

```
┌─────────────────────────────────────┐
│         Application Cache           │
│      (In-Memory - Node Cache)       │
│           TTL: 30 seconds           │
└──────────────┬──────────────────────┘
               │ Miss
┌──────────────▼──────────────────────┐
│          Redis Cache                │
│     (Distributed - Redis)           │
│           TTL: 5 minutes            │
└──────────────┬──────────────────────┘
               │ Miss
┌──────────────▼──────────────────────┐
│         Database Query              │
│      (PostgreSQL - Source)          │
└─────────────────────────────────────┘
```

**Implementation:**

```typescript
@Injectable()
export class FxRateCacheService {
  private memoryCache = new NodeCache({ stdTTL: 30 });

  async getRate(from: Currency, to: Currency): Promise<FxRate> {
    // L1: Memory cache
    const memKey = `${from}:${to}`;
    let rate = this.memoryCache.get<FxRate>(memKey);
    if (rate) return rate;

    // L2: Redis cache
    const redisKey = `fx:${from}:${to}`;
    const cached = await this.redis.get(redisKey);
    if (cached) {
      rate = JSON.parse(cached);
      this.memoryCache.set(memKey, rate);
      return rate;
    }

    // L3: Database
    rate = await this.fxRateRepository.findRate(from, to);
    
    // Populate caches
    await this.redis.setex(redisKey, 300, JSON.stringify(rate));
    this.memoryCache.set(memKey, rate);
    
    return rate;
  }
}
```

### 9.2 Database Optimization

**Indexes:**
```sql
CREATE INDEX idx_wallet_user ON wallets(user_id);
CREATE INDEX idx_wallet_balance_currency ON wallet_balances(wallet_id, currency);
CREATE INDEX idx_transaction_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transaction_idempotency ON transactions(idempotency_key) WHERE status = 'COMPLETED';
CREATE INDEX idx_fx_rate_pair ON fx_rates(base_currency, target_currency, created_at DESC);
```

**Query Optimization:**
```typescript
// Use projections
async getUserWalletSummary(userId: string) {
  return this.walletRepository
    .createQueryBuilder('w')
    .select(['w.id', 'w.status'])
    .leftJoinAndSelect('w.balances', 'b')
    .where('w.userId = :userId', { userId })
    .getOne();
}

// Pagination
async getTransactions(userId: string, page: number, limit: number) {
  return this.transactionRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
}
```

### 9.3 Connection Pooling

```typescript
// database/data-source.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  // ...
  extra: {
    max: 20, // Maximum pool size
    min: 5,  // Minimum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});
```

---

## 10. Error Handling & Resilience

### 10.1 Error Hierarchy

```typescript
// Base exception
export class BusinessException extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
  }
}

// Domain-specific exceptions
export class InsufficientBalanceException extends BusinessException {
  constructor(currency: Currency, available: Decimal, required: Decimal) {
    super(
      'INSUFFICIENT_BALANCE',
      `Insufficient ${currency} balance. Available: ${available}, Required: ${required}`,
      400,
    );
  }
}

export class InvalidFxRateException extends BusinessException {
  constructor(from: Currency, to: Currency) {
    super(
      'INVALID_FX_RATE',
      `No valid FX rate available for ${from}/${to}`,
      503,
    );
  }
}

export class WalletLockedException extends BusinessException {
  constructor(walletId: string) {
    super(
      'WALLET_LOCKED',
      `Wallet ${walletId} is currently locked`,
      423,
    );
  }
}
```

### 10.2 Global Exception Filter

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof BusinessException) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    // Log error
    this.logger.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception,
    });

    response.status(status).json({
      success: false,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 10.3 Circuit Breaker Pattern

```typescript
@Injectable()
export class FxApiAdapter {
  private circuitBreaker = new CircuitBreaker(this.callApi.bind(this), {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  });

  async getRate(from: Currency, to: Currency): Promise<FxRate> {
    try {
      return await this.circuitBreaker.fire(from, to);
    } catch (error) {
      // Fallback to cached rate
      return this.getCachedRate(from, to);
    }
  }

  private async callApi(from: Currency, to: Currency): Promise<FxRate> {
    // Actual API call
  }
}
```

---

## 11. Monitoring & Observability

### 11.1 Logging Strategy

```typescript
@Injectable()
export class LoggerService {
  private logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

  logTransaction(transaction: Transaction) {
    this.logger.info('Transaction completed', {
      transactionId: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.fromAmount,
      currency: transaction.fromCurrency,
      status: transaction.status,
    });
  }

  logFxRateUsage(from: Currency, to: Currency, rate: Decimal) {
    this.logger.info('FX rate used', { from, to, rate });
  }
}
```

### 11.2 Health Checks

```typescript
@Controller('health')
export class HealthController {
  @Get()
  async check(): Promise<HealthCheckResult> {
    return {
      status: 'ok',
      timestamp: new Date(),
      checks: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        fxApi: await this.checkFxApi(),
      },
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'up', latency: 5 };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }
}
```

### 11.3 Metrics Collection

```typescript
@Injectable()
export class MetricsService {
  private readonly conversionCounter = new Counter({
    name: 'currency_conversions_total',
    help: 'Total number of currency conversions',
    labelNames: ['from_currency', 'to_currency', 'status'],
  });

  private readonly conversionDuration = new Histogram({
    name: 'currency_conversion_duration_seconds',
    help: 'Duration of currency conversion operations',
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  recordConversion(from: Currency, to: Currency, duration: number, status: string) {
    this.conversionCounter.inc({ from_currency: from, to_currency: to, status });
    this.conversionDuration.observe(duration / 1000);
  }
}
```

---

## 12. Testing Strategy

### 12.1 Test Pyramid

```
         ┌─────────┐
         │   E2E   │  (10% - Full integration)
         ├─────────┤
         │  Integ  │  (20% - Module integration)
      ┌──┴─────────┴──┐
      │     Unit      │  (70% - Business logic)
      └───────────────┘
```

### 12.2 Unit Test Example

```typescript
describe('ConversionService', () => {
  let service: ConversionService;

  beforeEach(() => {
    service = new ConversionService();
  });

  describe('calculateConversion', () => {
    it('should correctly convert NGN to USD', () => {
      const result = service.calculateConversion(
        new Decimal(1000),
        Currency.NGN,
        Currency.USD,
        new Decimal(0.0013),
      );

      expect(result.convertedAmount).toEqual(new Decimal(1.3));
      expect(result.fromCurrency).toBe(Currency.NGN);
      expect(result.toCurrency).toBe(Currency.USD);
    });

    it('should throw error for zero amount', () => {
      expect(() =>
        service.calculateConversion(
          new Decimal(0),
          Currency.NGN,
          Currency.USD,
          new Decimal(0.0013),
        ),
      ).toThrow(InvalidAmountException);
    });
  });
});
```

### 12.3 Integration Test Example

```typescript
describe('WalletsController (Integration)', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Setup test user and get token
    userToken = await createTestUserAndGetToken(app);
  });

  it('/wallets/convert (POST) - successful conversion', async () => {
    const response = await request(app.getHttpServer())
      .post('/wallets/convert')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        fromCurrency: 'NGN',
        toCurrency: 'USD',
        amount: 1000,
        idempotencyKey: uuid(),
      })
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        type: 'CONVERSION',
        fromCurrency: 'NGN',
        toCurrency: 'USD',
        status: 'COMPLETED',
      },
    });
  });
});
```

---

## 13. Deployment Architecture

### 13.1 Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer (ALB)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐ ┌────▼─────────┐ ┌────▼─────────┐
│   NestJS App   │ │  NestJS App  │ │  NestJS App  │
│   Instance 1   │ │  Instance 2  │ │  Instance 3  │
└───────┬────────┘ └────┬─────────┘ └────┬─────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼────────┐ ┌────▼─────────┐ ┌──▼──────────┐
│   PostgreSQL   │ │    Redis     │ │  BullMQ     │
│  (RDS Primary) │ │   (Cluster)  │ │  (Workers)  │
└───────┬────────┘ └──────────────┘ └─────────────┘
        │
┌───────▼────────┐
│   PostgreSQL   │
│ (RDS Replica)  │
│  (Read Only)   │
└────────────────┘
```

### 13.2 Environment Configuration

```
Development:
- Single instance
- SQLite/Local PostgreSQL
- Local Redis

Staging:
- 2 instances
- RDS PostgreSQL
- ElastiCache Redis
- CloudWatch monitoring

Production:
- Auto-scaling (3-10 instances)
- Multi-AZ RDS with replica
- Redis Cluster
- CloudWatch + ELK Stack
- WAF + DDoS protection
```

---

## 14. API Documentation

### 14.1 Swagger Integration

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('FX Trading API')
  .setDescription('Backend API for FX Trading Application')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('wallets', 'Wallet management')
  .addTag('fx', 'Foreign exchange rates')
  .addTag('transactions', 'Transaction history')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### 14.2 API Response Format

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
  timestamp: string;
}
```

---

## 15. Scalability Considerations

### 15.1 Horizontal Scaling

**Stateless Design:**
- No session state in application instances
- All state in Redis/Database
- JWT tokens for authentication
- Distributed locks for coordination

**Load Distribution:**
- Round-robin load balancing
- Health check-based routing
- Auto-scaling based on CPU/Memory

### 15.2 Database Scaling

**Read Replicas:**
```typescript
// Use replica for read operations
@InjectRepository(Transaction, 'read')
private readRepository: Repository<Transaction>;

@InjectRepository(Transaction, 'write')
private writeRepository: Repository<Transaction>;
```

**Sharding Strategy** (Future):
- Shard by user ID hash
- Separate hot/cold data
- Archive old transactions

### 15.3 Caching Layers

1. **Application Cache** (Node-Cache): 30 seconds
2. **Redis Cache**: 5 minutes
3. **CDN** (Static assets): 1 day
4. **Database Query Cache**: Variable TTL

---

## 16. Security Checklist

- [x] Password hashing (bcrypt)
- [x] JWT token authentication
- [x] Email verification
- [x] Rate limiting
- [x] Input validation (Zod)
- [x] SQL injection prevention (TypeORM parameterized queries)
- [x] XSS protection (helmet middleware)
- [x] CORS configuration
- [x] Request size limits
- [x] Secure headers
- [x] API key rotation
- [x] Secrets in environment variables
- [x] Database encryption at rest
- [x] TLS/SSL in transit
- [x] Audit logging
- [x] Role-based access control

---

## 17. Development Workflow

### 17.1 Git Strategy

```
main (production)
  ├── develop (staging)
  │    ├── feature/wallet-conversion
  │    ├── feature/fx-rate-sync
  │    └── bugfix/balance-calculation
  └── hotfix/critical-security-patch
```

### 17.2 CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Code   │───▶│   Lint   │───▶│   Test   │───▶│  Build   │
│   Push   │    │  ESLint  │    │   Jest   │    │  Docker  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                      ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Production│◀───│ Approval │◀───│ Staging  │◀───│  Deploy  │
│  Deploy  │    │  Manual  │    │  Deploy  │    │   Auto   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

---

## 18. Performance Benchmarks (Target)

| Metric | Target | Notes |
|--------|--------|-------|
| API Response Time (p95) | < 200ms | Excludes external API calls |
| API Response Time (p99) | < 500ms | |
| Conversion Transaction | < 1s | End-to-end |
| Concurrent Users | 10,000+ | With auto-scaling |
| Database Query Time | < 50ms | p95 |
| Cache Hit Ratio | > 90% | For FX rates |
| Throughput | 1,000 TPS | Transactions per second |

---

## 19. Future Enhancements

### Phase 2:
- [ ] WebSocket for real-time rate updates
- [ ] Mobile push notifications
- [ ] Advanced analytics dashboard
- [ ] Machine learning for fraud detection
- [ ] Multi-factor authentication (2FA)

### Phase 3:
- [ ] Trading algorithms/bots API
- [ ] Referral system
- [ ] Affiliate program
- [ ] White-label solution
- [ ] Blockchain integration

---

## 20. Key Assumptions & Decisions

### Database Choice: PostgreSQL
**Rationale:**
- ACID compliance for financial transactions
- JSON support for flexible metadata
- Excellent performance for complex queries
- Strong community and tooling

### ORM Choice: TypeORM
**Rationale:**
- Native TypeScript support
- Active development
- Good migration system
- Repository pattern support

### Caching: Redis
**Rationale:**
- In-memory performance
- Distributed locks
- Pub/Sub for events
- Session storage

### Queue: BullMQ
**Rationale:**
- Redis-based (consistency with cache)
- Retry mechanisms
- Job scheduling
- Excellent monitoring

### Decimal Handling: decimal.js
**Rationale:**
- Prevents floating-point errors
- Essential for financial calculations
- Better than native JavaScript numbers

---

## 21. Conclusion

This architecture provides a robust, scalable, and maintainable foundation for an enterprise-grade FX trading platform. The design emphasizes:

- **Correctness**: Through atomic transactions, locking, and validation
- **Performance**: Via multi-level caching and optimized queries
- **Scalability**: With stateless design and horizontal scaling
- **Maintainability**: Using clean architecture and SOLID principles
- **Security**: With comprehensive protection at all layers
- **Observability**: Through logging, metrics, and monitoring

The modular structure allows for easy extension and modification as business requirements evolve, while the comprehensive error handling and resilience patterns ensure system stability even under adverse conditions.
