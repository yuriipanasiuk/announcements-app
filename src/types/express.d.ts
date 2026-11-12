import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: number | string;
        email?: string;
      };
    }
  }
}
