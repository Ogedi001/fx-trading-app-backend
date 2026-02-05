import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1770224318102 implements MigrationInterface {
    name = 'InitSchema1770224318102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN', 'SUPPORT')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "password" character varying NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TYPE "public"."wallet_balances_currency_enum" AS ENUM('NGN', 'USD', 'EUR', 'GBP')`);
        await queryRunner.query(`CREATE TABLE "wallet_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "walletId" uuid NOT NULL, "currency" "public"."wallet_balances_currency_enum" NOT NULL, "balance" numeric(18,2) NOT NULL DEFAULT '0', "lockedBalance" numeric(18,2) NOT NULL DEFAULT '0', CONSTRAINT "UQ_f95bfe9d167bf79ecaf43d093e7" UNIQUE ("walletId", "currency"), CONSTRAINT "PK_eebe2c6f13f1a2de3457f8a885c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('FUND', 'CONVERT', 'TRADE')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_fromcurrency_enum" AS ENUM('NGN', 'USD', 'EUR', 'GBP')`);
        await queryRunner.query(`CREATE TYPE "public"."transactions_tocurrency_enum" AS ENUM('NGN', 'USD', 'EUR', 'GBP')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "walletId" uuid NOT NULL, "userId" character varying NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "status" "public"."transactions_status_enum" NOT NULL, "fromCurrency" "public"."transactions_fromcurrency_enum" NOT NULL, "toCurrency" "public"."transactions_tocurrency_enum" NOT NULL, "fromAmount" numeric(18,8) NOT NULL, "toAmount" numeric(18,8) NOT NULL, "rate" numeric(18,8) NOT NULL, "fee" numeric(18,8) NOT NULL, "idempotencyKey" character varying NOT NULL, "metadata" jsonb, "completedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_86238dd0ae2d79be941104a584" ON "transactions" ("idempotencyKey") `);
        await queryRunner.query(`CREATE TYPE "public"."wallets_status_enum" AS ENUM('ACTIVE', 'SUSPENDED', 'LOCKED')`);
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "status" "public"."wallets_status_enum" NOT NULL, CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."fx_rates_basecurrency_enum" AS ENUM('NGN', 'USD', 'EUR', 'GBP')`);
        await queryRunner.query(`CREATE TYPE "public"."fx_rates_targetcurrency_enum" AS ENUM('NGN', 'USD', 'EUR', 'GBP')`);
        await queryRunner.query(`CREATE TABLE "fx_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "baseCurrency" "public"."fx_rates_basecurrency_enum" NOT NULL, "targetCurrency" "public"."fx_rates_targetcurrency_enum" NOT NULL, "rate" numeric(18,8) NOT NULL, "source" character varying NOT NULL, "validUntil" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_94eb17e7eddb6df0cec5985ea5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d9a760f8207fe200c842bbdc5f" ON "fx_rates" ("baseCurrency", "targetCurrency") `);
        await queryRunner.query(`ALTER TABLE "wallet_balances" ADD CONSTRAINT "FK_10560f85c13af935346bdd37dd4" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_a88f466d39796d3081cf96e1b66" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_a88f466d39796d3081cf96e1b66"`);
        await queryRunner.query(`ALTER TABLE "wallet_balances" DROP CONSTRAINT "FK_10560f85c13af935346bdd37dd4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d9a760f8207fe200c842bbdc5f"`);
        await queryRunner.query(`DROP TABLE "fx_rates"`);
        await queryRunner.query(`DROP TYPE "public"."fx_rates_targetcurrency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fx_rates_basecurrency_enum"`);
        await queryRunner.query(`DROP TABLE "wallets"`);
        await queryRunner.query(`DROP TYPE "public"."wallets_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86238dd0ae2d79be941104a584"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_tocurrency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_fromcurrency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
        await queryRunner.query(`DROP TABLE "wallet_balances"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_balances_currency_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
