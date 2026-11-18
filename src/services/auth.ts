import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

export const generateTokens = (userId: number) => {
  const payload = { sub: userId };

  const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY!, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY!, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string): { sub: number } => {
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET_KEY!) as unknown as {
      sub: number;
    };
  } catch {
    throw createHttpError(401, 'Invalid refresh token');
  }
};

export const verifyAccessToken = (token: string): { sub: number } => {
  try {
    return jwt.verify(token, process.env.ACCESS_SECRET_KEY!) as unknown as {
      sub: number;
    };
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }
};
