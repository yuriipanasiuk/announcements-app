import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z
    .string({ error: "Поле title є обов'язковим і має бути рядком" })
    .min(5, 'Мінімум 5 символів')
    .max(50, 'Максимум 50 символів'),
  description: z
    .string({ error: "Поле description є обов'язковим і має бути рядком" })
    .min(10, 'Мінімум 10 символів'),
  price: z
    .number({ error: "Поле price є обов'язковим і має бути числом" })
    .positive('Ціна має бути більшою за 0'),
  category: z.enum(['sale', 'service', 'job', 'other'], {
    error: "Поле category є обов'язковим (sale, service, job або other)",
  }),
});

export const updateAnnouncementSchema = createAnnouncementSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Має бути передано хоча б одне поле для оновлення',
  });

export const announcementIdSchema = z.object({
  id: z.coerce
    .number({ error: 'ID має бути числом' })
    .int('ID має бути цілим числом')
    .positive('ID має бути більшим за 0'),
});

export const queryAnnouncementsSchema = z.object({
  page: z.coerce.number().int().min(1, 'Мінімальна сторінка — 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Мінімальний ліміт — 1')
    .max(100, 'Максимальний ліміт — 100')
    .default(10),
  category: z.enum(['sale', 'service', 'job', 'other']).optional(),
  search: z.string().trim().min(1).optional(),
});
