import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.ts';
import { AuthTokenSchema } from '../src/validators/auth.validator.ts';
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/services/auth.ts';
import prisma from '../prisma/client.ts';

describe('JWT Tokens', () => {
  beforeAll(() => {
    process.env.ACCESS_SECRET_KEY =
      process.env.ACCESS_SECRET_KEY || 'test-access-secret';
    process.env.REFRESH_SECRET_KEY =
      process.env.REFRESH_SECRET_KEY || 'test-refresh-secret';
  });

  it('should generate valid accessToken and refreshToken', () => {
    const userId = 1;
    const tokens = generateTokens(userId);

    const validationResult = AuthTokenSchema.safeParse(tokens);
    expect(validationResult.success).toBe(true);

    expect(tokens.accessToken.split('.')).toHaveLength(3);
    expect(tokens.refreshToken.split('.')).toHaveLength(3);
    expect(tokens.accessToken).not.toBe(tokens.refreshToken);
  });

  it('should verify generated tokens and return correct userId in sub', () => {
    const userId = 42;
    const { accessToken, refreshToken } = generateTokens(userId);

    const accessPayload = verifyAccessToken(accessToken);
    const refreshPayload = verifyRefreshToken(refreshToken);

    expect(accessPayload.sub).toBe(userId);
    expect(refreshPayload.sub).toBe(userId);
  });

  it('should throw 401 error when verifying invalid or mismatched tokens', () => {
    const { accessToken, refreshToken } = generateTokens(1);

    expect(() => verifyAccessToken('invalid.token.string')).toThrow(
      'Invalid or expired token'
    );

    expect(() => verifyRefreshToken('invalid.token.string')).toThrow(
      'Invalid refresh token'
    );

    expect(() => verifyAccessToken(refreshToken)).toThrow(
      'Invalid or expired token'
    );

    expect(() => verifyRefreshToken(accessToken)).toThrow(
      'Invalid refresh token'
    );
  });
});

describe('Auth Integration Tests', () => {
  const timestamp = Date.now();

  const testUser = {
    username: `user_${timestamp}`,
    email: `user_${timestamp}@example.com`,
    password: 'password',
    name: 'User',
  };

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { username: testUser.username },
    });

    await prisma.$disconnect();
  });

  it('POST /auth/register — should return 201 and user with tokens on valid data', async () => {
    const response = await request(app).post('/auth/register').send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user).toMatchObject({
      username: testUser.username,
      email: testUser.email,
      name: testUser.name,
    });

    expect(response.body.user).not.toHaveProperty('password');
  });

  it('POST /auth/login — should return 401 on wrong password', async () => {
    const response = await request(app).post('/auth/login').send({
      username: testUser.username,
      password: 'WrongPassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  });
});
