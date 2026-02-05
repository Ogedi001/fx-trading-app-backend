import { config } from 'dotenv';

config();

export const {
  PORT,
  NODE_ENV,

  JWT_SECRET,
  JWT_EXPIRES_IN,

  DATABASE_URL,

  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL,

  REDIS_URL,

  // mail
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,

  FRONTEND_URL_DEV,
  FRONTEND_URL_PROD,
} = process.env;

// Structured database config
export const EnvDatabaseConfig = {
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  name: DB_NAME,
  ssl: DB_SSL === 'true',
  url: DATABASE_URL, // optional
};
