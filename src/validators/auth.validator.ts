import { z } from 'zod';
import { registry } from '../openapi.ts';

export const RegisterSchema = registry.register(
  'Register',
  z.object({
    username: z
      .string({ error: 'Username is required' })
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters'),
    email: z
      .string({ error: 'Email is required' })
      .email('Invalid email format'),
    password: z
      .string({ error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    name: z
      .string({ error: 'Name is required' })
      .min(2, 'Name must be at least 2 characters'),
  })
);

export const RefreshSchema = registry.register(
  'Refresh',
  z.object({
    refreshToken: z.string({ error: 'refreshToken is required' }),
  })
);

export const LoginSchema = registry.register(
  'Login',
  z.object({
    username: z
      .string({ error: 'Username is required' })
      .min(3, 'Username must be at least 3 characters'),
    password: z
      .string({ error: 'Password is required' })
      .min(3, 'Password must be at least 3 characters'),
  })
);

export const AuthTokenSchema = registry.register(
  'AuthToken',
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const UserResponseSchema = registry.register(
  'User',
  RegisterSchema.omit({ password: true }).extend({
    id: z.number().int().openapi({ example: 1 }),
  })
);

const AuthResponseSchema = registry.register(
  'AuthResponse',
  AuthTokenSchema.extend({
    user: UserResponseSchema,
  })
);

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': { schema: RegisterSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Created',
      content: {
        'application/json': { schema: UserResponseSchema },
      },
    },
    409: { description: 'Username or email already taken' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Log in user',
  request: {
    body: {
      content: {
        'application/json': { schema: LoginSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: AuthResponseSchema },
      },
    },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh authentication tokens',
  request: {
    body: {
      content: {
        'application/json': { schema: AuthTokenSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: AuthTokenSchema },
      },
    },
    401: { description: 'Invalid token' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  summary: 'Log out user',
  security: [{ bearerAuth: [] }],
  responses: {
    204: { description: 'No Content' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Get current user profile',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: UserResponseSchema },
      },
    },
    401: { description: 'Unauthorized' },
  },
});
