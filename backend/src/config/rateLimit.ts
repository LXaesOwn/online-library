import rateLimit from 'express-rate-limit';
import { OPEN_LIBRARY } from './constants';

export const globalRateLimiter = rateLimit({
  windowMs: OPEN_LIBRARY.RATE_LIMIT.WINDOW_MS,
  max: OPEN_LIBRARY.RATE_LIMIT.MAX_REQUESTS,
  message: {
    error: 'Too many requests, please try again later.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // 10 запросов
  message: {
    error: 'Too many requests. Please slow down.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
