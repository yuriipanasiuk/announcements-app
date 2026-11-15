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
  announcementIdSchema,
  createAnnouncementSchema,
  queryAnnouncementsSchema,
  updateAnnouncementSchema,
} from './validators/announcements.validator.ts';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

const userResponseSchema = registry.register(
  'User',
  registerSchema.omit({ password: true }).extend({
    id: z.number().int().openapi({ example: 1 }),
  })
);

const authResponseSchema = registry.register(
  'AuthResponse',
  authTokenSchema.extend({
    user: userResponseSchema,
  })
);

const announcementResponseSchema = registry.register(
  'Announcement',
  createAnnouncementSchema.extend({
    id: z.number().int().openapi({ example: 5 }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: '2025-01-10T12:00:00.000Z' }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ example: '2025-01-10T12:00:00.000Z' }),
    user: userResponseSchema,
  })
);

const paginationSchema = registry.register(
  'Pagination',
  z.object({
    total: z.number().int().openapi({ example: 23 }),
    page: z.number().int().openapi({ example: 2 }),
    totalPages: z.number().int().openapi({ example: 3 }),
    perPage: z.number().int().openapi({ example: 10 }),
  })
);

const paginatedAnnouncementsSchema = registry.register(
  'PaginatedAnnouncements',
  z.object({
    data: z.array(announcementResponseSchema),
    pagination: paginationSchema,
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
  summary: 'Реєстрація користувача',
  request: {
    body: {
      content: {
        'application/json': { schema: registerSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Created',
      content: {
        'application/json': { schema: userResponseSchema },
      },
    },
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
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: authResponseSchema },
      },
    },
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
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: authTokenSchema },
      },
    },
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
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: userResponseSchema },
      },
    },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/announcements',
  summary: 'Список оголошень з пагінацією, пошуком та сортуванням',
  request: {
    query: queryAnnouncementsSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: paginatedAnnouncementsSchema },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/announcements/{id}',
  summary: 'Отримання оголошення за ID',
  request: {
    params: announcementIdSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: announcementResponseSchema },
      },
    },
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
    201: {
      description: 'Created',
      content: {
        'application/json': { schema: announcementResponseSchema },
      },
    },
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
    params: announcementIdSchema,
    body: {
      content: {
        'application/json': { schema: updateAnnouncementSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: announcementResponseSchema },
      },
    },
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
    params: announcementIdSchema,
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
