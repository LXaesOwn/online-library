import NodeCache from 'node-cache';
import env from './env';

export const cache = new NodeCache({
  stdTTL: env.CACHE_TTL_SECONDS,
  checkperiod: env.CACHE_CHECK_PERIOD_SECONDS,
  useClones: false,
});

export const CACHE_KEYS = {
  OPEN_LIBRARY_SEARCH: 'ol_search',
  OPEN_LIBRARY_WORK: 'ol_work',
} as const;

export function getCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  return `${prefix}:${JSON.stringify(sortedParams)}`;
}
