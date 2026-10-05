import './config/dns';
import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import router from './routes';
import { securityHeaders } from './middleware/securityHeaders';
import { globalRateLimiter } from './config/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import env from './config/env';
import { APP, API } from './config/constants';
import { logger } from './config/logger';

dotenv.config();

const app = express();

app.use(securityHeaders());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);

if (env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(API.PREFIX, router);

app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: APP.NAME,
    version: APP.VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
      docs: env.NODE_ENV !== 'production' ? `http://localhost:${env.PORT}/api/docs` : undefined,
    },
    'server started'
  );
});
