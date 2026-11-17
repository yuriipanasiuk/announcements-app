import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginUserBody, RegisterUserBody } from '../types/types.ts';
import prisma from '../../prisma/client.ts';

const saltRounds = 10;
const ACCESS_SECRET_KEY: string = process.env.ACCESS_SECRET_KEY as string;
const REFRESH_SECRET_KEY: string = process.env.REFRESH_SECRET_KEY as string;

interface JwtPayload {
  sub: number;
}

const generateTokens = (userId: number) => {
  const payload: JwtPayload = { sub: userId };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};

export const register = async (
  req: Request<{}, {}, RegisterUserBody>,
  res: Response
) => {
  const { password, username, name, email } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      message: 'Username or email already taken',
    });
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      name,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
    },
  });

  const { accessToken, refreshToken } = generateTokens(newUser.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: newUser.id,
    },
  });

  return res.status(201).json({
    user: newUser,
    accessToken,
    refreshToken,
  });
};

export const login = async (
  req: Request<{}, {}, LoginUserBody>,
  res: Response
) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const { accessToken, refreshToken } = generateTokens(user.id);

  await prisma.$transaction([
    prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    }),

    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
      },
    }),
  ]);

  return res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user?.sub;

  if (userId) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  return res.status(204).end();
};

export const refresh = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as unknown as {
      sub: number;
    };

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(decoded.sub);

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: storedToken.id },
      }),

      prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: decoded.sub,
        },
      }),
    ]);

    return res.status(200).json(tokens);
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const userId = req.user?.sub;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json(user);
};
