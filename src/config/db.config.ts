import { registerAs } from '@nestjs/config';
import { EnvDatabaseConfig } from './env.config.js';

export default registerAs('database', () => ({
  host: EnvDatabaseConfig.host,
  port: EnvDatabaseConfig.port,
  user: EnvDatabaseConfig.user,
  password: EnvDatabaseConfig.password,
  name: EnvDatabaseConfig.name,
  url: EnvDatabaseConfig.url,
  ssl: EnvDatabaseConfig.ssl,
}));
