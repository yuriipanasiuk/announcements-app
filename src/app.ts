import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import 'dotenv/config';

import { generateOpenApiDocument } from './openapi.ts';
import announcementsRouter from './routes/announcements.routes.ts';
import { authRoutes } from './routes/auth.routes.ts';
import { logger } from './logger.ts';

export const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(helmet());
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());

const openApiDocument = generateOpenApiDocument();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use('/announcements', announcementsRouter);
app.use('/auth', authRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, 'Unhandled application error');

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Validation failed',
      details: {
        body: ['Invalid JSON format in request body'],
      },
    });
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Unique constraint violation' });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Foreign key constraint failed' });
  }

  res.status(500).json({ error: 'Internal server error' });
});
