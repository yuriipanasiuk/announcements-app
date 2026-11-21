import express, { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

import { generateOpenApiDocument } from './src/openapi.ts';
import announcementsRouter from './src/routes/announcements.routes.ts';
import { authRoutes } from './src/routes/auth.routes.ts';
import { logger } from './src/logger.ts';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

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
app.use('/auth', strictLimiter, authRoutes);

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

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}: http://localhost:${PORT}`);
});
