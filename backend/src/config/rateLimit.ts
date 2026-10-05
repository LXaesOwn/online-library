import rateLimit from 'express-rate-limit';
import env from './env';
import { OPEN_LIBRARY } from './constants';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 10,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 5,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

void OPEN_LIBRARY;
