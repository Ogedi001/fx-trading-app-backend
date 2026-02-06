# FX Trading App - Architectural Diagrams

This document contains detailed flow diagrams and architectural charts for the FX Trading System. Reference the main [README.md](README.md) for general setup and API documentation.

## Table of Contents

- [Trading Flow Diagram](#trading-flow-diagram)
- [Wallet Management Flow](#wallet-management-flow)
- [Currency Exchange Flow](#currency-exchange-flow)
- [Authentication Flow](#authentication-flow)
- [System Components Diagram](#system-components-diagram)
- [Database Schema](#database-schema)
- [Error Handling Flow](#error-handling-flow)

---

## Trading Flow Diagram

### Complete Trade Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Initiates Trade                          │
│                  (POST /api/wallets/trade)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   JWT Token & Email Verification     │
        │         Guard Validation              │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │    Zod Input Validation              │
        │  (Currency, Amount, Rate Checks)     │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  Check Idempotency Key               │
        │  (Prevent Duplicate Trades)          │
        └──────────────────┬───────────────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
            ┌─────▼────┐    ┌──────▼──────┐
            │ Cached?  │    │  New Trade? │
            │ Return   │    └──────┬───────┘
            └──────────┘           │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Fetch Current FX Rate        │
                    │ (Redis Cache or API Call)    │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Calculate Conversion         │
                    │ Using decimal.js             │
                    │ Calculate Fees               │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Lock Source Wallet (Pessimistic)
                    │ Verify Sufficient Balance    │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
              ┌─────▼──────┐          ┌──────────▼────┐
              │Insufficient│          │   Balance OK  │
              │   Balance  │          └──────┬────────┘
              │  (Fail)    │                 │
              └────────────┘                 ▼
                                  ┌──────────────────────┐
                                  │ Lock Target Wallet   │
                                  │ (Pessimistic Lock)   │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ Deduct from Source   │
                                  │ Add to Target        │
                                  │ (Atomic Transaction) │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ Create Transaction   │
                                  │ Record (Status:      │
                                  │ COMPLETED)           │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ Emit Wallet.Traded   │
                                  │ Event                │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │ Return Success       │
                                  │ Response with        │
                                  │ Transaction Details  │
                                  └──────────────────────┘
```

---

## Wallet Management Flow

### Fund Wallet Operation

```
┌──────────────────────────────────────────────┐
│    User Funds Wallet                         │
│  (POST /api/wallets/fund)                    │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  Validate JWT & Email      │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  Validate Input            │
    │  - Amount                  │
    │  - Currency                │
    │  - Idempotency Key         │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  Check Idempotency Cache   │
    └────────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    ┌───▼──┐      ┌──────▼─────┐
    │Found │      │  Not Found  │
    └──────┘      └──────┬──────┘
                         │
                         ▼
              ┌──────────────────┐
              │ Lock Wallet      │
              │ (Pessimistic)    │
              └──────┬───────────┘
                     │
                     ▼
              ┌──────────────────┐
              │ Update Balance   │
              │ Add Funds        │
              └──────┬───────────┘
                     │
                     ▼
              ┌──────────────────┐
              │ Create Transaction
              │ Record           │
              └──────┬───────────┘
                     │
                     ▼
              ┌──────────────────┐
              │ Cache Result     │
              │ (24hr TTL)       │  (planned)
              └──────┬───────────┘
                     │
                     ▼
              ┌──────────────────┐
              │ Return Success   │
              └──────────────────┘
```

### Withdrawal Operation

```
┌──────────────────────────────────────┐
│    User Withdraws Funds              │
│  (POST /api/wallets/withdraw)        │
└────────────┬────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Authentication &   │
    │ Input Validation   │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Check Idempotency  │
    │ (Prevent Duplicate)│
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Lock Wallet        │
    │ (Pessimistic)      │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ Check Balance      │
    │ >= Amount?         │
    └────────┬───────────┘
             │
    ┌────────┴────────┐
    │                 │
 ┌──▼───┐      ┌──────▼─────┐
 │Fail  │      │ Sufficient  │
 └──────┘      └──────┬──────┘
                      │
                      ▼
               ┌───────────────┐
               │ Deduct Amount │
               │ Update Status │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │ Record        │
               │ Transaction   │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │ Send Confirm  │ (planned)
               │ Email         │
               └───────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │ Return Success│
               └───────────────┘
```

---

## Currency Exchange Flow

### Convert Currency (Calculate Only)

```
┌────────────────────────────────────────────┐
│     Calculate Conversion Rate              │
│   (GET /api/wallets/convert)               │
└──────────────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Validate Currencies  │
        │ Check Support        │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Fetch FX Rate        │
        │ (Check Redis Cache)  │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼──┐          ┌──────▼──┐
    │Cache │          │  Not    │
    │Hit   │          │ Cached  │
    └──────┘          └────┬────┘
                           │
                    ┌──────▼──────┐
                    │ Call Primary│
                    │ Provider    │
                    │(ExchangeRate│
                    │   API)      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Cache Rate  │
                    │(Redis, 6h)  │
                    └──────┬──────┘
                           │
                           ▼
        ┌──────────────────────────┐
        │ Calculate Conversion     │
        │ From Amount * Rate       │
        │ (decimal.js for         │
        │  precision)             │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Return Calculation   │
        │ - From Amount        │
        │ - To Amount          │
        │ - Rate               │
        │ - Fees               │
        └──────────────────────┘
```

### Actual Trade (Conversion + State Change)

```
┌────────────────────────────────────┐
│   Execute Trade (Convert Currency) │
│    (POST /api/wallets/trade)       │
└────────────┬──────────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ All Auth & Validation   │
    │ (Like Convert Step)     │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Check Idempotency Key   │
    │ (Prevent Double Trade)  │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Get Current FX Rate     │
    │ (Cache or API)          │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Lock Both Wallets       │
    │ (Source & Target)       │
    │ Pessimistic            │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Verify Source Balance   │
    │ >= Amount              │
    └────────┬────────────────┘
             │
    ┌────────┴────────┐
    │                 │
 ┌──▼───┐      ┌──────▼────┐
 │Fail  │      │   Success  │
 └──────┘      └──────┬─────┘
                      │
                      ▼
              ┌───────────────┐
              │ Calculate:    │
              │ - To Amount   │
              │ - Fees        │
              │ decimal.js    │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Begin DB       │
              │ Transaction   │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Deduct from   │
              │ Source Currency
              │ Add to Target │
              │ Currency      │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Record Tx in  │
              │ Database      │
              │ Status:       │
              │ COMPLETED     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Commit DB Tx  │ (planned)
              │ (ATOMIC)      │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Cache Result  │
              │ with Idempotency
              │ Key (24h TTL) │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Emit Events   │
              │ - wallet.    │
              │   traded     │
              │ - fx.rate.   │
              │   applied    │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Return Success│
              │ with Details  │
              └───────────────┘
```

---

## Authentication Flow

### Registration to Trading Access

```
┌────────────────────────────────────┐
│   1. User Registration             │
│   (POST /api/auth/register)        │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Validate Email & Password         │
│                                    │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Check Email Not Already Used      │
└────────────┬───────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──┐       ┌──────▼───┐
│Exists│       │  New OK   │
└──────┘       └─────┬────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Hash Password   │
            │ (bcryptjs)      │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Create User     │
            │ isVerified:FALSE│
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Generate OTP    │
            │ (6-digit)       │
            │ 10-min TTL      │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Send OTP Email  │
            │ (Brevo)         │
            └────────┬────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Return Success  │
            │ User Created    │
            └─────────────────┘

               │
               │ 2. Email Verification
               │
               ▼
┌────────────────────────────────────┐
│   User Verifies OTP                │
│   (POST /api/auth/verify-account)  │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Find User & OTP Token             │
│  Validate OTP Expiration           │
└────────────┬───────────────────────┘
             │
    ┌────────┴─────────┐
    │                  │
┌───▼──┐         ┌─────▼────┐
│Invalid│        │  Valid   │
│/Expired
└───────┘        └──────┬───┘
                        │
                        ▼
                ┌────────────────┐
                │ Update User    │
                │ isVerified:TRUE│
                │ Delete OTP     │
                └────────┬───────┘
                         │
                         ▼
                ┌────────────────┐
                │ Create Wallet  │
                │ for User       │
                │ (Multi-Currency│
                └────────┬───────┘
                         │
                         ▼
                ┌────────────────┐
                │ Return Success │
                │ User Verified  │
                └────────────────┘

               │
               │ 3. User Login
               │
               ▼
┌────────────────────────────────────┐
│   User Login                       │
│   (POST /api/auth/login)           │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Find User by Email                │
└────────────┬───────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──┐        ┌─────▼────┐
│Found │        │  Found   │
│ = No │        │ = Yes    │
└──────┘        └─────┬────┘
                      │
                      ▼
              ┌───────────────┐
              │ Verify Email  │
              │ isVerified?   │
              └───────┬───────┘
                      │
         ┌────────────┴─────────────┐
         │                          │
     ┌───▼──┐                ┌─────▼────┐
     │ No   │                │   Yes    │
     │(Fail)│                └──────┬───┘
     └──────┘                       │
                                    ▼
                            ┌──────────────┐
                            │ Verify       │
                            │ Password Hash│
                            │(bcryptjs)    │
                            └──────┬───────┘
                                   │
                            ┌──────┴──────┐
                            │             │
                        ┌───▼──┐    ┌─────▼────┐
                        │Fail  │    │   Valid  │
                        └──────┘    └──────┬───┘
                                           │
                                           ▼
                                   ┌──────────────┐
                                   │ Generate JWT │
                                   │ Access Token │
                                   │ (1 day)      │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   ┌──────────────┐
                                   │ Return JWT   │
                                   │ Login Success│
                                   └──────────────┘

               │
               │ 4. Access Protected Endpoints
               │
               ▼
┌────────────────────────────────────┐
│   User Calls Protected Endpoint    │
│   + JWT Token in Header            │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  JwtAuthGuard                      │
│  Verify & Decode Token             │
└────────────┬───────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──┐        ┌─────▼────┐
│Invalid│       │  Valid   │
└───────┘       └─────┬────┘
                      │
                      ▼
              ┌─────────────────┐
              │ Extract User    │
              │ from Token      │
              └─────┬───────────┘
                    │
                    ▼
              ┌─────────────────┐
              │ EmailVerified   │
              │ Guard (if req)  │
              └─────┬───────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
     ┌───▼──┐          ┌──────▼──┐
     │Not   │          │Verified │
     │Verified          └────┬────┘
     │(Fail)│                │
     └──────┘                ▼
                      ┌──────────────┐
                      │ RolesGuard   │
                      │ (if req)     │
                      └────┬─────────┘
                           │
                    ┌──────┴──────┐
                    │             │
                ┌───▼──┐    ┌─────▼────┐
                │No    │    │  Has     │
                │Role  │    │  Role    │
                │(Fail)│    └────┬─────┘
                └──────┘         │
                                 ▼
                          ┌──────────────┐
                          │ Rate Limit   │
                          │ Guard (if)   │
                          └────┬─────────┘
                               │
                        ┌──────┴──────┐
                        │             │
                    ┌───▼──┐    ┌─────▼────┐
                    │Exceed│    │   OK     │
                    │Limit │    └────┬─────┘
                    │(Fail)│         │
                    └──────┘         ▼
                            ┌──────────────┐
                            │ Allow Access │
                            │ to Endpoint  │
                            └──────────────┘
```

---

## System Components Diagram

### Service Interaction

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
    ┌──────────────────┐        ┌──────────────────┐
    │  Web Frontend    │        │  Mobile App      │
    └────────┬─────────┘        └────────┬─────────┘
             │                          │
             └──────────────┬───────────┘
                           │
            ┌──────────────▼───────────────┐
            │     Fastify + NestJS         │
            │       API Server             │
            └──────────────┬───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Auth   │      │Wallets │      │   FX   │
    │Module  │      │Module  │      │Module  │
    └────────┘      └────────┘      └────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
            ┌──────────────▼───────────────┐
            │   Service Layer              │
            │  - AuthService              │
            │  - WalletsService           │
            │  - TransactionsService      │
            │  - FxService                │
            └──────────────┬───────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Domain │      │Repository
    │Logic   │      │Pattern  │      │Cache   │
    │        │      │(Data    │      │(Redis) │
    └────────┘      │Access)  │      └────────┘
                    └────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │PostgreSQL│    │  Redis   │    │ExternalAPIs
    │Database  │    │  Cache   │    │(FX Rates) │
    └──────────┘    └──────────┘    └──────────┘
```

---

## Database Schema

### Simplified ERD with Key Fields

```
┌─────────────────────────────────┐
│           USERS                 │
├─────────────────────────────────┤
│ id: UUID (PK)                   │
│ email: VARCHAR (UNIQUE)         │
│ password: VARCHAR (hashed)      │
│ role: ENUM (USER, ADMIN, SUP)   │
│ isEmailVerified: BOOLEAN        │
│ createdAt: TIMESTAMP            │
│ updatedAt: TIMESTAMP            │
└────────────────┬────────────────┘
                 │
                 │ 1:1 relation
                 │
┌────────────────▼────────────────┐
│          WALLETS                │
├─────────────────────────────────┤
│ id: UUID (PK)                   │
│ userId: UUID (FK)               │
│ status: ENUM (ACTIVE, FROZEN)   │
│ createdAt: TIMESTAMP            │
│ updatedAt: TIMESTAMP            │
└────────────────┬────────────────┘
                 │
                 │ 1:N relation
                 │
┌────────────────▼──────────────────────┐
│       WALLET_BALANCES                 │
├───────────────────────────────────────┤
│ id: UUID (PK)                         │
│ walletId: UUID (FK)                   │
│ currency: ENUM (NGN, USD, EUR, ...)   │
│ balance: DECIMAL(20, 8)               │
│ lockedBalance: DECIMAL(20, 8)         │
│ createdAt: TIMESTAMP                  │
│ updatedAt: TIMESTAMP                  │
│ INDEX: (walletId, currency)           │
└────────────────┬──────────────────────┘
                 │
                 │ 1:N relation
                 │
┌────────────────▼──────────────────────┐
│       TRANSACTIONS                    │
├───────────────────────────────────────┤
│ id: UUID (PK)                         │
│ walletId: UUID (FK)                   │
│ userId: UUID (FK)                     │
│ type: ENUM (FUND, WITHDRAW, CONVERT,  │
│            TRANSFER, RECEIVE)         │
│ status: ENUM (PENDING, COMPLETED,     │
│              FAILED, CANCELLED)       │
│ fromCurrency: VARCHAR                 │
│ toCurrency: VARCHAR                   │
│ amount: DECIMAL(20, 8)                │
│ convertedAmount: DECIMAL(20, 8)       │
│ rate: DECIMAL(20, 10)                 │
│ fee: DECIMAL(20, 8)                   │
│ idempotencyKey: UUID (UNIQUE INDEX)   │
│ metadata: JSONB (flexible)            │
│ description: TEXT                     │
│ completedAt: TIMESTAMP (nullable)     │
│ createdAt: TIMESTAMP                  │
│ updatedAt: TIMESTAMP                  │
│ INDEX: (userId, createdAt)            │
│ INDEX: (idempotencyKey)               │
│        WHERE status = 'COMPLETED'     │
└───────────────────────────────────────┘
         │                │
         │                │
         │                │ Receiver
         │                │ (Self-join)
         │                │
         └────────────────┘

┌──────────────────────────────────┐
│          FX_RATES                │
├──────────────────────────────────┤
│ id: UUID (PK)                    │
│ baseCurrency: VARCHAR            │
│ targetCurrency: VARCHAR          │
│ rate: DECIMAL(20, 10)            │
│ source: VARCHAR                  │
│ validUntil: TIMESTAMP            │
│ createdAt: TIMESTAMP             │
│ INDEX: (baseCurrency, target)    │
│        (validUntil)              │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│         OTP_TOKENS               │
├──────────────────────────────────┤
│ id: UUID (PK)                    │
│ userId: UUID (FK)                │
│ otp: VARCHAR (6-digit, hashed)   │
│ expiresAt: TIMESTAMP             │
│ attempts: INTEGER                │
│ createdAt: TIMESTAMP             │
│ INDEX: (userId, expiresAt)       │
└──────────────────────────────────┘
```

---

## Error Handling Flow

### Exception Handling Pipeline

```
┌──────────────────────────────────┐
│    API Request Received          │
└────────────┬─────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │  Guard Execution   │
    │  - JWT Validation  │
    │  - Role Check      │
    │  - Rate Limit      │
    └────────┬───────────┘
             │
    ┌────────┴─────────────┐
    │                      │
┌───▼──┐           ┌──────▼──┐
│Guard │           │  Pass   │
│Fail  │           └────┬────┘
└──────┘                │
  │                     ▼
  │           ┌─────────────────┐
  │           │  Pipes/Validation
  │           │  - Zod Schema   │
  │           │  - Transform    │
  │           └────────┬────────┘
  │                    │
  │           ┌────────┴──────────┐
  │           │                   │
  │       ┌───▼──┐         ┌─────▼────┐
  │       │Invalid
  │       │(Fail)│         │   Valid  │
  │       └──────┘         └──────┬───┘
  │                               │
  │                               ▼
  │                       ┌───────────────┐
  │                       │ Interceptor   │
  │                       │ Execution     │
  │                       │ (Timing Start)│
  │                       └───────┬───────┘
  │                               │
  │                               ▼
  │                       ┌───────────────┐
  │                       │ Controller    │
  │                       │ Handler       │
  │                       └───────┬───────┘
  │                               │
  │                       ┌───────┴────────┐
  │                       │                │
  │                   ┌───▼──┐      ┌─────▼────┐
  │                   │Throw │      │ Success  │
  │                   │Error │      │ Response │
  │                   └───┬──┘      └──────────┘
  │                       │
  │                       ▼
  │               ┌───────────────┐
  │               │ Service Layer │
  │               │ Throws Error  │
  │               └───────┬───────┘
  │                       │
  │               ┌───────┴────────────┐
  │               │                    │
  │       ┌───────▼─────────┐  ┌──────▼────────┐
  │       │Business Exception
  │       │(Bad Request)    │  │DB/System Error│
  │       └────────┬────────┘  └────────┬──────┘
  │               │                    │
  └───────────────┴────────┬───────────┘
                           │
                           ▼
                   ┌───────────────────┐
                   │ Exception Filter  │
                   │ (Global Handler)  │
                   │ - Catch Errors    │
                   │ - Log             │
                   │ - Format Response │
                   └─────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                        │
        ┌──────▼──────┐         ┌───────▼─────┐
        │ Log Error   │         │Map to HTTP  │
        │ - Stack     │         │Status Code  │
        │ - Context   │         │- 400 Bad Req│
        │ - Metadata  │         │- 401 Unauth │
        └─────────────┘         │- 403 Forbid │
                                │- 404 Not Fd │
                                │- 409 Conflict
                                │- 429 Rate Lim
                                │- 500 Internal
                                └───────┬────┘
                                        │
                                        ▼
                            ┌──────────────────┐
                            │ Response Format: │
                            │{                │
                            │  statusCode: XX │
                            │  message: "..." │
                            │  error: "..."   │
                            │  timestamp: ...│
                            │}                │
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ Send Response    │
                            │ to Client        │
                            └──────────────────┘
```

### Error Response Examples

```typescript
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": null
  },
  "meta": {
    "requestId": "abc123",
    "timestamp": "2026-02-06T01:44:00.000Z",
    "version": "v1",
    "extra": {
      "path": "/fx/rates",
      "method": "GET"
    }
  }
}
```

---

## Data Flow Examples

### Successful Trade Execution

```
Client Request
    ↓
{
  "fromCurrency": "NGN",
  "toCurrency": "USD",
  "amount": "100000",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
    ↓
Server Validation
    ↓
Idempotency Check (Redis)
    ↓
Fetch FX Rate (Redis Cache → ExchangeRate API)
    ↓
Lock Wallets (Pessimistic)
    ↓
Verify Balance (100000 NGN available)
    ↓
Calculate Conversion
    ├─ Amount: 100000 NGN
    ├─ Rate: 0.0025
    └─ Converted: 250 USD
    ↓
Atomic DB Transaction
    ├─ Deduct NGN balance
    ├─ Add USD balance
    ├─ Create Transaction record
    └─ Commit
    ↓
Cache Result (24h TTL with idempotency key)
    ↓
Emit Events
    ├─ wallet.traded
    └─ fx.rate.applied
    ↓
Response
{
  "success": true,
  "data": {
    "transactionId": "...",
    "fromCurrency": "NGN",
    "toCurrency": "USD",
    "fromAmount": "100000",
    "toAmount": "250",
    "rate": "0.0025",
    "status": "COMPLETED",
    "completedAt": "2026-02-06T10:30:00Z"
  }
}
```

### Failure Scenario - Insufficient Balance

```
Client Request (Same as above)
    ↓
Validation & Idempotency Check (Pass)
    ↓
Fetch FX Rate (Success)
    ↓
Lock Wallet (Success)
    ↓
Verify Balance
    ├─ Required: 100000 NGN
    ├─ Available: 50000 NGN
    └─ Status: INSUFFICIENT
    ↓
Rollback Lock
    ↓
Exception: InsufficientBalanceException
    ↓
Exception Filter Catches
    ├─ Log error with context
    └─ Map to HTTP 400
    ↓
Response
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Insufficient balance. Required: 100000, Available: 50000"
}
```

---

## Caching Strategy

### Multi-Level Cache

```
1. Request Layer Cache (Redis)
   - Idempotency Keys: 24 hours
   - User Sessions: 7 days
   - OTP Tokens: 10 minutes

2. Data Layer Cache (Redis)
   - FX Rates: 6 hours
   - User Profiles: 1 hour
   - Exchange Rates: 6 hours

3. Query Optimization (DB)
   - Strategic Indexes
   - Query Plans
   - Connection Pooling

4. Response Cache (Optional)
   - GET endpoints: 5 minutes
   - Static data: 1 hour
```

---

## Monitoring & Observability

### Metrics to Track

```
Performance Metrics:
├─ Request latency (p50, p95, p99)
├─ Database query time
├─ API response time
└─ Cache hit rate

Business Metrics:
├─ Successful trades
├─ Failed transactions
├─ Average trade amount
└─ User registration rate

System Metrics:
├─ CPU usage
├─ Memory usage
├─ Database connections
├─ Redis connections
└─ Error rates
```

---

This document provides comprehensive visual representations of the FX Trading System architecture and data flows. Refer to the main [README.md](README.md) and [Architecture Document](fx-trading-architecture.md) for additional details.
