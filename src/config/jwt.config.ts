import { JWT_EXPIRES_IN, JWT_SECRET } from './env.config.js';

const jwtConfig = {
  secret: JWT_SECRET || 'secret',
  expiresIn: JWT_EXPIRES_IN || '30d',
};

export default jwtConfig;
