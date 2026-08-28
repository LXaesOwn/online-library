import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import router from './routes';
import { globalRateLimiter } from './config/rateLimit';
import env from './config/env';
import { APP, API } from './config/constants';

dotenv.config();

const app = express();
const port = env.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(globalRateLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.use((_req, res) => {
  res.status(404).json({
    error: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// Error handler - используем для неиспользуемых параметров
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`🚀 ${APP.NAME} v${APP.VERSION}`);
  console.log(`📍 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`💚 Health check: http://localhost:${port}/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
