import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { verifyAccessToken } from '../services/auth.ts';

export const authenticate = (
  req: Request<{}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw createHttpError(401, 'Authentication required');
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    throw createHttpError(401, 'Invalid or expired token');
  }

  const decoded = verifyAccessToken(token);

  req.user = { sub: decoded.sub };

  next();
};
