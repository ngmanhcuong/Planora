import { env } from './env';

export const config = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  aiProvider: env.AI_PROVIDER,
  aiApiKey: env.AI_API_KEY,
};

