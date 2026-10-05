import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('7d'),

  OPEN_LIBRARY_BASE_URL: z.string().url().default('https://openlibrary.org'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(60),

  CACHE_TTL_SECONDS: z.coerce.number().default(1800),
  CACHE_CHECK_PERIOD_SECONDS: z.coerce.number().default(120),

  LOG_LEVEL: z.string().default('info'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

function loadEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const env = loadEnv();
export default env;
