import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  authTokenSchema,
  loginSchema,
  registerSchema,
} from './validators/auth.validator.ts';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  summary: 'Реєстрація користувача',
  request: {
    body: {
      content: {
        'application/json': { schema: registerSchema },
      },
    },
  },
  responses: {
    201: { description: 'Created' },
    409: { description: 'Username or email already taken' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  summary: 'Вхід користувача',
  request: {
    body: {
      content: {
        'application/json': { schema: loginSchema },
      },
    },
  },
  responses: {
    200: { description: 'OK' },
    401: { description: 'Invalid credentials' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  summary: 'Оновлення токенів',
  request: {
    body: {
      content: {
        'application/json': { schema: authTokenSchema },
      },
    },
  },
  responses: {
    200: { description: 'OK' },
    401: { description: 'Invalid token' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/logout',
  summary: 'Вихід',
  security: [{ bearerAuth: [] }],
  responses: {
    204: { description: 'No Content' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  summary: 'Профіль поточного користувача',
  security: [{ bearerAuth: [] }],
  responses: {
    200: { description: 'OK' },
    401: { description: 'Unauthorized' },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'announcements-app API',
      version: '1.0.0',
      description: 'REST API for announcements-app',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });
}
