import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET_KEY: string = process.env.ACCESS_SECRET_KEY as string;

export const authenticate = (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET_KEY) as unknown as {
      sub: number;
    };

    req.user = { sub: decoded.sub };
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized' });
  }
};
