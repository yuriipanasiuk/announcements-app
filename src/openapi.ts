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
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from './validators/announcements.validator.ts';

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
        'application/json': {
          schema: registerSchema,
          example: {
            username: 'ivan_petrenko',
            email: 'ivan@example.com',
            password: 'Password123!',
            name: 'Іван',
          },
        },
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
        'application/json': {
          schema: loginSchema,
          example: {
            email: 'ivan@example.com',
            password: 'Password123!',
          },
        },
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

registry.registerPath({
  method: 'get',
  path: '/announcements',
  summary: 'Список оголошень з пагінацією, пошуком та сортуванням',
  request: {
    query: z.object({
      page: z.string().optional(),
      search: z.string().optional(),
      sort: z.enum(['newest', 'oldest']).optional(),
    }),
  },
  responses: {
    200: { description: 'OK' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/announcements/{id}',
  summary: 'Отримання оголошення за ID',
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: { description: 'OK' },
    400: { description: 'Invalid ID' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/announcements',
  summary: 'Створення оголошення',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createAnnouncementSchema },
      },
    },
  },
  responses: {
    201: { description: 'Created' },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/announcements/{id}',
  summary: 'Часткове оновлення оголошення',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': { schema: updateAnnouncementSchema },
      },
    },
  },
  responses: {
    200: { description: 'OK' },
    400: { description: 'Validation error or invalid ID' },
    401: { description: 'Unauthorized' },
    403: { description: 'Access denied' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/announcements/{id}',
  summary: 'Видалення оголошення',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    204: { description: 'No Content' },
    400: { description: 'Invalid ID' },
    401: { description: 'Unauthorized' },
    403: { description: 'Access denied' },
    404: { description: 'Not found' },
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
