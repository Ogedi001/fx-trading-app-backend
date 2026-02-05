import {
  NODE_ENV,
  PORT,
  FRONTEND_URL_PROD,
  FRONTEND_URL_DEV,
} from './env.config.js';

const appConfig = {
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test',
  PORT,
  testEmailCode: '123456',
  FRONTEND_URL:
    NODE_ENV === 'production' ? FRONTEND_URL_PROD : FRONTEND_URL_DEV,
};

export default appConfig;
