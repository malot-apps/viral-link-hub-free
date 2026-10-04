import express, { Express } from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { responseMaskMiddleware } from './middleware/sanitizer';

export function createApp(): Express {
  const app = express();

  // Standard middleware
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-init-data'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Intercept and sanitize all responses: NO MENTION OF TERABOX in response JSON
  app.use(responseMaskMiddleware);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'VIRAL LINK HUB',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API v1 router
  app.use('/api/v1', apiRouter);

  return app;
}

export default createApp;
