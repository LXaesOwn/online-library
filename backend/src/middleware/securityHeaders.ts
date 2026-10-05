import cors from 'cors';
import helmet from 'helmet';
import { Router } from 'express';
import env from '../config/env';

export function securityHeaders(): Router {
  const router = Router();
  router.use(helmet());
  router.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  return router;
}
