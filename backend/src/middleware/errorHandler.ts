import { NextFunction, Request, Response } from 'express';
import env from '../config/env';
import { HTTP } from '../config/constants';
import { logger } from '../config/logger';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(HTTP.STATUS.NOT_FOUND).json({
    error: 'Route not found',
    timestamp: new Date().toISOString(),
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({ err }, 'unhandled error');
  res.status(HTTP.STATUS.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
}
