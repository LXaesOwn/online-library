import { createClient } from '@supabase/supabase-js';
import env from './env';
import { logger } from './logger';

const TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3;

async function resilientFetch(
  ...args: Parameters<typeof fetch>
): Promise<Response> {
  const [input, init] = args;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      logger.warn({ attempt, error }, 'supabase fetch attempt failed');
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }

  throw lastError;
}

logger.debug({ supabaseHost: new URL(env.SUPABASE_URL).host }, 'supabase client created');

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: resilientFetch as typeof fetch },
});