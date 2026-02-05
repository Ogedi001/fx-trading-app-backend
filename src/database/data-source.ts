import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { DATABASE_URL, DB_SSL, NODE_ENV } from 'src/config/env.config';

export const AppDataSource = new DataSource({
  type: 'postgres',

  url: DATABASE_URL,

  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],

  synchronize: false, // NEVER true in production
  logging: NODE_ENV !== 'production',
  ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
