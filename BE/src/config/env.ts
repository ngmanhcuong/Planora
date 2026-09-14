import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL environment variable is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET environment variable is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  AI_PROVIDER: z.string().optional().default('none'),
  AI_API_KEY: z.string().optional(),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[ENV Error] Invalid environment configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
