import { z } from 'zod';

export const announcementCategorySchema = z.enum(
  ['sale', 'service', 'job', 'other'],
  {
    error:
      'Category must be one of the following values: sale, service, job, or other',
  }
);

export const createAnnouncementSchema = z.object({
  title: z
    .string({ error: 'Title is required and must be a string' })
    .min(5, 'Title must contain at least 5 characters')
    .max(50, 'Title must not exceed 50 characters'),

  description: z
    .string({ error: 'Description is required and must be a string' })
    .min(10, 'Description must contain at least 10 characters'),

  price: z
    .number({ error: 'Price is required and must be a number' })
    .positive('Price must be greater than 0'),

  category: announcementCategorySchema,
});

export const updateAnnouncementSchema = createAnnouncementSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const announcementIdSchema = z.object({
  id: z.coerce
    .number({ error: 'ID must be a number' })
    .int('ID must be an integer')
    .positive('ID must be greater than 0'),
});

export const queryAnnouncementsSchema = z.strictObject({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(10),

  category: announcementCategorySchema.optional(),

  search: z.string().trim().min(1, 'Search query cannot be empty').optional(),
});
