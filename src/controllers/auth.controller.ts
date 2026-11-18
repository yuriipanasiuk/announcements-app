import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { LoginUserBody, RegisterUserBody } from '../types/types.ts';
import prisma from '../../prisma/client.ts';
import { generateTokens, verifyRefreshToken } from '../services/auth.ts';
import createHttpError from 'http-errors';

const saltRounds = 10;

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
    throw createHttpError(409, 'Username or email already taken');
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
    throw createHttpError(401, 'Invalid credentials');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw createHttpError(401, 'Invalid credentials');
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

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });

  return res.status(204).end();
};

export const refresh = async (
  req: Request<{}, {}, { refreshToken: string }>,
  res: Response
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token not provided');
  }

  verifyRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  const tokens = generateTokens(storedToken.userId);

  await prisma.$transaction([
    prisma.refreshToken.delete({
      where: { id: storedToken.id },
    }),

    prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: storedToken.userId,
      },
    }),
  ]);

  return res.status(200).json(tokens);
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
    throw createHttpError(404, 'User not found');
  }

  return res.json(user);
};
