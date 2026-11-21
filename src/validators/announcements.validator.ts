import { z } from 'zod';
import { registry } from '../openapi.ts';
import { UserResponseSchema } from './auth.validator.ts';

export const AnnouncementCategorySchema = registry.register(
  'AnnouncementCategory',
  z.enum(['sale', 'service', 'job', 'other'], {
    error:
      'Category must be one of the following values: sale, service, job, or other',
  })
);

export const CreateAnnouncementSchema = registry.register(
  'CreateAnnouncement',
  z.object({
    title: z
      .string({ error: 'Title is required and must be a string' })
      .min(5, 'Title must contain at least 5 characters')
      .max(50, 'Title must not exceed 50 characters'),

    description: z
      .string({ error: 'Description is required and must be a string' })
      .min(10, 'Description must contain at least 10 characters'),

    price: z.coerce
      .number({ error: 'Price is required and must be a number' })
      .positive('Price must be greater than 0'),

    imageUrl: z.string().url('Invalid image URL').optional().openapi({
      example:
        'https://res.cloudinary.com/demo/image/upload/v1/announcements/abc123.jpg',
    }),

    category: AnnouncementCategorySchema,
  })
);

export const UpdateAnnouncementSchema = registry.register(
  'UpdateAnnouncement',
  CreateAnnouncementSchema.partial().refine(
    data => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided for update',
    }
  )
);

const AnnouncementResponseSchema = registry.register(
  'Announcement',
  CreateAnnouncementSchema.extend({
    id: z.number().int().openapi({ example: 5 }),
    imageUrl: z.string().url().nullable().optional().openapi({
      example:
        'https://res.cloudinary.com/demo/image/upload/v1/announcements/abc123.jpg',
    }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ example: '2025-01-10T12:00:00.000Z' }),
    updatedAt: z
      .string()
      .datetime()
      .openapi({ example: '2025-01-10T12:00:00.000Z' }),
    user: UserResponseSchema,
  })
);

const PaginatedAnnouncementsSchema = registry.register(
  'PaginatedAnnouncements',
  z.object({
    data: z.array(AnnouncementResponseSchema),
    pagination: z.object({
      total: z.number().int().openapi({ example: 23 }),
      page: z.number().int().openapi({ example: 2 }),
      totalPages: z.number().int().openapi({ example: 3 }),
      perPage: z.number().int().openapi({ example: 10 }),
    }),
  })
);

export const AnnouncementIdSchema = registry.register(
  'AnnouncementParamId',
  z.object({
    id: z.coerce
      .number({ error: 'ID must be a number' })
      .int('ID must be an integer')
      .positive('ID must be greater than 0'),
  })
);

export const QueryAnnouncementsSchema = registry.register(
  'QueryAnnouncements',
  z.strictObject({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),

    perPage: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit must not exceed 100')
      .default(10),

    category: AnnouncementCategorySchema.optional(),

    search: z.string().trim().min(1, 'Search query cannot be empty').optional(),
    sort: z.enum(['newest', 'oldest']).default('newest'),
  })
);

const AnnouncementMultipartSchema = CreateAnnouncementSchema.omit({
  imageUrl: true,
}).extend({
  photo: z.string().optional().openapi({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload',
  }),
});

registry.registerPath({
  method: 'get',
  path: '/announcements',
  tags: ['Announcements'],
  summary: 'Get announcements list with pagination, search, and sorting',
  request: {
    query: QueryAnnouncementsSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: PaginatedAnnouncementsSchema },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  summary: 'Get announcement by ID',
  request: {
    params: AnnouncementIdSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: AnnouncementResponseSchema },
      },
    },
    400: { description: 'Invalid ID' },
    404: { description: 'Not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/announcements',
  tags: ['Announcements'],
  summary: 'Create a new announcement',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: AnnouncementMultipartSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created',
      content: {
        'application/json': { schema: AnnouncementResponseSchema },
      },
    },
    400: { description: 'Validation error' },
    401: { description: 'Unauthorized' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/announcements/{id}',
  tags: ['Announcements'],
  summary: 'Update an announcement',
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementIdSchema,
    body: {
      content: {
        'multipart/form-data': {
          schema: AnnouncementMultipartSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: AnnouncementResponseSchema },
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
  tags: ['Announcements'],
  summary: 'Delete an announcement',
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementIdSchema,
  },
  responses: {
    204: { description: 'No Content' },
    400: { description: 'Invalid ID' },
    401: { description: 'Unauthorized' },
    403: { description: 'Access denied' },
    404: { description: 'Not found' },
  },
});
