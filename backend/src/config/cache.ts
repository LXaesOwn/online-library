import NodeCache from 'node-cache';

export const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS || '1800'),
  checkperiod: 120,
  useClones: false,
});

export const CACHE_KEYS = {
  OPEN_LIBRARY_SEARCH: 'ol_search',
  OPEN_LIBRARY_WORK: 'ol_work',
} as const;

export function getCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  return `${prefix}:${JSON.stringify(sortedParams)}`;
}
